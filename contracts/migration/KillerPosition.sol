/**
 * @author Musket
 */
// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@positionex/matching-engine/contracts/interfaces/IMatchingEngineAMM.sol";
import "@positionex/matching-engine/contracts/libraries/amm/LiquidityMath.sol";

import "../interfaces/IUniswapV2Pair.sol";
import "../interfaces/IUniswapV2Router.sol";
import "../interfaces/IPositionNondisperseLiquidity.sol";
import "../interfaces/ISpotFactory.sol";
import "../interfaces/IWBNB.sol";
import "../libraries/helper/LiquidityHelper.sol";

contract KillerPosition is ReentrancyGuard, Ownable {
    using Address for address payable;

    IUniswapV2Router01 public uniswapRouter;
    IPositionNondisperseLiquidity public positionLiquidity;
    ISpotFactory public spotFactory;
    IWBNB public WBNB;

    receive() external payable {
        //        assert(msg.sender == address(uniswapRouter));
        // only accept BNB via fallback from the WBNB contract
    }

    event PositionLiquidityMigrated(
        address user,
        uint256 nftId,
        uint256 liquidityMigrated
    );

    constructor(
        IUniswapV2Router01 _uniswapRouter,
        IPositionNondisperseLiquidity _positionLiquidity,
        ISpotFactory _spotFactory,
        IWBNB _WBNB
    ) {
        uniswapRouter = _uniswapRouter;
        positionLiquidity = _positionLiquidity;
        spotFactory = _spotFactory;
        WBNB = _WBNB;
    }

    struct State {
        uint128 currentPip;
        uint32 currentIndexedPipRange;
        address baseToken;
        address quoteToken;
        address pairManager;
        uint256 amount0;
        uint256 amount1;
        uint256 balance0;
        uint256 balance1;
    }

    // TODO remove when testing done
    function updateUniswapRouter(IUniswapV2Router01 _new) public {
        uniswapRouter = _new;
    }

    function isToken0Base(IUniswapV2Pair pair) public view returns (bool) {
        (
            address baseToken,
            address quoteToken,
            address pairManager
        ) = spotFactory.getPairManagerSupported(pair.token0(), pair.token1());

        return baseToken == pair.token0();
    }

    function migratePosition(IUniswapV2Pair pair, uint256 liquidity)
        public
        nonReentrant
    {
        State memory state;
        address user = _msgSender();
        address token0 = pair.token0();
        address token1 = pair.token1();

        pair.transferFrom(user, address(this), liquidity);
        (state.baseToken, state.quoteToken, state.pairManager) = spotFactory
            .getPairManagerSupported(token0, token1);

        _approve(address(pair), address(uniswapRouter));
        _approve(token0, address(positionLiquidity));
        _approve(token1, address(positionLiquidity));

        state.balance0 = _balanceOf(token0, address(this));
        state.balance1 = _balanceOf(token1, address(this));

        require(state.pairManager != address(0x00), "!0x0");
        if (token0 == address(WBNB) || token1 == address(WBNB)) {
            uniswapRouter.removeLiquidityETH(
                token0 == address(WBNB) ? token1 : token0,
                liquidity,
                0,
                0,
                address(this),
                9999999999
            );
        } else {
            uniswapRouter.removeLiquidity(
                token0,
                token1,
                liquidity,
                0,
                0,
                address(this),
                9999999999
            );
        }

        state.amount0 = _balanceOf(token0, address(this)) - state.balance0;
        state.amount1 = _balanceOf(token1, address(this)) - state.balance1;

        state.balance0 = _balanceOf(token0, address(this));
        state.balance1 = _balanceOf(token1, address(this));

        bool isToken0Base = state.baseToken == pair.token0();

        state.currentIndexedPipRange = uint32(
            IMatchingEngineAMM(state.pairManager).currentIndexedPipRange()
        );
        state.currentPip = IMatchingEngineAMM(state.pairManager)
            .getCurrentPip();

        (uint128 minPip, uint128 maxPip) = LiquidityMath.calculatePipRange(
            state.currentIndexedPipRange,
            IMatchingEngineAMM(state.pairManager).pipRange()
        );

        if (minPip == state.currentPip) {
            uint256 _value;

            if (
                (isToken0Base && token0 == address(WBNB)) ||
                (!isToken0Base && token0 == address(WBNB))
            ) {
                _value = state.amount0;
            }

            if (
                (!isToken0Base && token1 == address(WBNB)) ||
                (isToken0Base && token1 == address(WBNB))
            ) {
                _value = state.amount1;
            }
            /// add only base
            positionLiquidity.addLiquidityWithRecipient{value: _value}(
                ILiquidityManager.AddLiquidityParams({
                    pool: IMatchingEngineAMM(state.pairManager),
                    amountVirtual: isToken0Base
                        ? uint128(state.amount0)
                        : uint128(state.amount1),
                    indexedPipRange: state.currentIndexedPipRange,
                    isBase: true
                }),
                user
            );
        } else if (maxPip == state.currentPip) {
            uint256 _value;
            if (
                (isToken0Base && token0 == address(WBNB)) ||
                (!isToken0Base && token0 == address(WBNB))
            ) {
                _value = state.amount0;
            }

            if (
                (!isToken0Base && token1 == address(WBNB)) ||
                (isToken0Base && token1 == address(WBNB))
            ) {
                _value = state.amount1;
            }

            /// add only quote
            positionLiquidity.addLiquidityWithRecipient{value: _value}(
                ILiquidityManager.AddLiquidityParams({
                    pool: IMatchingEngineAMM(state.pairManager),
                    amountVirtual: isToken0Base
                        ? uint128(state.amount1)
                        : uint128(state.amount0),
                    indexedPipRange: state.currentIndexedPipRange,
                    isBase: false
                }),
                user
            );
        } else {
            uint128 amountBase;
            uint128 amountQuote;
            state.currentPip = sqrt(uint256(state.currentPip) * 10**18);
            maxPip = sqrt(uint256(maxPip) * 10**18);
            minPip = sqrt(uint256(minPip) * 10**18);
            if (isToken0Base) {
                (amountBase, amountQuote) = estimate(
                    uint128(state.amount0),
                    true,
                    state.currentIndexedPipRange,
                    state.currentPip,
                    maxPip,
                    minPip,
                    state.pairManager
                );

                if (amountQuote <= state.amount1) {
                    try
                        positionLiquidity.addLiquidityWithRecipient{
                            value: calculateValue(
                                token0,
                                token1,
                                amountBase,
                                amountQuote,
                                isToken0Base
                            )
                        }(
                            ILiquidityManager.AddLiquidityParams({
                                pool: IMatchingEngineAMM(state.pairManager),
                                amountVirtual: uint128(state.amount0),
                                indexedPipRange: state.currentIndexedPipRange,
                                isBase: true
                            }),
                            user
                        )
                    {} catch Error(string memory reason) {
                        if (isCatch(reason)) {
                            amountQuote = (amountQuote * 9990) / 10_000;
                            positionLiquidity.addLiquidityWithRecipient{
                                value: calculateValue(
                                    token0,
                                    token1,
                                    amountBase,
                                    amountQuote,
                                    isToken0Base
                                )
                            }(
                                ILiquidityManager.AddLiquidityParams({
                                    pool: IMatchingEngineAMM(state.pairManager),
                                    amountVirtual: uint128(amountQuote),
                                    indexedPipRange: state
                                        .currentIndexedPipRange,
                                    isBase: false
                                }),
                                user
                            );
                        } else revert(reason);
                    }
                } else {
                    (amountBase, amountQuote) = estimate(
                        uint128(state.amount1),
                        false,
                        state.currentIndexedPipRange,
                        state.currentPip,
                        maxPip,
                        minPip,
                        state.pairManager
                    );

                    amountBase = (amountBase * 9990) / 10_000;
                    try
                        positionLiquidity.addLiquidityWithRecipient{
                            value: calculateValue(
                                token0,
                                token1,
                                amountBase,
                                amountQuote,
                                isToken0Base
                            )
                        }(
                            ILiquidityManager.AddLiquidityParams({
                                pool: IMatchingEngineAMM(state.pairManager),
                                amountVirtual: amountBase,
                                indexedPipRange: state.currentIndexedPipRange,
                                isBase: true
                            }),
                            user
                        )
                    {} catch Error(string memory reason) {
                        if (isCatch(reason)) {
                            amountQuote = (amountQuote * 9990) / 10_000;
                            positionLiquidity.addLiquidityWithRecipient{
                                value: calculateValue(
                                    token0,
                                    token1,
                                    amountBase,
                                    amountQuote,
                                    isToken0Base
                                )
                            }(
                                ILiquidityManager.AddLiquidityParams({
                                    pool: IMatchingEngineAMM(state.pairManager),
                                    amountVirtual: uint128(amountQuote),
                                    indexedPipRange: state
                                        .currentIndexedPipRange,
                                    isBase: false
                                }),
                                user
                            );
                        } else revert(reason);
                    }
                }
            } else {
                (amountBase, amountQuote) = estimate(
                    uint128(state.amount1),
                    true,
                    state.currentIndexedPipRange,
                    state.currentPip,
                    maxPip,
                    minPip,
                    state.pairManager
                );

                if (amountQuote <= state.amount0) {
                    try
                        positionLiquidity.addLiquidityWithRecipient{
                            value: calculateValue(
                                token0,
                                token1,
                                amountBase,
                                amountQuote,
                                isToken0Base
                            )
                        }(
                            ILiquidityManager.AddLiquidityParams({
                                pool: IMatchingEngineAMM(state.pairManager),
                                amountVirtual: uint128(state.amount1),
                                indexedPipRange: state.currentIndexedPipRange,
                                isBase: true
                            }),
                            user
                        )
                    {} catch Error(string memory reason) {
                        if (isCatch(reason)) {
                            amountQuote = (amountQuote * 9990) / 10_000;
                            positionLiquidity.addLiquidityWithRecipient{
                                value: calculateValue(
                                    token0,
                                    token1,
                                    amountBase,
                                    amountQuote,
                                    isToken0Base
                                )
                            }(
                                ILiquidityManager.AddLiquidityParams({
                                    pool: IMatchingEngineAMM(state.pairManager),
                                    amountVirtual: uint128(amountQuote),
                                    indexedPipRange: state
                                        .currentIndexedPipRange,
                                    isBase: false
                                }),
                                user
                            );
                        } else revert(reason);
                    }
                } else {
                    (amountBase, amountQuote) = estimate(
                        uint128(state.amount0),
                        false,
                        state.currentIndexedPipRange,
                        state.currentPip,
                        maxPip,
                        minPip,
                        state.pairManager
                    );

                    amountBase = (amountBase * 9990) / 10_000;

                    try
                        positionLiquidity.addLiquidityWithRecipient{
                            value: calculateValue(
                                token0,
                                token1,
                                amountBase,
                                amountQuote,
                                isToken0Base
                            )
                        }(
                            ILiquidityManager.AddLiquidityParams({
                                pool: IMatchingEngineAMM(state.pairManager),
                                amountVirtual: amountBase,
                                indexedPipRange: state.currentIndexedPipRange,
                                isBase: true
                            }),
                            user
                        )
                    {} catch Error(string memory reason) {
                        if (isCatch(reason)) {
                            amountQuote = (amountQuote * 9990) / 10_000;
                            positionLiquidity.addLiquidityWithRecipient{
                                value: calculateValue(
                                    token0,
                                    token1,
                                    amountBase,
                                    amountQuote,
                                    isToken0Base
                                )
                            }(
                                ILiquidityManager.AddLiquidityParams({
                                    pool: IMatchingEngineAMM(state.pairManager),
                                    amountVirtual: uint128(amountQuote),
                                    indexedPipRange: state
                                        .currentIndexedPipRange,
                                    isBase: false
                                }),
                                user
                            );
                        } else revert(reason);
                    }
                }
            }
        }

        _getBack(
            token0,
            uint128(
                state.amount0 -
                    (state.balance0 - _balanceOf(token0, address(this)))
            ),
            user
        );
        _getBack(
            token1,
            uint128(
                state.amount1 -
                    (state.balance1 - _balanceOf(token1, address(this)))
            ),
            user
        );

        emit PositionLiquidityMigrated(
            user,
            positionLiquidity.tokenID(),
            liquidity
        );
    }

    function isCatch(string memory reason) internal view returns (bool) {
        return
            (keccak256(abi.encodePacked((reason))) ==
                keccak256(
                    abi.encodePacked(("ERC20: transfer amount exceeds balance"))
                )) ||
            (keccak256(abi.encodePacked((reason))) ==
                keccak256(abi.encodePacked(("LQ_07"))));
    }

    function sqrt(uint256 number) public view returns (uint128) {
        return uint128(Math.sqrt(number));
    }

    function _approve(address token, address spender) internal {
        bool isApprove = IERC20(token).allowance(
            address(this),
            address(spender)
        ) > 0
            ? true
            : false;

        if (!isApprove) {
            IERC20(token).approve(spender, type(uint256).max);
        }
    }

    function calculateValue(
        address token0,
        address token1,
        uint128 amountBase,
        uint128 amountQuote,
        bool isToken0Base
    ) public view returns (uint256 value) {
        if (
            (token0 == address(WBNB) && isToken0Base) ||
            (token1 == address(WBNB) && !isToken0Base)
        ) {
            value = amountBase;
        }

        if (
            (token0 == address(WBNB) && !isToken0Base) ||
            (token1 == address(WBNB) && isToken0Base)
        ) {
            value = amountQuote;
        }
    }

    function estimate(
        uint128 amountVirtual,
        bool isBase,
        uint32 currentIndexedPipRange,
        uint128 currentPip,
        uint128 maxPip,
        uint128 minPip,
        address pair
    ) public view returns (uint128 amountBase, uint128 amountQuote) {
        if (isBase) {
            amountBase = amountVirtual;
            amountQuote = LiquidityHelper.calculateQuoteVirtualFromBaseReal(
                LiquidityMath.calculateBaseReal(
                    maxPip,
                    amountVirtual,
                    currentPip
                ),
                currentPip,
                minPip,
                uint128(Math.sqrt(IMatchingEngineAMM(pair).basisPoint()))
            );
        } else {
            amountQuote = amountVirtual;
            amountBase =
                LiquidityHelper.calculateBaseVirtualFromQuoteReal(
                    LiquidityMath.calculateQuoteReal(
                        minPip,
                        amountVirtual,
                        currentPip
                    ),
                    currentPip,
                    maxPip
                ) *
                uint128(IMatchingEngineAMM(pair).basisPoint());
        }
    }

    function _msgSender() internal view override(Context) returns (address) {
        return msg.sender;
    }

    function _getBack(
        address token,
        uint128 amount,
        address user
    ) internal {
        if (amount == 0) return;
        if (token == address(WBNB)) {
            payable(user).sendValue(amount);
        } else {
            IERC20(token).transfer(user, amount);
        }
    }

    function _balanceOf(address token, address instance)
        internal
        view
        returns (uint256)
    {
        if (token == address(WBNB)) {
            return instance.balance;
        }
        return IERC20(token).balanceOf(instance);
    }
}
