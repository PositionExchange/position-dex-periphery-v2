/**
 * @author Musket
 */
// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.9;

interface IWithdrawBNB {
    function withdraw(address recipient, uint256 _amount) external;
}
