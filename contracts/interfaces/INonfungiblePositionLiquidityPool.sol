/**
 * @author Musket
 */
// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/token/ERC721/IERC721Upgradeable.sol";
import "../libraries/liquidity/Liquidity.sol";

interface INonfungiblePositionLiquidityPool is IERC721Upgradeable {
    function mint(address user) external returns (uint256 tokenId);

    function burn(uint256 tokenId) external;

    function voteFor() external;

    function voteAgainst() external;

    function getDataNonfungibleToken(uint256 tokenId)
        external
        view
        returns (Liquidity.Data memory);
}
