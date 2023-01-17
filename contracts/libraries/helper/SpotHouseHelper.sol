// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.9;

import "./Convert.sol";
import "@positionex/matching-engine/contracts/interfaces/IMatchingEngineAMM.sol";
import "@positionex/matching-engine/contracts/libraries/helper/TradeConvert.sol";

library SpotHouseHelper {
    using TradeConvert for uint256;
    using Convert for uint256;

    // exchanged data return for liquidity
    // how many base -> quote and versa
    struct ExchangedData {
        int256 base;
        int256 quote;
        uint128 feeQuote;
        uint128 feeBase;
    }

    /// @notice calculate the accumulate claim able amount
    /// @param pairAddress address of pair
    /// @param pip the pip of order
    /// @param orderId the id of order in pip
    /// @param quoteAmount quote amount accumulate
    /// @param baseAmount base amount accumulate
    /// @param basisPoint of pair
    function accumulateClaimableAmount(
        address pairAddress,
        uint128 pip,
        uint64 orderId,
        uint256 quoteAmount,
        uint256 baseAmount,
        uint256 basisPoint
    )
        internal
        view
        returns (
            uint256,
            uint256,
            int128,
            int128
        )
    {
        IMatchingEngineAMM _pairManager = IMatchingEngineAMM(pairAddress);
        (
            bool isFilled,
            bool isBuy,
            uint256 baseSize,
            uint256 partialFilled
        ) = _pairManager.getPendingOrderDetail(pip, orderId);
        uint256 filledSize = isFilled ? baseSize : partialFilled;
        if (isBuy) {
            //BUY => can claim base asset
            baseAmount += filledSize;
        } else {
            // SELL => can claim quote asset
            quoteAmount += filledSize.baseToQuote(pip, basisPoint);
        }
        return (quoteAmount, baseAmount, 0, 0);
    }
}
