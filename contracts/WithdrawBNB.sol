/**
 * @author Musket
 */
// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.9;

import {DexErrors} from "./libraries/helper/DexErrors.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "./interfaces/IWBNB.sol";
import "./interfaces/IWithdrawBNB.sol";

contract WithdrawBNB is IWithdrawBNB {
    using Address for address payable;
    IWBNB public WBNB;
    address public owner;
    mapping(address => bool) public counterParties;

    modifier onlyOwner() {
        require(msg.sender == owner, DexErrors.DEX_ONLY_OWNER);
        _;
    }

    modifier onlyCounterParty() {
        require(counterParties[msg.sender], DexErrors.DEX_ONLY_COUNTER_PARTY);
        _;
    }

    receive() external payable {
        assert(msg.sender == address(WBNB));
        // only accept BNB via fallback from the WBNB contract
    }

    constructor(IWBNB _WBNB) {
        owner = msg.sender;
        WBNB = _WBNB;
    }

    function setWBNB(IWBNB _newWBNB) external onlyOwner {
        WBNB = _newWBNB;
    }

    function transferOwner(address _newOwner) external onlyOwner {
        owner = _newOwner;
    }

    function setCounterParty(address _newCounterParty) external onlyOwner {
        counterParties[_newCounterParty] = true;
    }

    function revokeCounterParty(address _account) external onlyOwner {
        counterParties[_account] = false;
    }

    function withdraw(address recipient, uint256 amount)
        external
        override
        onlyCounterParty
    {
        WBNB.withdraw(amount);
        payable(recipient).sendValue(amount);
    }
}
