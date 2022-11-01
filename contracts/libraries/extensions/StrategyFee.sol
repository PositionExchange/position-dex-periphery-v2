/**
 * @author Musket
 */
// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.9;

abstract contract StrategyFee {
    uint16 public fee;

    struct FeeDiscount {
        uint32 minHold;
        uint32 maxHold;
        uint16 fee;
    }

    FeeDiscount[] public strategyFee;

    function getFeeDiscount(uint256 amount) internal view returns (uint256) {
        if (strategyFee.length == 0) {
            return defaultFeePercentage;
        }

        uint256 feeDiscountPercent;

        for (uint256 i = 0; i < strategyFee.length; i++) {
            if (
                amount >= strategyFee[i].minHold &&
                amount <= strategyFee[i].maxHold
            ) {
                discount = strategyFee[i].discount;
                break;
            }
        }
        return feeDiscountPercent;
    }

    function updateDiscountStrategy(FeeDiscount[] memory newStrategyDiscount)
        external
        virtual
    {
        delete discountStrategy;

        if (newStrategyDiscount.length != 0) {
            for (uint32 i = 0; i < newStrategyDiscount.length; i++) {
                FeeDiscount memory discount = newStrategyDiscount[i];
                discountStrategy.push(discount);
            }
        }
    }
}
