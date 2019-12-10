pragma solidity ^0.5;

import './SafeMath.sol';

contract NewfangDIDRegistry {
    using SafeMath for uint;
    bytes32 public log;

    // keccak256(file index) => bytes32 newfang-specific-idstring
    mapping(bytes32 => address) public owners; // file owners
    mapping(bytes32 => mapping(bytes32 => mapping(address => ACK))) public accessSpecifier;
    mapping(address => uint) public changed;
    mapping(address => uint) public nonce;
    address public owner;

    struct ACK {
        bytes32 encrypted_key;
        uint256 validity;
    }

    constructor () public {
        owner = msg.sender;
    }

    modifier onlyFileOwner(bytes32 _file, address _identity) {
        require(_identity == owners[_file]);
        _;
    }


    function getSigner(bytes32 payloadHash, address signer, uint8 v, bytes32 r, bytes32 s) public returns (address){
        bytes32 messageHash = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", payloadHash));
        address actualSigner = ecrecover(messageHash, v, r, s);
        require(signer == actualSigner);
        nonce[signer]++;
        return actualSigner;
    }


    /**
    * @dev This function will be used by createDID pubic function and createDIDSigned
    * @return bool
    */
    function createDID(bytes32 _id, address _identity) internal returns (bool){
        require(owners[_id] == address(0), "Owner already exist for this file");
        owners[_id] = _identity;
        nonce[_identity]++;
        return true;
    }

    /**
    * @dev _id will be the file index which is generated by newfang SDK on client side.
    * @return bool
    */
    function createDID(bytes32 _id) public returns (bool){
        return createDID(_id, msg.sender);
    }

    /**
    * @dev key is encrypted with users public key and stored on a server hash of encrypted key is stored here in smart
     contract along with its validity
    * @return bool
    */
    function share(address _identity, bytes32 _file, address _user, bytes32 _access_type, bytes32 _access_key, uint256 _validity) internal onlyFileOwner(_file, _identity) returns (bool){
        require(_validity != 0, "Validity must be non zero");
        accessSpecifier[_file][_access_type][_user] = ACK(_access_key, now.add(_validity));
        nonce[_identity]++;
        return true;
    }


    function share(bytes32 _file, address _user, bytes32 _access_type, bytes32 _access_key, uint256 _validity) public returns (bool){
        return share(msg.sender, _file, _user, _access_type, _access_key, _validity);
    }

    event KeyHash(
        bytes32 key,
        uint256 validity
    );

    function getKeyHash(address _identity, bytes32 _file, bytes32 _access_type) internal returns (bytes32, uint256){
        ACK memory ack = accessSpecifier[_file][_access_type][_identity];
        emit KeyHash(ack.encrypted_key, ack.validity);
        return (ack.encrypted_key, ack.validity);
    }


    /**
    * @dev Fetch ACK hash of user
    * @return encrypted hash and validity
    */
    function getKeyHash(bytes32 _file, bytes32 _access_type) public returns (bytes32, uint256){
        return getKeyHash(msg.sender, _file, _access_type);
    }

    function getKeyHashSigned(bytes32 _file, bytes32 _access_type, address signer, uint8 v, bytes32 r, bytes32 s) public returns (bytes32, uint256) {
        bytes32 payloadHash = keccak256(abi.encode(_file, _access_type));
        address actualSigner = getSigner(payloadHash, signer, v, r, s);
        return getKeyHash(actualSigner, _file, _access_type);
    }


    /**
    * @dev Update ACK hash or its validity
    * @return bool
    */
    function updateACK(address _identity, bytes32 _file, address _user, bytes32 _access_type, bytes32 _access_key, uint256 _validity) internal onlyFileOwner(_file, _identity) returns (bool){
        accessSpecifier[_file][_access_type][_user] = ACK(_access_key, now.add(_validity));
        nonce[_identity]++;
        return true;
    }

    function updateACK(bytes32 _file, address _user, bytes32 _access_type, bytes32 _access_key, uint256 _validity) public returns (bool){
        return updateACK(msg.sender, _file, _user, _access_type, _access_key, _validity);
    }


    /**
    * @dev Change file Owner
    * @return bool
    */
    function changeFileOwner(address _identity, bytes32 _file, address _new_owner) internal onlyFileOwner(_file, _identity) returns (bool){
        require(_new_owner != address(0), "Invalid address");
        owners[_file] = _new_owner;
        nonce[_identity]++;
        return true;
    }

    function changeFileOwner(bytes32 _file, address _new_owner) public returns (bool){
        return changeFileOwner(msg.sender, _file, _new_owner);
    }

}
