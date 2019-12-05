pragma solidity ^0.5;

import './SafeMath.sol';

contract NewfangDIDRegistry {
    using SafeMath for uint;

    // keccak256(UEB) => bytes32 newfang-specific-idstring
    mapping(bytes32 => address) public owners; // file owners
    mapping(bytes32 => mapping(bytes32 => mapping(address => ACK))) public accessSpecifier;
    mapping(address => uint) public changed;
    mapping(address => uint) public nonce;

    struct ACK {
        bytes32 encrypted_key;
        uint256 validity;
    }

}
