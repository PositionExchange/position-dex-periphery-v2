// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.9;

import "../libraries/liquidity/Liquidity.sol";

//import "../spot-exchange/libraries/liquidity/PoolLiquidity.sol";
//import "../spot-exchange/libraries/liquidity/LiquidityInfo.sol";

interface IConcentratedLiquidity {
    enum ModifyType {
        INCREASE,
        DECREASE
    }

    //------------------------------------------------------------------------------------------------------------------
    // FUNCTIONS
    //------------------------------------------------------------------------------------------------------------------

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

    //------------------------------------------------------------------------------------------------------------------
    // EVENTS
    //------------------------------------------------------------------------------------------------------------------

    event LiquidityAdded(
        address user,
        address pairManager,
        uint256 amountBaseAdded,
        uint256 amountQuoteAdded,
        uint64 indexedPipRange,
        uint256 nftId
    );

    event LiquidityRemoved(
        address user,
        address pairManager,
        uint256 amountBaseRemoved,
        uint256 amountQuoteRemoved,
        uint64 indexedPipRange
    );

    event LiquidityModified(
        address user,
        address pairManager,
        uint256 amountBaseModified,
        uint256 amountQuoteModified,
        // 0: increase
        // 1: decrease
        ModifyType modifyType,
        uint64 indexedPipRange
    );
}
