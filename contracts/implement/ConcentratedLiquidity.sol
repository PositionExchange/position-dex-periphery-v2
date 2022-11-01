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
        (
            uint128 baseAmountAdded,
            uint128 quoteAmountAdded,
            uint256 liquidity,
            uint256 feeGrowthBase,
            uint256 feeGrowthQuote
        ) = _addLiquidity(
                params.amountVirtual,
                params.isBase,
                params.indexedPipRange,
                params.pool
            );

        address user = _msgSender();

        uint256 nftTokenId = positionDexNft.mint(user);

        concentratedLiquidity[nftTokenId] = UserLiquidity.Data({
            baseVirtual: baseAmountAdded,
            quoteVirtual: quoteAmountAdded,
            liquidity: uint128(liquidity),
            indexedPipRange: params.indexedPipRange,
            feeGrowthBase: feeGrowthBase,
            feeGrowthQuote: feeGrowthQuote,
            pool: params.pool
        });

        depositLiquidity(
            params.pool,
            user,
            SpotHouseStorage.Asset.Base,
            baseAmountAdded
        );
        depositLiquidity(
            params.pool,
            user,
            SpotHouseStorage.Asset.Quote,
            quoteAmountAdded
        );
        emit LiquidityAdded(
            user,
            address(params.pool),
            baseAmountAdded,
            quoteAmountAdded,
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

        (
            uint256 feeBaseAmount,
            uint256 feeQuoteAmount,
            uint256 newFeeGrowthBase,
            uint256 newFeeGrowthQuote
        ) = _collectFee(
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
            baseAmountRemoved + feeBaseAmount
        );

        withdrawLiquidity(
            liquidityData.pool,
            user,
            SpotHouseStorage.Asset.Quote,
            quoteAmountRemoved + feeQuoteAmount
        );

        // TODO get fee reward
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
            liquidityData.quoteVirtual - quoteAmountRemoved
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
        (
            uint128 baseAmountAdded,
            uint128 quoteAmountAdded,
            uint256 liquidity,
            uint256 feeGrowthBase,
            uint256 feeGrowthQuote
        ) = _addLiquidity(
                amountModify,
                isBase,
                liquidityData.indexedPipRange,
                liquidityData.pool
            );

        concentratedLiquidity[nftTokenId].updateLiquidity(
            liquidityData.liquidity + uint128(liquidity),
            liquidityData.baseVirtual + baseAmountAdded,
            liquidityData.quoteVirtual + quoteAmountAdded
        );

        address user = _msgSender();
        depositLiquidity(
            liquidityData.pool,
            user,
            SpotHouseStorage.Asset.Base,
            baseAmountAdded
        );

        depositLiquidity(
            liquidityData.pool,
            user,
            SpotHouseStorage.Asset.Quote,
            quoteAmountAdded
        );

        emit LiquidityModified(
            user,
            address(liquidityData.pool),
            baseAmountAdded,
            quoteAmountAdded,
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

        (
            uint128 baseAmountRemoved,
            uint128 quoteAmountRemoved
        ) = _removeLiquidity(liquidityData, liquidityData.liquidity);

        (
            uint128 baseAmountAdded,
            uint128 quoteAmountAdded,
            uint256 liquidity,
            uint256 feeGrowthBase,
            uint256 feeGrowthQuote
        ) = _addLiquidity(
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
            if (quoteAmountRemoved < quoteAmountAdded) {
                depositLiquidity(
                    liquidityData.pool,
                    user,
                    SpotHouseStorage.Asset.Quote,
                    quoteAmountAdded - quoteAmountRemoved
                );
            } else {
                withdrawLiquidity(
                    liquidityData.pool,
                    user,
                    SpotHouseStorage.Asset.Quote,
                    quoteAmountRemoved - quoteAmountAdded
                );
            }

            if (baseAmountRemoved < baseAmountAdded) {
                depositLiquidity(
                    liquidityData.pool,
                    user,
                    SpotHouseStorage.Asset.Base,
                    baseAmountAdded - baseAmountRemoved
                );
            } else {
                withdrawLiquidity(
                    liquidityData.pool,
                    user,
                    SpotHouseStorage.Asset.Base,
                    baseAmountRemoved - baseAmountAdded
                );
            }
        }

        concentratedLiquidity[nftTokenId].updateLiquidity(
            uint128(liquidity),
            baseAmountAdded,
            quoteAmountAdded
        );

        // TODO Update farm/pool
    }

    function collectFee(uint256 nftTokenId)
        public
        virtual
        returns (
            uint256 baseAmount,
            uint256 quoteAmount,
            uint256 newFeeGrowthBase,
            uint256 newFeeGrowthQuote
        )
    {
        address owner = _msgSender();
        require(owner == positionDexNft.ownerOf(nftTokenId), "!Owner");

        UserLiquidity.Data memory liquidityData = concentratedLiquidity[
            nftTokenId
        ];
        return
            _collectFee(
                liquidityData.pool,
                liquidityData.feeGrowthBase,
                liquidityData.feeGrowthQuote,
                liquidityData.liquidity,
                liquidityData.indexedPipRange
            );
    }

    function liquidity(uint256 nftTokenId)
        public
        view
        returns (
            uint128 baseVirtual,
            uint128 quoteVirtual,
            uint128 liquidity,
            uint256 feeBasePending,
            uint256 feeQuotePending,
            address pool
        )
    {
        return (0, 0, 0, 0, 0, address(0x00000));
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

    function _addLiquidity(
        uint128 amountModify,
        bool isBase,
        uint32 indexedPipRange,
        IMatchingEngineAMM pool
    )
        internal
        returns (
            uint128 baseAmountAdded,
            uint128 quoteAmountAdded,
            uint256 liquidity,
            uint256 feeGrowthBase,
            uint256 feeGrowthQuote
        )
    {
        uint128 baseAmountModify;
        uint128 quoteAmountModify;
        uint128 pipRange = _getPipRange(pool);

        // Require input is BNB if base or quote is BNB

        SpotFactoryStorage.Pair memory _pair = _getQuoteAndBase(address(pool));

        address WBNBAddress = _getWBNBAddress();

        require(
            (_pair.QuoteAsset == WBNBAddress && !isBase) ||
                (_pair.BaseAsset == WBNBAddress && isBase),
            "not support"
        );

        if (isBase) {
            baseAmountModify = amountModify;
            quoteAmountModify = LiquidityHelper
                .calculateQuoteVirtualAmountFromBaseVirtualAmount(
                    amountModify,
                    pool,
                    indexedPipRange,
                    pipRange
                );
        } else {
            baseAmountModify = amountModify;
            quoteAmountModify = LiquidityHelper
                .calculateBaseVirtualAmountFromQuoteVirtualAmount(
                    amountModify,
                    pool,
                    indexedPipRange,
                    pipRange
                );
        }
        return
            pool.addLiquidity(
                IAutoMarketMakerCore.AddLiquidity({
                    baseAmount: baseAmountModify,
                    quoteAmount: quoteAmountModify,
                    indexedPipRange: indexedPipRange
                })
            );
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
        returns (
            uint256 baseAmount,
            uint256 quoteAmount,
            uint256 newFeeGrowthBase,
            uint256 newFeeGrowthQuote
        )
    {
        return
            pool.collectFee(
                feeGrowthBase,
                feeGrowthQuote,
                liquidity,
                indexedPipRange
            );
    }

    function _getPipRange(IMatchingEngineAMM pool)
        internal
        returns (uint128 pipRange)
    {
        return pool.getPipRange();
    }
}
