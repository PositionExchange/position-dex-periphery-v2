/**
 * @author Musket
 */
// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.9;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title SimpleToken
 * @dev Very simple ERC20 Token example, where all tokens are pre-assigned to the creator.
 * Note they can later distribute these tokens as they wish using `transfer` and other
 * `ERC20` functions.
 */
contract Token9 is Context, ERC20 {

    /**
     * @dev Constructor that gives _msgSender() all of existing tokens.
     */
    constructor () public ERC20("Token 9", "T9") {
        _mint(_msgSender(), 10000 * (10 ** uint256(decimals())));
    }


    function mint(uint256 amount) public {
        _mint(_msgSender(), 10000 * (10 ** uint256(decimals())));

    }

    function decimals() public view virtual override returns (uint8) {
        return 9;
    }
}
