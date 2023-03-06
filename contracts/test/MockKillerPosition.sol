/**
 * @author Musket
 */
// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.9;

import "../migration/KillerPosition.sol";

contract MockKillerPosition is KillerPosition {
    constructor(
        IUniswapV2Router02 _uniswapRouter,
        IPositionNondisperseLiquidity _positionLiquidity,
        ISpotFactory _spotFactory,
        IWBNB _WBNB
    ) KillerPosition(_uniswapRouter, _positionLiquidity, _spotFactory, _WBNB) {}

    function stake(uint256 ndtId, address user) internal virtual override {}
}
