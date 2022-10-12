// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.9;

import "../libraries/liquidity/Liquidity.sol";

//import "../spot-exchange/libraries/liquidity/PoolLiquidity.sol";
//import "../spot-exchange/libraries/liquidity/LiquidityInfo.sol";

interface IConcentratedLiquidity {
    // @dev get data of nft
    function getDataNonfungibleToken(uint256 tokenId)
        external
        view
        returns (Liquidity.Data memory);

    // @dev get all data of nft
    function getAllDataTokens(uint256[] memory tokens)
        external
        view
        returns (Liquidity.Data[] memory);
}
