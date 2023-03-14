/**
 * @author Musket
 */
// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.9;

import "../../interfaces/IUniswapV2Router.sol";
import "../../interfaces/ISpotFactory.sol";
import "../../interfaces/ISpotHouse.sol";
import "../../interfaces/IUniswapV2Router.sol";
import "../../interfaces/IEstimateLogic.sol";

contract PositionRouterStorage {
    ISpotFactory public factory;

    ISpotHouse public spotHouse;

    ITransistorBNB public withdrawBNB;

    address public WBNB;

    IUniswapV2Router02 public uniSwapRouterV2;

    /**
     * @dev This empty reserved space is put in place to allow future versions to add new
     * variables without shifting down storage in the inheritance chain.
     * See https://docs.openzeppelin.com/contracts/4.x/upgradeable#storage_gaps
     */
    uint256[49] private __gap;

    IEstimateLogic public estimateLogic;
}
