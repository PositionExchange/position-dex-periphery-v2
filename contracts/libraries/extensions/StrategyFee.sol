/**
 * @author Musket
 */
// SPDX-License-Identifier: BUSL-1.1

import "@positionex/matching-engine/contracts/libraries/helper/Require.sol";

pragma solidity ^0.8.9;

abstract contract StrategyFee {
    uint16 public defaultFeePercentage;

    struct FeeDiscount {
        uint32 minHold;
        uint32 maxHold;
        uint16 fee;
    }

    FeeDiscount[] public strategyFee;

    /// @notice init the strategy fee
    function _initStrategyFee(uint16 _defaultFeePercentage) internal {
        defaultFeePercentage = _defaultFeePercentage;
    }

    function condition() internal view virtual returns (uint16) {}

    /// @notice get discount of fee when open order
    /// @return return the discount
    function getFeeDiscount() internal view returns (uint16) {
        uint256 _condition = condition();
        if (strategyFee.length == 0 || _condition == 0) {
            return defaultFeePercentage;
        }

        uint16 feeDiscountPercent;

        for (uint256 i = 0; i < strategyFee.length; i++) {
            if (
                _condition >= strategyFee[i].minHold &&
                _condition <= strategyFee[i].maxHold
            ) {
                feeDiscountPercent = strategyFee[i].fee;
                break;
            }
        }
        return feeDiscountPercent;
    }

    /// @notice update the strategy discount percentage
    /// @notice newStrategyDiscount the array of struct FeeDiscount
    /// @dev only operator can call
    function updateDiscountStrategy(FeeDiscount[] memory newStrategyDiscount)
        public
        virtual
    {
        delete strategyFee;

        if (newStrategyDiscount.length != 0) {
            for (uint32 i = 0; i < newStrategyDiscount.length; i++) {
                FeeDiscount memory discount = newStrategyDiscount[i];
                strategyFee.push(discount);
            }
        }
    }

    /// @notice set the default fee
    /// @dev only operator can call
    /// @dev _defaultFeePercentage the new default fee
    function setFee(uint16 _defaultFeePercentage) public virtual {
        defaultFeePercentage = _defaultFeePercentage;
    }
}
