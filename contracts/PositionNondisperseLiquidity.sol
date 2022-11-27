/**
 * @author Musket
 */
// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.9;
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";

import "./implement/LiquidityManager.sol";
import "./implement/LiquidityManagerNFT.sol";

import "./libraries/helper/TransferHelper.sol";
import "./implement/LiquidityManager.sol";

contract PositionNondisperseLiquidity is
    LiquidityManager,
    LiquidityManagerNFT,
    ReentrancyGuardUpgradeable,
    OwnableUpgradeable
{
    modifier nftOwner(uint256 nftId) {
        require(_msgSender() == ownerOf(nftId), "!Owner");
        _;
    }

    modifier nftOwnerOrStaking(uint256 nftId) {
        require(
            (_msgSender() == ownerOf(nftId)) ||
                _isOwnerWhenStaking(_msgSender(), nftId),
            "!Owner"
        );
        _;
    }

    ISpotFactory public spotFactory;
    IWithdrawBNB withdrawBNB;
    address WBNB;

    mapping(address => bool) public counterParties;

    function initialize() external initializer {
        __ReentrancyGuard_init();
        __Ownable_init();
        __ERC721_init("Position Nondisperse Liquidity", "PNL");
        tokenID = 1000000;
    }

    function setFactory(ISpotFactory _sportFactory) public onlyOwner {
        spotFactory = _sportFactory;
    }

    function setStakingManager(IPositionStakingDexManager _stakingManager)
        public
        onlyOwner
    {
        stakingManager = _stakingManager;
    }

    function getStakingManager() public view returns (address) {
        return address(stakingManager);
    }

    function addLiquidity(AddLiquidityParams calldata params)
        public
        payable
        override(LiquidityManager)
        nonReentrant
    {
        super.addLiquidity(params);
    }

    function removeLiquidity(uint256 nftTokenId)
        public
        override(LiquidityManager)
        nonReentrant
        nftOwner(nftTokenId)
    {
        super.removeLiquidity(nftTokenId);
    }

    function decreaseLiquidity(uint256 nftTokenId, uint128 liquidity)
        public
        override(LiquidityManager)
        nonReentrant
        nftOwnerOrStaking(nftTokenId)
    {
        super.decreaseLiquidity(nftTokenId, liquidity);
    }

    function increaseLiquidity(
        uint256 nftTokenId,
        uint128 amountModify,
        bool isBase
    )
        public
        payable
        override(LiquidityManager)
        nonReentrant
        nftOwnerOrStaking(nftTokenId)
    {
        super.increaseLiquidity(nftTokenId, amountModify, isBase);
    }

    function shiftRange(
        uint256 nftTokenId,
        uint32 targetIndex,
        uint128 amountNeeded,
        bool isBase
    )
        public
        payable
        override(LiquidityManager)
        nonReentrant
        nftOwnerOrStaking(nftTokenId)
    {
        super.shiftRange(nftTokenId, targetIndex, amountNeeded, isBase);
    }

    function collectFee(uint256 nftTokenId)
        public
        override(LiquidityManager)
        nonReentrant
        nftOwnerOrStaking(nftTokenId)
    {
        super.collectFee(nftTokenId);
    }

    function mint(address user)
        internal
        override(LiquidityManager)
        returns (uint256 tokenId)
    {
        tokenId = tokenID + 1;
        _mint(user, tokenId);
        tokenID = tokenId;
    }

    function burn(uint256 tokenId) internal override(LiquidityManager) {
        _burnNFT(tokenId);
    }

    function getAllToken(address owner)
        external
        view
        returns (UserLiquidity.Data[] memory, uint256[] memory)
    {
        uint256[] memory tokens = tokensOfOwner(owner);
        return (getAllDataTokens(tokens), tokens);
    }

    function setCounterParty(address _newCounterParty) external onlyOwner {
        counterParties[_newCounterParty] = true;
    }

    function revokeCounterParty(address _account) external onlyOwner {
        counterParties[_account] = false;
    }

    function donatePool(
        IMatchingEngineAMM pool,
        uint256 base,
        uint256 quote
    ) external {
        depositLiquidity(
            pool,
            _msgSender(),
            SpotHouseStorage.Asset.Quote,
            quote
        );
        depositLiquidity(pool, _msgSender(), SpotHouseStorage.Asset.Base, base);
    }

    function _getQuoteAndBase(IMatchingEngineAMM _managerAddress)
        internal
        view
        override(LiquidityManager)
        returns (SpotFactoryStorage.Pair memory pair)
    {
        pair = spotFactory.getQuoteAndBase(address(_managerAddress));
        require(pair.BaseAsset != address(0), "!0x");
    }

    function depositLiquidity(
        IMatchingEngineAMM _pairManager,
        address _payer,
        SpotHouseStorage.Asset _asset,
        uint256 _amount
    ) internal override(LiquidityManager) returns (uint256 amount) {
        if (_amount == 0) return 0;
        SpotFactoryStorage.Pair memory _pairAddress = _getQuoteAndBase(
            _pairManager
        );
        address pairManagerAddress = address(_pairManager);
        if (_asset == SpotHouseStorage.Asset.Quote) {
            if (_pairAddress.QuoteAsset == WBNB) {
                _depositBNB(pairManagerAddress, _amount);
            } else {
                IERC20 quoteAsset = IERC20(_pairAddress.QuoteAsset);
                uint256 _balanceBefore = quoteAsset.balanceOf(
                    pairManagerAddress
                );
                TransferHelper.transferFrom(
                    quoteAsset,
                    _payer,
                    pairManagerAddress,
                    _amount
                );
                uint256 _balanceAfter = quoteAsset.balanceOf(
                    pairManagerAddress
                );
                _amount = _balanceAfter - _balanceBefore;
            }
        } else {
            if (_pairAddress.BaseAsset == WBNB) {
                _depositBNB(pairManagerAddress, _amount);
            } else {
                IERC20 baseAsset = IERC20(_pairAddress.BaseAsset);
                uint256 _balanceBefore = baseAsset.balanceOf(
                    pairManagerAddress
                );
                TransferHelper.transferFrom(
                    baseAsset,
                    _payer,
                    pairManagerAddress,
                    _amount
                );
                uint256 _balanceAfter = baseAsset.balanceOf(pairManagerAddress);
                _amount = _balanceAfter - _balanceBefore;
            }
        }
        return _amount;
    }

    function withdrawLiquidity(
        IMatchingEngineAMM _pairManager,
        address _recipient,
        SpotHouseStorage.Asset _asset,
        uint256 _amount
    ) internal override(LiquidityManager) {
        address user = _msgSender();
        if (_amount == 0) return;
        SpotFactoryStorage.Pair memory _pairAddress = _getQuoteAndBase(
            _pairManager
        );

        address pairManagerAddress = address(_pairManager);
        if (_asset == SpotHouseStorage.Asset.Quote) {
            if (_pairAddress.QuoteAsset == WBNB) {
                _withdrawBNB(_recipient, pairManagerAddress, _amount);
            } else {
                TransferHelper.transferFrom(
                    IERC20(_pairAddress.QuoteAsset),
                    address(_pairManager),
                    _recipient,
                    _amount
                );
            }
        } else {
            if (_pairAddress.BaseAsset == WBNB) {
                _withdrawBNB(_recipient, pairManagerAddress, _amount);
            } else {
                TransferHelper.transferFrom(
                    IERC20(_pairAddress.BaseAsset),
                    address(_pairManager),
                    _recipient,
                    _amount
                );
            }
        }
    }

    function _depositBNB(address _pairManagerAddress, uint256 _amount)
        internal
    {
        require(msg.value >= _amount, Errors.VL_NEED_MORE_BNB);
        IWBNB(WBNB).deposit{value: _amount}();
        assert(IWBNB(WBNB).transfer(_pairManagerAddress, _amount));
    }

    function _withdrawBNB(
        address _trader,
        address _pairManagerAddress,
        uint256 _amount
    ) internal {
        IWBNB(WBNB).transferFrom(
            _pairManagerAddress,
            address(withdrawBNB),
            _amount
        );
        withdrawBNB.withdraw(_trader, _amount);
    }

    function _msgSender()
        internal
        view
        override(ContextUpgradeable, LiquidityManager)
        returns (address)
    {
        return msg.sender;
    }

    function _getWBNBAddress()
        internal
        view
        override(LiquidityManager)
        returns (address)
    {
        return WBNB;
    }

    function _owner(uint256 tokenId)
        internal
        view
        override(LiquidityManager)
        returns (address)
    {
        return ownerOf(tokenId);
    }
}