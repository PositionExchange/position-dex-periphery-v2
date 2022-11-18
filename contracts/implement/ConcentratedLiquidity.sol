/**
 * @author Musket
 * @author NiKa
 */
// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.9;

import "../libraries/liquidity/Liquidity.sol";
import "../libraries/types/SpotHouseStorage.sol";
import "../libraries/helper/Errors.sol";
import "../interfaces/IConcentratedLiquidityNFT.sol";
import "@positionex/matching-engine/contracts/interfaces/IMatchingEngineAMM.sol";
import "@positionex/matching-engine/contracts/libraries/helper/FixedPoint128.sol";
import "@positionex/matching-engine/contracts/libraries/helper/Math.sol";
import "../interfaces/IConcentratedLiquidity.sol";
import "../libraries/helper/LiquidityHelper.sol";
import "hardhat/console.sol";
import "../staking/PositionStakingDexManager.sol";

abstract contract ConcentratedLiquidity is IConcentratedLiquidity {
    using UserLiquidity for UserLiquidity.Data;

    mapping(uint256 => UserLiquidity.Data)
        public
        override concentratedLiquidity;
    IPositionStakingDexManager stakingManager;

    struct AddLiquidityParams {
        IMatchingEngineAMM pool;
        uint128 amountVirtual;
        uint32 indexedPipRange;
        bool isBase;
    }

    function addLiquidity(AddLiquidityParams calldata params)
        public
        payable
        virtual
    {
        address user = _msgSender();
        console.log(
            "[ConcentratedLiquidity][addLiquidity] amountVirtual: ",
            params.amountVirtual
        );
        console.log(
            "[ConcentratedLiquidity][addLiquidity] isBase: ",
            params.isBase
        );
        uint256 _addedAmountVirtual = depositLiquidity(
            params.pool,
            user,
            params.isBase
                ? SpotHouseStorage.Asset.Base
                : SpotHouseStorage.Asset.Quote,
            params.amountVirtual
        );

        console.log(
            "[ConcentratedLiquidity]_addedAmountVirtual: ",
            _addedAmountVirtual
        );

        ResultAddLiquidity memory _resultAddLiquidity = _addLiquidity(
            uint128(_addedAmountVirtual),
            params.isBase,
            params.indexedPipRange,
            _getCurrentIndexPipRange(params.pool),
            params.pool
        );

        console.log(
            "[ConcentratedLiquidity]ResultAddLiquidity: ",
            _resultAddLiquidity.liquidity
        );

        uint256 amountModifySecondAsset = depositLiquidity(
            params.pool,
            user,
            params.isBase
                ? SpotHouseStorage.Asset.Quote
                : SpotHouseStorage.Asset.Base,
            params.isBase
                ? _resultAddLiquidity.quoteAmountAdded
                : _resultAddLiquidity.baseAmountAdded
        );

        console.log(
            "[ConcentratedLiquidity][addLiquidity] amountModifySecondAsset: ",
            amountModifySecondAsset
        );
        require(
            params.isBase
                ? amountModifySecondAsset >=
                    _resultAddLiquidity.quoteAmountAdded
                : amountModifySecondAsset >=
                    _resultAddLiquidity.baseAmountAdded,
            "not support"
        );

        uint256 nftTokenId = mint(user);
        console.log("[ConcentratedLiquidity]added nftTokenId: ", nftTokenId);

        concentratedLiquidity[nftTokenId] = UserLiquidity.Data({
            //            baseVirtual: _resultAddLiquidity.baseAmountAdded,
            //            quoteVirtual: _resultAddLiquidity.quoteAmountAdded,
            liquidity: uint128(_resultAddLiquidity.liquidity),
            indexedPipRange: params.indexedPipRange,
            feeGrowthBase: _resultAddLiquidity.feeGrowthBase,
            feeGrowthQuote: _resultAddLiquidity.feeGrowthQuote,
            pool: params.pool
        });

        console.log(
            "[ConcentratedLiquidity]added addLiquidity: ",
            concentratedLiquidity[nftTokenId].liquidity
        );

        emit LiquidityAdded(
            user,
            address(params.pool),
            _resultAddLiquidity.baseAmountAdded,
            _resultAddLiquidity.quoteAmountAdded,
            params.indexedPipRange,
            nftTokenId
        );
    }

    // 1. Burn NFT
    // 2. Update liquidity data
    // 3. Transfer assets
    // 4. Get fee reward
    // 5. Transfer fee reward
    // 6. Emit Event
    function removeLiquidity(uint256 nftTokenId) public virtual {
        UserLiquidity.Data memory liquidityData = concentratedLiquidity[
            nftTokenId
        ];

        console.log(
            "[ConcentratedLiquidity][removeLiquidity] user liquidity : ",
            concentratedLiquidity[nftTokenId].liquidity
        );

        console.log(
            "[ConcentratedLiquidity][removeLiquidity] start burn: ",
            nftTokenId
        );
        burn(nftTokenId);
        console.log(
            "[ConcentratedLiquidity][removeLiquidity] end burn: ",
            nftTokenId
        );

        delete concentratedLiquidity[nftTokenId];

        (
            uint128 baseAmountRemoved,
            uint128 quoteAmountRemoved
        ) = _removeLiquidity(liquidityData, liquidityData.liquidity);

        UserLiquidity.CollectFeeData memory _collectFeeData;

        _collectFeeData = _collectFee(
            liquidityData.pool,
            liquidityData.feeGrowthBase,
            liquidityData.feeGrowthQuote,
            liquidityData.liquidity,
            liquidityData.indexedPipRange
        );

        address user = _msgSender();
        console.log(
            "[ConcentratedLiquidity][removeLiquidity] base receive, _collectFeeData.feeBaseAmount: ",
            baseAmountRemoved + _collectFeeData.feeBaseAmount,
            _collectFeeData.feeBaseAmount
        );

        withdrawLiquidity(
            liquidityData.pool,
            user,
            SpotHouseStorage.Asset.Base,
            baseAmountRemoved + _collectFeeData.feeBaseAmount
        );

        console.log(
            "[ConcentratedLiquidity][removeLiquidity] quote receive, _collectFeeData.feeQuoteAmount: ",
            quoteAmountRemoved + _collectFeeData.feeQuoteAmount,
            _collectFeeData.feeQuoteAmount
        );

        withdrawLiquidity(
            liquidityData.pool,
            user,
            SpotHouseStorage.Asset.Quote,
            quoteAmountRemoved + _collectFeeData.feeQuoteAmount
        );

        emit LiquidityRemoved(
            user,
            address(liquidityData.pool),
            baseAmountRemoved,
            quoteAmountRemoved,
            liquidityData.indexedPipRange
        );
    }

    function increaseLiquidity(
        uint256 nftTokenId,
        uint128 amountModify,
        bool isBase
    ) public payable virtual {
        UserLiquidity.Data memory liquidityData = concentratedLiquidity[
            nftTokenId
        ];
        address user = _msgSender();
        amountModify = uint128(
            depositLiquidity(
                liquidityData.pool,
                user,
                isBase
                    ? SpotHouseStorage.Asset.Base
                    : SpotHouseStorage.Asset.Quote,
                amountModify
            )
        );
        console.log(
            "[ConcentratedLiquidity][increaseLiquidity] amountModify, isbase, nftTokenId: ",
            amountModify,
            isBase,
            nftTokenId
        );

        ResultAddLiquidity memory _resultAddLiquidity = _addLiquidity(
            amountModify,
            isBase,
            liquidityData.indexedPipRange,
            _getCurrentIndexPipRange(liquidityData.pool),
            liquidityData.pool
        );

        uint256 amountModifySecondAsset = depositLiquidity(
            liquidityData.pool,
            user,
            isBase ? SpotHouseStorage.Asset.Quote : SpotHouseStorage.Asset.Base,
            isBase
                ? _resultAddLiquidity.quoteAmountAdded
                : _resultAddLiquidity.baseAmountAdded
        );

        require(
            isBase
                ? amountModifySecondAsset >=
                    _resultAddLiquidity.quoteAmountAdded
                : amountModifySecondAsset >=
                    _resultAddLiquidity.baseAmountAdded,
            "not support"
        );

        UserLiquidity.CollectFeeData memory _collectFeeData = _collectFee(
            liquidityData.pool,
            liquidityData.feeGrowthBase,
            liquidityData.feeGrowthQuote,
            liquidityData.liquidity,
            liquidityData.indexedPipRange
        );

        console.log(
            "_collectFeeData.feeBaseAmount: ",
            _collectFeeData.feeBaseAmount
        );

        withdrawLiquidity(
            liquidityData.pool,
            user,
            SpotHouseStorage.Asset.Base,
            _collectFeeData.feeBaseAmount
        );

        console.log(
            "_collectFeeData.feeQuoteAmount: ",
            _collectFeeData.feeQuoteAmount
        );
        withdrawLiquidity(
            liquidityData.pool,
            user,
            SpotHouseStorage.Asset.Quote,
            _collectFeeData.feeQuoteAmount
        );

        concentratedLiquidity[nftTokenId].updateLiquidity(
            liquidityData.liquidity + uint128(_resultAddLiquidity.liquidity),
            liquidityData.indexedPipRange,
            _collectFeeData.newFeeGrowthBase,
            _collectFeeData.newFeeGrowthQuote
        );

        _updateStakingLiquidity(
            user,
            nftTokenId,
            address(liquidityData.pool),
            uint128(_resultAddLiquidity.liquidity),
            ModifyType.INCREASE
        );

        emit LiquidityModified(
            user,
            address(liquidityData.pool),
            _resultAddLiquidity.baseAmountAdded,
            _resultAddLiquidity.quoteAmountAdded,
            ModifyType.INCREASE,
            liquidityData.indexedPipRange
        );
    }

    function decreaseLiquidity(uint256 nftTokenId, uint128 liquidity)
        public
        virtual
    {
        UserLiquidity.Data memory liquidityData = concentratedLiquidity[
            nftTokenId
        ];

        //        require(liquidityData.liquidity >= liquidity, "!Liquidity");

        if (liquidity > liquidityData.liquidity) {
            liquidity = liquidityData.liquidity;
        }

        (
            uint128 baseAmountRemoved,
            uint128 quoteAmountRemoved
        ) = _removeLiquidity(liquidityData, liquidity);

        console.log(
            " [ConcentratedLiquidity][decreaseLiquidity] baseAmountRemoved: ",
            baseAmountRemoved
        );
        console.log(
            " [ConcentratedLiquidity][decreaseLiquidity] quoteAmountRemoved: ",
            quoteAmountRemoved
        );
        //        console.log(" liquidityData.baseVirtual: ", liquidityData.baseVirtual );
        //        console.log(" liquidityData.quoteVirtual: ", liquidityData.quoteVirtual );

        UserLiquidity.CollectFeeData memory _collectFeeData = _collectFee(
            liquidityData.pool,
            liquidityData.feeGrowthBase,
            liquidityData.feeGrowthQuote,
            liquidityData.liquidity,
            liquidityData.indexedPipRange
        );

        concentratedLiquidity[nftTokenId].updateLiquidity(
            liquidityData.liquidity - liquidity,
            liquidityData.indexedPipRange,
            _collectFeeData.newFeeGrowthBase,
            _collectFeeData.feeQuoteAmount
        );

        // current 5
        address user = _msgSender();
        withdrawLiquidity(
            liquidityData.pool,
            user,
            SpotHouseStorage.Asset.Base,
            baseAmountRemoved + _collectFeeData.feeBaseAmount
        );

        withdrawLiquidity(
            liquidityData.pool,
            user,
            SpotHouseStorage.Asset.Quote,
            quoteAmountRemoved + _collectFeeData.feeQuoteAmount
        );
        _updateStakingLiquidity(
            user,
            nftTokenId,
            address(liquidityData.pool),
            liquidity,
            ModifyType.DECREASE
        );

        emit LiquidityModified(
            user,
            address(liquidityData.pool),
            baseAmountRemoved,
            quoteAmountRemoved,
            ModifyType.DECREASE,
            liquidityData.indexedPipRange
        );
    }

    struct ShiftRangeState {
        UserLiquidity.Data liquidityData;
        UserLiquidity.CollectFeeData collectFeeData;
        ResultAddLiquidity resultAddLiquidity;
        address user;
        uint256 currentIndexedPipRange;
        uint128 baseReceiveEstimate;
        uint128 quoteReceiveEstimate;
    }

    function shiftRange(
        uint256 nftTokenId,
        uint32 targetIndex,
        uint128 amountNeeded,
        bool isBase
    ) public payable virtual {
        ShiftRangeState memory state;

        state.liquidityData = concentratedLiquidity[nftTokenId];

        state.currentIndexedPipRange = _getCurrentIndexPipRange(
            state.liquidityData.pool
        );

        require(
            targetIndex != state.liquidityData.indexedPipRange,
            Errors.LQ_INDEX_RANGE_NOT_DIFF
        );

        state.collectFeeData = _collectFee(
            state.liquidityData.pool,
            state.liquidityData.feeGrowthBase,
            state.liquidityData.feeGrowthQuote,
            state.liquidityData.liquidity,
            state.liquidityData.indexedPipRange
        );
        console.log(
            "[shiftRange]  _collectFeeData.feeBaseAmount, _collectFeeData.feeQuoteAmount :",
            state.collectFeeData.feeBaseAmount,
            state.collectFeeData.feeQuoteAmount
        );

        (
            uint128 baseAmountRemoved,
            uint128 quoteAmountRemoved
        ) = _removeLiquidity(
                state.liquidityData,
                state.liquidityData.liquidity
            );
        console.log(
            "[shiftRange] baseAmountRemoved, quoteAmountRemoved :",
            baseAmountRemoved,
            quoteAmountRemoved
        );

        state.baseReceiveEstimate =
            baseAmountRemoved +
            uint128(state.collectFeeData.feeBaseAmount);
        state.quoteReceiveEstimate =
            quoteAmountRemoved +
            uint128(state.collectFeeData.feeQuoteAmount);

        if (isBase) {
            state.baseReceiveEstimate += amountNeeded;
        } else {
            state.quoteReceiveEstimate += amountNeeded;
        }
        if (
            (targetIndex > state.currentIndexedPipRange &&
                state.baseReceiveEstimate == 0) ||
            (targetIndex < state.currentIndexedPipRange &&
                state.quoteReceiveEstimate == 0)
        ) {
            revert("Invalid amount");
        }

        state.resultAddLiquidity = _addLiquidity(
            // calculate based on BaseAmount. Keep the amount of Base if
            // targetIndex > liquidityData.indexedPipRange
            // else Calculate based on QuoteAmount. Keep the amount of Quote
            isBase ? state.baseReceiveEstimate : state.quoteReceiveEstimate,
            isBase,
            targetIndex,
            state.currentIndexedPipRange,
            state.liquidityData.pool
        );

        console.log(
            "[shiftRange] state.resultAddLiquidity.baseAmountAdded, state.resultAddLiquidity.quoteAmountAdded :",
            state.resultAddLiquidity.baseAmountAdded,
            state.resultAddLiquidity.quoteAmountAdded
        );

        state.user = _msgSender();
        {
            console.log(
                "< compare 1",
                quoteAmountRemoved + state.collectFeeData.feeQuoteAmount <
                    state.resultAddLiquidity.quoteAmountAdded
            );
            if (
                quoteAmountRemoved + state.collectFeeData.feeQuoteAmount <
                state.resultAddLiquidity.quoteAmountAdded
            ) {
                console.log("depositLiquidity");

                depositLiquidity(
                    state.liquidityData.pool,
                    state.user,
                    SpotHouseStorage.Asset.Quote,
                    state.resultAddLiquidity.quoteAmountAdded -
                        quoteAmountRemoved -
                        state.collectFeeData.feeQuoteAmount
                );
            } else {
                console.log("withdrawLiquidity");
                withdrawLiquidity(
                    state.liquidityData.pool,
                    state.user,
                    SpotHouseStorage.Asset.Quote,
                    quoteAmountRemoved +
                        state.collectFeeData.feeQuoteAmount -
                        state.resultAddLiquidity.quoteAmountAdded
                );
            }

            console.log(
                "< compare 2",
                quoteAmountRemoved + state.collectFeeData.feeQuoteAmount <
                    state.resultAddLiquidity.quoteAmountAdded
            );
            if (
                baseAmountRemoved + state.collectFeeData.feeBaseAmount <
                state.resultAddLiquidity.baseAmountAdded
            ) {
                depositLiquidity(
                    state.liquidityData.pool,
                    state.user,
                    SpotHouseStorage.Asset.Base,
                    state.resultAddLiquidity.baseAmountAdded -
                        baseAmountRemoved -
                        state.collectFeeData.feeBaseAmount
                );
            } else {
                withdrawLiquidity(
                    state.liquidityData.pool,
                    state.user,
                    SpotHouseStorage.Asset.Base,
                    baseAmountRemoved +
                        state.collectFeeData.feeBaseAmount -
                        state.resultAddLiquidity.baseAmountAdded
                );
            }
        }

        console.log(
            "targetIndex, state.resultAddLiquidity.feeGrowthBase, state.resultAddLiquidity.feeGrowthQuote: ",
            targetIndex,
            state.resultAddLiquidity.feeGrowthBase,
            state.resultAddLiquidity.feeGrowthQuote
        );
        console.log("nftTokenId, targetIndex: ", nftTokenId, targetIndex);
        concentratedLiquidity[nftTokenId].updateLiquidity(
            uint128(state.resultAddLiquidity.liquidity),
            targetIndex,
            state.resultAddLiquidity.feeGrowthBase,
            state.resultAddLiquidity.feeGrowthQuote
        );

        _updateStakingLiquidity(
            state.user,
            nftTokenId,
            address(state.liquidityData.pool),
            uint128(state.resultAddLiquidity.liquidity),
            state.resultAddLiquidity.liquidity > state.liquidityData.liquidity
                ? ModifyType.INCREASE
                : ModifyType.DECREASE
        );

        emit LiquidityShiftRange(
            state.user,
            address(state.liquidityData.pool),
            state.liquidityData.indexedPipRange,
            baseAmountRemoved,
            quoteAmountRemoved,
            targetIndex,
            uint128(state.resultAddLiquidity.liquidity),
            state.resultAddLiquidity.baseAmountAdded,
            state.resultAddLiquidity.quoteAmountAdded
        );
    }

    function collectFee(uint256 nftTokenId) public virtual {
        UserLiquidity.Data memory liquidityData = concentratedLiquidity[
            nftTokenId
        ];
        UserLiquidity.CollectFeeData memory _collectFeeData;
        _collectFeeData = _collectFee(
            liquidityData.pool,
            liquidityData.feeGrowthBase,
            liquidityData.feeGrowthQuote,
            liquidityData.liquidity,
            liquidityData.indexedPipRange
        );

        address user = _msgSender();
        withdrawLiquidity(
            liquidityData.pool,
            user,
            SpotHouseStorage.Asset.Base,
            _collectFeeData.feeBaseAmount
        );

        withdrawLiquidity(
            liquidityData.pool,
            user,
            SpotHouseStorage.Asset.Quote,
            _collectFeeData.feeQuoteAmount
        );
        concentratedLiquidity[nftTokenId].feeGrowthBase = _collectFeeData
            .newFeeGrowthBase;
        concentratedLiquidity[nftTokenId].feeGrowthQuote = _collectFeeData
            .newFeeGrowthQuote;
    }

    function liquidity(uint256 nftTokenId)
        public
        view
        virtual
        returns (
            uint128 baseVirtual,
            uint128 quoteVirtual,
            uint128 liquidity,
            uint256 indexedPipRange,
            uint256 feeBasePending,
            uint256 feeQuotePending,
            IMatchingEngineAMM pool
        )
    {
        UserLiquidity.Data memory liquidityData = concentratedLiquidity[
            nftTokenId
        ];
        UserLiquidity.CollectFeeData memory _collectFeeData;
        _collectFeeData = _collectFee(
            liquidityData.pool,
            liquidityData.feeGrowthBase,
            liquidityData.feeGrowthQuote,
            liquidityData.liquidity,
            liquidityData.indexedPipRange
        );

        (
            uint128 baseAmountRemoved,
            uint128 quoteAmountRemoved,

        ) = liquidityData.pool.estimateRemoveLiquidity(
                IAutoMarketMakerCore.RemoveLiquidity({
                    liquidity: liquidityData.liquidity,
                    indexedPipRange: liquidityData.indexedPipRange,
                    feeGrowthBase: liquidityData.feeGrowthBase,
                    feeGrowthQuote: liquidityData.feeGrowthQuote
                })
            );

        uint128 liquidity;
        uint32 indexedPipRange;
        uint256 feeGrowthBase;
        uint256 feeGrowthQuote;

        return (
            baseAmountRemoved,
            quoteAmountRemoved,
            liquidityData.liquidity,
            liquidityData.indexedPipRange,
            _collectFeeData.feeBaseAmount,
            _collectFeeData.feeQuoteAmount,
            liquidityData.pool
        );
    }

    function getAllDataTokens(uint256[] memory tokens)
        public
        view
        returns (UserLiquidity.Data[] memory)
    {
        UserLiquidity.Data[] memory LiquidityData;
        return LiquidityData;
    }

    //------------------------------------------------------------------------------------------------------------------
    // INTERNAL FUNCTIONS
    //------------------------------------------------------------------------------------------------------------------

    function _msgSender() internal view virtual returns (address) {}

    struct ResultAddLiquidity {
        uint128 baseAmountAdded;
        uint128 quoteAmountAdded;
        uint256 liquidity;
        uint256 feeGrowthBase;
        uint256 feeGrowthQuote;
    }

    struct State {
        uint128 baseAmountModify;
        uint128 quoteAmountModify;
        uint256 currentIndexedPipRange;
        SpotFactoryStorage.Pair pair;
        address WBNBAddress;
        uint128 currentPrice;
        uint128 maxPip;
        uint128 minPip;
        uint128 basicPoint;
    }

    function _addLiquidity(
        uint128 amountModify,
        bool isBase,
        uint32 indexedPipRange,
        uint256 currentIndexedPipRange,
        IMatchingEngineAMM pool
    ) internal returns (ResultAddLiquidity memory result) {
        console.log(
            "[ConcentratedLiquidity][_addLiquidity] amountModify: ",
            amountModify
        );

        State memory state;
        state.currentIndexedPipRange = currentIndexedPipRange;
        state.currentPrice = pool.getCurrentPip();

        (state.minPip, state.maxPip) = LiquidityMath.calculatePipRange(
            indexedPipRange,
            _getPipRange(pool)
        );

        console.log("state.minPip, state.maxPip: ", state.minPip, state.maxPip);

        //        console.log("state.pipRange: ", state.pipRange);
        ////
        state.pair = _getQuoteAndBase(pool);

        // TODO consider necessary to check it
        //        state.WBNBAddress = _getWBNBAddress();
        //        if (state.pair.QuoteAsset == state.WBNBAddress) {
        //            require(!isBase, "not support");
        //        }
        //
        //        if (state.pair.BaseAsset == state.WBNBAddress) {
        //            require(isBase, "not support");
        //        }

        console.log(
            "[ConcentratedLiquidity][_addLiquidity] indexedPipRange state.currentIndexedPipRange: ",
            indexedPipRange,
            state.currentIndexedPipRange
        );
        console.log(
            "[ConcentratedLiquidity][_addLiquidity] state.currentPrice  state.maxPip : ",
            state.currentPrice,
            state.maxPip
        );
        if (
            (indexedPipRange < state.currentIndexedPipRange) ||
            (indexedPipRange == state.currentIndexedPipRange &&
                state.currentPrice == state.maxPip)
        ) {
            if (isBase) revert("!Base");

            state.quoteAmountModify = amountModify;
        } else if (
            (indexedPipRange > state.currentIndexedPipRange) ||
            (indexedPipRange == state.currentIndexedPipRange &&
                state.currentPrice == state.minPip)
        ) {
            if (!isBase) revert("!Quote");
            state.baseAmountModify = amountModify;
        } else if (indexedPipRange == state.currentIndexedPipRange) {
            state.maxPip = uint128(Math.sqrt(uint256(state.maxPip) * 10**18));
            state.minPip = uint128(Math.sqrt(uint256(state.minPip) * 10**18));
            state.currentPrice = uint128(
                Math.sqrt(uint256(state.currentPrice) * 10**18)
            );

            if (isBase) {
                uint128 baseReal = LiquidityMath.calculateBaseReal(
                    state.maxPip,
                    amountModify,
                    state.currentPrice
                );

                console.log(
                    "[ConcentratedLiquidity][_addLiquidity] baseReal: ",
                    baseReal
                );
                state.baseAmountModify = amountModify;
                state.quoteAmountModify = LiquidityHelper
                    .calculateQuoteVirtualFromBaseReal(
                        LiquidityMath.calculateBaseReal(
                            state.maxPip,
                            amountModify,
                            state.currentPrice
                        ),
                        state.currentPrice,
                        state.minPip,
                        uint128(Math.sqrt(pool.basisPoint()))
                    );
                console.log(
                    "[ConcentratedLiquidity][_addLiquidity] state.baseAmountModify state.quoteAmountModify x: ",
                    state.baseAmountModify,
                    state.quoteAmountModify
                );
            } else {
                uint128 quoteReal = LiquidityMath.calculateQuoteReal(
                    state.minPip,
                    amountModify,
                    state.currentPrice
                );

                console.log(
                    "[ConcentratedLiquidity][_addLiquidity] quoteRael, state.minPip, state.currentPrice: ",
                    quoteReal,
                    state.minPip,
                    state.currentPrice
                );
                console.log(
                    "[ConcentratedLiquidity][_addLiquidity] amountModify: ",
                    amountModify
                );

                state.quoteAmountModify = amountModify;
                state.baseAmountModify =
                    LiquidityHelper.calculateBaseVirtualFromQuoteReal(
                        LiquidityMath.calculateQuoteReal(
                            state.minPip,
                            amountModify,
                            state.currentPrice
                        ),
                        state.currentPrice,
                        state.maxPip
                    ) *
                    uint128(pool.basisPoint());

                console.log(
                    "[ConcentratedLiquidity][_addLiquidity] state.baseAmountModify state.quoteAmountModify with quote: ",
                    state.baseAmountModify,
                    state.quoteAmountModify
                );
            }
        }

        console.log(
            "[ConcentratedLiquidity][_addLiquidity] state.baseAmountModify: ",
            state.baseAmountModify
        );
        console.log(
            "[ConcentratedLiquidity][_addLiquidity] state.quoteAmountModify: ",
            state.quoteAmountModify
        );

        (
            result.baseAmountAdded,
            result.quoteAmountAdded,
            result.liquidity,
            result.feeGrowthBase,
            result.feeGrowthQuote
        ) = pool.addLiquidity(
            IAutoMarketMakerCore.AddLiquidity({
                baseAmount: state.baseAmountModify,
                quoteAmount: state.quoteAmountModify,
                indexedPipRange: indexedPipRange
            })
        );
        console.log(
            "[ConcentratedLiquidity][_addLiquidity] result.liquidity: ",
            result.liquidity
        );
    }

    function _removeLiquidity(
        UserLiquidity.Data memory liquidityData,
        uint128 liquidity
    ) internal returns (uint128 baseAmount, uint128 quoteAmount) {
        if (liquidity == 0) return (baseAmount, quoteAmount);
        return
            liquidityData.pool.removeLiquidity(
                IAutoMarketMakerCore.RemoveLiquidity({
                    liquidity: liquidity,
                    indexedPipRange: liquidityData.indexedPipRange,
                    feeGrowthBase: liquidityData.feeGrowthBase,
                    feeGrowthQuote: liquidityData.feeGrowthQuote
                })
            );
    }

    function _collectFee(
        IMatchingEngineAMM pool,
        uint256 feeGrowthBase,
        uint256 feeGrowthQuote,
        uint128 liquidity,
        uint32 indexedPipRange
    ) internal view returns (UserLiquidity.CollectFeeData memory _feeData) {
        (
            ,
            ,
            ,
            ,
            ,
            _feeData.newFeeGrowthBase,
            _feeData.newFeeGrowthQuote,

        ) = pool.liquidityInfo(indexedPipRange);
        console.log(
            "_feeData.newFeeGrowthBase, feeGrowthBase, indexedPipRange: ",
            _feeData.newFeeGrowthBase,
            feeGrowthBase,
            indexedPipRange
        );
        console.log(
            "_feeData.newFeeGrowthQuote, feeGrowthQuote, indexedPipRange: ",
            _feeData.newFeeGrowthQuote,
            feeGrowthQuote,
            indexedPipRange
        );

        _feeData.feeBaseAmount = Math.mulDiv(
            _feeData.newFeeGrowthBase - feeGrowthBase,
            liquidity,
            FixedPoint128.Q_POW18
        );
        _feeData.feeQuoteAmount = Math.mulDiv(
            _feeData.newFeeGrowthQuote - feeGrowthQuote,
            liquidity,
            FixedPoint128.Q_POW18
        );
    }

    function _getPipRange(IMatchingEngineAMM pool)
        internal
        returns (uint128 pipRange)
    {
        return pool.getPipRange();
    }

    function _getCurrentIndexPipRange(IMatchingEngineAMM pool)
        internal
        returns (uint256)
    {
        return pool.currentIndexedPipRange();
    }

    function _getCurrentPrice(IMatchingEngineAMM pool)
        internal
        returns (uint128)
    {}

    function depositLiquidity(
        IMatchingEngineAMM _pairManager,
        address _payer,
        SpotHouseStorage.Asset _asset,
        uint256 _amount
    ) internal virtual returns (uint256 amount) {}

    function withdrawLiquidity(
        IMatchingEngineAMM _pairManager,
        address _recipient,
        SpotHouseStorage.Asset _asset,
        uint256 _amount
    ) internal virtual {}

    function _getQuoteAndBase(IMatchingEngineAMM _managerAddress)
        internal
        view
        virtual
        returns (SpotFactoryStorage.Pair memory pair)
    {}

    function _getWBNBAddress() internal view virtual returns (address) {}

    function _updateStakingLiquidity(
        address user,
        uint256 tokenId,
        address poolId,
        uint128 deltaLiquidityModify,
        ModifyType modifyType
    ) internal {
        if (address(stakingManager) != address(0)) {
            stakingManager.updateLiquidity(
                user,
                tokenId,
                poolId,
                deltaLiquidityModify,
                modifyType
            );
        }
    }

    function mint(address user) internal virtual returns (uint256 tokenId) {}

    function burn(uint256 tokenId) internal virtual {}
}
