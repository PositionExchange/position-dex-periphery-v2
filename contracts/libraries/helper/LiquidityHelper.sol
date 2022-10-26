// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.9;

import "./TradeConvert.sol";
import "./Convert.sol";
import "@positionex/matching-engine/contracts/interfaces/IMatchingEngineAMM.sol";
import "@positionex/matching-engine/contracts/libraries/helper/LiquidityMath.sol";
import "@positionex/matching-engine/contracts/libraries/helper/Math.sol";

library LiquidityHelper {
    function calculateQuoteVirtualAmountFromBaseVirtualAmount(
        uint128 baseVirtualAmount,
        IMatchingEngineAMM _pairManager,
        uint32 indexedPipRange,
        uint128 pipRange
    ) internal view returns (uint128 quoteVirtualAmount) {
        uint128 currentPrice = _pairManager.getCurrentPip();
        (uint128 minPip, uint128 maxPip) = LiquidityMath.calculatePipRange(
            indexedPipRange,
            pipRange
        );
        return
            LiquidityMath.calculateQuoteVirtualAmountFromBaseVirtualAmount(
                baseVirtualAmount,
                uint128(Math.sqrt(uint256(currentPrice))),
                uint128(Math.sqrt(uint256(maxPip))),
                uint128(Math.sqrt(uint256(minPip)))
            );
    }

    function calculateBaseVirtualAmountFromQuoteVirtualAmount(
        uint128 quoteVirtualAmount,
        IMatchingEngineAMM _pairManager,
        uint32 indexedPipRange,
        uint128 pipRange
    ) internal view returns (uint128 baseVirtualAmount) {
        uint128 currentPrice = _pairManager.getCurrentPip();
        (uint128 minPip, uint128 maxPip) = LiquidityMath.calculatePipRange(
            indexedPipRange,
            pipRange
        );
        return
            LiquidityMath.calculateQuoteVirtualAmountFromBaseVirtualAmount(
                quoteVirtualAmount,
                uint128(Math.sqrt(uint256(currentPrice))),
                uint128(Math.sqrt(uint256(maxPip))),
                uint128(Math.sqrt(uint256(minPip)))
            );
    }
}
