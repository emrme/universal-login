pragma solidity ^0.5.2;

import "./IKeyHolder.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";


contract KeyHolder is IKeyHolder {
    using SafeMath for uint;

    uint constant MAX_KEYS_PER_ADD = 5;

    mapping (address => Key) public keys;

    uint public keyCount;

    constructor(address _key) public {
        keys[_key].key = _key;
        keys[_key].purpose = MANAGEMENT_KEY;
        keyCount = 1;
        emit KeyAdded(keys[_key].key,  keys[_key].purpose);
    }

    function() external payable {

    }

    modifier onlyManagementOrActionKeys(address sender) {
        bool isActionKey = keyHasPurpose(sender, ACTION_KEY);
        bool isManagementKey = keyHasPurpose(sender, MANAGEMENT_KEY);
        require(isActionKey || isManagementKey, "Invalid key");
        _;
    }

    modifier onlyManagementKeyOrThisContract() {
        bool isManagementKey = keyHasPurpose(msg.sender, MANAGEMENT_KEY);
        require(isManagementKey || msg.sender == address(this), "Sender not permissioned");
        _;
    }

    function keyExist(address _key) public view returns(bool) {
        return keys[_key].key != address(0x0);
    }

    function getKeyPurpose(address _key) public view returns(uint256 purpose) {
        return keys[_key].purpose;
    }

    function keyHasPurpose(address _key, uint256 _purpose) public view returns(bool result) {
        return keys[_key].purpose == _purpose;
    }

    function addKey(address _key, uint256 _purpose) public onlyManagementKeyOrThisContract returns(bool success) {
        require(_key != msg.sender, "Invalid key"); //Simplifies formal verification
        require(keys[_key].key != _key, "Key already added");
        keys[_key].key = _key;
        keys[_key].purpose = _purpose;
        keyCount = keyCount.add(1);
        emit KeyAdded(keys[_key].key,  keys[_key].purpose);

        return true;
    }

    function addKeys(address[] memory _keys, uint256[] memory _purposes) public onlyManagementKeyOrThisContract returns(bool success) {
        require(_keys.length <= MAX_KEYS_PER_ADD, "Too many keys"); //Simplifies formal verification
        require(_keys.length == _purposes.length, "Unequal argument set lengths");
        for (uint i = 0; i < _keys.length; i++) {
            require(_keys[i] != msg.sender, "Invalid key");
            addKey(_keys[i], _purposes[i]);
        }
        emit MultipleKeysAdded(_keys.length);
        return true;
    }

    function removeKey(address _key, uint256 _purpose) public  onlyManagementKeyOrThisContract returns(bool success) {
        require(_key != msg.sender, "Invalid Key"); //Simplifies formal verification
        require(keys[_key].purpose == _purpose, "Invalid key");

        emit KeyRemoved(keys[_key].key, keys[_key].purpose);

        delete keys[_key];
        keyCount = keyCount.sub(1);

        return true;
    }

    event MultipleKeysAdded(uint count);
}
