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

    uint256 public totalBurned;

    event BuyBackAndBurned(
        IMatchingEngineAMM pair,
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
            !TransferHelper.isApprove(pathBuyBack[0], address(positionRouter))
        ) {
            TransferHelper.approve(pathBuyBack[0], address(positionRouter));
        }
        uint256[] memory amounts;

        if (userEther) {
            amounts = positionRouter.swapExactETHForTokens{value: amount}(
                0,
                pathBuyBack,
                _dead(),
                9999999999
            );
        } else {
            amounts = positionRouter.swapExactTokensForTokens(
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

    function _dead() internal returns (address) {
        return 0x000000000000000000000000000000000000dEaD;
    }

    /// @notice buy back Posi token and burn it
    /// @param pairManager the pair of token need sell to buy posi
    /// @param pathBuyBack path to buy back
    function buyBackAndBurn(
        IMatchingEngineAMM pairManager,
        address[] memory pathBuyBack
    ) external virtual {}

    /// @notice set position router
    /// @param _positionRouter new address of position router
    function setPositionRouter(IPositionRouter _positionRouter) public virtual {
        positionRouter = _positionRouter;
    }

    /// @notice set position token
    /// @param _posiToken new address of position token
    function setPosiToken(IERC20 _posiToken) public virtual {
        posiToken = _posiToken;
    }

    /**
     * @dev This empty reserved space is put in place to allow future versions to add new
     * variables without shifting down storage in the inheritance chain.
     * See https://docs.openzeppelin.com/contracts/4.x/upgradeable#storage_gaps
     */
    uint256[49] private __gap;
}
