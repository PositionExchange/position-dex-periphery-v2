/**
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

contract PositionRouter is
    PositionRouterStorage,
    IPositionRouter,
    PausableUpgradeable,
    ReentrancyGuardUpgradeable,
    OwnableUpgradeable
{
    modifier ensure(uint256 deadline) {
        require(deadline >= blockNumber(), "PositionRouter: EXPIRED");
        _;
    }

    receive() external payable {
        assert(msg.sender == WBNB); // only accept BNB via fallback from the WBNB contract
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
        (
            SpotHouseStorage.Side side,
            address pairManager
        ) = getSideAndPairManager(path);
        if (pairManager == address(0)) {
            amounts = uniSwapRouterV2.getAmountsOut(amountIn, path);
            _deposit(path[0], msg.sender, amounts[0]);
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
            if (side == SpotHouseStorage.Side.BUY) {
                amounts = spotHouse.openMarketOrderWithQuote(
                    IMatchingEngineAMM(pairManager),
                    side,
                    uint256(amountIn),
                    msg.sender,
                    to
                );
            } else {
                amounts = spotHouse.openMarketOrder(
                    IMatchingEngineAMM(pairManager),
                    side,
                    uint256(amountIn),
                    msg.sender,
                    to
                );
            }
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
            _deposit(path[0], msg.sender, amounts[0]);
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
                    msg.sender,
                    to
                );
            } else {
                amounts = spotHouse.openMarketOrderWithQuote(
                    IMatchingEngineAMM(pairManager),
                    side,
                    uint256(amountOut),
                    msg.sender,
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
        require(path[0] == WBNB, "!BNB");
        (
            SpotHouseStorage.Side side,
            address pairManager
        ) = getSideAndPairManager(path);

        if (pairManager == address(0)) {
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
            if (side == SpotHouseStorage.Side.BUY) {
                amounts = spotHouse.openMarketOrderWithQuote{value: msg.value}(
                    IMatchingEngineAMM(pairManager),
                    side,
                    uint256(msg.value),
                    msg.sender,
                    to
                );
            } else {
                amounts = spotHouse.openMarketOrder{value: msg.value}(
                    IMatchingEngineAMM(pairManager),
                    side,
                    uint256(msg.value),
                    msg.sender,
                    to
                );
            }
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
        require(path[path.length - 1] == WBNB, "!BNB");
        (
            SpotHouseStorage.Side side,
            address pairManager
        ) = getSideAndPairManager(path);

        if (pairManager == address(0)) {
            amounts = uniSwapRouterV2.getAmountsIn(amountOut, path);
            _deposit(path[0], msg.sender, amounts[0]);
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
                    msg.sender,
                    to
                );
            } else {
                amounts = spotHouse.openMarketOrderWithQuote(
                    IMatchingEngineAMM(pairManager),
                    side,
                    amountOut,
                    msg.sender,
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
        require(path[path.length - 1] == WBNB, "!BNB");
        (
            SpotHouseStorage.Side side,
            address pairManager
        ) = getSideAndPairManager(path);

        if (pairManager == address(0)) {
            amounts = uniSwapRouterV2.getAmountsOut(amountIn, path);
            _deposit(path[0], msg.sender, amounts[0]);

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
                    msg.sender,
                    to
                );
            } else {
                amounts = spotHouse.openMarketOrder(
                    IMatchingEngineAMM(pairManager),
                    side,
                    amountIn,
                    msg.sender,
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
                    msg.sender,
                    to
                );
            } else {
                amounts = spotHouse.openMarketOrderWithQuote{value: msg.value}(
                    IMatchingEngineAMM(pairManager),
                    side,
                    uint256(msg.value),
                    msg.sender,
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
            _deposit(path[0], msg.sender, amountIn);
            uint256 balanceAfter = IERC20(path[0]).balanceOf(address(this));
            //            _deposit(path[0], msg.sender, amountIn);
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
                    msg.sender,
                    to
                );
            } else {
                spotHouse.openMarketOrder(
                    IMatchingEngineAMM(pairManager),
                    side,
                    uint256(amountIn),
                    msg.sender,
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
        require(path[0] == WBNB, "!BNB");
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
                    msg.sender,
                    to
                );
            } else {
                spotHouse.openMarketOrder{value: msg.value}(
                    IMatchingEngineAMM(pairManager),
                    side,
                    uint256(msg.value),
                    msg.sender,
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
        require(path[path.length - 1] == WBNB, "!BNB");
        (
            SpotHouseStorage.Side side,
            address pairManager
        ) = getSideAndPairManager(path);

        if (pairManager == address(0)) {
            uint256 balanceBefore = IERC20(path[0]).balanceOf(address(this));
            _deposit(path[0], msg.sender, amountIn);
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
                    msg.sender,
                    to
                );
            } else {
                spotHouse.openMarketOrder(
                    IMatchingEngineAMM(pairManager),
                    side,
                    amountIn,
                    msg.sender,
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

    function _approve(address token) internal {
        IERC20(token).approve(address(uniSwapRouterV2), type(uint256).max);
    }

    //------------------------------------------------------------------------------------------------------------------
    // ONLY OWNER FUNCTIONS
    //------------------------------------------------------------------------------------------------------------------

    function setFactory(ISpotFactory _newFactory) public onlyOwner {
        factory = _newFactory;
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
}
