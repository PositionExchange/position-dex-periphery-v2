/**
 * @author Musket
 */
// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.9;

import "./IConcentratedLiquidity.sol";
import "./IConcentratedLiquidityNFT.sol";

interface IPositionConcentratedLiquidity is
    IConcentratedLiquidity,
    IConcentratedLiquidityNFT
{}
