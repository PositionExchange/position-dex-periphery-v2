/**
 * @author Musket
 */
// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.9;

import {Errors} from "./libraries/helper/Errors.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "./interfaces/IWBNB.sol";

interface IWithdrawBNB {
    function withdraw(address recipient, uint256 _amount) external;
}

contract WithdrawBNB is IWithdrawBNB {
    using Address for address payable;
    IWBNB public WBNB;
    address public owner;
    address public spotHouse;

    modifier onlyOwner() {
        require(msg.sender == owner, Errors.VL_ONLY_OWNER);
        _;
    }

    modifier onlyCounterParty() {
        require(msg.sender == spotHouse, Errors.VL_ONLY_COUNTERPARTY);
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

    function setSpotHouse(address _newSpotHouse) external onlyOwner {
        spotHouse = _newSpotHouse;
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
