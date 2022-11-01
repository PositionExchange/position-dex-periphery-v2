/**
 * @author Musket
 */
// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.9;

import "@positionex/matching-engine/contracts/interfaces/IMatchingEngineAMM.sol";

library UserLiquidity {
    struct Data {
        uint128 baseVirtual;
        uint128 quoteVirtual;
        uint128 liquidity;
        uint32 indexedPipRange;
        uint256 feeGrowthBase;
        uint256 feeGrowthQuote;
        IMatchingEngineAMM pool;
    }

    function updateLiquidity(
        Data storage self,
        uint128 liquidity,
        uint128 baseAmount,
        uint128 quoteAmount,
        uint32 indexedPipRange,
        uint256 feeGrowthBase,
        uint256 feeGrowthQuote
    ) internal {
        self.liquidity = liquidity;
        self.baseVirtual = baseAmount;
        self.quoteVirtual = quoteAmount;
        self.indexedPipRange = indexedPipRange;
        if (feeGrowthBase != 0) {
            self.feeGrowthBase = feeGrowthBase;
        }
        if (feeGrowthQuote != 0) {
            self.feeGrowthQuote = feeGrowthQuote;
        }
    }
}
