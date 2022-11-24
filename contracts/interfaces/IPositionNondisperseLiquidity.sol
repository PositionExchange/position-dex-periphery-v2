/**
 * @author Musket
 */
// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.9;

import "./ILiquidityManager.sol";
import "./ILiquidityNFT.sol";

interface IPositionNondisperseLiquidity is
    ILiquidityManager,
    ILiquidityNFT
{}
