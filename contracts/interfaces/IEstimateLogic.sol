/**
 * @author Musket
 */
// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.9;
import "@positionex/matching-engine/contracts/interfaces/IMatchingEngineAMM.sol";

interface IEstimateLogic {
    struct StepComputations {
        uint128 pipNext;
    }

    struct OnCrossPipParams {
        uint128 pipNext;
        bool isBuy;
        bool isBase;
        uint128 amount;
        uint32 basisPoint;
        uint128 currentPip;
        uint128 pipRange;
    }

    struct CrossPipState {
        int256 indexedPipRange;
        uint128 pipTargetStep;
        uint128 sqrtTargetPip;
        bool startIntoIndex;
        bool skipIndex;
    }
    struct CrossPipParams {
        uint128 pipNext;
        bool isBuy;
        bool isBase;
        uint128 amount;
        uint32 basisPoint;
        uint128 currentPip;
        uint128 pipRange;
    }

    function getAmountEstimate(
        IMatchingEngineAMM pairManager,
        uint256 size,
        bool isBuy,
        bool isBase
    ) external view returns (uint256 mainSizeOut, uint256 flipSizeOut);
}
