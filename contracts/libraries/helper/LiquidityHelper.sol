// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.9;

import "./Convert.sol";
import "@positionex/matching-engine/contracts/interfaces/IMatchingEngineAMM.sol";
import "@positionex/matching-engine/contracts/libraries/amm/LiquidityMath.sol";
import "@positionex/matching-engine/contracts/libraries/helper/Math.sol";

library LiquidityHelper {
    function calculateQuoteVirtualFromBaseReal(
        uint128 baseReal,
        uint128 sqrtCurrentPrice,
        uint128 sqrtPriceMin,
        uint256 sqrtBasicPoint
    ) internal view returns (uint128) {
        return
            uint128(
                (uint256(baseReal) *
                    uint256(sqrtCurrentPrice / sqrtBasicPoint) *
                    (uint256(sqrtCurrentPrice / sqrtBasicPoint) -
                        uint256(sqrtPriceMin / sqrtBasicPoint))) / 10**18
            );
    }

    function calculateBaseVirtualFromQuoteReal(
        uint128 quoteReal,
        uint128 sqrtCurrentPrice,
        uint128 sqrtPriceMax
    ) internal returns (uint128) {
        return
            uint128(
                (uint256(quoteReal) *
                    10**18 *
                    (uint256(sqrtPriceMax) - uint256(sqrtCurrentPrice))) /
                    (uint256(sqrtCurrentPrice**2 * sqrtPriceMax))
            );
    }
}
