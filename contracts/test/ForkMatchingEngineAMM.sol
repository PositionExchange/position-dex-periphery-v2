/**
 * @author Musket
 */
// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.9;
import "@positionex/matching-engine/contracts/test/MockMatchingEngineAMM.sol";

contract ForkMatchingEngineAMM is MockMatchingEngineAMM {
    function setCounterParty02(address a) public {
        counterParties[a] = true;
    }

    function resetFeeShareAmm() public {
        feeShareAmm = 0;
    }

    function approveForTest(address house, address liquidity) public {
        _approve(quoteAsset, house);
        _approve(baseAsset, house);
        _approve(quoteAsset, liquidity);
        _approve(baseAsset, liquidity);
    }

    function _approve(IERC20 token, address spender) internal {
        token.approve(spender, type(uint256).max);
    }
}
