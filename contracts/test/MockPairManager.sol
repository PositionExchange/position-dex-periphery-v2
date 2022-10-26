/**
 * @author Musket
 */
pragma solidity ^0.8.0;

import "../PairManager.sol";

import "hardhat/console.sol";

import "../libraries/helper/Convert.sol";
import "../libraries/helper/TradeConvert.sol";
import "../libraries/helper/BitMathLiquidity.sol";

contract MockPairManager02 is PairManager {
    using TickPosition for TickPosition.Data;
    using LiquidityBitmap for mapping(uint128 => uint256);
    using Timers for uint64;
    using Convert for uint256;
    using Convert for int256;
    using TradeConvert for uint256;

    function takeOrder(
        uint128 pip,
        bool isBuy,
        IERC20 quoteAsset,
        IERC20 baseAsset,
        uint256 amount,
        uint64 orderId
    ) public {
        uint256 _liquidity;

        if (!isBuy) {
            _liquidity = quoteToBase(amount, pip);
        } else {
            _liquidity = amount;
        }
        uint128 liquidity = tickPosition[pip].liquidity;

        console.log("[SM] takeOrder liquidity: ", liquidity);
        console.log("[SM] takeOrder _liquidity: ", _liquidity);

        singleSlot.pip = pip;

        if (_liquidity == liquidity) {
            singleSlot.isFullBuy = 0;
            liquidityBitmap.toggleSingleBit(pip, false);

            if (isBuy) {
                uint256 quote = (_liquidity * pip) / basisPoint;
                quoteAsset.transferFrom(msg.sender, address(this), _liquidity);
            } else {
                baseAsset.transferFrom(msg.sender, address(this), _liquidity);
            }
        } else if (_liquidity < liquidity) {
            if (orderId != 0) {
                (
                bool isFilled,
                ,
                uint256 baseSize,
                uint256 partialFilled
                ) = getPendingOrderDetail(pip, orderId);

                console.log(
                    "[SM] takeOrder baseSize, _liquidity, pip: ",
                    baseSize,
                    _liquidity,
                    pip
                );
                _liquidity = baseSize - partialFilled;
            }
            if (isBuy) {
                singleSlot.isFullBuy = 2;
                uint256 quote = (_liquidity * pip) / basisPoint;
                console.log("[SM] takeOrder quote,", quote);
                quoteAsset.transferFrom(msg.sender, address(this), quote);
                tickPosition[pip].partiallyFill(_liquidity.Uint256ToUint128());
            } else {
                singleSlot.isFullBuy = 1;
                console.log("[SM] takeOrder _liquidity,", _liquidity);

                baseAsset.transferFrom(msg.sender, address(this), _liquidity);
                tickPosition[pip].partiallyFill(_liquidity.Uint256ToUint128());
            }
        }

        console.log("takeOrder singleSlot.pip: ", singleSlot.pip);
    }

    function openLimitMock(
        uint128 pip,
        uint128 size,
        bool isBuy,
        address trader,
        IERC20 quoteAsset,
        IERC20 baseAsset
    ) public {
        _internalOpenLimit(
            ParamsInternalOpenLimit({
        pip: pip,
        size: size,
        isBuy: isBuy,
        trader: trader,
        quoteDeposited: 0
        })
        );

        if (isBuy) {
            quoteAsset.transfer(address(this), (size * pip) / basisPoint);
        } else {
            baseAsset.transfer(address(this), size);
        }
    }

    function openMarketMock(
        uint256 size,
        bool isBuy,
        address trader,
        IERC20 quoteAsset,
        IERC20 baseAsset
    ) external returns (uint256 sizeOut, uint256 quoteAmount) {
        console.log(
            "[SM] openMarketMock getLiquidityInCurrentPip1: ",
            getLiquidityInCurrentPip()
        );
        console.log(
            "[SM] openMarketMock singleSlot :",
            singleSlot.pip,
            singleSlot.isFullBuy
        );

        console.log(
            "SM tickPosition[101000].liquidity",
            tickPosition[101000].liquidity
        );
        (sizeOut, quoteAmount) = _internalOpenMarketOrder(
            size,
            isBuy,
            0,
            trader,
            true
        );
        console.log(
            "[SM] openMarketMock sizeOut, quoteAmount: ",
            sizeOut,
            quoteAmount
        );
        console.log(
            "[SM] openMarketMock getLiquidityInCurrentPip2: ",
            getLiquidityInCurrentPip()
        );

        if (isBuy) {
            quoteAsset.transfer(address(this), quoteAmount);
        } else {
            baseAsset.transfer(address(this), sizeOut);
        }
    }
}
