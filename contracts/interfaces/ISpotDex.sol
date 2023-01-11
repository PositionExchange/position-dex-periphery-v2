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

    event SpotHouseInitialized(address owner);

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

    function openLimitOrder(
        IMatchingEngineAMM pairManager,
        SpotHouseStorage.Side side,
        uint256 quantity,
        uint128 pip
    ) external payable;

    function openBuyLimitOrderWithQuote(
        IMatchingEngineAMM pairManager,
        SpotHouseStorage.Side side,
        uint256 quoteAmount,
        uint128 pip
    ) external payable;

    function openMarketOrder(
        IMatchingEngineAMM pairManager,
        SpotHouseStorage.Side side,
        uint256 quantity
    ) external payable;

    function openMarketOrderWithQuote(
        IMatchingEngineAMM pairManager,
        SpotHouseStorage.Side side,
        uint256 quoteAmount
    ) external payable;

    function cancelLimitOrder(
        IMatchingEngineAMM _spotManager,
        uint64 _orderIdx,
        uint128 _pip
    ) external;

    function claimAsset(IMatchingEngineAMM spotManager) external;

    function getAmountClaimable(
        IMatchingEngineAMM _spotManager,
        address _trader
    )
        external
        view
        returns (
            uint256 quoteAsset,
            uint256 baseAsset,
            uint256 basisPoint
        );

    function cancelAllLimitOrder(IMatchingEngineAMM spotManager) external;

    function getPendingLimitOrders(
        IMatchingEngineAMM _spotManager,
        address _trader
    ) external view returns (SpotHouseStorage.PendingLimitOrder[] memory);

    function setFactory(address _factoryAddress) external;
}
