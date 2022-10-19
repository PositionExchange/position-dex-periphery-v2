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
        address user = _msgSender();
        (
            uint128 baseAmountAdded,
            uint128 quoteAmountAdded,
            uint128 liquidity,
            uint256 feeGrowthBase,
            uint256 feeGrowthQuote
        ) = params.pool.addLiquidity(
                params.amountBaseVirtual,
                params.amountQuoteVirtual,
                params.indexedPipRange
            );

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

    function removeLiquidity(uint256 tokenId) public virtual {
        address owner = _msgSender();
        require(owner == positionDexNft.ownerOf(tokenId), "!Owner");
        // TODO removeLiquidity and get fee reward
    }

    function decreaseLiquidity(uint256 tokenId, uint128 liquidity)
        public
        virtual
    {
        address owner = _msgSender();
        require(owner == positionDexNft.ownerOf(tokenId), "!Owner");
        Liquidity.Data memory liquidityData = concentratedLiquidity[tokenId];

        require(liquidityData.liquidity >= liquidity, "!Liquidity");

        (uint128 baseAmount, uint128 quoteAmount) = liquidityData
            .pool
            .removeLiquidity(
                IAutoMarketMakerCore.RemoveLiquidity({
                    liquidity: liquidity,
                    indexedPipRange: liquidityData.indexedPipRange,
                    feeGrowthBase: liquidityData.feeGrowthBase,
                    feeGrowthQuote: liquidityData.feeGrowthQuote
                })
            );

        concentratedLiquidity[tokenId].updateLiquidity(
            liquidityData.liquidity - liquidity,
            liquidityData.baseVirtual - baseAmount,
            liquidityData.quoteVirtual - quoteAmount
        );
        // TODO withdraw asset
    }

    function increaseLiquidity(
        uint256 tokenId,
        uint128 amountBaseModify,
        uint128 amountQuoteModify
    ) public payable virtual {
        // TODO implement
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

    function _msgSender() internal view virtual returns (address) {}
}
