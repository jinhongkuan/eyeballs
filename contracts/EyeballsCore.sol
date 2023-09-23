// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {ByteHasher} from "./helpers/ByteHasher.sol";
import {IWorldID} from "./interfaces/IWorldID.sol";

contract EyeballsCore {
    using ByteHasher for bytes;

    // Constants for magic numbers
    uint256 private constant INITIAL_BALANCE = 1000;
    uint256 private constant BASE_COST = 100;
    uint256 private constant REFERRER_COST = 90;
    uint256 private constant REFERRER_BONUS = 70;

    IWorldID internal immutable worldId;
    uint256 internal immutable externalNullifierHash;
    uint256 internal immutable groupId = 1;

    mapping(uint256 => bool) internal nullifierHashes;
    mapping(uint256 => bool) internal nullifierHashAndURL;
    mapping(uint256 => uint256) private balance;
    

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
