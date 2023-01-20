/**
 * @author Musket
 */
// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@positionex/matching-engine/contracts/libraries/helper/Require.sol";
import "@positionex/matching-engine/contracts/interfaces/IMatchingEngineAMM.sol";

import "../../interfaces/IPositionRouter.sol";
import {DexErrors} from "../helper/DexErrors.sol";
import "../helper/TransferHelper.sol";

abstract contract BuyBackAndBurn {
    IPositionRouter public positionRouter;

    IERC20 public posiToken;

    address public dead = 0x000000000000000000000000000000000000dEaD;

    uint256 public totalBurned;

    function _buyBackAndBurn(address[] memory pathBuyBack, uint256 amount)
        internal
    {
        Require._require(
            pathBuyBack[pathBuyBack.length - 1] == address(posiToken),
            DexErrors.DEX_MUST_POSI
        );

        if (
            !TransferHelper.isApprove(pathBuyBack[0], address(positionRouter))
        ) {
            TransferHelper.approve(pathBuyBack[0], address(positionRouter));
        }

        uint256[] memory amounts = positionRouter.swapExactTokensForTokens(
            amount,
            0,
            pathBuyBack,
            dead,
            9999999999
        );
        totalBurned += amounts[pathBuyBack.length - 1];
    }

    function buyBackAndBurn(
        IMatchingEngineAMM pairManager,
        address[] memory pathBuyBack
    ) external virtual {}
}