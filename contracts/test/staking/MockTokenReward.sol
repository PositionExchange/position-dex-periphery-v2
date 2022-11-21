import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MockTokenReward is ERC20, Ownable {
    uint256 public constant BASE_MINT = 1;
    address public treasuryContract;
    event TreasuryContractChanged(
        address indexed previousAddress,
        address indexed newAddress
    );
    modifier onlyTreasury() {
        require(_msgSender() == treasuryContract, "Only Treasury");
        _;
    }

    constructor() public ERC20("Mock Reward Token", "MRT") {
        _mint(msg.sender, 10_000_000 * 10**18);
    }

    function treasuryTransfer(address recipient, uint256 amount)
        public
        onlyTreasury
    {
        _transfer(_msgSender(), recipient, amount);
    }

    function mint(address _receiver, uint256 amount) public onlyTreasury {
        _mint(_receiver, amount);
    }

    function burn(uint256 amount) public onlyTreasury {
        //        _burn(amount);
    }

    function setTreasuryAddress(address _newAddress) public onlyOwner {
        emit TreasuryContractChanged(treasuryContract, _newAddress);
        treasuryContract = _newAddress;
    }

    function transferTaxRate() public view returns (uint256) {
        return 0;
    }
}
