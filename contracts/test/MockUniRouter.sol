/**
 * @author Musket
 */
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/Address.sol";

import "../interfaces/IWBNB.sol";

import "hardhat/console.sol";

pragma solidity ^0.8.9;

contract MockUniRouter {
    using Address for address payable;
    address public token0;
    address public token1;

    address public WBNB;


    receive() external payable {
        console.log("receive");
        assert(msg.sender == address(WBNB));
        // only accept BNB via fallback from the WBNB contract
    }

    function setWBNB(address _WBNB) public {
        WBNB = _WBNB;
    }

    function setToken(address _token0, address _token1) public {
        address caller = msg.sender;
        getAllBack();
        token0 = _token0;
        token1 = _token1;
    }

    function deposit(uint256 amountToken0, uint256 amountToken1)
        public
        payable
    {
        address caller = msg.sender;
        if (token0 == address(WBNB)) {
            _depositBNB(amountToken0);
        } else {
            IERC20(token0).transferFrom(caller, address(this), amountToken0);
        }

        if (token1 == address(WBNB)) {
            _depositBNB(amountToken1);
        } else {
            IERC20(token1).transferFrom(caller, address(this), amountToken1);
        }
    }

    function getAllBack() public {
        address caller = msg.sender;

        if (token0 == WBNB) {
            _withdrawBNB(caller, IWBNB(WBNB).balanceOf(address(this)));
        } else {
            if (token0 == address(0x00)) return;
            IERC20(token0).transfer(
                caller,
                IERC20(token0).balanceOf(address(this))
            );
        }

        if (token1 == WBNB) {
            _withdrawBNB(caller, IWBNB(WBNB).balanceOf(address(this)));
        } else {
            if (token0 == address(0x00)) return;
            IERC20(token1).transfer(
                caller,
                IERC20(token1).balanceOf(address(this))
            );
        }
    }

    function _depositBNB(uint256 _amount) internal {

        console.log("wbnb: ", WBNB, _amount);
        IWBNB(WBNB).deposit{value: _amount}();
        assert(IWBNB(WBNB).transfer(address(this), _amount));
    }

    function _withdrawBNB(address _trader, uint256 _amount) public {
        console.log("start  withdraw: ");
        IWBNB(WBNB).withdraw(_amount);
        console.log("withdraw balance: ", address(this).balance);
        payable(_trader).sendValue(address(this).balance);
    }

    function removeLiquidity(
        address tokenA,
        address tokenB,
        uint256 liquidity,
        uint256 amountAMin,
        uint256 amountBMin,
        address to,
        uint256 deadline
    ) external returns (uint256 amountA, uint256 amountB) {
        address caller = msg.sender;

        amountA = IERC20(token0).balanceOf(address(this));
        amountB = IERC20(token1).balanceOf(address(this));
        IERC20(token0).transfer(caller, amountA);
        IERC20(token1).transfer(caller, amountB);
    }

    function removeLiquidityETH(
        address token,
        uint256 liquidity,
        uint256 amountTokenMin,
        uint256 amountETHMin,
        address to,
        uint256 deadline
    ) external returns (uint256 amountToken, uint256 amountETH) {
        address caller = msg.sender;
        console.log("start removeLiquidityETH" );

        if (token0 == address(WBNB)) {
            amountETH = IWBNB(WBNB).balanceOf(address(this));
            console.log("token0 amountETH: ", amountETH );

            _withdrawBNB(caller, amountETH);
        } else {
            amountToken = IERC20(token0).balanceOf(address(this));

            IERC20(token0).transfer(caller, amountToken);
        }

        if (token1 == address(WBNB)) {
            amountETH = IWBNB(WBNB).balanceOf(address(this));
            console.log("token1 amountETH: ", amountETH );

            _withdrawBNB(caller, amountETH);
        } else {
            amountToken = IERC20(token1).balanceOf(address(this));
            IERC20(token1).transfer(caller, amountToken);
        }
    }
}
