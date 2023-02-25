/**
 * @author Musket
 */
// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.9;
import "@positionex/matching-engine/contracts/MatchingEngineAMM.sol";

contract ForkMatchingEngineAMM is MatchingEngineAMM {
    uint32 public _feeShareAmm;

    function initialize(InitParams memory params) external virtual override {
        Require._require(!isInitialized, Errors.ME_INITIALIZED);
        isInitialized = true;

        counterParties[params.positionLiquidity] = true;
        counterParties[params.spotHouse] = true;
        counterParties[params.router] = true;

        _initializeAMM(params.pipRange, params.tickSpace, params.initialPip);
        _initializeCore(
            params.basisPoint,
            params.maxFindingWordsIndex,
            params.initialPip
        );
        _initFee(params.quoteAsset, params.baseAsset);

        if (params.basisPoint == 100) {
            rangeFindingWordsAmm = 10;
        } else {
            rangeFindingWordsAmm = 150;
        }
        _approveCounterParty(params.quoteAsset, params.positionLiquidity);
        _approveCounterParty(params.baseAsset, params.positionLiquidity);

        _approveCounterParty(params.quoteAsset, params.spotHouse);
        _approveCounterParty(params.baseAsset, params.spotHouse);

        _approveCounterParty(params.baseAsset, params.router);
        _approveCounterParty(params.quoteAsset, params.router);
    }

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
