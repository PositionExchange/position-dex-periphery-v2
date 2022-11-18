// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.9;

import "../libraries/types/SpotFactoryStorage.sol";

interface ISpotFactory {
    event PairManagerInitialized(
        address quoteAsset,
        address baseAsset,
        uint256 basisPoint,
        uint128 maxFindingWordsIndex,
        uint128 initialPip,
        address owner,
        address pairManager,
        uint256 pipRange,
        uint256 tickSpace
    );

    function createPairManager(
        address quoteAsset,
        address baseAsset,
        uint256 basisPoint,
        uint128 maxFindingWordsIndex,
        uint128 initialPip,
        uint128 pipRange,
        uint32 tickSpace
    ) external;

    function getPairManager(address quoteAsset, address baseAsset)
        external
        view
        returns (address pairManager);

    function getQuoteAndBase(address pairManager)
        external
        view
        returns (SpotFactoryStorage.Pair memory);

    function isPairManagerExist(address pairManager)
        external
        view
        returns (bool);

    function getPairManagerSupported(address tokenA, address tokenB)
        external
        view
        returns (
            address baseToken,
            address quoteToken,
            address pairManager
        );
}
