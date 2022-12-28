/**
 * @author Musket
 */
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";


pragma solidity ^0.8.9;

contract MockPairUni is ERC20 {

    address public token0;
    address public token1;

    constructor() ERC20("PAIR", "P"){}

    function mint(address recipient, uint256 amount) public {

        _mint(recipient, amount);
    }
    function setToken(address token0_, address token1_) public {
        token0 = token0_;
        token1 = token1_;
    }



}
