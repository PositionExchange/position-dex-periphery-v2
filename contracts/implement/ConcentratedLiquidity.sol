/**
 * @author Musket
 * @author NiKa
 */
// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.9;

import "../libraries/liquidity/Liquidity.sol";
import "../libraries/types/SpotHouseStorage.sol";
import "../interfaces/INonfungiblePositionLiquidityPool.sol";
import "@positionex/matching-engine/contracts/interfaces/IMatchingEngineAMM.sol";
import "../interfaces/IConcentratedLiquidity.sol";
import "../libraries/helper/LiquidityHelper.sol";

abstract contract ConcentratedLiquidity is IConcentratedLiquidity {
    using UserLiquidity for UserLiquidity.Data;
    INonfungiblePositionLiquidityPool public positionDexNft;

    modifier nftOwner(uint256 nftId) {
        require(_msgSender() == positionDexNft.ownerOf(nftId), "!Owner");
        _;
    }

    mapping(uint256 => UserLiquidity.Data) public concentratedLiquidity;

    function _initializeConcentratedLiquidity(address _positionDexNft)
        internal
    {
        positionDexNft = INonfungiblePositionLiquidityPool(_positionDexNft);
    }

    struct AddLiquidityParams {
        IMatchingEngineAMM pool;
        uint128 amountVirtual;
        bool isBase;
        uint32 indexedPipRange;
    }

    // 1.1 Add Liquidity
    // 1.1.1 Add Liquidity for token
    // 1.1.2 Add liquidity for native coin
    // 1.2 Mint an NFT
    // 1.3 Store Liquidity Info to storage
    // 1.4 Transfer assets
    // 1.5 Emit Event
    function addLiquidity(AddLiquidityParams calldata params)
        public
        payable
        virtual
    {
        ResultAddLiquidity memory _addLiquidity = _addLiquidity(
            params.amountVirtual,
            params.isBase,
            params.indexedPipRange,
            params.pool
        );

        address user = _msgSender();

        uint256 nftTokenId = positionDexNft.mint(user);

        concentratedLiquidity[nftTokenId] = UserLiquidity.Data({
            baseVirtual: _addLiquidity.baseAmountAdded,
            quoteVirtual: _addLiquidity.quoteAmountAdded,
            liquidity: uint128(_addLiquidity.liquidity),
            indexedPipRange: params.indexedPipRange,
            feeGrowthBase: _addLiquidity.feeGrowthBase,
            feeGrowthQuote: _addLiquidity.feeGrowthQuote,
            pool: params.pool
        });

        depositLiquidity(
            params.pool,
            user,
            SpotHouseStorage.Asset.Base,
            _addLiquidity.baseAmountAdded
        );
        depositLiquidity(
            params.pool,
            user,
            SpotHouseStorage.Asset.Quote,
            _addLiquidity.quoteAmountAdded
        );
        emit LiquidityAdded(
            user,
            address(params.pool),
            _addLiquidity.baseAmountAdded,
            _addLiquidity.quoteAmountAdded,
            params.indexedPipRange,
            nftTokenId
        );
    }

    function depositLiquidity(
        IMatchingEngineAMM _pairManager,
        address _payer,
        SpotHouseStorage.Asset _asset,
        uint256 _amount
    ) internal virtual {}

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

    function _getQuoteAndBase(address pairManager)
        internal
        view
        virtual
        returns (SpotFactoryStorage.Pair memory)
    {}

    function _getWBNBAddress() internal view virtual returns (address) {}

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

        positionDexNft.burn(nftTokenId);
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

        require(liquidityData.liquidity >= liquidity, "!Liquidity");

        (
            uint128 baseAmountRemoved,
            uint128 quoteAmountRemoved
        ) = _removeLiquidity(liquidityData, liquidity);

        concentratedLiquidity[nftTokenId].updateLiquidity(
            liquidityData.liquidity - liquidity,
            liquidityData.baseVirtual - baseAmountRemoved,
            liquidityData.quoteVirtual - quoteAmountRemoved,
            liquidityData.indexedPipRange,
            0,
            0
        );

        address user = _msgSender();
        withdrawLiquidity(
            liquidityData.pool,
            user,
            SpotHouseStorage.Asset.Base,
            baseAmountRemoved
        );

        withdrawLiquidity(
            liquidityData.pool,
            user,
            SpotHouseStorage.Asset.Quote,
            quoteAmountRemoved
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
        ResultAddLiquidity memory _addLiquidity = _addLiquidity(
            amountModify,
            isBase,
            liquidityData.indexedPipRange,
            liquidityData.pool
        );

        concentratedLiquidity[nftTokenId].updateLiquidity(
            liquidityData.liquidity + uint128(_addLiquidity.liquidity),
            liquidityData.baseVirtual + _addLiquidity.baseAmountAdded,
            liquidityData.quoteVirtual + _addLiquidity.quoteAmountAdded,
            liquidityData.indexedPipRange,
            0,
            0
        );
        address user = _msgSender();
        {
            depositLiquidity(
                liquidityData.pool,
                user,
                SpotHouseStorage.Asset.Base,
                _addLiquidity.baseAmountAdded
            );

            depositLiquidity(
                liquidityData.pool,
                user,
                SpotHouseStorage.Asset.Quote,
                _addLiquidity.quoteAmountAdded
            );
        }

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
                ? liquidityData.baseVirtual
                : liquidityData.quoteVirtual,
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
            _addLiquidity.baseAmountAdded,
            _addLiquidity.quoteAmountAdded,
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

        return (
            liquidityData.baseVirtual,
            liquidityData.quoteVirtual,
            liquidityData.liquidity,
            _collectFeeData.feeBaseAmount,
            _collectFeeData.feeQuoteAmount,
            liquidityData.pool
        );
    }

    function getDataNonfungibleToken(uint256 nftTokenId)
        external
        view
        returns (UserLiquidity.Data memory)
    {
        UserLiquidity.Data memory LiquidityData;
        return LiquidityData;
    }

    function getAllDataTokens(uint256[] memory tokens)
        external
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
        uint128 pipRange;
        SpotFactoryStorage.Pair pair;
        address WBNBAddress;
    }

    function _addLiquidity(
        uint128 amountModify,
        bool isBase,
        uint32 indexedPipRange,
        IMatchingEngineAMM pool
    ) internal returns (ResultAddLiquidity memory) {
        State memory state;
        //        uint128 baseAmountModify;
        //        uint128 quoteAmountModify;
        state.pipRange = _getPipRange(pool);
        //
        //        // Require input is BNB if base or quote is BNB
        //
        state.pair = _getQuoteAndBase(address(pool));

        state.WBNBAddress = _getWBNBAddress();

        require(
            (state.pair.QuoteAsset == state.WBNBAddress && !isBase) ||
                (state.pair.BaseAsset == state.WBNBAddress && isBase),
            "not support"
        );

        if (isBase) {
            state.baseAmountModify = amountModify;
            state.quoteAmountModify = LiquidityHelper
                .calculateQuoteVirtualAmountFromBaseVirtualAmount(
                    amountModify,
                    pool,
                    indexedPipRange,
                    state.pipRange
                );
        } else {
            state.baseAmountModify = amountModify;
            state.quoteAmountModify = LiquidityHelper
                .calculateBaseVirtualAmountFromQuoteVirtualAmount(
                    amountModify,
                    pool,
                    indexedPipRange,
                    state.pipRange
                );
        }
        (
            uint128 baseAmountAdded,
            uint128 quoteAmountAdded,
            uint256 liquidity,
            uint256 feeGrowthBase,
            uint256 feeGrowthQuote
        ) = pool.addLiquidity(
                IAutoMarketMakerCore.AddLiquidity({
                    baseAmount: state.baseAmountModify,
                    quoteAmount: state.quoteAmountModify,
                    indexedPipRange: indexedPipRange
                })
            );

        return
            ResultAddLiquidity({
                baseAmountAdded: baseAmountAdded,
                quoteAmountAdded: quoteAmountAdded,
                liquidity: liquidity,
                feeGrowthBase: feeGrowthBase,
                feeGrowthQuote: feeGrowthQuote
            });
    }

    function _removeLiquidity(
        UserLiquidity.Data memory liquidityData,
        uint128 liquidity
    ) internal returns (uint128 baseAmount, uint128 quoteAmount) {
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
    )
        internal
        view
        returns (UserLiquidity.CollectFeeData memory _feeData)
    //            uint256 baseAmount,
    //            uint256 quoteAmount,
    //            uint256 newFeeGrowthBase,
    //            uint256 newFeeGrowthQuote
    {
        UserLiquidity.CollectFeeData memory _feeData;
        (
            uint256 feeBaseAmount,
            uint256 feeQuoteAmount,
            uint256 newFeeGrowthBase,
            uint256 newFeeGrowthQuote
        ) = pool.collectFee(
                feeGrowthBase,
                feeGrowthQuote,
                liquidity,
                indexedPipRange
            );
        _feeData.feeBaseAmount = feeBaseAmount;
        _feeData.feeQuoteAmount = feeQuoteAmount;
        _feeData.newFeeGrowthBase = newFeeGrowthBase;
        _feeData.newFeeGrowthQuote = newFeeGrowthQuote;

        return _feeData;
    }

    function _getPipRange(IMatchingEngineAMM pool)
        internal
        returns (uint128 pipRange)
    {
        return pool.getPipRange();
    }
}
