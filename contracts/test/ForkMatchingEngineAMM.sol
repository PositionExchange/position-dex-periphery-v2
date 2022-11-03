/**
 * @author Musket
 */
// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.9;
import "@positionex/matching-engine/contracts/test/MockMatchingEngineAMM.sol";

contract ForkMatchingEngineAMM is MockMatchingEngineAMM {
    function approve(
        address baseAsset,
        address quoteAsset,
        address _nftContractAddress
    ) public {
        IERC20(quoteAsset).approve(_nftContractAddress, type(uint256).max);
        IERC20(baseAsset).approve(_nftContractAddress, type(uint256).max);
    }
}
