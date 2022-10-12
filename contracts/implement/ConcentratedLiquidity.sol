/**
 * @author Musket
 */
// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.9;

import "../libraries/liquidity/Liquidity.sol";

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

    function addLiquidity(AddLiquidityParams calldata params)
        public
        payable
        virtual
    {}

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
