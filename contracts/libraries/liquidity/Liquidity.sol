/**
 * @author Musket
 */
// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.9;

import "@positionex/matching-engine/contracts/interfaces/IMatchingEngineAMM.sol";

library UserLiquidity {
    struct Data {
        uint128 liquidity;
        uint32 indexedPipRange;
        uint256 feeGrowthBase;
        uint256 feeGrowthQuote;
        IMatchingEngineAMM pool;
    }

    struct CollectFeeData {
        uint256 feeBaseAmount;
        uint256 feeQuoteAmount;
        uint256 newFeeGrowthBase;
        uint256 newFeeGrowthQuote;
    }

    function updateLiquidity(
        Data storage self,
        uint128 liquidity,
        uint32 indexedPipRange,
        uint256 feeGrowthBase,
        uint256 feeGrowthQuote
    ) internal {
        self.liquidity = liquidity;
        self.indexedPipRange = indexedPipRange;
        self.feeGrowthBase = feeGrowthBase;
        self.feeGrowthQuote = feeGrowthQuote;
    }
}
