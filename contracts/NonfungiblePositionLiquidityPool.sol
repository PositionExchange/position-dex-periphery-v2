/**
 * @author Musket
 */
// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.0;
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

import {Errors} from "./libraries/helper/Errors.sol";
import "./implement/ConcentratedLiquidityNFT.sol";
import "./interfaces/INonfungiblePositionLiquidityPool.sol";
import "./interfaces/IConcentratedLiquidity.sol";

contract NonfungiblePositionLiquidityPool is
    INonfungiblePositionLiquidityPool,
    ConcentratedLiquidityNFT,
    ReentrancyGuardUpgradeable,
    OwnableUpgradeable
{
    address public counterParty;
    uint256 public tokenID;
    mapping(address => bool) public counterParties;

    modifier onlyCounterParty() {
        require(counterParties[_msgSender()], Errors.VL_ONLY_COUNTERPARTY);
        _;
    }

    function initialize() external initializer {
        __ReentrancyGuard_init();
        __Ownable_init();
        __ERC721_init("Position Liquidity Pool", "PLP");
        __EIP712_init("Position Liquidity NFT", "1.0.0");
        tokenID = 1000000;
    }

    function mint(address user)
        external
        override
        onlyCounterParty
        returns (uint256 tokenId)
    {
        tokenId = tokenID + 1;
        _mint(user, tokenId);
        tokenID = tokenId;
    }

    function burn(uint256 tokenId) external override onlyCounterParty {
        _burnNFT(tokenId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721Upgradeable)
        returns (string memory)
    {
        return "";
    }

    function getDataNonfungibleToken(uint256 tokenId)
        external
        view
        override
        returns (Liquidity.Data memory)
    {
        return
            IConcentratedLiquidity(counterParty).getDataNonfungibleToken(
                tokenId
            );
    }

    function getAllToken(address owner)
        external
        view
        returns (Liquidity.Data[] memory, uint256[] memory)
    {
        uint256[] memory tokens = tokensOfOwner(owner);
        return (
            IConcentratedLiquidity(counterParty).getAllDataTokens(tokens),
            tokens
        );
    }

    function _msgSender()
        internal
        view
        override(ContextUpgradeable)
        returns (address)
    {
        return msg.sender;
    }

    function _msgData()
        internal
        view
        override(ContextUpgradeable)
        returns (bytes calldata)
    {
        return msg.data;
    }

    function voteFor() external override {
        uint256 vote = 0;
    }

    function voteAgainst() external override {}

    //------------------------------------------------------------------------------------------------------------------
    // OWNER FUNCTIONS
    //------------------------------------------------------------------------------------------------------------------

    function setCounterParty(address _newCounterParty) external onlyOwner {
        counterParties[_newCounterParty] = true;
    }

    function revokeCounterParty(address _account) external onlyOwner {
        counterParties[_account] = false;
    }
}
