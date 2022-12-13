/**
 * @author Musket
 * @author NiKa
 */
// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.9;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@positionex/matching-engine/contracts/interfaces/IMatchingEngineAMM.sol";

import "./interfaces/ISpotFactory.sol";
import "./interfaces/IWBNB.sol";
import "./interfaces/ISpotHouse.sol";
import "./libraries/types/SpotHouseStorage.sol";
import "./libraries/types/SpotFactoryStorage.sol";
import "./interfaces/IUniswapV2Router.sol";
import "./interfaces/IUniswapV2Factory.sol";
import "./interfaces/IUniswapV2Pair.sol";
import "./libraries/types/PositionRouterStorage.sol";
import "./interfaces/IPositionRouter.sol";
import "./libraries/helper/DexErrors.sol";
import "./libraries/helper/TransferHelper.sol";

contract PositionRouter is
    IPositionRouter,
    PausableUpgradeable,
    ReentrancyGuardUpgradeable,
    OwnableUpgradeable,
    PositionRouterStorage
{
    modifier ensure(uint256 deadline) {
        require(deadline >= blockNumber(), "PositionRouter: EXPIRED");
        _;
    }

    receive() external payable {
        assert(_msgSender() == WBNB); // only accept BNB via fallback from the WBNB contract
    }

    function initialize(
        ISpotFactory _factory,
        ISpotHouse _spotHouse,
        IUniswapV2Router02 _uniSwapRouterV2,
        address _WBNB
    ) public initializer {
        __ReentrancyGuard_init();
        __Ownable_init();
        __Pausable_init();
        factory = _factory;
        spotHouse = _spotHouse;
        uniSwapRouterV2 = _uniSwapRouterV2;
        WBNB = _WBNB;
    }

    function swapExactTokensForTokens(
        uint256 amountIn,
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    )
        external
        virtual
        override
        ensure(deadline)
        returns (uint256[] memory amounts)
    {
        SideAndPair[] memory sidesAndPairs = getSidesAndPairs(path);
        if (sidesAndPairs[0].pairManager == address(0)) {
            amounts = uniSwapRouterV2.getAmountsOut(amountIn, path);
            _deposit(path[0], _msgSender(), amounts[0]);
            if (!isApprove(path[0])) {
                _approve(path[0]);
            }
            uniSwapRouterV2.swapExactTokensForTokens(
                amountIn,
                amountOutMin,
                path,
                to,
                deadline
            );
        } else {
            uint256 mainSideOut;
            uint256 flipSideOut;
            uint256 fee;
            amounts = new uint256[](3);
            amounts[0] = amountIn;
            for (uint256 i = 0; i < sidesAndPairs.length; i++) {
                if (sidesAndPairs[i].side == SpotHouseStorage.Side.BUY) {
                    (mainSideOut, flipSideOut, fee) = IMatchingEngineAMM(
                        sidesAndPairs[i].pairManager
                    ).openMarketWithQuoteAsset(
                            amounts[i],
                            true,
                            _msgSender(),
                            20
                        );
                } else {
                    (mainSideOut, flipSideOut, fee) = IMatchingEngineAMM(
                        sidesAndPairs[i].pairManager
                    ).openMarket(amounts[i], true, _msgSender(), 20);
                }
                require(mainSideOut == amounts[i], "!L");
                amounts[i + 1] = flipSideOut - fee;
            }
            _transferBridge(amounts, sidesAndPairs);
        }
    }

    function swapTokensForExactTokens(
        uint256 amountOut,
        uint256 amountInMax,
        address[] calldata path,
        address to,
        uint256 deadline
    )
        external
        virtual
        override
        ensure(deadline)
        returns (uint256[] memory amounts)
    {
        (
            SpotHouseStorage.Side side,
            address pairManager
        ) = getSideAndPairManager(path);
        if (pairManager == address(0)) {
            amounts = uniSwapRouterV2.getAmountsIn(amountOut, path);
            _deposit(path[0], _msgSender(), amounts[0]);
            if (!isApprove(path[0])) {
                _approve(path[0]);
            }
            uniSwapRouterV2.swapTokensForExactTokens(
                amountOut,
                amountInMax,
                path,
                to,
                deadline
            );
        } else {
            if (side == SpotHouseStorage.Side.BUY) {
                amounts = spotHouse.openMarketOrder(
                    IMatchingEngineAMM(pairManager),
                    side,
                    uint256(amountOut),
                    _msgSender(),
                    to
                );
            } else {
                amounts = spotHouse.openMarketOrderWithQuote(
                    IMatchingEngineAMM(pairManager),
                    side,
                    uint256(amountOut),
                    _msgSender(),
                    to
                );
            }
        }
    }

    function swapExactETHForTokens(
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    )
        external
        payable
        virtual
        override
        ensure(deadline)
        returns (uint256[] memory amounts)
    {
        require(path[0] == WBNB, DexErrors.DEX_MUST_BNB);
        SideAndPair[] memory sidesAndPairs = getSidesAndPairs(path);

        if (sidesAndPairs[0].pairManager == address(0)) {
            if (!isApprove(path[0])) {
                _approve(path[0]);
            }
            uniSwapRouterV2.swapExactETHForTokens{value: msg.value}(
                amountOutMin,
                path,
                to,
                deadline
            );
        } else {
            uint256 mainSideOut;
            uint256 flipSideOut;
            uint256 fee;
            amounts = new uint256[](3);
            amounts[0] = msg.value;
            for (uint256 i = 0; i < sidesAndPairs.length; i++) {
                if (sidesAndPairs[i].side == SpotHouseStorage.Side.BUY) {
                    (mainSideOut, flipSideOut, fee) = IMatchingEngineAMM(
                        sidesAndPairs[i].pairManager
                    ).openMarketWithQuoteAsset(
                            amounts[i],
                            true,
                            _msgSender(),
                            20
                        );
                } else {
                    (mainSideOut, flipSideOut, fee) = IMatchingEngineAMM(
                        sidesAndPairs[i].pairManager
                    ).openMarket(amounts[i], true, _msgSender(), 20);
                }
                require(mainSideOut == amounts[i],DexErrors.DEX_MARKET_NOT_FULL_FILL);
                amounts[i + 1] = flipSideOut - fee;
            }
            _transferBridge(amounts, sidesAndPairs);
        }
    }

    function swapTokensForExactETH(
        uint256 amountOut,
        uint256 amountInMax,
        address[] calldata path,
        address to,
        uint256 deadline
    )
        external
        virtual
        override
        ensure(deadline)
        returns (uint256[] memory amounts)
    {
        require(path[path.length - 1] == WBNB, DexErrors.DEX_MUST_BNB);
        (
            SpotHouseStorage.Side side,
            address pairManager
        ) = getSideAndPairManager(path);

        if (pairManager == address(0)) {
            amounts = uniSwapRouterV2.getAmountsIn(amountOut, path);
            _deposit(path[0], _msgSender(), amounts[0]);
            if (!isApprove(path[0])) {
                _approve(path[0]);
            }
            uniSwapRouterV2.swapTokensForExactETH(
                amountOut,
                amountInMax,
                path,
                to,
                deadline
            );
        } else {
            if (side == SpotHouseStorage.Side.BUY) {
                amounts = spotHouse.openMarketOrder(
                    IMatchingEngineAMM(pairManager),
                    side,
                    amountOut,
                    _msgSender(),
                    to
                );
            } else {
                amounts = spotHouse.openMarketOrderWithQuote(
                    IMatchingEngineAMM(pairManager),
                    side,
                    amountOut,
                    _msgSender(),
                    to
                );
            }
        }
    }

    function swapExactTokensForETH(
        uint256 amountIn,
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    )
        external
        virtual
        override
        ensure(deadline)
        returns (uint256[] memory amounts)
    {
        require(path[path.length - 1] == WBNB, DexErrors.DEX_MUST_BNB);
        (
            SpotHouseStorage.Side side,
            address pairManager
        ) = getSideAndPairManager(path);

        if (pairManager == address(0)) {
            amounts = uniSwapRouterV2.getAmountsOut(amountIn, path);
            _deposit(path[0], _msgSender(), amounts[0]);

            if (!isApprove(path[0])) {
                _approve(path[0]);
            }
            uniSwapRouterV2.swapExactTokensForETH(
                amountIn,
                amountOutMin,
                path,
                to,
                deadline
            );
        } else {
            if (side == SpotHouseStorage.Side.BUY) {
                amounts = spotHouse.openMarketOrderWithQuote(
                    IMatchingEngineAMM(pairManager),
                    side,
                    amountIn,
                    _msgSender(),
                    to
                );
            } else {
                amounts = spotHouse.openMarketOrder(
                    IMatchingEngineAMM(pairManager),
                    side,
                    amountIn,
                    _msgSender(),
                    to
                );
            }
        }
    }

    function swapETHForExactTokens(
        uint256 amountOut,
        address[] calldata path,
        address to,
        uint256 deadline
    )
        external
        payable
        virtual
        override
        ensure(deadline)
        returns (uint256[] memory amounts)
    {
        (
            SpotHouseStorage.Side side,
            address pairManager
        ) = getSideAndPairManager(path);

        if (pairManager == address(0)) {
            if (!isApprove(path[0])) {
                _approve(path[0]);
            }
            uniSwapRouterV2.swapExactETHForTokens{value: msg.value}(
                amountOut,
                path,
                to,
                deadline
            );
        } else {
            if (side == SpotHouseStorage.Side.BUY) {
                amounts = spotHouse.openMarketOrder{value: msg.value}(
                    IMatchingEngineAMM(pairManager),
                    side,
                    amountOut,
                    _msgSender(),
                    to
                );
            } else {
                amounts = spotHouse.openMarketOrderWithQuote{value: msg.value}(
                    IMatchingEngineAMM(pairManager),
                    side,
                    uint256(msg.value),
                    _msgSender(),
                    to
                );
            }
        }
    }

    function swapExactTokensForTokensSupportingFeeOnTransferTokens(
        uint256 amountIn,
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external virtual override ensure(deadline) {
        (
            SpotHouseStorage.Side side,
            address pairManager
        ) = getSideAndPairManager(path);
        if (pairManager == address(0)) {
            uint256 balanceBefore = IERC20(path[0]).balanceOf(address(this));
            _deposit(path[0], _msgSender(), amountIn);
            uint256 balanceAfter = IERC20(path[0]).balanceOf(address(this));
            if (!isApprove(path[0])) {
                _approve(path[0]);
            }
            uniSwapRouterV2
                .swapExactTokensForTokensSupportingFeeOnTransferTokens(
                    balanceAfter - balanceBefore,
                    amountOutMin,
                    path,
                    to,
                    deadline
                );
        } else {
            if (side == SpotHouseStorage.Side.BUY) {
                spotHouse.openMarketOrderWithQuote(
                    IMatchingEngineAMM(pairManager),
                    side,
                    uint256(amountIn),
                    _msgSender(),
                    to
                );
            } else {
                spotHouse.openMarketOrder(
                    IMatchingEngineAMM(pairManager),
                    side,
                    uint256(amountIn),
                    _msgSender(),
                    to
                );
            }
        }
    }

    function swapExactETHForTokensSupportingFeeOnTransferTokens(
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external payable virtual override ensure(deadline) {
        require(path[0] == WBNB, DexErrors.DEX_MUST_BNB);
        (
            SpotHouseStorage.Side side,
            address pairManager
        ) = getSideAndPairManager(path);

        if (pairManager == address(0)) {
            if (!isApprove(path[0])) {
                _approve(path[0]);
            }
            uniSwapRouterV2.swapExactETHForTokensSupportingFeeOnTransferTokens{
                value: msg.value
            }(amountOutMin, path, to, deadline);
        } else {
            if (side == SpotHouseStorage.Side.BUY) {
                spotHouse.openMarketOrderWithQuote{value: msg.value}(
                    IMatchingEngineAMM(pairManager),
                    side,
                    uint256(msg.value),
                    _msgSender(),
                    to
                );
            } else {
                spotHouse.openMarketOrder{value: msg.value}(
                    IMatchingEngineAMM(pairManager),
                    side,
                    uint256(msg.value),
                    _msgSender(),
                    to
                );
            }
        }
    }

    function swapExactTokensForETHSupportingFeeOnTransferTokens(
        uint256 amountIn,
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external virtual override ensure(deadline) {
        require(path[path.length - 1] == WBNB, DexErrors.DEX_MUST_BNB);
        (
            SpotHouseStorage.Side side,
            address pairManager
        ) = getSideAndPairManager(path);

        if (pairManager == address(0)) {
            uint256 balanceBefore = IERC20(path[0]).balanceOf(address(this));
            _deposit(path[0], _msgSender(), amountIn);
            uint256 balanceAfter = IERC20(path[0]).balanceOf(address(this));

            if (!isApprove(path[0])) {
                _approve(path[0]);
            }
            uniSwapRouterV2.swapExactTokensForETHSupportingFeeOnTransferTokens(
                balanceAfter - balanceBefore,
                amountOutMin,
                path,
                to,
                deadline
            );
        } else {
            if (side == SpotHouseStorage.Side.BUY) {
                spotHouse.openMarketOrderWithQuote(
                    IMatchingEngineAMM(pairManager),
                    side,
                    amountIn,
                    _msgSender(),
                    to
                );
            } else {
                spotHouse.openMarketOrder(
                    IMatchingEngineAMM(pairManager),
                    side,
                    amountIn,
                    _msgSender(),
                    to
                );
            }
        }
    }

    //------------------------------------------------------------------------------------------------------------------
    // INTERNAL FUNCTIONS
    //------------------------------------------------------------------------------------------------------------------

    function _deposit(
        address token,
        address from,
        uint256 amount
    ) internal {
        IERC20(token).transferFrom(from, address(this), amount);
    }

    function _depositBNB(address _pairManagerAddress, uint256 _amount)
        internal
    {
        require(msg.value >= _amount, DexErrors.DEX_NEED_MORE_BNB);
        IWBNB(WBNB).deposit{value: _amount}();
        assert(IWBNB(WBNB).transfer(_pairManagerAddress, _amount));
    }

    function _withdrawBNB(
        address _trader,
        address _pairManagerAddress,
        uint256 _amount
    ) internal {
        IWBNB(WBNB).transferFrom(
            _pairManagerAddress,
            address(withdrawBNB),
            _amount
        );
        withdrawBNB.withdraw(_trader, _amount);
    }

    function _transferBridge(
        uint256[] memory amounts,
        SideAndPair[] memory sidesAndPairs
    ) internal {
        for (uint256 i = 0; i < sidesAndPairs.length; i++) {
            if (sidesAndPairs[i].side == SpotHouseStorage.Side.BUY) {
                if (i == 0) {
                    if (sidesAndPairs[i].quoteToken == WBNB) {
                        _depositBNB(sidesAndPairs[i].pairManager, amounts[i]);
                    } else {
                        TransferHelper.transferFrom(
                            IERC20(sidesAndPairs[i].quoteToken),
                            _msgSender(),
                            sidesAndPairs[i].pairManager,
                            amounts[i]
                        );
                    }
                } else {
                    TransferHelper.transferFrom(
                        IERC20(sidesAndPairs[i].quoteToken),
                        sidesAndPairs[i - 1].pairManager,
                        sidesAndPairs[i].pairManager,
                        amounts[i]
                    );
                }
                if (i == sidesAndPairs.length - 1) {
                    if (sidesAndPairs[i].baseToken == WBNB) {
                        _withdrawBNB(
                            msg.sender,
                            sidesAndPairs[i].pairManager,
                            amounts[i + 1]
                        );
                    } else {
                        TransferHelper.transferFrom(
                            IERC20(sidesAndPairs[i].baseToken),
                            sidesAndPairs[i].pairManager,
                            _msgSender(),
                            amounts[i + 1]
                        );
                    }
                }
            } else {
                if (i == 0) {
                    if (sidesAndPairs[i].baseToken == WBNB) {
                        _depositBNB(sidesAndPairs[i].pairManager, amounts[i]);
                    } else {
                        TransferHelper.transferFrom(
                            IERC20(sidesAndPairs[i].baseToken),
                            _msgSender(),
                            sidesAndPairs[i].pairManager,
                            amounts[i]
                        );
                    }
                } else {
                    TransferHelper.transferFrom(
                        IERC20(sidesAndPairs[i].baseToken),
                        sidesAndPairs[i - 1].pairManager,
                        sidesAndPairs[i].pairManager,
                        amounts[i]
                    );
                }

                if (i == sidesAndPairs.length - 1) {
                    if (sidesAndPairs[i].quoteToken == WBNB) {
                        _withdrawBNB(
                            msg.sender,
                            sidesAndPairs[i].pairManager,
                            amounts[i + 1]
                        );
                    } else {
                        TransferHelper.transferFrom(
                            IERC20(sidesAndPairs[i].quoteToken),
                            sidesAndPairs[i].pairManager,
                            _msgSender(),
                            amounts[i + 1]
                        );
                    }
                }
            }
        }
    }

    function _approve(address token) internal {
        IERC20(token).approve(address(uniSwapRouterV2), type(uint256).max);
    }

    //------------------------------------------------------------------------------------------------------------------
    // ONLY OWNER FUNCTIONS
    //------------------------------------------------------------------------------------------------------------------

    function setFactory(ISpotFactory _newFactory) public onlyOwner {
        factory = _newFactory;
    }

    function setWithdrawBNB(IWithdrawBNB _withdrawBNB) external onlyOwner {
        withdrawBNB = _withdrawBNB;
    }

    function setUniSwpRouter(IUniswapV2Router02 _newUniSwpRouter)
        public
        onlyOwner
    {
        uniSwapRouterV2 = _newUniSwpRouter;
    }

    function setWBNB(address _newWBNB) external onlyOwner {
        WBNB = _newWBNB;
    }

    function setSpotHouse(ISpotHouse _newSpotHouse) external onlyOwner {
        spotHouse = _newSpotHouse;
    }

    //------------------------------------------------------------------------------------------------------------------
    // VIEWS FUNCTIONS
    //------------------------------------------------------------------------------------------------------------------
    function getSideAndPairManager(address[] calldata path)
        public
        view
        returns (SpotHouseStorage.Side side, address pairManager)
    {
        address quoteToken;
        (, quoteToken, pairManager) = isPosiDexSupportPair(
            path[0],
            path[path.length - 1]
        );

        if (quoteToken == path[0]) {
            // Buy
            // path[0] -> path[path.length - 1] and path[0] is quote
            side = SpotHouseStorage.Side.BUY;
        } else {
            side = SpotHouseStorage.Side.SELL;
        }
    }

    struct SideAndPair {
        SpotHouseStorage.Side side;
        address pairManager;
        address baseToken;
        address quoteToken;
    }

    function getSidesAndPairs(address[] calldata path)
        public
        view
        returns (SideAndPair[] memory)
    {
        SideAndPair[] memory sidesAndPairs = new SideAndPair[](path.length - 1);
        address baseToken;
        address quoteToken;
        address pairManager;

        for (uint256 i = 0; i < path.length - 1; i++) {
            (baseToken, quoteToken, pairManager) = isPosiDexSupportPair(
                path[i],
                path[i + 1]
            );

            if (quoteToken == path[i]) {
                // Buy
                // path[0] -> path[path.length - 1] and path[0] is quote
                sidesAndPairs[i].side = SpotHouseStorage.Side.BUY;
            } else {
                sidesAndPairs[i].side = SpotHouseStorage.Side.SELL;
            }
            sidesAndPairs[i].pairManager = pairManager;
            sidesAndPairs[i].baseToken = baseToken;
            sidesAndPairs[i].quoteToken = quoteToken;
        }

        return sidesAndPairs;
    }

    function getReserves(address tokenA, address tokenB)
        external
        view
        returns (uint256 reservesA, uint256 reservesB)
    {
        (reservesA, reservesB, ) = IUniswapV2Pair(
            IUniswapV2Factory(uniSwapRouterV2.factory()).getPair(tokenA, tokenB)
        ).getReserves();
    }

    function isApprove(address token) public view returns (bool) {
        return
            IERC20(token).allowance(address(this), address(uniSwapRouterV2)) > 0
                ? true
                : false;
    }

    function isPosiDexSupportPair(address tokenA, address tokenB)
        public
        view
        override
        returns (
            address baseToken,
            address quoteToken,
            address pairManager
        )
    {
        (baseToken, quoteToken, pairManager) = factory.getPairManagerSupported(
            tokenA,
            tokenB
        );
    }

    function getAmountsOut(uint256 amountIn, address[] calldata path)
        public
        view
        virtual
        override
        returns (uint256[] memory amounts)
    {
        (
            SpotHouseStorage.Side side,
            address pairManagerAddress
        ) = getSideAndPairManager(path);

        uint256 sizeOut;
        uint256 openOtherSide;

        if (pairManagerAddress != address(0)) {
            IMatchingEngineAMM pairManager = IMatchingEngineAMM(
                pairManagerAddress
            );
            amounts = new uint256[](2);
            if (side == SpotHouseStorage.Side.BUY) {
                // quote
                (sizeOut, openOtherSide) = pairManager.getAmountEstimate(
                    amountIn,
                    true,
                    false
                );
                amounts[0] = sizeOut;
                amounts[1] = openOtherSide;
            } else {
                (sizeOut, openOtherSide) = pairManager.getAmountEstimate(
                    amountIn,
                    false,
                    true
                );
                amounts[0] = sizeOut;
                amounts[1] = openOtherSide;
            }
        } else {
            amounts = uniSwapRouterV2.getAmountsOut(amountIn, path);
        }
    }

    function getAmountsIn(uint256 amountOut, address[] calldata path)
        public
        view
        virtual
        override
        returns (uint256[] memory amounts)
    {
        (
            SpotHouseStorage.Side side,
            address pairManagerAddress
        ) = getSideAndPairManager(path);
        uint256 sizeOut;
        uint256 openOtherSide;

        if (pairManagerAddress != address(0)) {
            IMatchingEngineAMM pairManager = IMatchingEngineAMM(
                pairManagerAddress
            );
            amounts = new uint256[](2);

            if (side == SpotHouseStorage.Side.BUY) {
                // quote
                (sizeOut, openOtherSide) = pairManager.getAmountEstimate(
                    amountOut,
                    true,
                    true
                );

                amounts[0] = openOtherSide;
                amounts[1] = sizeOut;
            } else {
                (sizeOut, openOtherSide) = pairManager.getAmountEstimate(
                    amountOut,
                    false,
                    false
                );
                amounts[0] = openOtherSide;
                amounts[1] = sizeOut;
            }
        } else {
            amounts = uniSwapRouterV2.getAmountsIn(amountOut, path);
        }
    }

    function blockNumber() internal view virtual returns (uint256) {
        return block.timestamp;
    }

    function _msgSender()
        internal
        view
        override(ContextUpgradeable)
        returns (address)
    {
        return msg.sender;
    }
}
