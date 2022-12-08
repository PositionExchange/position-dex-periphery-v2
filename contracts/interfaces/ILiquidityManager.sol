// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.9;

import "../libraries/liquidity/Liquidity.sol";

//import "../spot-exchange/libraries/liquidity/PoolLiquidity.sol";
//import "../spot-exchange/libraries/liquidity/LiquidityInfo.sol";

interface ILiquidityManager {
    enum ModifyType {
        INCREASE,
        DECREASE
    }

    //------------------------------------------------------------------------------------------------------------------
    // FUNCTIONS
    //------------------------------------------------------------------------------------------------------------------

    // @dev get all data of nft
    function getAllDataTokens(uint256[] memory tokens)
        external
        view
        returns (UserLiquidity.Data[] memory);

    // @dev get data of nft
    function concentratedLiquidity(uint256 tokenId)
        external
        view
        returns (
            uint128 liquidity,
            uint32 indexedPipRange,
            uint256 feeGrowthBase,
            uint256 feeGrowthQuote,
            IMatchingEngineAMM pool
        );

    //------------------------------------------------------------------------------------------------------------------
    // EVENTS
    //------------------------------------------------------------------------------------------------------------------

    //    event LiquidityAdded(
    //        address user,
    //        address pool,
    //        uint256 amountBaseAdded,
    //        uint256 amountQuoteAdded,
    //        uint64 indexedPipRange,
    //        uint256 nftId
    //    );

    //    event LiquidityRemoved(
    //        address user,
    //        address pool,
    //        uint256 amountBaseRemoved,
    //        uint256 amountQuoteRemoved,
    //        uint64 indexedPipRange,
    //        uint128 removedLiquidity
    //    );

    //    event LiquidityModified(
    //        address user,
    //        address pool,
    //        uint256 amountBaseModified,
    //        uint256 amountQuoteModified,
    //        // 0: increase
    //        // 1: decrease
    //        ModifyType modifyType,
    //        uint64 indexedPipRange,
    //        uint128 modifiedLiquidity
    //    );

    event LiquidityShiftRange(
        address user,
        address pool,
        uint64 oldIndexedPipRange,
        uint128 liquidityRemoved,
        uint256 amountBaseRemoved,
        uint256 amountQuoteRemoved,
        uint64 newIndexedPipRange,
        uint128 newLiquidity,
        uint256 amountBaseAdded,
        uint256 amountQuoteAded
    );

    event LiquidityAdded(
        address indexed user,
        address indexed pool,
        uint256 indexed nftId,
        uint256 amountBaseAdded,
        uint256 amountQuoteAdded,
        uint64 indexedPipRange,
        uint256 trackingId
    );

    event LiquidityRemoved(
        address indexed user,
        address indexed pool,
        uint256 indexed nftId,
        uint256 amountBaseRemoved,
        uint256 amountQuoteRemoved,
        uint64 indexedPipRange,
        uint128 removedLiquidity,
        uint256 trackingId
    );

    event LiquidityModified(
        address indexed user,
        address indexed pool,
        uint256 indexed nftId,
        uint256 amountBaseModified,
        uint256 amountQuoteModified,
        // 0: increase
        // 1: decrease
        ModifyType modifyType,
        uint64 indexedPipRange,
        uint128 modifiedLiquidity,
        uint256 trackingId
    );

    event LiquidityShiftRange(
        address indexed user,
        address indexed pool,
        uint256 indexed nftId,
        uint64 oldIndexedPipRange,
        uint128 liquidityRemoved,
        uint256 amountBaseRemoved,
        uint256 amountQuoteRemoved,
        uint64 newIndexedPipRange,
        uint128 newLiquidity,
        uint256 amountBaseAdded,
        uint256 amountQuoteAded,
        uint256 trackingId
    );
}
