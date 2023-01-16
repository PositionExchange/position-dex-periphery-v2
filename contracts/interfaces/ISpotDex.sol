/**
 * @author Musket
 */
// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.9;

import "../libraries/types/SpotHouseStorage.sol";
import "@positionex/matching-engine/contracts/interfaces/IMatchingEngineAMM.sol";

interface ISpotDex {
    //------------------------------------------------------------------------------------------------------------------
    // EVENTS
    //------------------------------------------------------------------------------------------------------------------

    event MarketOrderOpened(
        address trader,
        uint256 quantity,
        uint256 openNational,
        SpotHouseStorage.Side side,
        IMatchingEngineAMM spotManager,
        uint128 currentPip
    );
    event LimitOrderOpened(
        uint64 orderId,
        address trader,
        uint256 quantity,
        uint256 sizeOut,
        uint128 pip,
        SpotHouseStorage.Side _side,
        address spotManager
    );

    event LimitOrderCancelled(
        address trader,
        IMatchingEngineAMM spotManager,
        uint128 pip,
        SpotHouseStorage.Side _side,
        uint64 orderId
    );

    event AllLimitOrderCancelled(
        address trader,
        IMatchingEngineAMM spotManager,
        uint128[] pips,
        uint64[] orderIds,
        SpotHouseStorage.Side[] sides
    );

    event AssetClaimed(
        address trader,
        IMatchingEngineAMM spotManager,
        uint256 quoteAmount,
        uint256 baseAmount
    );

    //------------------------------------------------------------------------------------------------------------------
    // FUNCTIONS
    //------------------------------------------------------------------------------------------------------------------

    /// @notice open limit order
    /// @param pairManager the pair want to open limit order
    /// @param side of order, 0 is buy, 1 is sell
    /// @param quantity the amount of base open order
    /// @param pip of limit order
    function openLimitOrder(
        IMatchingEngineAMM pairManager,
        SpotHouseStorage.Side side,
        uint256 quantity,
        uint128 pip
    ) external payable;

    /// @notice open limit order with input is quote asset
    /// @param pairManager the pair want to open limit order
    /// @param side of order, 0 is buy, 1 is sell
    /// @param quoteAmount the amount of quote open order
    /// @param pip of limit order
    function openBuyLimitOrderWithQuote(
        IMatchingEngineAMM pairManager,
        SpotHouseStorage.Side side,
        uint256 quoteAmount,
        uint128 pip
    ) external payable;

    /// @notice open market order with base asset
    /// @param pairManager the pair want to open limit order
    /// @param side of order, 0 is buy, 1 is sell
    /// @param quantity the amount of base open order
    function openMarketOrder(
        IMatchingEngineAMM pairManager,
        SpotHouseStorage.Side side,
        uint256 quantity
    ) external payable;

    /// @notice open market order with quote asset
    /// @param pairManager the pair want to open limit order
    /// @param side of order, 0 is buy, 1 is sell
    /// @param quoteAmount the amount of quote open order
    function openMarketOrderWithQuote(
        IMatchingEngineAMM pairManager,
        SpotHouseStorage.Side side,
        uint256 quoteAmount
    ) external payable;

    /// @notice cancel limit order is pending
    /// @param pairManager the pair want cancel order
    /// @param orderIdx the id of list orders are pending
    /// @param pip the pip of order
    function cancelLimitOrder(
        IMatchingEngineAMM pairManager,
        uint64 orderIdx,
        uint128 pip
    ) external;

    /// @notice cancel all limit order is pending of one pair
    /// @param pairManager the pair want cancel all order
    function cancelAllLimitOrder(IMatchingEngineAMM pairManager) external;

    /// @notice claim asset base and quote after the order filled or partial filled
    /// @param pairManager the pair want to claim asset
    function claimAsset(IMatchingEngineAMM pairManager) external;

    /// @notice get amount of assets can claim of trader and pair
    /// @param pairManager the pair want to get amount
    /// @param trader check
    /// @return quoteAsset amount of quote can claim
    /// @return baseAsset amount of base can claim
    /// @return basisPoint of pair
    function getAmountClaimable(IMatchingEngineAMM pairManager, address trader)
        external
        view
        returns (
            uint256 quoteAsset,
            uint256 baseAsset,
            uint256 basisPoint
        );

    /// @notice get all pending limit order of trader and pair
    /// @param pairManager the pair want to get pending limit
    /// @param trader check
    /// @return the array of list pending order
    function getPendingLimitOrders(
        IMatchingEngineAMM pairManager,
        address trader
    ) external view returns (SpotHouseStorage.PendingLimitOrder[] memory);

    struct BatchPendingLimitOrder {
        address instance;
        SpotHouseStorage.PendingLimitOrder[] pendingOrders;
    }

    /// @notice get batch pending order of multi traders in 1 pair
    /// @param pairManager the pair want to get batch pending
    /// @param traders array of traders
    /// @return batchPendingOrders the array of list pending order
    function getBatchPendingLimitOrdersByTrader(
        IMatchingEngineAMM pairManager,
        address[] memory traders
    )
        external
        view
        returns (BatchPendingLimitOrder[] memory batchPendingOrders);

    /// @notice get batch pending order of multi pairs by 1 trade
    /// @param pairManagers the array of pairs want to get batch pending
    /// @param trader array of traders
    /// @return batchPendingOrders the array of list pending order
    function getBatchPendingLimitOrdersByPair(
        IMatchingEngineAMM[] memory pairManagers,
        address trader
    )
        external
        view
        returns (BatchPendingLimitOrder[] memory batchPendingOrders);

    /// @notice get order id of trader in list pending order
    /// @param pairManager the pair of get limit pending
    /// @param trader the trader
    /// @param pip the pip want to get id
    /// @param orderId id of order in quote of pip
    /// @return the order id of trader in list pending orders
    function getOrderIdOfTrader(
        address pairManager,
        address trader,
        uint128 pip,
        uint64 orderId
    ) external view returns (int256);
}
