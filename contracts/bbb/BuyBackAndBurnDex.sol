/**
 * @author Musket
 */
// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.9;
import "@positionex/matching-engine/contracts/libraries/helper/Require.sol";
import "@positionex/matching-engine/contracts/interfaces/IMatchingEngineAMM.sol";

import "../interfaces/IPositionRouter.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../libraries/helper/TransferHelper.sol";
import "../libraries/helper/DexErrors.sol";
import "../libraries/types/SpotFactoryStorage.sol";

//import "../libraries/types/SpotFactoryStorage.sol";

contract BuyBackAndBurnDex {
    IPositionRouter public _positionRouter;

    IERC20 public posiToken;

    uint256 public totalBurned;

    event BuyBackAndBurned(
        address pair,
        address token,
        uint256 amountBought,
        uint256 amountPosiBurned
    );

    function _buyBackAndBurn(
        address[] memory pathBuyBack,
        uint256 amount,
        bool userEther
    ) internal returns (uint256[] memory) {
        Require._require(
            pathBuyBack[pathBuyBack.length - 1] == address(posiToken),
            DexErrors.DEX_MUST_POSI
        );

        if (
            !TransferHelper.isApprove(pathBuyBack[0], address(_positionRouter))
        ) {
            TransferHelper.approve(pathBuyBack[0], address(_positionRouter));
        }
        uint256[] memory amounts;

        if (userEther) {
            amounts = _positionRouter.swapExactETHForTokens{value: amount}(
                0,
                pathBuyBack,
                _dead(),
                9999999999
            );
        } else {
            amounts = _positionRouter.swapExactTokensForTokens(
                amount,
                0,
                pathBuyBack,
                _dead(),
                9999999999
            );
        }

        totalBurned += amounts[pathBuyBack.length - 1];
        return amounts;
    }

    function _dead() internal pure returns (address) {
        return 0x000000000000000000000000000000000000dEaD;
    }

    /**
     * @dev see {BuyBackAndBurn-buyBackAndBurn}
     */
    function buyBackAndBurn(
        IMatchingEngineAMM pairManager,
        address[] memory pathBuyBack
    ) external {
        //        SpotFactoryStorage.Pair memory _pair = _getQuoteAndBase(pairManager);
        //        bool isBase = pathBuyBack[0] == _pair.BaseAsset;
        //
        //        (uint256 baseFeeFunding, uint256 quoteFeeFunding) = pairManager
        //        .getFee();
        //
        //        uint256 amount = isBase
        //        ? (baseFeeFunding * 9999) / FixedPoint128.BASIC_POINT_FEE
        //        : (quoteFeeFunding * 9999) / FixedPoint128.BASIC_POINT_FEE;
        //
        //        bool userEther;
        //        if (pathBuyBack[0] == WBNB) {
        //            _withdrawBNB(address(this), address(pairManager), amount);
        //            userEther = true;
        //        } else {
        //            TransferHelper.transferFrom(
        //                IERC20(pathBuyBack[0]),
        //                address(pairManager),
        //                address(this),
        //                amount
        //            );
        //        }
        //
        //        uint256[] memory amounts = _buyBackAndBurn(
        //            pathBuyBack,
        //            amount,
        //            userEther
        //        );
        //
        //        if (isBase) {
        //            pairManager.decreaseBaseFeeFunding(amount);
        //        } else {
        //            pairManager.decreaseQuoteFeeFunding(amount);
        //        }
        //
        //        emit BuyBackAndBurned(
        //            pairManager,
        //            pathBuyBack[0],
        //            amount,
        //            amounts[pathBuyBack.length - 1]
        //        );
    }
}
