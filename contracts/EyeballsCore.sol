// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

// import {ByteHasher} from "./helpers/ByteHasher.sol";
// import {IWorldID} from "./interfaces/IWorldID.sol";
interface IWorldID {
    /// @notice Reverts if the zero-knowledge proof is invalid.
    /// @param root The of the Merkle tree
    /// @param groupId The id of the Semaphore group
    /// @param signalHash A keccak256 hash of the Semaphore signal
    /// @param nullifierHash The nullifier hash
    /// @param externalNullifierHash A keccak256 hash of the external nullifier
    /// @param proof The zero-knowledge proof
    /// @dev  Note that a double-signaling check is not included here, and should be carried by the caller.
    function verifyProof(
        uint256 root,
        uint256 groupId,
        uint256 signalHash,
        uint256 nullifierHash,
        uint256 externalNullifierHash,
        uint256[8] calldata proof
    ) external view;
}

library ByteHasher {
    /// @dev Creates a keccak256 hash of a bytestring.
    /// @param value The bytestring to hash
    /// @return The hash of the specified value
    /// @dev `>> 8` makes sure that the result is included in our field
    function hashToField(bytes memory value) internal pure returns (uint256) {
        return uint256(keccak256(abi.encodePacked(value))) >> 8;
    }
}

contract EyeballsCore {
    using ByteHasher for bytes;

    // Constants for magic numbers
    uint256 private constant INITIAL_BALANCE = 2000;
    uint256 private constant BASE_COST = 100;
    uint256 private constant REFERRER_COST = 90;
    uint256 private constant REFERRER_BONUS = 70;

    // Additional constants for balance boost
    uint256 private constant BALANCE_THRESHOLD = 2000;
    uint256 private constant BOOSTED_BALANCE = 2000;
    uint256 private constant TIME_PERIOD = 30 days; // 30 days in seconds

    IWorldID internal immutable worldId;
    uint256 internal immutable externalNullifierHash;
    uint256 internal immutable groupId = 1;

    mapping(uint256 => bool) internal nullifierHashes;
    mapping(uint256 => bool) internal nullifierHashAndURL;
    mapping(uint256 => uint256) private balance;
    mapping(uint256 => uint256) private lastBoosted;

    event BalanceUpdated(uint256 indexed nullifierHash, uint256 newBalance);
    event ViewedStatusUpdated(uint256 indexed hash, bool status);

    // Constructor
    constructor(
        IWorldID _worldId,
        string memory _appId,
        string memory _actionId
    ) {
        worldId = _worldId;
        externalNullifierHash = abi
            .encodePacked(abi.encodePacked(_appId).hashToField(), _actionId)
            .hashToField();
    }

    // Get hash for nullifier and URL
    function getHash(
        uint256 nullifierHash,
        string memory url
    ) internal pure returns (uint256) {
        return uint256(keccak256(abi.encodePacked(nullifierHash, url)));
    }

    // Add balance for a given nullifier hash
    function addBalance(uint256 nullifierHash, uint256 tokens) internal {
        balance[nullifierHash] += tokens;
        emit BalanceUpdated(nullifierHash, balance[nullifierHash]);
    }

    // Public function to get balance for a nullifier hash
    function getBalance(uint256 nullifierHash) external view returns (uint256) {
        return balance[nullifierHash];
    }

    // Decrease balance for a given nullifier hash
    function decrementBalance(uint256 nullifierHash, uint256 amount) internal {
        require(balance[nullifierHash] >= amount, "Insufficient balance");
        balance[nullifierHash] -= amount;
        emit BalanceUpdated(nullifierHash, balance[nullifierHash]);
    }

    function boostBalance(uint256 nullifierHash) public {
        require(balance[nullifierHash] < BALANCE_THRESHOLD, "Balance is above the threshold");
        require(lastBoosted[nullifierHash] + TIME_PERIOD <= block.timestamp, "Boost period not reached");

        // Update last boosted time and set balance to BOOSTED_BALANCE
        lastBoosted[nullifierHash] = block.timestamp;
        balance[nullifierHash] = BOOSTED_BALANCE;

        emit BalanceUpdated(nullifierHash, BOOSTED_BALANCE);
    }

    /**
     * Verify and execute the logic for a given signal.
     *
     * @param signal The URL of the hosted content
     * @param root The Merkle root
     * @param nullifierHash The nullifier hash
     * @param proof The proof array
     * @param referrerHash The referrer hash
     */
    function payToView(
        string memory signal,
        uint256 root,
        uint256 nullifierHash,
        uint256[8] calldata proof,
        uint256 referrerHash
    ) public {
        // Set the base cost
        uint256 cost = BASE_COST;
        boostBalance(nullifierHash);

        // Check if the nullifier hash is already used
        if (!nullifierHashes[nullifierHash]) {
            nullifierHashes[nullifierHash] = true;
            addBalance(nullifierHash, INITIAL_BALANCE);
        }

        // Verify the proof using the WorldID contract
        worldId.verifyProof(
            root,
            groupId,
            abi.encodePacked(signal).hashToField(),
            nullifierHash,
            externalNullifierHash,
            proof
        );

        // Calculate the readerUrlHash
        uint256 readerUrlHash = getHash(nullifierHash, signal);

        // Check if the readerUrlHash is already used
        if (!nullifierHashAndURL[readerUrlHash]) {
            // Check if there is a referrer
            if (referrerHash != 0) {
                uint256 referrerUrlHash = getHash(referrerHash, signal);
                // Check if the referrer has read (paid for) the content
                if (nullifierHashAndURL[referrerUrlHash]) {
                    cost = REFERRER_COST;
                    addBalance(referrerHash, REFERRER_BONUS);
                }
            }

            // Decrease the balance and mark the readerUrlHash as used
            decrementBalance(nullifierHash, cost);
            nullifierHashAndURL[readerUrlHash] = true;
        }
    }
}
