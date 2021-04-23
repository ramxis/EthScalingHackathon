pragma solidity ^0.7.3;
// SPDX-License-Identifier: MIT

contract ORU {
    bytes32 public currentStorageRoot;
    
    constructor() {}
    
    function updateState(bytes32 oldStorageRoot, bytes32 newStorageRoot) public {
        if (oldStorageRoot == currentStorageRoot) {
            currentStorageRoot = newStorageRoot;
        }
    }
}