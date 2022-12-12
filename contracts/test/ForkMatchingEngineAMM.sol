/**
 * @author Musket
 */
// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.9;
import "@positionex/matching-engine/contracts/test/MockMatchingEngineAMM.sol";

contract ForkMatchingEngineAMM is MockMatchingEngineAMM {
    function setCounterParty02(address a) public {
        counterParty = a;
    }

    function resetFeeShareAmm() public {
        feeShareAmm = 0;
    }

    function approveForTest() public {
        _approve(quoteAsset,counterParty);
        _approve(baseAsset,counterParty);
        _approve(quoteAsset,positionManagerLiquidity);
        _approve(baseAsset,positionManagerLiquidity);
    }

    function _approve(IERC20 token, address spender) internal {
        token.approve(spender, type(uint256).max);
    }
}
