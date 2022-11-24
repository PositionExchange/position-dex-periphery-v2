// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.9;

import "@positionex/matching-engine/contracts/interfaces/IMatchingEngineAMM.sol";
import "../libraries/types/SpotHouseStorage.sol";
import "./ISpotDex.sol";
import "./ILiquidityManager.sol";

interface ISpotHouse is ISpotDex {}
