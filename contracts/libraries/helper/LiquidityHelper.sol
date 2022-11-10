// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.9;

import "./TradeConvert.sol";
import "./Convert.sol";
import "@positionex/matching-engine/contracts/interfaces/IMatchingEngineAMM.sol";
import "@positionex/matching-engine/contracts/libraries/helper/LiquidityMath.sol";
import "@positionex/matching-engine/contracts/libraries/helper/Math.sol";
import "hardhat/console.sol";

library LiquidityHelper {
    function calculateQuoteVirtualFromBaseReal(
        uint128 baseReal,
        uint128 sqrtCurrentPrice,
        uint128 sqrtPriceMin,
        uint256 sqrtBasicPoint
    ) internal view returns (uint128) {
        console.log("sqrtBasicPoint: ", sqrtBasicPoint);
        console.log("[calculateQuoteVirtualFromBaseReal]baseReal sqrtCurrentPrice : ", baseReal, sqrtCurrentPrice);
        console.log("[calculateQuoteVirtualFromBaseReal]sqrtPriceMin sqrtBasicPoint: ", sqrtPriceMin, sqrtBasicPoint);
        return
        uint128(
            (uint256(baseReal) *
            uint256(sqrtCurrentPrice / sqrtBasicPoint) *
            (uint256(sqrtCurrentPrice / sqrtBasicPoint) - uint256(sqrtPriceMin / sqrtBasicPoint))) / 10 ** 18
        );
    }

    function calculateBaseVirtualFromQuoteReal(
        uint128 quoteReal,
        uint128 sqrtCurrentPrice,
        uint128 sqrtPriceMax
    ) internal returns (uint128) {
        console.log("[calculateBaseVirtualFromQuoteReal]quoteReal: ", quoteReal);
        console.log("[calculateBaseVirtualFromQuoteReal]sqrtCurrentPrice : ", sqrtCurrentPrice);
        console.log("[calculateBaseVirtualFromQuoteReal]sqrtPriceMax: ", sqrtPriceMax);
        return
            uint128(
                (uint256(quoteReal) *
                    (uint256(sqrtPriceMax) - uint256(sqrtCurrentPrice))) /
                    (uint256(sqrtCurrentPrice**2 * sqrtPriceMax))
            );
    }
}
