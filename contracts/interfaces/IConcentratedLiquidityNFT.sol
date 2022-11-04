/**
 * @author Musket
 */
// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/token/ERC721/IERC721Upgradeable.sol";
import "../libraries/liquidity/Liquidity.sol";

interface IConcentratedLiquidityNFT is IERC721Upgradeable {
    function voteFor() external;

    function voteAgainst() external;
}
