/**
 * @author Musket
 */
// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.9;

import "../libraries/types/SpotHouseStorage.sol";
import "../interfaces/IPairManager.sol";
import "../libraries/types/SpotFactoryStorage.sol";
import "../libraries/types/SpotHouseStorage.sol";
import "../libraries/types/SpotHouseStorage.sol";
import "../libraries/types/SpotHouseStorage.sol";
import "./Block.sol";
import "../interfaces/ISpotHouse.sol";
import "../libraries/helper/Convert.sol";

abstract contract SpotDex is Block, ISpotHouse, SpotHouseStorage {
    using Convert for uint256;

    /**
     * @dev see {ISpotHouse-openLimitOrder}
     */
    function openLimitOrder(
        IPairManager pairManager,
        Side side,
        uint256 quantity,
        uint128 pip
    ) public payable virtual override {
        //        require(!_pairManager.isExpired(), Errors.VL_EXPIRED);
        address trader = _msgSender();

        _openLimitOrder(pairManager, quantity, pip, trader, side);
    }

    function openBuyLimitOrderExactInput(
        IPairManager pairManager,
        Side side,
        uint256 quantity,
        uint128 pip
    ) public payable virtual {
        require(side == Side.BUY, "!B");
        address trader = _msgSender();
        _openBuyLimitOrderExactInput(pairManager, quantity, pip, trader);
    }

    function openMarketOrder(
        IPairManager _pairManager,
        Side _side,
        uint256 _quantity
    ) public payable virtual {
        address _trader = _msgSender();
        SpotFactoryStorage.Pair memory _pairAddress = _getQuoteAndBase(
            _pairManager
        );

        _openMarketOrder(_pairManager, _side, _quantity, _trader, _trader);
    }

    function openMarketOrder(
        IPairManager _pairManager,
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
        IPairManager _pairManager,
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
        IPairManager _pairManager,
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

    function cancelAllLimitOrder(IPairManager _pairManager) public virtual {
        address _trader = _msgSender();
        SpotFactoryStorage.Pair memory _pairAddress = _getQuoteAndBase(
            _pairManager
        );

        uint256 refundQuote;
        uint256 refundBase;
        uint256 quoteFilled;
        uint256 baseFilled;

        (
            quoteFilled,
            baseFilled
            //            uint256 feeQuote,
            //            uint256 feeBase
        ) = getAmountClaimable(_pairManager, _trader);

        PendingLimitOrder[]
            memory _listPendingLimitOrder = getPendingLimitOrders(
                _pairManager,
                _trader
            );

        require(
            _listPendingLimitOrder.length > 0,
            Errors.VL_NO_LIMIT_TO_CANCEL
        );

        uint128[] memory _listPips = new uint128[](
            _listPendingLimitOrder.length
        );
        uint64[] memory _orderIds = new uint64[](_listPendingLimitOrder.length);

        for (uint64 i = 0; i < _listPendingLimitOrder.length; i++) {
            PendingLimitOrder
                memory _pendingLimitOrder = _listPendingLimitOrder[i];

            if (_pendingLimitOrder.quantity == 0) {
                continue;
            }

            _listPips[i] = _pendingLimitOrder.pip;
            _orderIds[i] = _pendingLimitOrder.orderId;

            (uint256 refundQuantity, uint256 partialFilled) = _pairManager
                .cancelLimitOrder(
                    _pendingLimitOrder.pip,
                    _pendingLimitOrder.orderId
                );

            if (_pendingLimitOrder.isBuy) {
                refundQuote += _pairManager.calculatingQuoteAmount(
                    refundQuantity,
                    _pendingLimitOrder.pip
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

        emit AllLimitOrderCancelled(
            _trader,
            _pairManager,
            _listPips,
            _orderIds,
            _blockTimestamp()
        );
    }

    function cancelLimitOrder(
        IPairManager _pairManager,
        uint64 _orderIdx,
        uint128 _pip
    ) public virtual {
        address _trader = _msgSender();

        SpotLimitOrder.Data[] storage _orders = limitOrders[
            address(_pairManager)
        ][_trader];
        require(_orderIdx < _orders.length, Errors.VL_INVALID_ORDER_ID);

        // save gas
        SpotLimitOrder.Data memory _order = _orders[_orderIdx];

        require(
            _order.baseAmount != 0 && _order.quoteAmount != 0,
            Errors.VL_NO_LIMIT_TO_CANCEL
        );

        (bool isFilled, , , ) = _pairManager.getPendingOrderDetail(
            _order.pip,
            _order.orderId
        );

        require(isFilled == false, Errors.VL_MUST_NOT_FILLED);

        // blank limit order data
        // we set the deleted order to a blank data
        // because we don't want to mess with order index (orderIdx)
        SpotLimitOrder.Data memory blankLimitOrderData;

        (uint256 refundQuantity, uint256 partialFilled) = _pairManager
            .cancelLimitOrder(_order.pip, _order.orderId);

        if (_order.isBuy) {
            uint256 quoteAmount = _pairManager.calculatingQuoteAmount(
                refundQuantity,
                _order.pip
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
                    _pairManager.calculatingQuoteAmount(
                        partialFilled,
                        _order.pip
                    ),
                    true
                );
            }
        }
        delete _orders[_orderIdx];
        // = blankLimitOrderData;

        emit LimitOrderCancelled(
            _trader,
            _pairManager,
            _order.pip,
            _order.orderId,
            _blockTimestamp()
        );
    }

    function claimAsset(IPairManager _pairManager) public virtual {
        address _trader = _msgSender();

        (uint256 quoteAmount, uint256 baseAmount) = getAmountClaimable(
            _pairManager,
            _trader
        );
        require(
            quoteAmount > 0 || baseAmount > 0,
            Errors.VL_NO_AMOUNT_TO_CLAIM
        );
        _clearLimitOrder(address(_pairManager), _trader);

        _withdraw(_pairManager, _trader, Asset.Quote, quoteAmount, true);
        _withdraw(_pairManager, _trader, Asset.Base, baseAmount, true);

        emit AssetClaimed(_trader, _pairManager, quoteAmount, baseAmount);
    }

    function getAmountClaimable(IPairManager _pairManager, address _trader)
        public
        view
        virtual
        returns (uint256 quoteAmount, uint256 baseAmount)
    {
        address _pairManagerAddress = address(_pairManager);

        SpotLimitOrder.Data[] memory listLimitOrder = limitOrders[
            _pairManagerAddress
        ][_trader];
        uint256 i = 0;
        uint256 _basisPoint = _pairManager.getBasisPoint();
        uint128 _feeBasis = feeBasis;
        IPairManager.ExchangedData memory exData = IPairManager.ExchangedData({
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
                _basisPoint,
                listLimitOrder[i].fee,
                _feeBasis
            );
        }
        return (exData.quoteAmount, exData.baseAmount);
    }

    function getPendingLimitOrders(IPairManager _pairManager, address _trader)
        public
        view
        virtual
        returns (PendingLimitOrder[] memory)
    {
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

    function _getQuoteAndBase(IPairManager _managerAddress)
        internal
        view
        virtual
        returns (SpotFactoryStorage.Pair memory pair)
    {
        pair = spotFactory.getQuoteAndBase(address(_managerAddress));
        require(pair.BaseAsset != address(0), "!0x");
    }

    struct OpenLimitOrderState {
        uint64 orderId;
        uint256 sizeOut;
        uint256 quoteAmountFilled;
    }

    function _openLimitOrder(
        IPairManager _pairManager,
        uint256 _quantity,
        uint128 _pip,
        address _trader,
        Side _side
    ) internal {
        address _pairManagerAddress = address(_pairManager);
        OpenLimitOrderState memory state;
        uint256 quoteAmount;
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
        (state.orderId, state.sizeOut, state.quoteAmountFilled) = _pairManager
            .openLimit(_pip, _quantity.Uint256ToUint128(), isBuy, _trader, 0);
        if (isBuy) {
            // Buy limit
            quoteAmount =
                _pairManager.calculatingQuoteAmount(
                    (_quantity - state.sizeOut).Uint256ToUint128(),
                    _pip
                ) +
                state.quoteAmountFilled;
            //            quoteAmount += _feeCalculator(quoteAmount, fee);
            // deposit quote asset
            // with token has RFI we need deposit first
            // and get real balance transferred
            uint256 quoteAmountTransferred = _deposit(
                _pairManager,
                _trader,
                Asset.Quote,
                quoteAmount
            );

            require(quoteAmountTransferred == quoteAmount, "!RFI");
        } else {
            quoteAmount = _pairManager.calculatingQuoteAmount(
                (_quantity - state.sizeOut).Uint256ToUint128(),
                _pip
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
            _withdraw(_pairManager, _trader, Asset.Base, state.sizeOut, true);
        }
        if (!isBuy) {
            // withdraw quote asset
            _withdraw(
                _pairManager,
                _trader,
                Asset.Quote,
                state.quoteAmountFilled,
                true
            );
        }

        emit LimitOrderOpened(
            state.orderId,
            _trader,
            _quantity - state.sizeOut,
            state.sizeOut,
            _pip,
            isBuy ? Side.BUY : Side.SELL,
            _pairManagerAddress,
            _blockTimestamp()
        );
    }

    function _openBuyLimitOrderExactInput(
        IPairManager _pairManager,
        uint256 _quantity,
        uint128 _pip,
        address _trader
    ) internal {
        address _pairManagerAddress = address(_pairManager);
        OpenLimitOrderState memory state;

        uint256 quoteAmount = _pairManager.calculatingQuoteAmount(
            _quantity.Uint256ToUint128(),
            _pip
        );

        uint256 quoteAmountTransferred = _deposit(
            _pairManager,
            _trader,
            Asset.Quote,
            quoteAmount
        );

        if (quoteAmountTransferred != quoteAmount) {
            _quantity = _pairManager.quoteToBase(quoteAmountTransferred, _pip);
        }

        (state.orderId, state.sizeOut, state.quoteAmountFilled) = _pairManager
            .openLimit(
                _pip,
                _quantity.Uint256ToUint128(),
                true,
                _trader,
                quoteAmountTransferred
            );
        uint256 baseAmountReceive = state.sizeOut;
        if (
            state.sizeOut == _quantity &&
            quoteAmountTransferred > state.quoteAmountFilled
        ) {
            _quantity = _pairManager.quoteToBase(
                quoteAmountTransferred - state.quoteAmountFilled,
                _pip
            );

            emit MarketOrderOpened(
                _trader,
                state.sizeOut,
                state.quoteAmountFilled,
                Side.BUY,
                _pairManager,
                _pairManager.getCurrentPip(),
                _blockTimestamp()
            );
            state.sizeOut = 0;
        }

        if (_quantity > state.sizeOut) {
            limitOrders[_pairManagerAddress][_trader].push(
                SpotLimitOrder.Data({
                    pip: _pip,
                    orderId: state.orderId,
                    isBuy: true,
                    quoteAmount: _pairManager
                        .calculatingQuoteAmount(
                            (_quantity - state.sizeOut).Uint256ToUint128(),
                            _pip
                        )
                        .Uint256ToUint128(),
                    baseAmount: (_quantity - state.sizeOut).Uint256ToUint128(),
                    blockNumber: block.number.Uint256ToUint40(),
                    fee: fee
                })
            );
        }
        _withdraw(_pairManager, _trader, Asset.Base, baseAmountReceive, true);

        emit LimitOrderOpened(
            state.orderId,
            _trader,
            _quantity - state.sizeOut,
            state.sizeOut,
            _pip,
            Side.BUY,
            _pairManagerAddress,
            _blockTimestamp()
        );
    }

    function _openMarketOrder(
        IPairManager _pairManager,
        Side _side,
        uint256 _quantity,
        address _payer,
        address _recipient
    ) internal returns (uint256[] memory) {
        uint256 sizeOut;
        uint256 quoteAmount;
        if (_side == Side.BUY) {
            (sizeOut, quoteAmount) = _pairManager.openMarket(
                _quantity,
                true,
                _payer
            );
            require(sizeOut == _quantity, Errors.VL_NOT_ENOUGH_LIQUIDITY);

            // deposit quote asset
            uint256 amountTransferred = _deposit(
                _pairManager,
                _payer,
                Asset.Quote,
                quoteAmount
            );

            require(amountTransferred == quoteAmount, "!RFI");

            // withdraw base asset
            // after BUY done, transfer base back to trader
            _withdraw(_pairManager, _recipient, Asset.Base, _quantity, true);
        } else {
            // SELL market
            uint256 baseAmountTransferred = _deposit(
                _pairManager,
                _payer,
                Asset.Base,
                _quantity
            );

            (sizeOut, quoteAmount) = _pairManager.openMarket(
                baseAmountTransferred,
                false,
                _payer
            );
            require(
                sizeOut == baseAmountTransferred,
                Errors.VL_NOT_ENOUGH_LIQUIDITY
            );

            _withdraw(_pairManager, _recipient, Asset.Quote, quoteAmount, true);
            _quantity = baseAmountTransferred;
        }

        emit MarketOrderOpened(
            _payer,
            _quantity,
            quoteAmount,
            _side,
            _pairManager,
            _pairManager.getCurrentPip(),
            _blockTimestamp()
        );
        return _calculatorAmounts(_side, _quantity, quoteAmount);
    }

    function _openMarketOrderWithQuote(
        IPairManager _pairManager,
        Side _side,
        uint256 _quoteAmount,
        address _payer,
        address _recipient
    ) internal returns (uint256[] memory) {
        uint256 sizeOutQuote;
        uint256 baseAmount;
        if (_side == Side.BUY) {
            // deposit quote asset
            uint256 amountTransferred = _deposit(
                _pairManager,
                _payer,
                Asset.Quote,
                _quoteAmount
            );
            (sizeOutQuote, baseAmount) = _pairManager.openMarketWithQuoteAsset(
                amountTransferred,
                true,
                _payer
            );

            require(
                sizeOutQuote == amountTransferred,
                Errors.VL_NOT_ENOUGH_LIQUIDITY
            );

            // withdraw base asset
            // after BUY done, transfer base back to trader
            _withdraw(_pairManager, _recipient, Asset.Base, baseAmount, true);
        } else {
            // SELL market
            uint256 amountTransferred = _deposit(
                _pairManager,
                _payer,
                Asset.Base,
                baseAmount
            );

            (sizeOutQuote, baseAmount) = _pairManager.openMarketWithQuoteAsset(
                amountTransferred,
                false,
                _payer
            );
            require(
                sizeOutQuote == _quoteAmount,
                Errors.VL_NOT_ENOUGH_LIQUIDITY
            );
            _withdraw(
                _pairManager,
                _recipient,
                Asset.Quote,
                _quoteAmount,
                true
            );
        }
        emit MarketOrderOpened(
            _payer,
            baseAmount,
            _quoteAmount,
            _side,
            _pairManager,
            _pairManager.getCurrentPip(),
            _blockTimestamp()
        );
        return _calculatorAmounts(_side, baseAmount, _quoteAmount);
    }

    function _clearLimitOrder(address _pairManagerAddress, address _trader)
        internal
    {
        if (limitOrders[_pairManagerAddress][_trader].length > 0) {
            SpotLimitOrder.Data[]
                memory subListLimitOrder = _clearAllFilledOrder(
                    IPairManager(_pairManagerAddress),
                    limitOrders[_pairManagerAddress][_trader]
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
        IPairManager _pairManager,
        SpotLimitOrder.Data[] memory listLimitOrder
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
                        _pairManager.calculatingQuoteAmount(
                            size - partialFilled,
                            listLimitOrder[i].pip
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

    // INTERNAL FUNCTIONS
    function _calculatorAmounts(
        Side _side,
        uint256 baseAmount,
        uint256 quoteAmount
    ) internal returns (uint256[] memory) {
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
        IPairManager _pairManager,
        address _recipient,
        Asset asset,
        uint256 _amount,
        bool isTakeFee
    ) internal virtual {}

    function _deposit(
        IPairManager _pairManager,
        address _payer,
        Asset _asset,
        uint256 _amount
    ) internal virtual returns (uint256) {}

    function _withdrawCancelAll(
        IPairManager _pairManager,
        address _recipient,
        Asset asset,
        uint256 _amountRefund,
        uint256 _amountFilled
    ) internal virtual {}

    function _msgSender() internal view virtual returns (address) {}
}
