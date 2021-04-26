pragma solidity ^0.7.3;
// SPDX-License-Identifier: MIT

contract ORU {
    bytes32 public currentStorageRoot;
    address public executor;
    address public orderer;
    address public publisher;
    
    constructor(address _executor, address _publisher, address _orderer) {
        publisher = _publisher;
        // TODO: change to _executor
        executor = _executor;
        orderer = _orderer;
    }
    
    function updateState(
        bytes32 orderer_r,
        bytes32 orderer_s,
        uint8 orderer_v,
        bytes32 executor_r,
        bytes32 executor_s,
        uint8 executor_v,
        bytes32 oldStorageRoot,
        bytes32 newStorageRoot
    ) public {
        require(msg.sender == publisher, 'You are not the registered publisher');
        //TODO: we will add this back in :)
        // require(currentStorageRoot == oldStorageRoot, 'Given Storage root is wrong');
        bytes32 signed_hash;
        assembly {
            let mem_location := 0x100
            // we need to sub 4 (func signature) + (32 (r) + 32 (s) + 32 (v)) * 2 = 196
            let call_data_size := sub(calldatasize(), 196)
            // we need to add 4 (func signature) + (32 (r) + 32 (s) + 32 (v)) * 2 = 196
            calldatacopy(mem_location, 196, call_data_size)
            let hash := keccak256(mem_location, call_data_size)
            
            let mem_location_header := add(mem_location, call_data_size)
            mstore(mem_location_header, "\x19Ethereum Signed Message:\n32")
            mstore(add(mem_location_header, 28), hash)
            signed_hash := keccak256(mem_location_header, 60)
        }
        //input:
        // 0x65d0f029393e7f2ebc9b6f9644224480bcce3e8c411ca1b3bd227daa095cd7ca, 0x47400b4f7118563551c4d28e1cdd74ce948cc5fa65b7d3837bab574848ba4829, 0x1b, 0xAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA, 0x1111111111111111111111111111111111111111111111111111111111111111
        address executor_address = ecrecover(signed_hash, executor_v, executor_r, executor_s);
        // the signature is over the oldStorageRoot, the new one and the transactions
        require(executor_address == executor, 'You are not the registered executor');
        // TODO: 
        // the orderer does not have the old or new storage. So he is going to sign only the transactions he forwarded to the executor
        // this means, we need to exclude the two parameters
        // assembly {
        // //     let mem_location := 0x100
        //     // we need to sub 4 (func signature) + (32 (r) + 32 (s) + 32 (v)) * 2 + 64 (storage root parameter)= 260
        //     let call_data_size := sub(calldatasize(), 260)
        // //     // we need to add 4 (func signature) + 32 (r) + 32 (s) + 32 (v) = 100
        // //     calldatacopy(mem_location, 100, call_data_size)
        //     let without_storage_root := add(mem_location, 64)
        //     let hash := keccak256(without_storage_root, call_data_size)
            
        //     // let mem_location_header := add(mem_location, call_data_size)
        // //     mstore(mem_location_header, "\x19Ethereum Signed Message:\n32")
        //     mstore(add(mem_location_header, 28), hash)
        //     signed_hash := keccak256(mem_location_header, 60)
        // }
        // address orderer_address = ecrecover(signed_hash, executor_v, executor_r, executor_s);
        // require(orderer_address == orderer, 'You are not the registered executor');
        currentStorageRoot = newStorageRoot;
    }

    function getCurrentStorageRoot() public view returns (bytes32) {
        return currentStorageRoot;
    }
}