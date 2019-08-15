pragma solidity ^0.5.2;
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/cryptography/ECDSA.sol";

contract ProxyCounterfactualFactory is Ownable {
    using ECDSA for bytes32;

    bytes public initCode;
    address public constant linkdropFactory = 0xBa051891B752ecE3670671812486fe8dd34CC1c8;

    constructor(bytes memory _initCode) public {
        initCode = _initCode;
    }

    function createContract(address publicKey, bytes memory initializeWithENS, bytes memory signature) public returns(bool success) {
        require(isOwner() || msg.sender == linkdropFactory, "ONLY_OWNER_OR_LINKDROP_FACTORY");

        require(publicKey == getSigner(initializeWithENS, signature), "Invalid signature");
        bytes32 finalSalt = keccak256(abi.encodePacked(publicKey));
        bytes memory _initCode = initCode;
        address contractAddress;
        // solium-disable-next-line security/no-inline-assembly
        assembly {
            contractAddress := create2(0, add(_initCode, 0x20), mload(_initCode), finalSalt)
            if iszero(extcodesize(contractAddress)) {revert(0, 0)}
        }
        // solium-disable-next-line security/no-low-level-calls
        (success, ) = contractAddress.call(initializeWithENS);
        require(success, "Unable to register ENS domain");
        return success;
    }

    function getSigner(bytes memory initializeWithENS, bytes memory signature) public pure returns (address) {
        return keccak256(abi.encodePacked(initializeWithENS)).toEthSignedMessageHash().recover(signature);
    }
}
