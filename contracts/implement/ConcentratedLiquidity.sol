/**
 * @author Musket
 */
// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.9;

import "../libraries/liquidity/Liquidity.sol";
import "../libraries/types/SpotHouseStorage.sol";
import "../interfaces/INonfungiblePositionLiquidityPool.sol";
import "@positionex/matching-engine/contracts/interfaces/IMatchingEngineAMM.sol";

abstract contract ConcentratedLiquidity {
    using Liquidity for Liquidity.Data;
    INonfungiblePositionLiquidityPool public positionDexNft;

    modifier nftOwner(uint256 nftId) {
        require(_msgSender() == positionDexNft.ownerOf(nftId), "!Owner");
        _;
    }

    enum ModifyType {
        INCREASE,
        DECREASE
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
    // 1.4 Transfer ..
    function addLiquidity(AddLiquidityParams calldata params)
        public
        payable
        virtual
    {
        (
            uint128 baseAmountAdded,
            uint128 quoteAmountAdded,
            uint128 liquidity,
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
            liquidity: liquidity,
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
    // 5. transfer fee reward
    function removeLiquidity(uint256 tokenId) public virtual {
        Liquidity.Data memory liquidityData = concentratedLiquidity[tokenId];

        positionDexNft.burn(tokenId);
        delete concentratedLiquidity[tokenId];

        (uint128 baseAmount, uint128 quoteAmount) = _removeLiquidity(
            liquidityData,
            liquidityData.liquidity
        );

        address user = _msgSender();
        withdrawLiquidity(
            liquidityData.pool,
            user,
            SpotHouseStorage.Asset.Base,
            baseAmount
        );

        withdrawLiquidity(
            liquidityData.pool,
            user,
            SpotHouseStorage.Asset.Quote,
            quoteAmount
        );

        // TODO get fee reward
    }

    function decreaseLiquidity(uint256 tokenId, uint128 liquidity)
        public
        virtual
    {
        Liquidity.Data memory liquidityData = concentratedLiquidity[tokenId];

        require(liquidityData.liquidity >= liquidity, "!Liquidity");

        (uint128 baseAmount, uint128 quoteAmount) = _removeLiquidity(
            liquidityData,
            liquidity
        );

        concentratedLiquidity[tokenId].updateLiquidity(
            liquidityData.liquidity - liquidity,
            liquidityData.baseVirtual - baseAmount,
            liquidityData.quoteVirtual - quoteAmount
        );

        address user = _msgSender();
        withdrawLiquidity(
            liquidityData.pool,
            user,
            SpotHouseStorage.Asset.Base,
            baseAmount
        );

        withdrawLiquidity(
            liquidityData.pool,
            user,
            SpotHouseStorage.Asset.Quote,
            quoteAmount
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
            uint128 liquidity,
            uint256 feeGrowthBase,
            uint256 feeGrowthQuote
        ) = _addLiquidity(
                amountBaseModify,
                amountQuoteModify,
                liquidityData.indexedPipRange,
                liquidityData.pool
            );

        concentratedLiquidity[tokenId].updateLiquidity(
            liquidityData.liquidity + liquidity,
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
            uint128 liquidity,
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
