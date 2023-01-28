/**
 * @author Musket
 * @author NiKa
 */
// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.9;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@positionex/matching-engine/contracts/interfaces/IMatchingEngineAMM.sol";
import "@positionex/matching-engine/contracts/libraries/helper/FixedPoint128.sol";
import "@positionex/matching-engine/contracts/libraries/helper/Require.sol";

import "./interfaces/IWBNB.sol";
import "./libraries/types/SpotHouseStorage.sol";
import {DexErrors} from "./libraries/helper/DexErrors.sol";
import {TransferHelper} from "./libraries/helper/TransferHelper.sol";
import "./libraries/helper/Convert.sol";
import "./interfaces/ISpotHouse.sol";
import "./implement/SpotDex.sol";
import "./libraries/extensions/StrategyFee.sol";
import "./libraries/extensions/BuyBackAndBurn.sol";

contract SpotHouse is
    PausableUpgradeable,
    ReentrancyGuardUpgradeable,
    OwnableUpgradeable,
    StrategyFee,
    BuyBackAndBurn,
    SpotDex
{
    using Convert for uint256;

    function initialize() public initializer {
        __ReentrancyGuard_init();
        __Ownable_init();
        __Pausable_init();
        _initStrategyFee(20);
        operator = msg.sender;
    }

    modifier onlyOperator() {
        Require._require(_msgSender() == operator, DexErrors.DEX_ONLY_OPERATOR);
        _;
    }

    function openLimitOrder(
        IMatchingEngineAMM pairManager,
        Side side,
        uint256 quantity,
        uint128 pip
    ) public payable override(SpotDex) nonReentrant {
        super.openLimitOrder(pairManager, side, quantity, pip);
    }

    function openBuyLimitOrderWithQuote(
        IMatchingEngineAMM pairManager,
        Side side,
        uint256 quoteAmount,
        uint128 pip
    ) public payable override(SpotDex) nonReentrant {
        super.openBuyLimitOrderWithQuote(pairManager, side, quoteAmount, pip);
    }

    function openMarketOrder(
        IMatchingEngineAMM pairManager,
        Side side,
        uint256 quantity
    ) public payable override(SpotDex) nonReentrant {
        super.openMarketOrder(pairManager, side, quantity);
    }

    function cancelAllLimitOrder(IMatchingEngineAMM pairManager)
        public
        override(SpotDex)
        nonReentrant
    {
        super.cancelAllLimitOrder(pairManager);
    }

    function cancelLimitOrder(
        IMatchingEngineAMM pairManager,
        uint64 orderIdx,
        uint128 pip
    ) public override(SpotDex) nonReentrant {
        super.cancelLimitOrder(pairManager, orderIdx, pip);
    }

    function claimAsset(IMatchingEngineAMM pairManager)
        public
        override(SpotDex)
        nonReentrant
    {
        super.claimAsset(pairManager);
    }

    //------------------------------------------------------------------------------------------------------------------
    // ONLY OWNER FUNCTIONS
    //------------------------------------------------------------------------------------------------------------------

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function setOperator(address _operator) external onlyOwner {
        operator = _operator;
    }

    //------------------------------------------------------------------------------------------------------------------
    // ONLY OPERATOR FUNCTIONS
    //------------------------------------------------------------------------------------------------------------------

    /**
     * @dev see {BuyBackAndBurn-setPositionRouter}
     */
    function setPositionRouter(IPositionRouter _positionRouter)
        public
        override(BuyBackAndBurn)
        onlyOperator
    {
        super.setPositionRouter(_positionRouter);
    }

    /**
     * @dev see {BuyBackAndBurn-setPosiToken}
     */
    function setPosiToken(IERC20 _posiToken)
        public
        override(BuyBackAndBurn)
        onlyOperator
    {
        super.setPosiToken(_posiToken);
    }

    function setFactory(address _factoryAddress) external onlyOperator {
        require(_factoryAddress != address(0), DexErrors.DEX_EMPTY_ADDRESS);
        spotFactory = ISpotFactory(_factoryAddress);
    }

    function setWBNB(address _wbnb) external onlyOperator {
        WBNB = _wbnb;
    }

    function setWithdrawBNB(IWithdrawBNB _withdrawBNB) external onlyOperator {
        withdrawBNB = _withdrawBNB;
    }

    function claimFee(IMatchingEngineAMM pairManager, address recipient)
        external
        onlyOperator
    {
        SpotFactoryStorage.Pair memory _pairAddress = _getQuoteAndBase(
            pairManager
        );
        address pairManagerAddress = address(pairManager);

        (uint256 baseFeeFunding, uint256 quoteFeeFunding) = pairManager
            .getFee();

        if (_pairAddress.BaseAsset == WBNB) {
            _withdrawBNB(recipient, pairManagerAddress, baseFeeFunding);
        } else {
            TransferHelper.transferFrom(
                IERC20(_pairAddress.BaseAsset),
                pairManagerAddress,
                recipient,
                baseFeeFunding
            );
        }
        if (_pairAddress.QuoteAsset == WBNB) {
            _withdrawBNB(recipient, pairManagerAddress, quoteFeeFunding);
        } else {
            TransferHelper.transferFrom(
                IERC20(_pairAddress.QuoteAsset),
                pairManagerAddress,
                recipient,
                quoteFeeFunding
            );
        }

        pairManager.resetFee(baseFeeFunding, quoteFeeFunding);
    }

    function updateDiscountStrategy(FeeDiscount[] memory newStrategyDiscount)
        public
        override(StrategyFee)
        onlyOperator
    {
        super.updateDiscountStrategy(newStrategyDiscount);
    }

    function setFee(uint16 _defaultFeePercentage)
        public
        override(StrategyFee)
        onlyOperator
    {
        super.setFee(_defaultFeePercentage);
    }

    /**
     * @dev see {BuyBackAndBurn-buyBackAndBurn}
     */
    function buyBackAndBurn(
        IMatchingEngineAMM pairManager,
        address[] memory pathBuyBack
    ) external override(BuyBackAndBurn) onlyOperator {
        SpotFactoryStorage.Pair memory _pair = _getQuoteAndBase(pairManager);
        bool isBase = pathBuyBack[0] == _pair.BaseAsset;

        (uint256 baseFeeFunding, uint256 quoteFeeFunding) = pairManager
            .getFee();

        uint256 amount = isBase ? baseFeeFunding : quoteFeeFunding;
        _buyBackAndBurn(pathBuyBack, amount);

        if (isBase) {
            pairManager.increaseBaseFeeFunding(amount);
        } else {
            pairManager.increaseQuoteFeeFunding(amount);
        }
    }

    //------------------------------------------------------------------------------------------------------------------
    // INTERNAL FUNCTIONS
    //------------------------------------------------------------------------------------------------------------------

    function _getQuoteAndBase(IMatchingEngineAMM _managerAddress)
        internal
        view
        override(SpotDex)
        returns (SpotFactoryStorage.Pair memory pair)
    {
        pair = spotFactory.getQuoteAndBase(address(_managerAddress));
        require(pair.BaseAsset != address(0), DexErrors.DEX_EMPTY_ADDRESS);
    }

    function _getFee() internal view override(SpotDex) returns (uint16) {
        return getFeeDiscount();
    }

    function condition() internal view override(StrategyFee) returns (uint16) {
        return 0;
    }

    function _msgSender()
        internal
        view
        override(ContextUpgradeable, SpotDex)
        returns (address)
    {
        return msg.sender;
    }

    function _depositBNB(address _pairManagerAddress, uint256 _amount)
        internal
        override(SpotDex)
    {
        require(msg.value >= _amount, DexErrors.DEX_NEED_MORE_BNB);
        IWBNB(WBNB).deposit{value: _amount}();
        assert(IWBNB(WBNB).transfer(_pairManagerAddress, _amount));
    }

    function _withdrawBNB(
        address _trader,
        address _pairManagerAddress,
        uint256 _amount
    ) internal override(SpotDex) {
        IWBNB(WBNB).transferFrom(
            _pairManagerAddress,
            address(withdrawBNB),
            _amount
        );
        withdrawBNB.withdraw(_trader, _amount);
    }

    function _deposit(
        IMatchingEngineAMM _pairManager,
        address _payer,
        Asset _asset,
        uint256 _amount
    ) internal override(SpotDex) returns (uint256) {
        if (_amount == 0) return 0;
        SpotFactoryStorage.Pair memory _pairAddress = _getQuoteAndBase(
            _pairManager
        );

        address pairManagerAddress = address(_pairManager);
        if (_asset == Asset.Quote) {
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
                _amount =
                    quoteAsset.balanceOf(pairManagerAddress) -
                    _balanceBefore;
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
                _amount =
                    baseAsset.balanceOf(pairManagerAddress) -
                    _balanceBefore;
            }
        }
        return _amount;
    }

    function _withdraw(
        IMatchingEngineAMM _pairManager,
        address _recipient,
        Asset asset,
        uint256 _amount,
        bool isTakeFee
    ) internal override(SpotDex) {
        if (_amount == 0) return;
        SpotFactoryStorage.Pair memory _pairAddress = _getQuoteAndBase(
            _pairManager
        );

        if (isTakeFee) {
            uint256 feeCalculatedAmount = _feeCalculator(_amount, _getFee());
            _amount -= feeCalculatedAmount;
            _increaseFee(_pairManager, feeCalculatedAmount, asset);
        }
        address pairManagerAddress = address(_pairManager);
        if (asset == Asset.Quote) {
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

    function _withdrawCancelAll(
        IMatchingEngineAMM _pairManager,
        address _recipient,
        Asset asset,
        uint256 _amountRefund,
        uint256 _amountFilled
    ) internal override(SpotDex) {
        if (_amountFilled > 0) {
            uint256 feeCalculatedAmount = _feeCalculator(
                _amountFilled,
                _getFee()
            );
            _amountFilled -= feeCalculatedAmount;
            _increaseFee(_pairManager, feeCalculatedAmount, asset);
        }

        _withdraw(
            _pairManager,
            _recipient,
            asset,
            _amountRefund + _amountFilled,
            false
        );
    }

    // _feeCalculator calculate fee
    function _feeCalculator(uint256 _amount, uint16 _fee)
        internal
        pure
        returns (uint256 feeCalculatedAmount)
    {
        if (_fee == 0) {
            return 0;
        }
        feeCalculatedAmount = (_fee * _amount) / FixedPoint128.BASIC_POINT_FEE;
    }

    function _increaseFee(
        IMatchingEngineAMM _pairManager,
        uint256 _fee,
        Asset asset
    ) internal {
        if (asset == Asset.Quote && _fee > 0) {
            _pairManager.increaseQuoteFeeFunding(_fee);
        }
        if (asset == Asset.Base && _fee > 0) {
            _pairManager.increaseBaseFeeFunding(_fee);
        }
    }
}
