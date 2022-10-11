// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.9;

import "./IPairManager.sol";
import "../libraries/types/SpotHouseStorage.sol";

interface ISpotHouse {
    event SpotHouseInitialized(address owner);

    event MarketOrderOpened(
        address trader,
        uint256 quantity,
        uint256 openNational,
        SpotHouseStorage.Side side,
        IPairManager spotManager,
        uint128 currentPip,
        uint64 blockTimestamp
    );
    event LimitOrderOpened(
        uint64 orderId,
        address trader,
        uint256 quantity,
        uint256 sizeOut,
        uint128 pip,
        SpotHouseStorage.Side _side,
        address spotManager,
        uint64 blockTimestamp
    );

    event LimitOrderCancelled(
        address trader,
        IPairManager spotManager,
        uint128 pip,
        uint64 orderId,
        uint256 blockTimestamp
    );

    event AllLimitOrderCancelled(
        address trader,
        IPairManager spotManager,
        uint128[] pips,
        uint64[] orderIds,
        uint256 blockTimestamp
    );

    event AssetClaimed(
        address trader,
        IPairManager spotManager,
        uint256 quoteAmount,
        uint256 baseAmount
    );

    function openLimitOrder(
        IPairManager _spotManager,
        SpotHouseStorage.Side _side,
        uint256 _quantity,
        uint128 _pip
    ) external payable;

    function openBuyLimitOrderExactInput(
        IPairManager pairManager,
        SpotHouseStorage.Side side,
        uint256 quantity,
        uint128 pip
    ) external payable;

    function openMarketOrder(
        IPairManager _spotManager,
        SpotHouseStorage.Side _side,
        uint256 _quantity
    ) external payable;

    function openMarketOrderWithQuote(
        IPairManager _pairManager,
        SpotHouseStorage.Side _side,
        uint256 _quoteAmount
    ) external payable;

    function cancelLimitOrder(
        IPairManager _spotManager,
        uint64 _orderIdx,
        uint128 _pip
    ) external;

    function claimAsset(IPairManager _spotManager) external;

    function getAmountClaimable(IPairManager _spotManager, address _trader)
        external
        view
        returns (
            uint256 quoteAsset,
            uint256 baseAsset
            //            uint256 feeQuoteAmount,
            //            uint256 feeBaseAmount
        );

    function cancelAllLimitOrder(IPairManager _spotManager) external;

    function getPendingLimitOrders(IPairManager _spotManager, address _trader)
        external
        view
        returns (SpotHouseStorage.PendingLimitOrder[] memory);

    function setFactory(address _factoryAddress) external;

    function updateFee(uint16 _fee) external;

    function openMarketOrder(
        IPairManager _pairManager,
        SpotHouseStorage.Side _side,
        uint256 _quantity,
        address _payer,
        address _recipient
    ) external payable returns (uint256[] memory);

    function openMarketOrderWithQuote(
        IPairManager _pairManager,
        SpotHouseStorage.Side _side,
        uint256 _quoteAmount,
        address _payer,
        address _recipient
    ) external payable returns (uint256[] memory);
}
