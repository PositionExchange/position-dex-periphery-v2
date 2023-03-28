pragma solidity ^0.8.0;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockToken02 is ERC20 {
    address public owner;
    modifier onlyOwner() {
        require(msg.sender == owner, "!O");
        _;
    }

    constructor(string memory name, string memory symbol) ERC20(name, symbol) {
        _mint(msg.sender, 10000 * 10**18);
        owner = msg.sender;
    }

    function mint(address recipient, uint256 amount) public  {
        _mint(recipient, amount);
    }

    function setOwner(address _owner) public onlyOwner {
        owner = _owner;
    }
}
