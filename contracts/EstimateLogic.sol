/**
 * @author Musket
 */
// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.9;

import "./interfaces/IEstimateLogic.sol";
import "@positionex/matching-engine/contracts/libraries/amm/CrossPipResult.sol";
import "@positionex/matching-engine/contracts/libraries/amm/LiquidityMath.sol";
import "@positionex/matching-engine/contracts/libraries/exchange/SwapState.sol";
import "@positionex/matching-engine/contracts/libraries/helper/Convert.sol";
import "@positionex/matching-engine/contracts/libraries/helper/Math.sol";

contract EstimateLogic is IEstimateLogic {
    using SwapState for SwapState.State;
    using CrossPipResult for CrossPipResult.Result;
    using Math for uint128;
    using Math for uint256;
    using Convert for uint256;

    function getAmountEstimate(
        IMatchingEngineAMM pairManager,
        uint256 size,
        bool isBuy,
        bool isBase
    )
        external
        view
        override(IEstimateLogic)
        returns (uint256 mainSideOut, uint256 flipSideOut)
    {
        SwapState.State memory state = SwapState.State({
            remainingSize: size,
            pip: 0,
            basisPoint: uint32(pairManager.basisPoint()),
            startPip: 0,
            remainingLiquidity: 0,
            isFullBuy: 0,
            isSkipFirstPip: false,
            lastMatchedPip: 0,
            isBuy: isBuy,
            isBase: isBase,
            flipSideOut: 0,
            pipRange: pairManager.pipRange(),
            rangeFindingWordsAmm: 30,
            ammState: SwapState.newAMMState()
        });
        (state.pip, state.isFullBuy) = pairManager.singleSlot();
        state.lastMatchedPip = state.pip;

        (
            IMatchingEngineAMM.LiquidityOfEachPip[] memory liquidityInPip,
            uint128 pip
        ) = pairManager.getLiquidityInPipRange(state.pip, 30, isBuy);

        uint16 indexLiquidityInPip;

        if (state.isFullBuy != 0) {
            if (state.isBuy)
                // if buy and latest liquidity is buy. skip current pip
                state.isSkipFirstPip = state.isFullBuy == 1;
                // if sell and latest liquidity is sell. skip current pip
            else state.isSkipFirstPip = state.isFullBuy == 2;
        }
        CrossPipParams memory crossPipParams = CrossPipParams({
            pipNext: 0,
            isBuy: state.isBuy,
            isBase: isBase,
            amount: 0,
            basisPoint: state.basisPoint,
            currentPip: 0,
            pipRange: pairManager.pipRange()
        });
        while (state.remainingSize != 0) {
            StepComputations memory step;

            if (indexLiquidityInPip == 30) {
                break;
            }
            step.pipNext = liquidityInPip[indexLiquidityInPip].pip;

            if (step.pipNext == 0) {
                step.pipNext = _calculatePipLimitWhenFindPipNext(
                    state.pip,
                    state.isBuy,
                    30
                );
            }

            crossPipParams.pipNext = step.pipNext;
            crossPipParams.amount = uint128(state.remainingSize);
            crossPipParams.currentPip = state.pip;
            CrossPipResult.Result memory crossPipResult = _onCrossPipHook(
                crossPipParams,
                state.ammState,
                pairManager
            );
            if (crossPipResult.baseCrossPipOut > 0 && step.pipNext == 0) {
                step.pipNext = crossPipResult.toPip;
            }
            {
                if (
                    crossPipResult.baseCrossPipOut > 0 &&
                    crossPipResult.quoteCrossPipOut > 0
                ) {
                    if (
                        (crossPipResult.baseCrossPipOut >=
                            state.remainingSize &&
                            state.isBase) ||
                        (crossPipResult.quoteCrossPipOut >=
                            state.remainingSize &&
                            !state.isBase)
                    ) {
                        if (
                            (state.isBuy && crossPipResult.toPip > state.pip) ||
                            (!state.isBuy && crossPipResult.toPip < state.pip)
                        ) {
                            state.pip = crossPipResult.toPip;
                        }

                        state.ammFillAll(
                            crossPipResult.baseCrossPipOut,
                            crossPipResult.quoteCrossPipOut
                        );
                        break;
                    } else {
                        state.updateAMMTradedSize(
                            crossPipResult.baseCrossPipOut,
                            crossPipResult.quoteCrossPipOut
                        );
                        state.isSkipFirstPip = false;
                    }
                }
                if (!state.isSkipFirstPip) {
                    if (state.startPip == 0) state.startPip = step.pipNext;

                    // get liquidity at a tick index
                    uint128 liquidity = liquidityInPip[indexLiquidityInPip]
                        .liquidity
                        .Uint256ToUint128();

                    uint256 remainingQuantity = state.isBase
                        ? state.remainingSize
                        : TradeConvert.quoteToBase(
                            state.remainingSize,
                            step.pipNext,
                            state.basisPoint
                        );
                    if (liquidity > remainingQuantity) {
                        state.updateTradedSize(
                            remainingQuantity,
                            step.pipNext,
                            true
                        );
                    } else if (remainingQuantity > liquidity) {
                        // order in that pip will be fulfilled
                        state.updateTradedSize(liquidity, step.pipNext, false);
                        state.moveForward1Pip(step.pipNext);
                    } else {
                        state.updateTradedSize(liquidity, step.pipNext, true);
                    }
                } else {
                    state.isSkipFirstPip = false;
                    state.moveForward1Pip(step.pipNext);
                }
            }
            if (
                state.ammState.index >= FixedPoint128.MAX_FIND_INDEX_RANGE ||
                state.ammState.lastPipRangeLiquidityIndex == -2 ||
                state.pip == 0
            ) {
                //                Require._require(
                //                    !(_maxPip != 0 && state.remainingSize != 0),
                //                    Errors.ME_LIMIT_OVER_PRICE_NOT_ENOUGH_LIQUIDITY
                //                );
                break;
            }
            indexLiquidityInPip++;
        }
        mainSideOut = size - state.remainingSize;
        flipSideOut = state.flipSideOut;
    }

    function _onCrossPipHook(
        CrossPipParams memory params,
        SwapState.AmmState memory ammState,
        IMatchingEngineAMM pairManager
    ) internal view returns (CrossPipResult.Result memory crossPipResult) {
        if (params.pipNext == params.currentPip) {
            return crossPipResult;
        }

        int256 indexPip = int256(
            LiquidityMath.calculateIndexPipRange(
                params.currentPip,
                params.pipRange
            )
        );
        if (ammState.lastPipRangeLiquidityIndex != indexPip) {
            ammState.lastPipRangeLiquidityIndex = indexPip;
        }
        /// Modify ammState.ammReserves here will update to `state.ammState.ammReserves` in MatchingEngineCore
        /// Eg. given `state.ammState.ammReserves` in MatchingEngineCore is [A, B, C, D, E]
        /// if you change ammStates[0] = 1
        /// then the `state.ammState.ammReserves` in MatchingEngineCore will be [1, B, C, D, E]
        /// because ammStates is passed by an underlying pointer
        /// let's try it in Remix
        crossPipResult = _onCrossPipAMMTargetPrice(
            OnCrossPipParams(
                params.pipNext,
                params.isBuy,
                params.isBase,
                params.amount,
                params.basisPoint,
                params.currentPip,
                params.pipRange
            ),
            ammState,
            pairManager
        );
    }

    function _onCrossPipAMMTargetPrice(
        OnCrossPipParams memory params,
        SwapState.AmmState memory ammState,
        IMatchingEngineAMM pairManager
    ) internal view returns (CrossPipResult.Result memory result) {
        CrossPipState memory crossPipState;
        // Have target price
        crossPipState.sqrtTargetPip = _calculateSqrtPrice(
            params.pipNext,
            FixedPoint128.BUFFER
        );
        crossPipState.indexedPipRange = int256(
            LiquidityMath.calculateIndexPipRange(
                params.pipNext,
                params.pipRange
            )
        );
        params.currentPip = _calculateSqrtPrice(
            params.currentPip,
            FixedPoint128.BUFFER
        );
        for (int256 i = ammState.lastPipRangeLiquidityIndex; ; ) {
            SwapState.AmmReserves memory _ammReserves = ammState.ammReserves[
                ammState.index
            ];
            // Init amm state
            if (
                _ammReserves.baseReserve == 0 && _ammReserves.baseReserve == 0
            ) {
                Liquidity.Info memory _liquidity;
                (
                    _liquidity.sqrtMaxPip,
                    _liquidity.sqrtMinPip,
                    _liquidity.quoteReal,
                    _liquidity.baseReal,
                    _liquidity.indexedPipRange,
                    _liquidity.feeGrowthBase,
                    _liquidity.feeGrowthQuote,
                    _liquidity.sqrtK
                ) = pairManager.liquidityInfo(uint256(i));

                if (_liquidity.sqrtK != 0) {
                    _ammReserves = _initCrossAmmReserves(_liquidity, ammState); // ammState.ammReserves[ammState.index];
                    if (crossPipState.skipIndex) {
                        crossPipState.skipIndex = false;
                    }
                } else {
                    crossPipState.skipIndex = true;
                }
            }

            if (!crossPipState.skipIndex) {
                if (i != crossPipState.indexedPipRange) {
                    crossPipState.pipTargetStep = params.isBuy
                        ? _ammReserves.sqrtMaxPip
                        : _ammReserves.sqrtMinPip;
                } else {
                    crossPipState.pipTargetStep = crossPipState.sqrtTargetPip;
                }

                if (crossPipState.startIntoIndex) {
                    params.currentPip = params.isBuy
                        ? _ammReserves.sqrtMinPip
                        : _ammReserves.sqrtMaxPip;
                    crossPipState.startIntoIndex = false;
                }

                (uint128 baseOut, uint128 quoteOut) = _calculateAmountOut(
                    _ammReserves,
                    params.isBuy,
                    crossPipState.pipTargetStep,
                    params.currentPip,
                    params.basisPoint
                );

                /// This case for amount no reach pip
                /// Need find price stop
                if (
                    _notReachPip(
                        params,
                        _ammReserves,
                        ammState,
                        baseOut,
                        quoteOut,
                        result
                    )
                ) {
                    break;
                }

                result.updateAmountResult(baseOut, quoteOut);

                _updateAmmState(
                    params,
                    ammState.ammReserves[ammState.index],
                    baseOut,
                    quoteOut
                );
                params.currentPip = crossPipState.pipTargetStep;

                params.amount = params.isBase
                    ? params.amount - baseOut
                    : params.amount - quoteOut;
            }
            i = params.isBuy ? i + 1 : i - 1;
            if (
                (params.isBuy && i > crossPipState.indexedPipRange) ||
                (!params.isBuy && i < crossPipState.indexedPipRange) ||
                ammState.index == FixedPoint128.MAX_FIND_INDEX_RANGE
            ) {
                result.updatePipResult(params.pipNext);
                break;
            }

            ammState.lastPipRangeLiquidityIndex = i;
            crossPipState.startIntoIndex = true;
            ammState.index++;
        }
    }

    function _initCrossAmmReserves(
        Liquidity.Info memory _liquidity,
        SwapState.AmmState memory ammState
    ) internal pure returns (SwapState.AmmReserves memory) {
        ammState.ammReserves[ammState.index] = SwapState.AmmReserves({
            baseReserve: _liquidity.baseReal,
            quoteReserve: _liquidity.quoteReal,
            sqrtK: _liquidity.sqrtK,
            sqrtMaxPip: _liquidity.sqrtMaxPip,
            sqrtMinPip: _liquidity.sqrtMinPip,
            amountFilled: 0
        });

        ammState.pipRangesIndex[ammState.index] = uint256(
            ammState.lastPipRangeLiquidityIndex
        );
        return ammState.ammReserves[ammState.index];
    }

    function _notReachPip(
        OnCrossPipParams memory params,
        SwapState.AmmReserves memory _ammReserves,
        SwapState.AmmState memory ammState,
        uint128 baseOut,
        uint128 quoteOut,
        CrossPipResult.Result memory result
    ) internal pure returns (bool) {
        if (
            (params.isBase && params.amount <= baseOut) ||
            (!params.isBase && params.amount <= quoteOut)
        ) {
            (uint128 quoteAmount, uint128 baseAmount) = _calculateAmountFilled(
                params,
                _ammReserves
            );
            result.updateAmountResult(baseAmount, quoteAmount);
            result.updatePipResult(
                _updateAmmState(
                    params,
                    ammState.ammReserves[ammState.index],
                    baseAmount,
                    quoteAmount
                )
            );
            return true;
        }
        return false;
    }

    function _calculateAmountFilled(
        OnCrossPipParams memory params,
        SwapState.AmmReserves memory ammReserves
    ) internal pure returns (uint128 quoteAmount, uint128 baseAmount) {
        if (params.isBuy) {
            if (params.isBase) {
                quoteAmount = LiquidityMath
                    .calculateQuoteBuyAndBaseSellWithoutTargetPrice(
                        ammReserves.sqrtK,
                        ammReserves.baseReserve,
                        params.amount
                    );
                baseAmount = params.amount;
            } else {
                baseAmount = LiquidityMath
                    .calculateBaseBuyAndQuoteSellWithoutTargetPrice(
                        ammReserves.sqrtK,
                        ammReserves.baseReserve,
                        params.amount
                    );
                quoteAmount = params.amount;
            }
        } else if (!params.isBuy) {
            if (params.isBase) {
                quoteAmount = LiquidityMath
                    .calculateBaseBuyAndQuoteSellWithoutTargetPrice(
                        ammReserves.sqrtK,
                        ammReserves.quoteReserve,
                        params.amount
                    );
                baseAmount = params.amount;
            } else {
                baseAmount = LiquidityMath
                    .calculateQuoteBuyAndBaseSellWithoutTargetPrice(
                        ammReserves.sqrtK,
                        ammReserves.quoteReserve,
                        params.amount
                    );
                quoteAmount = params.amount;
            }
        }
    }

    function _calculateAmountOut(
        SwapState.AmmReserves memory ammReserves,
        bool isBuy,
        uint128 sqrtPriceTarget,
        uint128 sqrtCurrentPrice,
        uint32 basisPoint
    ) internal pure returns (uint128 baseOut, uint128 quoteOut) {
        if (isBuy) {
            baseOut = LiquidityMath.calculateBaseWithPriceWhenBuy(
                sqrtPriceTarget,
                ammReserves.baseReserve,
                sqrtCurrentPrice
            );
            quoteOut =
                LiquidityMath.calculateQuoteWithPriceWhenBuy(
                    sqrtPriceTarget,
                    ammReserves.baseReserve,
                    sqrtCurrentPrice
                ) /
                uint128(basisPoint);
        } else {
            baseOut =
                LiquidityMath.calculateBaseWithPriceWhenSell(
                    sqrtPriceTarget,
                    ammReserves.quoteReserve,
                    sqrtCurrentPrice
                ) *
                uint128(basisPoint);
            quoteOut = LiquidityMath.calculateQuoteWithPriceWhenSell(
                sqrtPriceTarget,
                ammReserves.quoteReserve,
                sqrtCurrentPrice
            );
        }
    }

    function _updateAmmState(
        OnCrossPipParams memory params,
        SwapState.AmmReserves memory ammReserves,
        uint128 baseAmount,
        uint128 quoteAmount
    ) internal pure returns (uint128 price) {
        /// In case both baseReal !=0 and quoteReal !=0
        /// We can choose many ways to update ammStates
        /// By quote or by base
        /// In this function, we choose to update by quote
        if (params.isBuy) {
            ammReserves.baseReserve -= baseAmount;
            ammReserves.quoteReserve = uint128(
                (uint256(ammReserves.sqrtK)**2) /
                    uint256(ammReserves.baseReserve)
            );
        } else {
            ammReserves.baseReserve += baseAmount;
            ammReserves.quoteReserve = uint128(
                (uint256(ammReserves.sqrtK)**2) /
                    uint256(ammReserves.baseReserve)
            );
        }

        ammReserves.amountFilled = params.isBuy
            ? ammReserves.amountFilled + baseAmount
            : ammReserves.amountFilled + quoteAmount;

        return
            (ammReserves.quoteReserve * params.basisPoint) /
            ammReserves.baseReserve;
    }

    function _calculateSqrtPrice(uint128 pip, uint256 curve)
        internal
        pure
        returns (uint128)
    {
        return (uint256(pip) * curve).sqrt().Uint256ToUint128();
    }

    function _calculatePipLimitWhenFindPipNext(
        uint128 pip,
        bool isBuy,
        uint128 rangeWords
    ) internal pure returns (uint128 limitPip) {
        if (!isBuy) {
            if (pip <= rangeWords * 256) {
                return 1;
            }
            return pip - rangeWords * 256;
        }

        return pip + rangeWords * 256;
    }
}
