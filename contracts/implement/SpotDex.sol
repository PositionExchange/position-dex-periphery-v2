/**
 * @author Musket
 */
// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.9;

import "@positionex/matching-engine/contracts/interfaces/IMatchingEngineAMM.sol";
import "@positionex/matching-engine/contracts/libraries/helper/TradeConvert.sol";
import "@positionex/matching-engine/contracts/libraries/helper/Require.sol";
import "@positionex/matching-engine/contracts/libraries/helper/FixedPoint128.sol";
import "@positionex/matching-engine/contracts/libraries/helper/Convert.sol";

import "../libraries/types/SpotFactoryStorage.sol";
import "../libraries/types/SpotHouseStorage.sol";
import "../libraries/types/SpotHouseStorage.sol";
import "../libraries/helper/DexErrors.sol";
import "./Block.sol";
import "../interfaces/ISpotDex.sol";

abstract contract SpotDex is ISpotDex, SpotHouseStorage {
    using Convert for uint256;

    /**
     * @dev see {ISpotDex-openLimitOrder}
     */
    function openLimitOrder(
        IMatchingEngineAMM pairManager,
        Side side,
        uint256 quantity,
        uint128 pip
    ) public payable virtual {
        address trader = _msgSender();
        _openLimitOrder(pairManager, quantity, pip, trader, side);
    }

    /**
     * @dev see {ISpotDex-openBuyLimitOrderWithQuote}
     */
    function openBuyLimitOrderWithQuote(
        IMatchingEngineAMM pairManager,
        Side side,
        uint256 quoteAmount,
        uint128 pip
    ) public payable virtual {
        Require._require(side == Side.BUY, DexErrors.DEX_MUST_ORDER_BUY);
        _openBuyLimitOrderWithQuote(
            pairManager,
            quoteAmount,
            pip,
            _msgSender()
        );
    }

    /**
     * @dev see {ISpotDex-openMarketOrder}
     */
    function openMarketOrder(
        IMatchingEngineAMM pairManager,
        Side side,
        uint256 quantity
    ) public payable virtual {
        _openMarketOrder(pairManager, side, quantity, _msgSender());
    }

    /**
     * @dev see {ISpotDex-openMarketOrderWithQuote}
     */
    function openMarketOrderWithQuote(
        IMatchingEngineAMM pairManager,
        Side side,
        uint256 quoteAmount
    ) public payable virtual {
        _openMarketOrderWithQuote(pairManager, side, quoteAmount, _msgSender());
    }

    /**
     * @dev see {ISpotDex-cancelAllLimitOrder}
     */
    function cancelAllLimitOrder(IMatchingEngineAMM pairManager)
        public
        virtual
    {
        address _trader = _msgSender();
        uint256 refundQuote;
        uint256 refundBase;
        uint256 quoteFilled;
        uint256 baseFilled;
        uint256 basicPoint;
        SpotFactoryStorage.Pair memory pair = _getQuoteAndBase(pairManager);

        (quoteFilled, baseFilled, basicPoint) = getAmountClaimable(
            pairManager,
            _trader
        );

        PendingLimitOrder[]
            memory _listPendingLimitOrder = getPendingLimitOrders(
                pairManager,
                _trader
            );
        Require._require(
            _listPendingLimitOrder.length > 0,
            DexErrors.DEX_NO_LIMIT_TO_CANCEL
        );

        uint128[] memory _listPips = new uint128[](
            _listPendingLimitOrder.length
        );

        uint64[] memory _orderIds = new uint64[](_listPendingLimitOrder.length);

        Side[] memory _listSides = new Side[](_listPendingLimitOrder.length);

        for (uint64 i = 0; i < _listPendingLimitOrder.length; i++) {
            PendingLimitOrder
                memory _pendingLimitOrder = _listPendingLimitOrder[i];

            if (_pendingLimitOrder.quantity == 0) {
                continue;
            }

            _listPips[i] = _pendingLimitOrder.pip;
            _orderIds[i] = _pendingLimitOrder.orderId;
            _listSides[i] = _pendingLimitOrder.isBuy ? Side.BUY : Side.SELL;

            (uint256 refundQuantity, ) = pairManager.cancelLimitOrder(
                _pendingLimitOrder.pip,
                _pendingLimitOrder.orderId
            );

            if (_pendingLimitOrder.isBuy) {
                refundQuote += _baseToQuote(
                    refundQuantity,
                    _pendingLimitOrder.pip,
                    basicPoint
                );
            } else {
                refundBase += refundQuantity;
            }
        }

        delete limitOrders[address(pairManager)][_trader];

        _withdrawCancelAll(
            pairManager,
            _trader,
            Asset.Quote,
            refundQuote,
            quoteFilled,
            pair
        );
        _withdrawCancelAll(
            pairManager,
            _trader,
            Asset.Base,
            refundBase,
            baseFilled,
            pair
        );

        emitAllLimitOrderCancelled(
            _trader,
            pairManager,
            _listPips,
            _orderIds,
            _listSides
        );
    }

    struct ModifyLimitOrder {
        uint64 orderIdx;
        uint128 editToPip;
    }
    struct ModifyLimitOrderState {
        uint256 totalRefundBase;
        uint256 totalRefundQuote;
        uint128 currentPip;
    }

    function modifyLimitOrder(
        IMatchingEngineAMM pairManager,
        ModifyLimitOrder[] memory modifyData
    ) public virtual {
        OpenLimitOrderState memory state;
        ModifyLimitOrderState memory modifyState;
        state.pair = _getQuoteAndBase(pairManager);
        state.basicPoint = _basisPoint(pairManager);
        modifyState.currentPip = pairManager.getCurrentPip();

        address _trader = _msgSender();
        SpotLimitOrder.Data[] storage _orders = limitOrders[
            address(pairManager)
        ][_trader];
        uint16 fee = _getFee();

        for (uint256 i = 0; i < modifyData.length; i++) {
            SpotLimitOrder.Data memory _order = _orders[modifyData[i].orderIdx];
            Require._require(
                _order.baseAmount != 0 && _order.quoteAmount != 0,
                DexErrors.DEX_NO_LIMIT_TO_CANCEL
            );

            (bool isFilled, bool isBuy, , ) = pairManager.getPendingOrderDetail(
                _order.pip,
                _order.orderId
            );

            if (isFilled) continue;

            (uint256 refundQuantity, uint256 partialFilled) = pairManager
                .cancelLimitOrder(_order.pip, _order.orderId);

            uint256 _quoteAmount = _baseToQuote(
                refundQuantity,
                _order.pip,
                state.basicPoint
            );
            if (isBuy) {
                modifyState.totalRefundBase += partialFilled;

                refundQuantity = _quoteToBase(
                    _quoteAmount,
                    modifyData[i].editToPip,
                    state.basicPoint
                );
            } else {
                modifyState.totalRefundQuote += _baseToQuote(
                    partialFilled,
                    _order.pip,
                    state.basicPoint
                );
            }
            Require._require(
                (isBuy && modifyData[i].editToPip < modifyState.currentPip) ||
                    (!isBuy &&
                        modifyData[i].editToPip > modifyState.currentPip),
                "!LO"
            );

            (state.orderId, , , ) = pairManager.openLimit(
                modifyData[i].editToPip,
                refundQuantity.Uint256ToUint128(),
                isBuy,
                _trader,
                0,
                fee
            );

            pushLimitOrder(
                address(pairManager),
                _trader,
                modifyData[i].editToPip,
                state.orderId,
                isBuy,
                _quoteAmount.Uint256ToUint128(),
                (refundQuantity).Uint256ToUint128(),
                fee
            );

            delete _orders[modifyData[i].orderIdx];
        }

        _withdraw(
            pairManager,
            _trader,
            Asset.Quote,
            modifyState.totalRefundQuote,
            false,
            state.pair
        );
        _withdraw(
            pairManager,
            _trader,
            Asset.Base,
            modifyState.totalRefundBase,
            false,
            state.pair
        );
    }

    /**
     * @dev see {ISpotDex-cancelLimitOrder}
     */
    function cancelLimitOrder(
        IMatchingEngineAMM pairManager,
        uint64 orderIdx,
        uint128 pip
    ) public virtual {
        address _trader = _msgSender();
        uint256 basicPoint = _basisPoint(pairManager);
        SpotFactoryStorage.Pair memory pair = _getQuoteAndBase(pairManager);

        SpotLimitOrder.Data[] storage _orders = limitOrders[
            address(pairManager)
        ][_trader];
        Require._require(
            orderIdx < _orders.length,
            DexErrors.DEX_INVALID_ORDER_ID
        );

        // save gas
        SpotLimitOrder.Data memory _order = _orders[orderIdx];

        Require._require(
            _order.baseAmount != 0 && _order.quoteAmount != 0,
            DexErrors.DEX_NO_LIMIT_TO_CANCEL
        );

        (bool isFilled, , , ) = pairManager.getPendingOrderDetail(
            _order.pip,
            _order.orderId
        );

        Require._require(
            isFilled == false,
            DexErrors.DEX_ORDER_MUST_NOT_FILLED
        );

        (uint256 refundQuantity, uint256 partialFilled) = pairManager
            .cancelLimitOrder(_order.pip, _order.orderId);

        if (_order.isBuy) {
            uint256 quoteAmount = _baseToQuote(
                refundQuantity,
                _order.pip,
                basicPoint
            );

            _withdraw(
                pairManager,
                _trader,
                Asset.Quote,
                quoteAmount,
                false,
                pair
            );
            _withdraw(
                pairManager,
                _trader,
                Asset.Base,
                partialFilled,
                true,
                pair
            );
        } else {
            _withdraw(
                pairManager,
                _trader,
                Asset.Base,
                refundQuantity,
                false,
                pair
            );
            if (partialFilled > 0) {
                _withdraw(
                    pairManager,
                    _trader,
                    Asset.Quote,
                    _baseToQuote(partialFilled, _order.pip, basicPoint),
                    true,
                    pair
                );
            }
        }
        delete _orders[orderIdx];

        emitLimitOrderCancelled(
            _trader,
            pairManager,
            _order.pip,
            _order.isBuy ? Side.BUY : Side.SELL,
            _order.orderId
        );
    }

    /**
     * @dev see {ISpotDex-claimAsset}
     */
    function claimAsset(IMatchingEngineAMM pairManager) public virtual {
        address _trader = _msgSender();
        SpotFactoryStorage.Pair memory pair = _getQuoteAndBase(pairManager);

        (
            uint256 quoteAmount,
            uint256 baseAmount,
            uint256 basicPoint
        ) = getAmountClaimable(pairManager, _trader);
        Require._require(
            quoteAmount > 0 || baseAmount > 0,
            DexErrors.DEX_NO_AMOUNT_TO_CLAIM
        );
        _clearLimitOrder(address(pairManager), _trader, basicPoint);

        _withdraw(pairManager, _trader, Asset.Quote, quoteAmount, true, pair);
        _withdraw(pairManager, _trader, Asset.Base, baseAmount, true, pair);

        emit AssetClaimed(_trader, pairManager, quoteAmount, baseAmount);
    }

    /**
     * @dev see {ISpotDex-getAmountClaimable}
     */
    function getAmountClaimable(IMatchingEngineAMM pairManager, address trader)
        public
        view
        virtual
        returns (
            uint256 quoteAmount,
            uint256 baseAmount,
            uint256 basisPoint
        )
    {
        address _pairManagerAddress = address(pairManager);

        SpotLimitOrder.Data[] memory listLimitOrder = limitOrders[
            _pairManagerAddress
        ][trader];
        uint256 i = 0;
        basisPoint = _basisPoint(pairManager);
        uint128 _feeBasis = FixedPoint128.BASIC_POINT_FEE;
        IMatchingEngineAMM.ExchangedData memory exData = IMatchingEngineAMM
            .ExchangedData({
                baseAmount: 0,
                quoteAmount: 0,
                feeQuoteAmount: 0,
                feeBaseAmount: 0
            });
        for (i; i < listLimitOrder.length; i++) {
            if (listLimitOrder[i].pip == 0 && listLimitOrder[i].orderId == 0)
                continue;
            exData = pairManager.accumulateClaimableAmount(
                listLimitOrder[i].pip,
                listLimitOrder[i].orderId,
                exData,
                basisPoint,
                listLimitOrder[i].fee,
                _feeBasis
            );
        }
        return (exData.quoteAmount, exData.baseAmount, basisPoint);
    }

    /**
     * @dev see {ISpotDex-getPendingLimitOrders}
     */
    function getPendingLimitOrders(
        IMatchingEngineAMM pairManager,
        address trader
    ) public view virtual returns (PendingLimitOrder[] memory) {
        address _pairManagerAddress = address(pairManager);
        SpotLimitOrder.Data[] storage listLimitOrder = limitOrders[
            _pairManagerAddress
        ][trader];
        PendingLimitOrder[]
            memory listPendingOrderData = new PendingLimitOrder[](
                listLimitOrder.length
            );
        uint256 index = 0;
        for (uint256 i = 0; i < listLimitOrder.length; i++) {
            (
                bool isFilled,
                bool isBuy,
                uint256 quantity,
                uint256 partialFilled
            ) = pairManager.getPendingOrderDetail(
                    listLimitOrder[i].pip,
                    listLimitOrder[i].orderId
                );
            if (!isFilled) {
                listPendingOrderData[index] = PendingLimitOrder({
                    isBuy: isBuy,
                    quantity: quantity,
                    partialFilled: partialFilled,
                    pip: listLimitOrder[i].pip,
                    blockNumber: listLimitOrder[i].blockNumber,
                    orderIdOfTrader: i,
                    orderId: listLimitOrder[i].orderId,
                    fee: listLimitOrder[i].fee
                });
                index++;
            }
        }
        for (uint256 i = 0; i < listPendingOrderData.length; i++) {
            if (listPendingOrderData[i].quantity != 0) {
                return listPendingOrderData;
            }
        }
        PendingLimitOrder[] memory blankListPendingOrderData;
        return blankListPendingOrderData;
    }

    /**
     * @dev see {ISpotDex-getBatchPendingLimitOrdersByTrader}
     */
    function getBatchPendingLimitOrdersByTrader(
        IMatchingEngineAMM pairManager,
        address[] memory traders
    ) public view returns (BatchPendingLimitOrder[] memory batchPendingOrders) {
        batchPendingOrders = new BatchPendingLimitOrder[](traders.length);
        for (uint256 i = 0; i < traders.length; i++) {
            batchPendingOrders[i].instance = traders[i];
            batchPendingOrders[i].pendingOrders = getPendingLimitOrders(
                pairManager,
                traders[i]
            );
        }
    }

    /**
     * @dev see {ISpotDex-getBatchPendingLimitOrdersByPair}
     */
    function getBatchPendingLimitOrdersByPair(
        IMatchingEngineAMM[] memory pairManagers,
        address trader
    ) public view returns (BatchPendingLimitOrder[] memory batchPendingOrders) {
        batchPendingOrders = new BatchPendingLimitOrder[](pairManagers.length);
        for (uint256 i = 0; i < pairManagers.length; i++) {
            batchPendingOrders[i].instance = address(pairManagers[i]);
            batchPendingOrders[i].pendingOrders = getPendingLimitOrders(
                pairManagers[i],
                trader
            );
        }
    }

    /**
     * @dev see {ISpotDex-getOrderIdOfTrader}
     */
    function getOrderIdOfTrader(
        address pairManager,
        address trader,
        uint128 pip,
        uint64 orderId
    ) public view returns (int256) {
        SpotLimitOrder.Data[] memory limitOrder = limitOrders[pairManager][
            trader
        ];

        for (uint256 i = 0; i < limitOrder.length; i++) {
            if (limitOrder[i].pip == pip && limitOrder[i].orderId == orderId) {
                return int256(i);
            }
        }
        return -1;
    }

    function _getQuoteAndBase(IMatchingEngineAMM _managerAddress)
        internal
        view
        virtual
        returns (SpotFactoryStorage.Pair memory pair)
    {}

    struct OpenLimitOrderState {
        uint64 orderId;
        uint256 sizeOut;
        uint256 quoteAmountFilled;
        uint256 feeAmount;
        uint256 basicPoint;
        uint16 fee;
        SpotFactoryStorage.Pair pair;
        uint256 quoteAmount;
    }

    function _openLimitOrder(
        IMatchingEngineAMM _pairManager,
        uint256 _quantity,
        uint128 _pip,
        address _trader,
        Side _side
    ) internal {
        address _pairManagerAddress = address(_pairManager);
        OpenLimitOrderState memory state;

        state.pair = _getQuoteAndBase(_pairManager);
        state.quoteAmount;
        state.basicPoint = _basisPoint(_pairManager);
        state.fee = _getFee();
        bool isBuy = _side == Side.BUY ? true : false;
        if (!isBuy) {
            // Sell limit
            // deposit base asset
            // with token has RFI we need deposit first
            // and get real balance transferred
            _quantity = _deposit(
                _pairManager,
                _trader,
                Asset.Base,
                _quantity.Uint256ToUint128(),
                state.pair
            );
        }
        (
            state.orderId,
            state.sizeOut,
            state.quoteAmountFilled,
            state.feeAmount
        ) = _pairManager.openLimit(
            _pip,
            _quantity.Uint256ToUint128(),
            isBuy,
            _trader,
            0,
            state.fee
        );
        if (isBuy) {
            // Buy limit
            state.quoteAmount =
                _baseToQuote(
                    (_quantity - state.sizeOut),
                    _pip,
                    state.basicPoint
                ) +
                state.quoteAmountFilled;

            // quoteAmount += _feeCalculator(quoteAmount, fee);
            // deposit quote asset
            // with token has RFI we need deposit first
            // and get real balance transferred
            uint256 quoteAmountTransferred = _deposit(
                _pairManager,
                _trader,
                Asset.Quote,
                state.quoteAmount,
                state.pair
            );

            Require._require(
                quoteAmountTransferred == state.quoteAmount,
                DexErrors.DEX_MUST_NOT_TOKEN_RFI
            );
        } else {
            state.quoteAmount = _baseToQuote(
                _quantity - state.sizeOut,
                _pip,
                state.basicPoint
            );
        }

        if (_quantity > state.sizeOut) {
            pushLimitOrder(
                _pairManagerAddress,
                _trader,
                _pip,
                state.orderId,
                isBuy,
                state.quoteAmount.Uint256ToUint128(),
                (_quantity - state.sizeOut).Uint256ToUint128(),
                state.fee
            );
        }

        if (isBuy) {
            // withdraw  base asset
            _withdraw(
                _pairManager,
                _trader,
                Asset.Base,
                state.sizeOut - state.feeAmount,
                false,
                state.pair
            );
        }
        if (!isBuy) {
            // withdraw quote asset
            _withdraw(
                _pairManager,
                _trader,
                Asset.Quote,
                state.quoteAmountFilled - state.feeAmount,
                false,
                state.pair
            );
        }

        emitLimitOrderOpened(
            state.orderId,
            _trader,
            _quantity - state.sizeOut,
            state.sizeOut,
            _pip,
            isBuy ? Side.BUY : Side.SELL,
            _pairManagerAddress
        );
    }

    function _openBuyLimitOrderWithQuote(
        IMatchingEngineAMM _pairManager,
        uint256 _quoteAmount,
        uint128 _pip,
        address _trader
    ) internal {
        address _pairManagerAddress = address(_pairManager);
        OpenLimitOrderState memory state;
        state.pair = _getQuoteAndBase(_pairManager);
        state.basicPoint = _basisPoint(_pairManager);

        state.fee = _getFee();

        uint256 quoteAmountTransferred = _deposit(
            _pairManager,
            _trader,
            Asset.Quote,
            _quoteAmount,
            state.pair
        );

        (
            state.orderId,
            state.sizeOut,
            state.quoteAmountFilled,
            state.feeAmount
        ) = _pairManager.openLimit(
            _pip,
            _quoteToBase(quoteAmountTransferred, _pip, state.basicPoint)
                .Uint256ToUint128(),
            true,
            _trader,
            quoteAmountTransferred,
            state.fee
        );
        if (quoteAmountTransferred == state.quoteAmountFilled) {
            emitMarketOrderOpened(
                _trader,
                state.sizeOut,
                state.quoteAmountFilled,
                Side.BUY,
                _pairManager,
                _pairManager.getCurrentPip()
            );
        } else {
            uint256 amountBaseOpen = _quoteToBase(
                quoteAmountTransferred - state.quoteAmountFilled,
                _pip,
                state.basicPoint
            );

            pushLimitOrder(
                _pairManagerAddress,
                _trader,
                _pip,
                state.orderId,
                true,
                quoteAmountTransferred.Uint256ToUint128() -
                    state.quoteAmountFilled.Uint256ToUint128(),
                amountBaseOpen.Uint256ToUint128(),
                state.fee
            );

            emitLimitOrderOpened(
                state.orderId,
                _trader,
                amountBaseOpen,
                state.sizeOut,
                _pip,
                Side.BUY,
                _pairManagerAddress
            );
        }
        _withdraw(
            _pairManager,
            _trader,
            Asset.Base,
            state.sizeOut,
            false,
            state.pair
        );
    }

    struct OpenMarketState {
        uint256 mainSideOut;
        uint256 flipSideOut;
        uint256 feeAmount;
        SpotFactoryStorage.Pair pair;
    }

    function _openMarketOrder(
        IMatchingEngineAMM _pairManager,
        Side _side,
        uint256 _quantity,
        address _trader
    ) internal {
        /// state.mainSideOut is base asset
        /// state.flipSideOut is quote asset
        OpenMarketState memory state;
        state.pair = _getQuoteAndBase(_pairManager);

        uint16 fee = _getFee();

        if (_side == Side.BUY) {
            (
                state.mainSideOut,
                state.flipSideOut,
                state.feeAmount
            ) = _pairManager.openMarket(_quantity, true, _trader, fee);
            Require._require(
                state.mainSideOut == _quantity,
                DexErrors.DEX_MARKET_NOT_FULL_FILL
            );

            // deposit quote asset
            uint256 amountTransferred = _deposit(
                _pairManager,
                _trader,
                Asset.Quote,
                state.flipSideOut,
                state.pair
            );

            Require._require(
                amountTransferred == state.flipSideOut,
                DexErrors.DEX_MUST_NOT_TOKEN_RFI
            );

            // withdraw base asset
            // after BUY done, transfer base back to trader
            _withdraw(
                _pairManager,
                _trader,
                Asset.Base,
                _quantity - state.feeAmount,
                false,
                state.pair
            );
        } else {
            // SELL market
            uint256 baseAmountTransferred = _deposit(
                _pairManager,
                _trader,
                Asset.Base,
                _quantity,
                state.pair
            );

            (
                state.mainSideOut,
                state.flipSideOut,
                state.feeAmount
            ) = _pairManager.openMarket(
                baseAmountTransferred,
                false,
                _trader,
                fee
            );
            Require._require(
                state.mainSideOut == baseAmountTransferred,
                DexErrors.DEX_MARKET_NOT_FULL_FILL
            );

            _withdraw(
                _pairManager,
                _trader,
                Asset.Quote,
                state.flipSideOut - state.feeAmount,
                false,
                state.pair
            );

            _quantity = baseAmountTransferred;
        }

        emitMarketOrderOpened(
            _trader,
            state.mainSideOut,
            state.flipSideOut,
            _side,
            _pairManager,
            _pairManager.getCurrentPip()
        );
    }

    function _openMarketOrderWithQuote(
        IMatchingEngineAMM _pairManager,
        Side _side,
        uint256 _quoteAmount,
        address _trader
    ) internal {
        /// state.mainSideOut is quote asset
        /// state.flipSideOut is base asset
        OpenMarketState memory state;
        state.pair = _getQuoteAndBase(_pairManager);

        uint16 fee = _getFee();

        if (_side == Side.BUY) {
            // deposit quote asset
            uint256 amountTransferred = _deposit(
                _pairManager,
                _trader,
                Asset.Quote,
                _quoteAmount,
                state.pair
            );
            (
                state.mainSideOut,
                state.flipSideOut,
                state.feeAmount
            ) = _pairManager.openMarketWithQuoteAsset(
                amountTransferred,
                true,
                _trader,
                fee
            );

            Require._require(
                state.mainSideOut == amountTransferred,
                DexErrors.DEX_MARKET_NOT_FULL_FILL
            );

            // withdraw base asset
            // after BUY done, transfer base back to trader
            _withdraw(
                _pairManager,
                _trader,
                Asset.Base,
                state.flipSideOut - state.feeAmount,
                false,
                state.pair
            );
        } else {
            // SELL market

            (
                state.mainSideOut,
                state.flipSideOut,
                state.feeAmount
            ) = _pairManager.openMarketWithQuoteAsset(
                _quoteAmount,
                false,
                _trader,
                fee
            );
            uint256 amountTransferred = _deposit(
                _pairManager,
                _trader,
                Asset.Base,
                state.flipSideOut,
                state.pair
            );
            Require._require(
                state.mainSideOut == _quoteAmount,
                DexErrors.DEX_MARKET_NOT_FULL_FILL
            );
            Require._require(
                state.flipSideOut == amountTransferred,
                DexErrors.DEX_MUST_NOT_TOKEN_RFI
            );
            _withdraw(
                _pairManager,
                _trader,
                Asset.Quote,
                _quoteAmount - state.feeAmount,
                false,
                state.pair
            );
        }
        emitMarketOrderOpened(
            _trader,
            state.flipSideOut,
            state.mainSideOut,
            _side,
            _pairManager,
            _pairManager.getCurrentPip()
        );
    }

    function _clearLimitOrder(
        address _pairManagerAddress,
        address _trader,
        uint256 basicPoint
    ) internal {
        if (limitOrders[_pairManagerAddress][_trader].length > 0) {
            SpotLimitOrder.Data[]
                memory subListLimitOrder = _clearAllFilledOrder(
                    IMatchingEngineAMM(_pairManagerAddress),
                    limitOrders[_pairManagerAddress][_trader],
                    basicPoint
                );
            delete limitOrders[_pairManagerAddress][_trader];
            for (uint256 i = 0; i < subListLimitOrder.length; i++) {
                if (subListLimitOrder[i].pip == 0) {
                    break;
                }
                pushLimitOrder(
                    _pairManagerAddress,
                    _trader,
                    subListLimitOrder[i].pip,
                    subListLimitOrder[i].orderId,
                    subListLimitOrder[i].isBuy,
                    subListLimitOrder[i].quoteAmount,
                    subListLimitOrder[i].baseAmount,
                    subListLimitOrder[i].fee
                );
            }
        }
    }

    function _clearAllFilledOrder(
        IMatchingEngineAMM _pairManager,
        SpotLimitOrder.Data[] memory listLimitOrder,
        uint256 basicPoint
    ) internal returns (SpotLimitOrder.Data[] memory) {
        SpotLimitOrder.Data[]
            memory subListLimitOrder = new SpotLimitOrder.Data[](
                listLimitOrder.length
            );
        uint256 index = 0;
        for (uint256 i = 0; i < listLimitOrder.length; i++) {
            (
                bool isFilled,
                ,
                uint256 size,
                uint256 partialFilled
            ) = _pairManager.getPendingOrderDetail(
                    listLimitOrder[i].pip,
                    listLimitOrder[i].orderId
                );
            if (!isFilled) {
                subListLimitOrder[index] = listLimitOrder[i];
                if (partialFilled > 0) {
                    subListLimitOrder[index].baseAmount = (size - partialFilled)
                        .Uint256ToUint128();
                    subListLimitOrder[index].quoteAmount = (
                        _baseToQuote(
                            size - partialFilled,
                            listLimitOrder[i].pip,
                            basicPoint
                        )
                    ).Uint256ToUint128();
                }
                _pairManager.updatePartialFilledOrder(
                    listLimitOrder[i].pip,
                    listLimitOrder[i].orderId
                );
                index++;
            }
        }

        return subListLimitOrder;
    }

    function pushLimitOrder(
        address _pairManager,
        address _trader,
        uint128 _pip,
        uint64 _orderId,
        bool _isBuy,
        uint128 _quoteAmount,
        uint128 _baseAmount,
        uint16 _fee
    ) internal {
        limitOrders[_pairManager][_trader].push(
            SpotLimitOrder.Data({
                pip: _pip,
                orderId: _orderId,
                isBuy: _isBuy,
                quoteAmount: _quoteAmount,
                baseAmount: _baseAmount,
                blockNumber: block.number.Uint256ToUint40(),
                fee: _fee
            })
        );
    }

    function emitMarketOrderOpened(
        address trader,
        uint256 quantity,
        uint256 openNational,
        SpotHouseStorage.Side side,
        IMatchingEngineAMM spotManager,
        uint128 currentPip
    ) internal {
        emit MarketOrderOpened(
            trader,
            quantity,
            openNational,
            side,
            spotManager,
            currentPip
        );
    }

    function emitLimitOrderOpened(
        uint64 orderId,
        address trader,
        uint256 quantity,
        uint256 sizeOut,
        uint128 pip,
        SpotHouseStorage.Side _side,
        address spotManager
    ) internal {
        emit LimitOrderOpened(
            orderId,
            trader,
            quantity,
            sizeOut,
            pip,
            _side,
            spotManager
        );
    }

    function emitLimitOrderCancelled(
        address _trader,
        IMatchingEngineAMM _pairManager,
        uint128 pip,
        SpotHouseStorage.Side _side,
        uint64 orderId
    ) internal {
        emit LimitOrderCancelled(_trader, _pairManager, pip, _side, orderId);
    }

    function emitAllLimitOrderCancelled(
        address _trader,
        IMatchingEngineAMM _pairManager,
        uint128[] memory _listPips,
        uint64[] memory _orderIds,
        SpotHouseStorage.Side[] memory _listSides
    ) internal {
        emit AllLimitOrderCancelled(
            _trader,
            _pairManager,
            _listPips,
            _orderIds,
            _listSides
        );
    }

    // INTERNAL FUNCTIONS

    function _baseToQuote(
        uint256 baseAmount,
        uint128 pip,
        uint256 basisPoint
    ) internal pure returns (uint256) {
        return TradeConvert.baseToQuote(baseAmount, pip, basisPoint);
    }

    function _quoteToBase(
        uint256 quoteAmount,
        uint128 pip,
        uint256 basisPoint
    ) internal pure returns (uint256) {
        return TradeConvert.quoteToBase(quoteAmount, pip, basisPoint);
    }

    function _basisPoint(IMatchingEngineAMM _pairManager)
        internal
        view
        returns (uint256)
    {
        return _pairManager.basisPoint();
    }

    // HOOK
    function _depositBNB(address _pairManagerAddress, uint256 _amount)
        internal
        virtual
    {}

    function _withdrawBNB(
        address _trader,
        address _pairManagerAddress,
        uint256 _amount
    ) internal virtual {}

    function _withdraw(
        IMatchingEngineAMM _pairManager,
        address _recipient,
        Asset asset,
        uint256 _amount,
        bool isTakeFee,
        SpotFactoryStorage.Pair memory _pair
    ) internal virtual {}

    function _deposit(
        IMatchingEngineAMM _pairManager,
        address _payer,
        Asset _asset,
        uint256 _amount,
        SpotFactoryStorage.Pair memory _pair
    ) internal virtual returns (uint256) {}

    function _withdrawCancelAll(
        IMatchingEngineAMM _pairManager,
        address _recipient,
        Asset asset,
        uint256 _amountRefund,
        uint256 _amountFilled,
        SpotFactoryStorage.Pair memory _pair
    ) internal virtual {}

    function _msgSender() internal view virtual returns (address) {}

    function _getFee() internal view virtual returns (uint16) {}
}
