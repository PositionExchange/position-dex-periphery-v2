/**
 * @author Musket
 * @author NiKa
 */
// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.9;

import "../libraries/liquidity/Liquidity.sol";
import "../libraries/types/SpotHouseStorage.sol";
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
            "[ConcentratedLiquidity][removeLiquidity] base receive: ",
            baseAmountRemoved + _collectFeeData.feeBaseAmount,
            _collectFeeData.feeBaseAmount
        );

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

        emit LiquidityRemoved(
            user,
            address(liquidityData.pool),
            baseAmountRemoved,
            quoteAmountRemoved,
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

        ResultAddLiquidity memory _addLiquidity = _addLiquidity(
            amountModify,
            isBase,
            liquidityData.indexedPipRange,
            liquidityData.pool
        );

        uint256 amountModifySecondAsset = depositLiquidity(
            liquidityData.pool,
            user,
            isBase ? SpotHouseStorage.Asset.Quote : SpotHouseStorage.Asset.Base,
            isBase
                ? _addLiquidity.quoteAmountAdded
                : _addLiquidity.baseAmountAdded
        );

        require(
            isBase
                ? amountModifySecondAsset >= _addLiquidity.quoteAmountAdded
                : amountModifySecondAsset >= _addLiquidity.baseAmountAdded,
            "not support"
        );

        UserLiquidity.CollectFeeData memory _collectFeeData = _collectFee(
            liquidityData.pool,
            liquidityData.feeGrowthBase,
            liquidityData.feeGrowthQuote,
            liquidityData.liquidity,
            liquidityData.indexedPipRange
        );

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

        concentratedLiquidity[nftTokenId].updateLiquidity(
            liquidityData.liquidity + uint128(_addLiquidity.liquidity),
            liquidityData.indexedPipRange,
            _collectFeeData.newFeeGrowthBase,
            _collectFeeData.newFeeGrowthQuote
        );

        _updateStakingLiquidity(
            user,
            nftTokenId,
            address(liquidityData.pool),
            uint128(_addLiquidity.liquidity),
            ModifyType.INCREASE
        );

        emit LiquidityModified(
            user,
            address(liquidityData.pool),
            _addLiquidity.baseAmountAdded,
            _addLiquidity.quoteAmountAdded,
            ModifyType.INCREASE,
            liquidityData.indexedPipRange
        );
    }

    function shiftRange(uint256 nftTokenId, uint32 targetIndex)
        public
        payable
        virtual
    {
        UserLiquidity.Data memory liquidityData = concentratedLiquidity[
            nftTokenId
        ];
        // 1. Check amount Base, Quote when removing liquidity
        // 2. Check base, quote Amount of new liquidity range
        // 3. Update liquidity info
        // 4. Transfer token if needed
        // 5. Push event
        // TODO update liquidity in Farm/Pool
        require(
            targetIndex != liquidityData.indexedPipRange,
            "IndexRange is not different!"
        );

        UserLiquidity.CollectFeeData memory _collectFeeData = _collectFee(
            liquidityData.pool,
            liquidityData.feeGrowthBase,
            liquidityData.feeGrowthQuote,
            liquidityData.liquidity,
            liquidityData.indexedPipRange
        );

        (
            uint128 baseAmountRemoved,
            uint128 quoteAmountRemoved
        ) = _removeLiquidity(liquidityData, liquidityData.liquidity);

        ResultAddLiquidity memory _addLiquidity = _addLiquidity(
            // calculate based on BaseAmount. Keep the amount of Base if
            // targetIndex > liquidityData.indexedPipRange
            // else Calculate based on QuoteAmount. Keep the amount of Quote
            targetIndex > liquidityData.indexedPipRange
                ? baseAmountRemoved
                : quoteAmountRemoved,
            targetIndex > liquidityData.indexedPipRange ? true : false,
            targetIndex,
            liquidityData.pool
        );

        {
            address user = _msgSender();
            if (
                quoteAmountRemoved + _collectFeeData.feeQuoteAmount <
                _addLiquidity.quoteAmountAdded
            ) {
                depositLiquidity(
                    liquidityData.pool,
                    user,
                    SpotHouseStorage.Asset.Quote,
                    _addLiquidity.quoteAmountAdded -
                        quoteAmountRemoved -
                        _collectFeeData.feeQuoteAmount
                );
            } else {
                withdrawLiquidity(
                    liquidityData.pool,
                    user,
                    SpotHouseStorage.Asset.Quote,
                    quoteAmountRemoved +
                        _collectFeeData.feeQuoteAmount -
                        _addLiquidity.quoteAmountAdded
                );
            }

            if (
                baseAmountRemoved + _collectFeeData.feeBaseAmount <
                _addLiquidity.baseAmountAdded
            ) {
                depositLiquidity(
                    liquidityData.pool,
                    user,
                    SpotHouseStorage.Asset.Base,
                    _addLiquidity.baseAmountAdded -
                        baseAmountRemoved -
                        _collectFeeData.feeBaseAmount
                );
            } else {
                withdrawLiquidity(
                    liquidityData.pool,
                    user,
                    SpotHouseStorage.Asset.Base,
                    baseAmountRemoved +
                        _collectFeeData.feeBaseAmount -
                        _addLiquidity.baseAmountAdded
                );
            }
        }

        concentratedLiquidity[nftTokenId].updateLiquidity(
            uint128(_addLiquidity.liquidity),
            targetIndex,
            _addLiquidity.feeGrowthBase,
            _addLiquidity.feeGrowthBase
        );

        // TODO Update farm/pool
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

        //TODO call estimate remove
        return (
            0,
            0,
            liquidityData.liquidity,
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
        IMatchingEngineAMM pool
    ) internal returns (ResultAddLiquidity memory result) {
        console.log(
            "[ConcentratedLiquidity][_addLiquidity] amountModify: ",
            amountModify
        );

        State memory state;
        state.currentIndexedPipRange = _getCurrentIndexPipRange(pool);
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
