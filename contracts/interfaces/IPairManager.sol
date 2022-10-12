// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

//import "../libraries/types/PairManagerStorage.sol";
//import "../spot-exchange/libraries/liquidity/Grid.sol";
//import "../spot-exchange/libraries/liquidity/PoolLiquidity.sol";

interface IPairManager {
    struct ExchangedData {
        uint256 baseAmount;
        uint256 quoteAmount;
        uint256 feeQuoteAmount;
        uint256 feeBaseAmount;
    }

    struct AccPoolExchangedDataParams {
        bytes32 orderId;
        int128 baseAdjust;
        int128 quoteAdjust;
        //        int128 baseFilledCurrentPip;
        uint128 currentPip;
        uint256 basisPoint;
        //        // cumulative price*quantity buy orders
        //        uint128 cumPQ;
        //        // cumulative quantity
        //        uint128 cumQ;
    }

    function openLimit(
        uint128 pip,
        uint128 size,
        bool isBuy,
        address trader,
        uint256 quoteDeposited
    )
        external
        returns (
            uint64 orderId,
            uint256 sizeOut,
            uint256 openNotional
        );

    function calculatingQuoteAmount(uint256 quantity, uint128 pip)
        external
        view
        returns (uint256);

    function cancelLimitOrder(uint128 pip, uint64 orderId)
        external
        returns (uint256 size, uint256 partialFilled);

    function updatePartialFilledOrder(uint128 pip, uint64 orderId) external;

    function getPendingOrderDetail(uint128 pip, uint64 orderId)
        external
        view
        returns (
            bool isFilled,
            bool isBuy,
            uint256 size,
            uint256 partialFilled
        );

    function getBasisPoint() external view returns (uint256);

    //    function isExpired() external returns (bool);

    function getBaseBasisPoint() external returns (uint256);

    function getCurrentPipAndBasisPoint()
        external
        view
        returns (uint128 currentPip, uint128 basisPoint);

    function getCurrentPip() external view returns (uint128);

    function getCurrentSingleSlot() external view returns (uint128, uint8);

    function getPrice() external view returns (uint256);

    function getQuoteAsset() external view returns (IERC20);

    function getBaseAsset() external view returns (IERC20);

    function pipToPrice(uint128 pip) external view returns (uint256);

    function getLiquidityInCurrentPip() external view returns (uint128);

    function hasLiquidity(uint128 pip) external view returns (bool);

    function updateMaxFindingWordsIndex(uint128 _newMaxFindingWordsIndex)
        external;

    function openMarket(
        uint256 size,
        bool isBuy,
        address _trader
    ) external returns (uint256 sizeOut, uint256 quoteAmount);

    function openMarketWithQuoteAsset(
        uint256 quoteAmount,
        bool isBuy,
        address trader
    ) external returns (uint256 sizeOutQuote, uint256 baseAmount);

    function getFee()
        external
        view
        returns (uint256 baseFeeFunding, uint256 quoteFeeFunding);

    function resetFee(uint256 baseFee, uint256 quoteFee) external;

    function increaseBaseFeeFunding(uint256 baseFee) external;

    function increaseQuoteFeeFunding(uint256 quoteFee) external;

    function decreaseBaseFeeFunding(uint256 baseFee) external;

    function decreaseQuoteFeeFunding(uint256 quoteFee) external;

    function quoteToBase(uint256 quoteAmount, uint128 pip)
        external
        view
        returns (uint256);

    function accumulatePoolExchangedData(
        bytes32[256] memory _orderIds,
        uint16 feeShareRatio,
        uint128 feeBase,
        int128 soRemovablePosBuy,
        int128 soRemovablePosSell
    ) external view returns (int128 quoteAdjust, int128 baseAdjust);

    function accumulateClaimableAmount(
        uint128 _pip,
        uint64 _orderId,
        IPairManager.ExchangedData memory exData,
        uint256 basisPoint,
        uint16 fee,
        uint128 feeBasis
    ) external view returns (IPairManager.ExchangedData memory);

    function accumulatePoolLiquidityClaimableAmount(
        uint128 _pip,
        uint64 _orderId,
        IPairManager.ExchangedData memory exData,
        uint256 basisPoint,
        uint16 fee,
        uint128 feeBasis
    ) external returns (IPairManager.ExchangedData memory, bool isFilled);

    function collectFund(
        IERC20 token,
        address to,
        uint256 amount
    ) external;

    function updateSpotHouse(address _newSpotHouse) external;

    function getAmountEstimate(
        uint256 size,
        bool isBuy,
        bool isBase
    ) external view returns (uint256 sizeOut, uint256 openOtherSide);
}
