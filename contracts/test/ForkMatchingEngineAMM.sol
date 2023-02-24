/**
 * @author Musket
 */
// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.9;
import "@positionex/matching-engine/contracts/MatchingEngineAMM.sol";

contract ForkMatchingEngineAMM is MatchingEngineAMM {

    uint32 public _feeShareAmm;

    function setCurrentPip(uint128 currentPip) public {
        singleSlot.pip = currentPip;
        currentIndexedPipRange = LiquidityMath.calculateIndexPipRange(
            currentPip,
            pipRange
        );
    }

    function setCounterParty() public {
        counterParties[msg.sender] = true;
    }

    function setCounterParty02(address a) public {
        counterParties[a] = true;
    }

    function resetFeeShareAmm() public {
        _feeShareAmm = 0;
    }

    function setFeeShareAmm(uint32 _feeShare) public {
        _feeShareAmm = _feeShare;
    }


    function feeShareAmm() public view override returns (uint32) {
        return _feeShareAmm;
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
