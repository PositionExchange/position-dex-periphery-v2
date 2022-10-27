/**
 * @author Musket
 */
// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.9;

import "../libraries/liquidity/Liquidity.sol";
import "../libraries/types/SpotHouseStorage.sol";
import "../interfaces/INonfungiblePositionLiquidityPool.sol";
import "@positionex/matching-engine/contracts/interfaces/IMatchingEngineAMM.sol";
import "../interfaces/IConcentratedLiquidity.sol";

abstract contract ConcentratedLiquidity is IConcentratedLiquidity {
    using Liquidity for Liquidity.Data;
    INonfungiblePositionLiquidityPool public positionDexNft;

    modifier nftOwner(uint256 nftId) {
        require(_msgSender() == positionDexNft.ownerOf(nftId), "!Owner");
        _;
    }

    mapping(uint256 => Liquidity.Data) public concentratedLiquidity;

    function _initializeConcentratedLiquidity(address _positionDexNft)
        internal
    {
        positionDexNft = INonfungiblePositionLiquidityPool(_positionDexNft);
    }

    struct AddLiquidityParams {
        IMatchingEngineAMM pool;
        uint128 amountBaseVirtual;
        uint128 amountQuoteVirtual;
        uint32 indexedPipRange;
    }

    // 1.1 Add Liquidity
    // 1.2 Mint an NFT
    // 1.3 Store Liquidity Info to storate
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
                params.amountBaseVirtual,
                params.amountQuoteVirtual,
                params.indexedPipRange,
                params.pool
            );

        address user = _msgSender();

        uint256 nftTokenId = positionDexNft.mint(user);

        concentratedLiquidity[nftTokenId] = Liquidity.Data({
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

    // 1. Burn NFT
    // 2. Update liquidity data
    // 3. Transfer assets
    // 4. Get fee reward
    // 5. Transfer fee reward
    // 6. Emit Event
    function removeLiquidity(uint256 tokenId) public virtual {
        Liquidity.Data memory liquidityData = concentratedLiquidity[tokenId];

        positionDexNft.burn(tokenId);
        delete concentratedLiquidity[tokenId];

        (
            uint128 baseAmountRemoved,
            uint128 quoteAmountRemoved
        ) = _removeLiquidity(liquidityData, liquidityData.liquidity);

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

        // TODO get fee reward
        emit LiquidityRemoved(
            user,
            address(liquidityData.pool),
            baseAmountRemoved,
            quoteAmountRemoved,
            liquidityData.indexedPipRange
        );
    }

    function decreaseLiquidity(uint256 tokenId, uint128 liquidity)
        public
        virtual
    {
        Liquidity.Data memory liquidityData = concentratedLiquidity[tokenId];

        require(liquidityData.liquidity >= liquidity, "!Liquidity");

        (
            uint128 baseAmountRemoved,
            uint128 quoteAmountRemoved
        ) = _removeLiquidity(liquidityData, liquidity);

        concentratedLiquidity[tokenId].updateLiquidity(
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
        uint256 tokenId,
        uint128 amountBaseModify,
        uint128 amountQuoteModify
    ) public payable virtual {
        Liquidity.Data memory liquidityData = concentratedLiquidity[tokenId];

        (
            uint128 baseAmountAdded,
            uint128 quoteAmountAdded,
            uint256 liquidity,
            uint256 feeGrowthBase,
            uint256 feeGrowthQuote
        ) = _addLiquidity(
                amountBaseModify,
                amountQuoteModify,
                liquidityData.indexedPipRange,
                liquidityData.pool
            );

        concentratedLiquidity[tokenId].updateLiquidity(
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

    function collectFee(uint256 tokenId) public virtual {
        address owner = _msgSender();
        require(owner == positionDexNft.ownerOf(tokenId), "!Owner");
    }

    function liquidity(uint256 tokenId)
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

    function getDataNonfungibleToken(uint256 tokenId)
        external
        view
        returns (Liquidity.Data memory)
    {
        Liquidity.Data memory LiquidityData;
        return LiquidityData;
    }

    function getAllDataTokens(uint256[] memory tokens)
        external
        view
        returns (Liquidity.Data[] memory)
    {
        Liquidity.Data[] memory LiquidityData;
        return LiquidityData;
    }

    //------------------------------------------------------------------------------------------------------------------
    // INTERNAL FUNCTIONS
    //------------------------------------------------------------------------------------------------------------------

    function _msgSender() internal view virtual returns (address) {}

    function _addLiquidity(
        uint128 amountBaseModify,
        uint128 amountQuoteModify,
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
        return
            pool.addLiquidity(
                IAutoMarketMakerCore.AddLiquidity({
                    baseAmount: amountBaseModify,
                    quoteAmount: amountQuoteModify,
                    indexedPipRange: indexedPipRange
                })
            );
    }

    function _removeLiquidity(
        Liquidity.Data memory liquidityData,
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
}
