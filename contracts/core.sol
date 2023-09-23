// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {ByteHasher} from "./helpers/ByteHasher.sol";
import {IWorldID} from "./interfaces/IWorldID.sol";

contract MyContract {
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

    // Main function to verify and execute logic
    function verifyAndExecute(
        string memory signal, // This is the url of the hosted content
        uint256 root,
        uint256 nullifierHash,
        uint256[8] calldata proof,
        uint256 referrerHash
    ) public {
        uint256 cost = BASE_COST;
        if (!nullifierHashes[nullifierHash]) {
            nullifierHashes[nullifierHash] = true;
            addBalance(nullifierHash, INITIAL_BALANCE);
        }

        worldId.verifyProof(
            root,
            groupId,
            abi.encodePacked(signal).hashToField(),
            nullifierHash,
            externalNullifierHash,
            proof
        );

        uint256 multiHash = getHash(nullifierHash, signal);
        if (!nullifierHashAndURL[multiHash]) {
            if (referrerHash != 0) {
                uint256 referrerUrlHash = getHash(referrerHash, signal);
                if (nullifierHashAndURL[referrerUrlHash]) {
                    cost = REFERRER_COST;
                    addBalance(referrerUrlHash, REFERRER_BONUS);
                }
            }
            decrementBalance(nullifierHash, cost);
            nullifierHashAndURL[multiHash] = true;
        }
    }
}
