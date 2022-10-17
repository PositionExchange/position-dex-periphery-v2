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
    address public positionDexNft;

    enum ModifyType {
        INCREASE,
        DECREASE
    }

    mapping(address => Liquidity.Data) public concentratedLiquidity;

    function _initializeConcentratedLiquidity(address _positionDexNft)
    internal
    {
        positionDexNft = _positionDexNft;
    }

    struct AddLiquidityParams {
        address pool;
        uint128 amountBaseVirtual;
        uint128 amountQuoteVirtual;
        uint32 indexedPipRange;
    }

    // 1.1 Add Liquidity
    // 1.2 Mint an NFT
    // 1.3 Store Liquidity Info to storate
    // 1.4 Transfer ..
    function addLiquidity(
        IPairManager _pairManager,
        AddLiquidityParams calldata params
    )
        public
        payable
        virtual
    {
        (uint128 baseAmountAdded, uint128 quoteAmountAdded, uint32 liquidity) = IMatchingEngineAMM.addLiquidity(
            AddLiquidityParams.amountBaseVirtual,
            AddLiquidityParams.amountQuoteVirtual,
            AddLiquidityParams.indexedPipRange);

        uint256 NftTokenId = INonfungiblePositionLiquidityPool(positionDexNft).mint(msg.sender);

        concentratedLiquidity[NftTokenId] = Liquidity.Data({
        baseVirtual : baseAmountAdded,
        quoteVirtual : quoteAmountAdded,
        liquidity : liquidity
        });

        depositLiquidity(_pairManager, msg.sender, SpotHouseStorage.Asset.Base, baseAmountAdded);
        depositLiquidity(_pairManager, msg.sender, SpotHouseStorage.Asset.Quote, quoteAmountAdded);
    }

    function depositLiquidity(
        IPairManager _pairManager,
        address _payer,
        SpotHouseStorage.Asset _asset,
        uint256 _amount) internal virtual {
    }

    function removeLiquidity(uint256 tokenId) public virtual {}

    struct ModifyLiquidityParams {
        uint256 tokenId;
        uint128 amountBaseModify;
        uint128 amountQuoteModify;
        ModifyType modifyType;
    }

    function modifyLiquidity(ModifyLiquidityParams calldata params)
        public
        virtual
    {}

    function collectFee(uint256 tokenId) public virtual {}

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
