// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MyContract {
    mapping(uint256 => bool) private hashToBool;
    mapping(uint256 => uint256) private balance;

    function addURLHash(uint256 nullifierHash, string memory URL) external {
        uint256 hash = uint256(keccak256(abi.encodePacked(nullifierHash, URL)));
        hashToBool[hash] = true;
    }

    function addNullifierHash(uint256 nullifierHash, uint256 tokens) external {
        balance[nullifierHash] = tokens;
    }

    function checkViewed(uint256 hash) internal view returns (bool) {
        return hashToBool[hash];
    }

    function getBalance(uint256 nullifierHash) external view returns (uint256) {
        return balance[nullifierHash];
    }

    function decrementBalance(uint256 nullifierHash) external {
        if (!checkViewed(nullifierHash)) {
            balance[nullifierHash] -= 1;
        }
    }
}
