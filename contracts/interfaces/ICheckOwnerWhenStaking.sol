/**
 * @author Musket
 */
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

interface ICheckOwnerWhenStaking {
    // TODO add guard
    function isOwnerWhenStaking(address user, uint256 tokenId)
        external
        returns (bool isOwner, address caller);
}
