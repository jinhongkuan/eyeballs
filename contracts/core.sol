// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {ByteHasher} from "./helpers/ByteHasher.sol";
import {IWorldID} from "./interfaces/IWorldID.sol";

contract MyContract {
    using ByteHasher for bytes;

    IWorldID internal immutable worldId;
    uint256 internal immutable externalNullifierHash;
    uint256 internal immutable groupId = 1;

    mapping(uint256 => bool) internal nullifierHashes;
    mapping(uint256 => bool) internal nullifierHashAndURL;
    mapping(uint256 => uint256) private balance;

    event BalanceUpdated(uint256 indexed nullifierHash, uint256 newBalance);
    event ViewedStatusUpdated(uint256 indexed hash, bool status);

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

    // Explicit function visibility for clarity
    function getHash(
        uint256 nullifierHash,
        string memory url
    ) internal pure returns (uint256) {
        return uint256(keccak256(abi.encodePacked(nullifierHash, url)));
    }

    function addBalance(uint256 nullifierHash, uint256 tokens) internal {
        // Implement your access control logic here

        balance[nullifierHash] += tokens;
        emit BalanceUpdated(nullifierHash, balance[nullifierHash]);
    }

    function getBalance(uint256 nullifierHash) external view returns (uint256) {
        return balance[nullifierHash];
    }

    function decrementBalance(uint256 nullifierHash, uint256 amount) internal {
        balance[nullifierHash] = balance[nullifierHash] - amount; // Underflow protection by Solidity 0.8.x
        emit BalanceUpdated(nullifierHash, balance[nullifierHash]);
    }

    function verifyAndExecute(
        string memory signal,
        uint256 root,
        uint256 nullifierHash,
        uint256[8] calldata proof,
        uint256 referrerHash
    ) public {
        uint256 cost = 100;
        if (!nullifierHashes[nullifierHash]) {
            nullifierHashes[nullifierHash] = true;
            addBalance(nullifierHash, 1000);
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
                    cost = 90;
                    addBalance(referrerUrlHash, 70);
                }
            }
            decrementBalance(nullifierHash, cost);
            nullifierHashAndURL[multiHash] = true;
        }
    }
}
