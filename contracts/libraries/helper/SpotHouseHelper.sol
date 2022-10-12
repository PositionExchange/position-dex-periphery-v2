// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.9;

import "./TradeConvert.sol";
import "./Convert.sol";
import "../../interfaces/IPairManager.sol";

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

    function accumulateClaimableAmount(
        address _pairAddress,
        uint128 _pip,
        uint64 _orderId,
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
        IPairManager _pairManager = IPairManager(_pairAddress);
        (
            bool isFilled,
            bool isBuy,
            uint256 baseSize,
            uint256 partialFilled
        ) = _pairManager.getPendingOrderDetail(_pip, _orderId);
        uint256 filledSize = isFilled ? baseSize : partialFilled;
        if (isBuy) {
            //BUY => can claim base asset
            baseAmount += filledSize;
        } else {
            // SELL => can claim quote asset
            quoteAmount += filledSize.baseToQuote(_pip, basisPoint);
        }
        return (quoteAmount, baseAmount, 0, 0);
    }
}
