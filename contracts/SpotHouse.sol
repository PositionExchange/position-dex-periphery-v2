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

import "./interfaces/IWBNB.sol";
import "./libraries/types/SpotHouseStorage.sol";
import {Errors} from "./libraries/helper/Errors.sol";
import {TransferHelper} from "./libraries/helper/TransferHelper.sol";

import "hardhat/console.sol";
import "./libraries/helper/Convert.sol";
import "./interfaces/ISpotHouse.sol";
import "./implement/SpotDex.sol";
import "./libraries/extensions/StrategyFee.sol";

contract SpotHouse is
    PausableUpgradeable,
    ReentrancyGuardUpgradeable,
    OwnableUpgradeable,
    StrategyFee,
    SpotDex
{
    using Convert for uint256;

    modifier onlyRouter() {
        require(_msgSender() == positionRouter, "!OR");
        _;
    }

    function initialize() public initializer {
        __ReentrancyGuard_init();
        __Ownable_init();
        __Pausable_init();
        _initStrategyFee(300);

        feeBasis = 10000;
        //        fee = 20;
     }

    function openLimitOrder(
        IMatchingEngineAMM pairManager,
        Side side,
        uint256 quantity,
        uint128 pip
    ) public payable override(SpotDex) nonReentrant {
        super.openLimitOrder(pairManager, side, quantity, pip);
    }

    function openBuyLimitOrderExactInput(
        IMatchingEngineAMM pairManager,
        Side side,
        uint256 quantity,
        uint128 pip
    ) public payable override(SpotDex) nonReentrant {
        super.openBuyLimitOrderExactInput(pairManager, side, quantity, pip);
    }

    function openMarketOrder(
        IMatchingEngineAMM _pairManager,
        Side _side,
        uint256 _quantity
    ) public payable override(SpotDex) nonReentrant {
        super.openMarketOrder(_pairManager, _side, _quantity);
    }

    function openMarketOrder(
        IMatchingEngineAMM _pairManager,
        Side _side,
        uint256 _quantity,
        address _payer,
        address _recipient
    )
        public
        payable
        virtual
        override(SpotDex)
        nonReentrant
        onlyRouter
        returns (uint256[] memory)
    {
        return
            super.openMarketOrder(
                _pairManager,
                _side,
                _quantity,
                _payer,
                _recipient
            );
    }

    function openMarketOrderWithQuote(
        IMatchingEngineAMM _pairManager,
        Side _side,
        uint256 _quoteAmount
    ) public payable override(SpotDex) nonReentrant {
        super.openMarketOrderWithQuote(_pairManager, _side, _quoteAmount);
    }

    function openMarketOrderWithQuote(
        IMatchingEngineAMM _pairManager,
        Side _side,
        uint256 _quoteAmount,
        address _payer,
        address _recipient
    )
        public
        payable
        override(SpotDex)
        nonReentrant
        onlyRouter
        returns (uint256[] memory)
    {
        return
            super.openMarketOrderWithQuote(
                _pairManager,
                _side,
                _quoteAmount,
                _payer,
                _recipient
            );
    }

    function cancelAllLimitOrder(IMatchingEngineAMM _pairManager)
        public
        override(SpotDex)
        nonReentrant
    {
        super.cancelAllLimitOrder(_pairManager);
    }

    function cancelLimitOrder(
        IMatchingEngineAMM _pairManager,
        uint64 _orderIdx,
        uint128 _pip
    ) public override(SpotDex) nonReentrant {
        super.cancelLimitOrder(_pairManager, _orderIdx, _pip);
    }

    function claimAsset(IMatchingEngineAMM _pairManager)
        public
        override(SpotDex)
        nonReentrant
    {
        super.claimAsset(_pairManager);
    }

    function _getQuoteAndBase(IMatchingEngineAMM _managerAddress)
        internal
        view
        override(SpotDex)
        returns (SpotFactoryStorage.Pair memory pair)
    {
        pair = spotFactory.getQuoteAndBase(address(_managerAddress));
        require(pair.BaseAsset != address(0), "!0x");
    }

    //------------------------------------------------------------------------------------------------------------------
    // ONLY OWNER FUNCTIONS
    //------------------------------------------------------------------------------------------------------------------

    function setWithdrawBNB(IWithdrawBNB _withdrawBNB) external onlyOwner {
        withdrawBNB = _withdrawBNB;
    }

    function setRouter(address _positionRouter) external onlyOwner {
        positionRouter = _positionRouter;
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function setFactory(address _factoryAddress) external override onlyOwner {
        require(_factoryAddress != address(0), Errors.VL_EMPTY_ADDRESS);
        spotFactory = ISpotFactory(_factoryAddress);
    }

    function updateFee(uint16 _fee) external override onlyOwner {
        //max fee can be is 10%
        require(_fee <= 1000, "!F");
        fee = _fee;
    }

    function setWBNB(address _wbnb) external onlyOwner {
        WBNB = _wbnb;
    }

    function claimFee(
        IMatchingEngineAMM pairManager,
        uint256 feeBase,
        uint256 feeQuote,
        address recipient
    ) external onlyOwner {
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

    //------------------------------------------------------------------------------------------------------------------
    // INTERNAL FUNCTIONS
    //------------------------------------------------------------------------------------------------------------------

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
        require(msg.value >= _amount, Errors.VL_NEED_MORE_BNB);
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
        uint256 _fee;
        uint128 _feeBasis = feeBasis;
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
            uint256 feeCalculatedAmount = _feeCalculator(_amountFilled, fee);
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
        view
        returns (uint256 feeCalculatedAmount)
    {
        if (_fee == 0) {
            return 0;
        }
        feeCalculatedAmount = (_fee * _amount) / feeBasis;
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
