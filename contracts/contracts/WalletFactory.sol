pragma solidity ^0.5.6;
import "openzeppelin-solidity/contracts/math/Safemath.sol";
import "./ProxyCounterfactualFactory.sol";


contract WalletFactory is ProxyCounterfactualFactory {
    using SafeMath for uint;

    address public linkdropFactory;

    constructor(bytes memory _initCode, address _linkdropFactory, address _relayer) public ProxyCounterfactualFactory(_initCode, _relayer) {
        linkdropFactory = _linkdropFactory;
    }

    uint public diff;

    function claimAndDeploy
    (
        bytes calldata _claimData,
        address _publicKey,
        bytes calldata _initializeWithENS,
        bytes calldata _signature
    )
    external
    returns
    (bool success)
    {
        require(isOwner() || msg.sender == relayer, "ONLY_OWNER_OR_RELAYER");

        uint balanceBefore = address(this).balance;
        (success, ) = linkdropFactory.call(_claimData);
        require(success, "CLAIM_FAILED");
        uint balanceAfter = address(this).balance;
        diff = balanceAfter.sub(balanceBefore);

        createContract(_publicKey, _initializeWithENS, _signature);

        // // Transfer fee back to relayer
        // msg.sender.transfer(balanceAfter.sub(balanceBefore));
    }

    function setRelayer(address _relayer) public onlyOwner {
        require(_relayer != address(0), "INVALID_ADDRESS");
        relayer = _relayer;
    }

    function() external payable {}
}