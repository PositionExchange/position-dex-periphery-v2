/**
 * @author Musket
 */
pragma solidity ^0.8.9;

abstract contract ConcentratedLiquidity {
    function addLiquidity() internal virtual {}

    function removeLiquidity() internal virtual {}

    function modifyLiquidity() internal virtual {}
}
