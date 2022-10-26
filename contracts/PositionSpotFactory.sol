/**
 * @author NiKa
 */
// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/proxy/Clones.sol";

import "./interfaces/ISpotFactory.sol";
import "./libraries/types/SpotFactoryStorage.sol";
import "./libraries/helper/Errors.sol";

import "@positionex/matching-engine/contracts/interfaces/IMatchingEngineAMM.sol";

contract PositionSpotFactory is
    ISpotFactory,
    SpotFactoryStorage,
    PausableUpgradeable,
    ReentrancyGuardUpgradeable,
    OwnableUpgradeable
{
    function initialize() public initializer {
        __ReentrancyGuard_init();
        __Ownable_init();
        __Pausable_init();
    }

    address public templatePair;

    function createPairManager(
        address quoteAsset,
        address baseAsset,
        uint256 basisPoint,
        uint256 baseBasisPoint,
        uint128 maxFindingWordsIndex,
        uint128 initialPip,
        uint128 pipRange,
        uint32 tickSpace
    ) external nonReentrant {
        address creator = msg.sender;

        require(
            quoteAsset != address(0) && baseAsset != address(0),
            Errors.VL_EMPTY_ADDRESS
        );
        require(quoteAsset != baseAsset, Errors.VL_MUST_IDENTICAL_ADDRESSES);
        require(
            pathPairManagers[baseAsset][quoteAsset] == address(0),
            Errors.VL_SPOT_MANGER_EXITS
        );

        require(
            basisPoint > 0 &&
                baseBasisPoint > 0 &&
                maxFindingWordsIndex > 0 &&
                initialPip > 0 &&
                pipRange > 0 &&
                tickSpace > 0,
            Errors.VL_INVALID_PAIR_INFO
        );

        address pair;

        bytes32 salt = keccak256(
            abi.encodePacked(creator, address(this), block.timestamp)
        );

        pair = Clones.cloneDeterministic(templatePair, salt);

        IMatchingEngineAMM(pair).initialize(
            quoteAsset,
            baseAsset,
            basisPoint,
            baseBasisPoint,
            maxFindingWordsIndex,
            initialPip,
            pipRange,
            tickSpace,
            creator
        );
    }

    function getPairManager(address quoteAsset, address baseAsset)
        external
        view
        override
        returns (address spotManager)
    {
        return pathPairManagers[baseAsset][quoteAsset];
    }

    function getPairManagerSupported(address tokenA, address tokenB)
        public
        view
        override
        returns (
            address baseToken,
            address quoteToken,
            address pairManager
        )
    {
        if (pathPairManagers[tokenA][tokenB] != address(0)) {
            return (tokenA, tokenB, pathPairManagers[tokenA][tokenB]);
        }
        if (pathPairManagers[tokenB][tokenA] != address(0)) {
            return (tokenB, tokenA, pathPairManagers[tokenB][tokenA]);
        }
    }

    function getQuoteAndBase(address pairManager)
        external
        view
        override
        returns (Pair memory)
    {
        return allPairManager[pairManager];
    }

    function isPairManagerExist(address pairManager)
        external
        view
        override
        returns (bool)
    {
        // Just 1 in 2 address need require != address 0x000
        // Because when we added pair, already require both of them difference address 0x00
        return allPairManager[pairManager].BaseAsset != address(0);
    }

    //------------------------------------------------------------------------------------------------------------------
    // ONLY OWNER FUNCTIONS
    //------------------------------------------------------------------------------------------------------------------

    function setSpotHouse(address newSpotHouse) external onlyOwner {
        spotHouse = newSpotHouse;
    }

    function setLiquidityPool(address _liquidityPool) external onlyOwner {
        require(_liquidityPool != address(0), Errors.VL_EMPTY_ADDRESS);
        liquidityPool = _liquidityPool;
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function addPairManagerManual(
        address _pairManager,
        address _baseAsset,
        address _quoteAsset
    ) external {
        require(
            _quoteAsset != address(0) && _baseAsset != address(0),
            Errors.VL_EMPTY_ADDRESS
        );
        require(_quoteAsset != _baseAsset, Errors.VL_MUST_IDENTICAL_ADDRESSES);
        require(
            pathPairManagers[_baseAsset][_quoteAsset] == address(0),
            Errors.VL_SPOT_MANGER_EXITS
        );

        // save
        pathPairManagers[_baseAsset][_quoteAsset] = _pairManager;

        allPairManager[_pairManager] = Pair({
            BaseAsset: _baseAsset,
            QuoteAsset: _quoteAsset
        });
    }

    function updateTemplatePair(address templatePair_) public onlyOwner {
        templatePair = templatePair_;
    }

    // IMPORTANT
    // This function only for dev. MUST remove when launch production
    function delPairManager(address pairManager) external onlyOwner {
        Pair storage pair = allPairManager[pairManager];
        pathPairManagers[address(pair.BaseAsset)][
            address(pair.QuoteAsset)
        ] = address(0);

        allPairManager[pairManager] = Pair({
            BaseAsset: address(0),
            QuoteAsset: address(0)
        });
    }

    function addAllowedAddress(address _address, bool allow)
        external
        onlyOwner
    {
        allowedAddressAddPair[_address] = allow;
    }
}
