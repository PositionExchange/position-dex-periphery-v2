/**
 * @author Musket
 */
// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.9;

import "@positionex/matching-engine/contracts/interfaces/IMatchingEngineAMM.sol";
import "@positionex/matching-engine/contracts/libraries/helper/TradeConvert.sol";
import "@positionex/matching-engine/contracts/libraries/helper/Require.sol";
import "@positionex/matching-engine/contracts/libraries/helper/FixedPoint128.sol";

import "../libraries/types/SpotFactoryStorage.sol";
import "../libraries/types/SpotHouseStorage.sol";
import "../libraries/types/SpotHouseStorage.sol";
import "./Block.sol";
import "../libraries/helper/Convert.sol";
import "../interfaces/ISpotDex.sol";

abstract contract SpotDex is ISpotDex, SpotHouseStorage {
    using Convert for uint256;

    /**
     * @dev see {ISpotHouse-openLimitOrder}
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

    function openBuyLimitOrderExactInput(
        IMatchingEngineAMM pairManager,
        Side side,
        uint256 quantity,
        uint128 pip
    ) public payable virtual {
        Require._require(side == Side.BUY, DexErrors.DEX_MUST_ORDER_BUY);
        address trader = _msgSender();
        _openBuyLimitOrderExactInput(pairManager, quantity, pip, trader);
    }

    function openMarketOrder(
        IMatchingEngineAMM _pairManager,
        Side _side,
        uint256 _quantity
    ) public payable virtual {
        address _trader = _msgSender();

        _openMarketOrder(_pairManager, _side, _quantity, _trader, _trader);
    }

    function openMarketOrder(
        IMatchingEngineAMM _pairManager,
        Side _side,
        uint256 _quantity,
        address _payer,
        address _recipient
    ) public payable virtual returns (uint256[] memory) {
        return
            _openMarketOrder(
                _pairManager,
                _side,
                _quantity,
                _payer,
                _recipient
            );
    }

    function openMarketOrderWithQuote(
        IMatchingEngineAMM _pairManager,
        Side _side,
        uint256 _quoteAmount
    ) public payable virtual {
        address _trader = _msgSender();

        _openMarketOrderWithQuote(
            _pairManager,
            _side,
            _quoteAmount,
            _trader,
            _trader
        );
    }

    function openMarketOrderWithQuote(
        IMatchingEngineAMM _pairManager,
        Side _side,
        uint256 _quoteAmount,
        address _payer,
        address _recipient
    ) public payable virtual returns (uint256[] memory) {
        return
            _openMarketOrderWithQuote(
                _pairManager,
                _side,
                _quoteAmount,
                _payer,
                _recipient
            );
    }

    function cancelAllLimitOrder(IMatchingEngineAMM _pairManager)
        public
        virtual
    {
        address _trader = _msgSender();

        uint256 refundQuote;
        uint256 refundBase;
        uint256 quoteFilled;
        uint256 baseFilled;
        uint256 basicPoint;

        (quoteFilled, baseFilled, basicPoint) = getAmountClaimable(
            _pairManager,
            _trader
        );

        PendingLimitOrder[]
            memory _listPendingLimitOrder = getPendingLimitOrders(
                _pairManager,
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

            (uint256 refundQuantity, ) = _pairManager.cancelLimitOrder(
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

        delete limitOrders[address(_pairManager)][_trader];

        _withdrawCancelAll(
            _pairManager,
            _trader,
            Asset.Quote,
            refundQuote,
            quoteFilled
        );
        _withdrawCancelAll(
            _pairManager,
            _trader,
            Asset.Base,
            refundBase,
            baseFilled
        );

        emitAllLimitOrderCancelled(
            _trader,
            _pairManager,
            _listPips,
            _orderIds,
            _listSides
        );
    }

    function cancelLimitOrder(
        IMatchingEngineAMM _pairManager,
        uint64 _orderIdx,
        uint128 _pip
    ) public virtual {
        address _trader = _msgSender();
        uint256 basicPoint = _basisPoint(_pairManager);

        SpotLimitOrder.Data[] storage _orders = limitOrders[
            address(_pairManager)
        ][_trader];
        Require._require(
            _orderIdx < _orders.length,
            DexErrors.DEX_INVALID_ORDER_ID
        );

        // save gas
        SpotLimitOrder.Data memory _order = _orders[_orderIdx];

        Require._require(
            _order.baseAmount != 0 && _order.quoteAmount != 0,
            DexErrors.DEX_NO_LIMIT_TO_CANCEL
        );

        (bool isFilled, , , ) = _pairManager.getPendingOrderDetail(
            _order.pip,
            _order.orderId
        );

        Require._require(
            isFilled == false,
            DexErrors.DEX_ORDER_MUST_NOT_FILLED
        );

        (uint256 refundQuantity, uint256 partialFilled) = _pairManager
            .cancelLimitOrder(_order.pip, _order.orderId);

        if (_order.isBuy) {
            uint256 quoteAmount = _baseToQuote(
                refundQuantity,
                _order.pip,
                basicPoint
            );

            _withdraw(_pairManager, _trader, Asset.Quote, quoteAmount, false);
            _withdraw(_pairManager, _trader, Asset.Base, partialFilled, true);
        } else {
            _withdraw(_pairManager, _trader, Asset.Base, refundQuantity, false);
            if (partialFilled > 0) {
                _withdraw(
                    _pairManager,
                    _trader,
                    Asset.Quote,
                    _baseToQuote(partialFilled, _order.pip, basicPoint),
                    true
                );
            }
        }
        delete _orders[_orderIdx];

        emitLimitOrderCancelled(
            _trader,
            _pairManager,
            _order.pip,
            _order.isBuy ? Side.BUY : Side.SELL,
            _order.orderId
        );
    }

    function claimAsset(IMatchingEngineAMM _pairManager) public virtual {
        address _trader = _msgSender();

        (
            uint256 quoteAmount,
            uint256 baseAmount,
            uint256 basicPoint
        ) = getAmountClaimable(_pairManager, _trader);
        Require._require(
            quoteAmount > 0 || baseAmount > 0,
            DexErrors.DEX_NO_AMOUNT_TO_CLAIM
        );
        _clearLimitOrder(address(_pairManager), _trader, basicPoint);

        _withdraw(_pairManager, _trader, Asset.Quote, quoteAmount, true);
        _withdraw(_pairManager, _trader, Asset.Base, baseAmount, true);

        emit AssetClaimed(_trader, _pairManager, quoteAmount, baseAmount);
    }

    function getAmountClaimable(
        IMatchingEngineAMM _pairManager,
        address _trader
    )
        public
        view
        virtual
        returns (
            uint256 quoteAmount,
            uint256 baseAmount,
            uint256 basisPoint
        )
    {
        address _pairManagerAddress = address(_pairManager);

        SpotLimitOrder.Data[] memory listLimitOrder = limitOrders[
            _pairManagerAddress
        ][_trader];
        uint256 i = 0;
        basisPoint = _basisPoint(_pairManager);
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
            exData = _pairManager.accumulateClaimableAmount(
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

    function getPendingLimitOrders(
        IMatchingEngineAMM _pairManager,
        address _trader
    ) public view virtual returns (PendingLimitOrder[] memory) {
        address _pairManagerAddress = address(_pairManager);
        SpotLimitOrder.Data[] storage listLimitOrder = limitOrders[
            _pairManagerAddress
        ][_trader];
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
            ) = _pairManager.getPendingOrderDetail(
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

    struct BatchPendingLimitOrder {
        address instance;
        PendingLimitOrder[] pendingOrders;
    }

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

    function getOrderIdOfTrader(
        address _pairManager,
        address _trader,
        uint128 _pip,
        uint64 _orderId
    ) public view returns (int256) {
        SpotLimitOrder.Data[] memory limitOrder = limitOrders[_pairManager][
            _trader
        ];

        for (uint256 i = 0; i < limitOrder.length; i++) {
            if (
                limitOrder[i].pip == _pip && limitOrder[i].orderId == _orderId
            ) {
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
        uint256 quoteAmount;
        state.basicPoint = _basisPoint(_pairManager);
        uint16 fee = _getFee();
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
                _quantity.Uint256ToUint128()
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
            fee
        );
        if (isBuy) {
            // Buy limit
            quoteAmount =
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
                quoteAmount
            );

            Require._require(
                quoteAmountTransferred == quoteAmount,
                DexErrors.DEX_MUST_NOT_TOKEN_RFI
            );
        } else {
            quoteAmount = _baseToQuote(
                _quantity - state.sizeOut,
                _pip,
                state.basicPoint
            );
        }

        if (_quantity > state.sizeOut) {
            limitOrders[_pairManagerAddress][_trader].push(
                SpotLimitOrder.Data({
                    pip: _pip,
                    orderId: state.orderId,
                    isBuy: isBuy,
                    quoteAmount: quoteAmount.Uint256ToUint128(),
                    baseAmount: (_quantity - state.sizeOut).Uint256ToUint128(),
                    blockNumber: block.number.Uint256ToUint40(),
                    fee: fee
                })
            );
        }

        if (isBuy) {
            // withdraw  base asset
            _withdraw(
                _pairManager,
                _trader,
                Asset.Base,
                state.sizeOut - state.feeAmount,
                false
            );
        }
        if (!isBuy) {
            // withdraw quote asset
            _withdraw(
                _pairManager,
                _trader,
                Asset.Quote,
                state.quoteAmountFilled - state.feeAmount,
                false
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

    function _openBuyLimitOrderExactInput(
        IMatchingEngineAMM _pairManager,
        uint256 _quantity,
        uint128 _pip,
        address _trader
    ) internal {
        address _pairManagerAddress = address(_pairManager);
        OpenLimitOrderState memory state;
        state.basicPoint = _basisPoint(_pairManager);

        uint256 quoteAmount = _baseToQuote(_quantity, _pip, state.basicPoint);

        uint16 fee = _getFee();

        uint256 quoteAmountTransferred = _deposit(
            _pairManager,
            _trader,
            Asset.Quote,
            quoteAmount
        );

        if (quoteAmountTransferred != quoteAmount) {
            _quantity = _quoteToBase(
                quoteAmountTransferred,
                _pip,
                state.basicPoint
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
            true,
            _trader,
            quoteAmountTransferred,
            fee
        );
        uint256 baseAmountReceive = state.sizeOut;
        if (
            state.sizeOut == _quantity &&
            quoteAmountTransferred > state.quoteAmountFilled
        ) {
            _quantity = _quoteToBase(
                quoteAmountTransferred - state.quoteAmountFilled,
                _pip,
                state.basicPoint
            );

            emitMarketOrderOpened(
                _trader,
                state.sizeOut,
                state.quoteAmountFilled,
                Side.BUY,
                _pairManager,
                _pairManager.getCurrentPip()
            );
            state.sizeOut = 0;
        }

        if (_quantity > state.sizeOut) {
            limitOrders[_pairManagerAddress][_trader].push(
                SpotLimitOrder.Data({
                    pip: _pip,
                    orderId: state.orderId,
                    isBuy: true,
                    quoteAmount: _baseToQuote(
                        _quantity - state.sizeOut,
                        _pip,
                        state.basicPoint
                    ).Uint256ToUint128(),
                    baseAmount: (_quantity - state.sizeOut).Uint256ToUint128(),
                    blockNumber: block.number.Uint256ToUint40(),
                    fee: fee
                })
            );
        }
        _withdraw(_pairManager, _trader, Asset.Base, baseAmountReceive, false);

        emitLimitOrderOpened(
            state.orderId,
            _trader,
            _quantity - state.sizeOut,
            state.sizeOut,
            _pip,
            Side.BUY,
            _pairManagerAddress
        );
    }

    struct OpenMarketState {
        uint256 mainSideOut;
        uint256 flipSideOut;
        uint256 feeAmount;
    }

    function _openMarketOrder(
        IMatchingEngineAMM _pairManager,
        Side _side,
        uint256 _quantity,
        address _payer,
        address _recipient
    ) internal returns (uint256[] memory) {
        /// state.mainSideOut is base asset
        /// state.flipSideOut is quote asset
        OpenMarketState memory state;

        uint16 fee = _getFee();

        if (_side == Side.BUY) {
            (
                state.mainSideOut,
                state.flipSideOut,
                state.feeAmount
            ) = _pairManager.openMarket(_quantity, true, _payer, fee);
            Require._require(
                state.mainSideOut == _quantity,
                DexErrors.DEX_MARKET_NOT_FULL_FILL
            );

            // deposit quote asset
            uint256 amountTransferred = _deposit(
                _pairManager,
                _payer,
                Asset.Quote,
                state.flipSideOut
            );

            Require._require(
                amountTransferred == state.flipSideOut,
                DexErrors.DEX_MUST_NOT_TOKEN_RFI
            );

            // withdraw base asset
            // after BUY done, transfer base back to trader
            _withdraw(
                _pairManager,
                _recipient,
                Asset.Base,
                _quantity - state.feeAmount,
                false
            );
        } else {
            // SELL market
            uint256 baseAmountTransferred = _deposit(
                _pairManager,
                _payer,
                Asset.Base,
                _quantity
            );

            (
                state.mainSideOut,
                state.flipSideOut,
                state.feeAmount
            ) = _pairManager.openMarket(
                baseAmountTransferred,
                false,
                _payer,
                fee
            );
            Require._require(
                state.mainSideOut == baseAmountTransferred,
                DexErrors.DEX_MARKET_NOT_FULL_FILL
            );

            _withdraw(
                _pairManager,
                _recipient,
                Asset.Quote,
                state.flipSideOut - state.feeAmount,
                false
            );

            _quantity = baseAmountTransferred;
        }

        emitMarketOrderOpened(
            _payer,
            state.mainSideOut,
            state.flipSideOut,
            _side,
            _pairManager,
            _pairManager.getCurrentPip()
        );
        return _calculatorAmounts(_side, state.mainSideOut, state.flipSideOut);
    }

    function _openMarketOrderWithQuote(
        IMatchingEngineAMM _pairManager,
        Side _side,
        uint256 _quoteAmount,
        address _payer,
        address _recipient
    ) internal returns (uint256[] memory) {
        /// state.mainSideOut is quote asset
        /// state.flipSideOut is base asset
        OpenMarketState memory state;

        uint16 fee = _getFee();

        if (_side == Side.BUY) {
            // deposit quote asset
            uint256 amountTransferred = _deposit(
                _pairManager,
                _payer,
                Asset.Quote,
                _quoteAmount
            );
            (
                state.mainSideOut,
                state.flipSideOut,
                state.feeAmount
            ) = _pairManager.openMarketWithQuoteAsset(
                amountTransferred,
                true,
                _payer,
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
                _recipient,
                Asset.Base,
                state.flipSideOut - state.feeAmount,
                false
            );
        } else {
            // SELL market
            uint256 amountTransferred = _deposit(
                _pairManager,
                _payer,
                Asset.Base,
                _quoteAmount
            );

            (
                state.mainSideOut,
                state.flipSideOut,
                state.feeAmount
            ) = _pairManager.openMarketWithQuoteAsset(
                amountTransferred,
                false,
                _payer,
                fee
            );
            Require._require(
                state.mainSideOut == _quoteAmount,
                DexErrors.DEX_MARKET_NOT_FULL_FILL
            );
            _withdraw(
                _pairManager,
                _recipient,
                Asset.Quote,
                _quoteAmount - state.feeAmount,
                false
            );
        }
        emitMarketOrderOpened(
            _payer,
            state.flipSideOut,
            state.mainSideOut,
            _side,
            _pairManager,
            _pairManager.getCurrentPip()
        );
        return _calculatorAmounts(_side, state.flipSideOut, state.mainSideOut);
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
                limitOrders[_pairManagerAddress][_trader].push(
                    subListLimitOrder[i]
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

    function _trackingId(address pairManager) internal returns (uint256) {
        return spotFactory.getTrackingRequestId(pairManager);
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
            currentPip,
            0
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
            spotManager,
            0
        );
    }

    function emitLimitOrderCancelled(
        address _trader,
        IMatchingEngineAMM _pairManager,
        uint128 pip,
        SpotHouseStorage.Side _side,
        uint64 orderId
    ) internal {
        emit LimitOrderCancelled(_trader, _pairManager, pip, _side, orderId, 0);
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
            _listSides,
            0
        );
    }

    // INTERNAL FUNCTIONS
    function _calculatorAmounts(
        Side _side,
        uint256 baseAmount,
        uint256 quoteAmount
    ) internal pure returns (uint256[] memory) {
        uint256[] memory amounts = new uint256[](2);

        if (_side == Side.BUY) {
            amounts[0] = quoteAmount;
            amounts[1] = baseAmount;
        } else {
            amounts[0] = baseAmount;
            amounts[1] = quoteAmount;
        }

        return amounts;
    }

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
        bool isTakeFee
    ) internal virtual {}

    function _deposit(
        IMatchingEngineAMM _pairManager,
        address _payer,
        Asset _asset,
        uint256 _amount
    ) internal virtual returns (uint256) {}

    function _withdrawCancelAll(
        IMatchingEngineAMM _pairManager,
        address _recipient,
        Asset asset,
        uint256 _amountRefund,
        uint256 _amountFilled
    ) internal virtual {}

    function _msgSender() internal view virtual returns (address) {}

    function _getFee() internal view virtual returns (uint16) {}
}
