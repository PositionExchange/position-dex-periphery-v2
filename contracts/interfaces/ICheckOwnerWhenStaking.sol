/**
 * @author Musket
 */
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

interface ICheckOwnerWhenStaking {
    // TODO add guard
    function isOwnerWhenStaking(address user, uint256 tokenId)
        external
        view
        returns (bool isOwner, address caller);
}
