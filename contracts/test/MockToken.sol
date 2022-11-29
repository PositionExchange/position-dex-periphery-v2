pragma solidity ^0.8.0;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockToken is ERC20 {
    address public owner;

    string private _nameT;
    string private _symbolT;

    bool public isInit;

    constructor() ERC20("", "") {}

    function init(
        string memory name_,
        string memory symbol_,
        address owner_
    ) public {
        require(!isInit, "already init");
        _nameT = name_;
        _symbolT = symbol_;
        owner = owner_;
        isInit = true;
    }

    function name() public view override(ERC20) returns (string memory) {
        return _nameT;
    }

    function symbol() public view override(ERC20) returns (string memory) {
        return _symbolT;
    }

    function changNameAndSymbol(string memory newName, string memory newSymbol)
        public
    {
        require(msg.sender == owner, "only owner can change name and symbol");
        _nameT = newName;
        _symbolT = newSymbol;
    }

    function mint(address recipient, uint256 amount) public {
        _mint(recipient, amount);
    }

    function setOwner(address _owner) public {
        require(msg.sender == owner, "only owner can change name and symbol");

        owner = _owner;
    }
}
