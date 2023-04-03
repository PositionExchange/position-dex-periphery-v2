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
import "../../interfaces/IBuyBackAndBurnDex.sol";

abstract contract BuyBackAndBurn {
    IPositionRouter public positionRouter;

    IERC20 public posiToken;

    uint256 public totalBurned;

    /**
     * @dev This empty reserved space is put in place to allow future versions to add new
     * variables without shifting down storage in the inheritance chain.
     * See https://docs.openzeppelin.com/contracts/4.x/upgradeable#storage_gaps
     */
    uint256[49] private __gap;
}
