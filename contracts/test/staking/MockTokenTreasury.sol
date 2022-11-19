/**
 * @author Musket
 */
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

pragma solidity ^0.8.0;

interface IPositionToken {
    function BASE_MINT() external view returns (uint256);
    function mint(address receiver, uint256 amount) external;
    function burn(uint amount) external;
    function treasuryTransfer(address[] memory recipients, uint256[] memory amounts) external;
    function treasuryTransfer(address recipient, uint256 amount) external;
    function transferTaxRate() external view returns (uint16) ;
    function balanceOf(address account) external view returns (uint256) ;
    function transfer(address to, uint value) external returns (bool);
    function isGenesisAddress(address account) external view returns (bool);
}

contract MockTokenTreasury is Ownable {

    address public positionStakingManager;
    address public insuranceFund;
    IPositionToken public posi;

    uint256 public maxMintAmount = 10*100000*10**18;

    modifier onlyCounterParty {
        require(positionStakingManager == msg.sender || insuranceFund == msg.sender, "not authorized");
        _;
    }

    constructor(IPositionToken _posi) {
        posi = _posi;
    }

    function myBalance() public view returns (uint256) {
        return posi.balanceOf(address(this));
    }

    function mint(address recipient, uint256 amount) public onlyCounterParty {
        if(myBalance() < amount){
            posi.mint(address(this), calulateMintAmount(amount));
        }
        posi.treasuryTransfer(recipient, amount);
    }

    function burn(uint256 amount) public onlyOwner {
        posi.burn(amount);
    }

    function setPositionStakingManager(address _newAddress) public onlyOwner {
        positionStakingManager = _newAddress;
    }

    function setInsuranceFund(address _newAddress) public onlyOwner {
        insuranceFund = _newAddress;
    }

    function setPosition(IPositionToken _newPosi) public onlyOwner {
        posi = _newPosi;
    }

    function setMaxMintAmount(uint256 amount) public onlyOwner {
        maxMintAmount = amount;
    }

    function calulateMintAmount(uint256 amount) private view returns (uint256 amountToMint) {
        uint256 baseAmount = posi.BASE_MINT();
        amountToMint = baseAmount*(amount/baseAmount+1);
        require(amountToMint < maxMintAmount, "Max exceed");
    }

}