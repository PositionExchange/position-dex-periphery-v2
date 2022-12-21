/**
 * @author Musket
 */
// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@positionex/posi-token/contracts/VestingScheduleBase.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@positionex/matching-engine/contracts/interfaces/IMatchingEngineAMM.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "../interfaces/IPositionNondisperseLiquidity.sol";
import "../libraries/helper/U128Math.sol";
import "../libraries/liquidity/Liquidity.sol";

interface IPositionReferral {
    /**
     * @dev Record referral.
     */
    function recordReferral(address user, address referrer) external;

    /**
     * @dev Record referral commission.
     */
    function recordReferralCommission(address referrer, uint256 commission)
        external;

    /**
     * @dev Get the referrer address that referred the user.
     */
    function getReferrer(address user) external view returns (address);
}

interface IPosiTreasury {
    function mint(address recipient, uint256 amount) external;
}

interface IPositionStakingDexManager {}

contract PositionStakingDexManager is
    ReentrancyGuardUpgradeable,
    OwnableUpgradeable,
    VestingScheduleBase
{
    using SafeMath for uint256;
    using U128Math for uint128;

    // Info of each user.
    struct UserInfo {
        uint128 amount; // How many LP tokens the user has provided.
        uint128 rewardDebt; // Reward debt. See explanation below.
        uint128 rewardLockedUp; // Reward locked up.
        uint128 nextHarvestUntil; // When can the user harvest again.
        //
        // We do some fancy math here. Basically, any point in time, the amount of Positions
        // entitled to a user but is pending to be distributed is:
        //
        //   pending reward = (user.amount * pool.accPositionPerShare) - user.rewardDebt
        //
        // Whenever a user deposits or withdraws LP tokens to a pool. Here's what happens:
        //   1. The pool's `accPositionPerShare` (and `lastRewardBlock`) gets updated.
        //   2. User receives the pending reward sent to his/her address.
        //   3. User's `amount` gets updated.
        //   4. User's `rewardDebt` gets updated.
    }

    // Info of each pool.
    struct PoolInfo {
        address poolId;
        uint256 totalStaked;
        uint256 allocPoint; // How many allocation points assigned to this pool. Positions to distribute per block.
        uint256 lastRewardBlock; // Last block number that Positions distribution occurs.
        uint256 accPositionPerShare; // Accumulated Positions per share, times 1e12. See below.
        uint16 depositFeeBP; // Deposit fee in basis points
        uint128 harvestInterval; // Harvest interval in seconds
    }

    // The Position TOKEN!
    IERC20 public position;
    IPosiTreasury public posiTreasury;

    //    IPosiStakingManager public posiStakingManager;
    IPositionNondisperseLiquidity public positionNondisperseLiquidity;
    //    IERC721 public liquidityNFT;
    // Dev address.
    address public devAddress;
    // Position tokens created per block.
    uint256 public positionPerBlock;
    // Deposit Fee address
    address public feeAddress;
    // Bonus muliplier for early position makers.
    uint256 public BONUS_MULTIPLIER;
    // Max harvest interval: 14 days.
    uint256 public MAXIMUM_HARVEST_INTERVAL;

    // Info of each pool.
    mapping(address => PoolInfo) public poolInfo;
    // Info of each user that stakes LP tokens.
    mapping(address => mapping(address => UserInfo)) public userInfo;
    address[] public pools;
    // Total allocation points. Must be the sum of all allocation points in all pools.
    uint256 public totalAllocPoint;
    // The block number when Position mining starts.
    uint256 public startBlock;
    // Total locked up rewards
    uint256 public totalLockedUpRewards;

    uint256 public posiStakingPid;

    // Position referral contract address.
    IPositionReferral public positionReferral;
    // Referral commission rate in basis points.
    uint16 public referralCommissionRate;
    // Max referral commission rate: 10%.
    uint16 public MAXIMUM_REFERRAL_COMMISSION_RATE;

    uint256 public stakingMinted;

    uint16 harvestFeeShareRate;
    uint16 public MAXIMUM_HARVEST_FEE_SHARE;

    // user => poolId => nftId[]
    mapping(address => mapping(address => uint256[])) public userNft;
    // nftid => poolId => its index in userNft
    mapping(uint256 => mapping(address => uint256)) public nftOwnedIndex;

    /// nftid => power
    mapping(uint256 => uint256) public powerNft;

    event Deposit(address indexed user, address indexed pid, uint256 amount);
    event Withdraw(address indexed user, address indexed pid, uint256 amount);
    event EmergencyWithdraw(
        address indexed user,
        address indexed pid,
        uint256 amount
    );
    event EmissionRateUpdated(
        address indexed caller,
        uint256 previousAmount,
        uint256 newAmount
    );
    event ReferralCommissionPaid(
        address indexed user,
        address indexed referrer,
        uint256 commissionAmount
    );
    event RewardLockedUp(
        address indexed user,
        address indexed pid,
        uint256 amountLockedUp
    );
    event NFTReceived(
        address operator,
        address from,
        uint256 tokenId,
        bytes data
    );

    function initialize(
        IERC20 _position,
        IPositionNondisperseLiquidity _positionLiquidityManager,
        uint256 _startBlock
    ) external initializer {
        __ReentrancyGuard_init();
        __Ownable_init();

        position = _position;
        startBlock = _startBlock;

        positionNondisperseLiquidity = _positionLiquidityManager;

        devAddress = _msgSender();
        feeAddress = _msgSender();

        referralCommissionRate = 100;
        MAXIMUM_REFERRAL_COMMISSION_RATE = 1000;

        harvestFeeShareRate = 1;
        MAXIMUM_HARVEST_FEE_SHARE = 10000;

        BONUS_MULTIPLIER = 1;

        MAXIMUM_HARVEST_INTERVAL = 14 days;

        totalAllocPoint = 0;
    }

    function poolLength() external view returns (uint256) {
        return pools.length;
    }

    //    // get position per block form the staking manager share to the contract

    function getPlayerIds(address owner, address pid)
        public
        view
        returns (uint256[] memory)
    {
        return userNft[owner][pid];
    }

    function onERC721Received(
        address operator,
        address from,
        uint256 tokenId,
        bytes memory data
    ) public returns (bytes4) {
        emit NFTReceived(operator, from, tokenId, data);
        return
            bytes4(
                keccak256("onERC721Received(address,address,uint256,bytes)")
            );
    }

    //------------------------------------------------------------------------------------------------------------------
    // ONLY_OWNER FUNCTIONS
    //------------------------------------------------------------------------------------------------------------------

    function setPositionPerBlock(uint256 _positionPerBlock) public onlyOwner {
        massUpdatePools();
        positionPerBlock = _positionPerBlock;
    }

    function setPositionTreasury(IPosiTreasury _posiTreasury) public onlyOwner {
        posiTreasury = _posiTreasury;
    }

    function setPositionEarningToken(IERC20 _positionEarningToken)
        public
        onlyOwner
    {
        position = _positionEarningToken;
    }

    function updatePositionLiquidityPool(address _newLiquidityPool)
        public
        onlyOwner
    {
        positionNondisperseLiquidity = IPositionNondisperseLiquidity(
            _newLiquidityPool
        );
    }

    function updateHarvestFeeShareRate(uint16 newRate) public onlyOwner {
        // max share 10%
        require(newRate <= 1000, "!F");
        harvestFeeShareRate = newRate;
    }

    function setPosiStakingPid(uint256 _posiStakingPid) public onlyOwner {
        posiStakingPid = _posiStakingPid;
    }

    // Add a new lp to the pool. Can only be called by the owner.
    // XXX DO NOT add the same LP token more than once. Rewards will be messed up if you do.
    function add(
        address _poolId,
        uint256 _allocPoint,
        uint16 _depositFeeBP,
        uint128 _harvestInterval,
        bool _withUpdate
    ) public onlyOwner {
        require(
            _depositFeeBP <= 10000,
            "add: invalid deposit fee basis points"
        );
        require(
            _harvestInterval <= MAXIMUM_HARVEST_INTERVAL,
            "add: invalid harvest interval"
        );
        require(poolInfo[_poolId].poolId == address(0x00), "pool created");
        if (_withUpdate) {
            massUpdatePools();
        }
        uint256 lastRewardBlock = block.number > startBlock
            ? block.number
            : startBlock;
        totalAllocPoint = totalAllocPoint.add(_allocPoint);
        pools.push(_poolId);
        poolInfo[_poolId] = PoolInfo({
            poolId: _poolId,
            totalStaked: 0,
            allocPoint: _allocPoint,
            lastRewardBlock: lastRewardBlock,
            accPositionPerShare: 0,
            depositFeeBP: _depositFeeBP,
            harvestInterval: _harvestInterval
        });
    }

    // Update the given pool's Position allocation point and deposit fee. Can only be called by the owner.
    function set(
        address _pid,
        uint256 _allocPoint,
        uint16 _depositFeeBP,
        uint128 _harvestInterval,
        bool _withUpdate
    ) public onlyOwner {
        require(
            _depositFeeBP <= 10000,
            "set: invalid deposit fee basis points"
        );
        require(
            _harvestInterval <= MAXIMUM_HARVEST_INTERVAL,
            "set: invalid harvest interval"
        );
        if (_withUpdate) {
            massUpdatePools();
        }
        totalAllocPoint = totalAllocPoint.sub(poolInfo[_pid].allocPoint).add(
            _allocPoint
        );
        poolInfo[_pid].allocPoint = _allocPoint;
        poolInfo[_pid].depositFeeBP = _depositFeeBP;
        poolInfo[_pid].harvestInterval = _harvestInterval;
    }

    // Return reward multiplier over the given _from to _to block.
    function getMultiplier(uint256 _from, uint256 _to)
        public
        view
        returns (uint256)
    {
        return _to.sub(_from).mul(BONUS_MULTIPLIER);
    }

    // View function to see pending Positions on frontend.
    function pendingPosition(address _pid, address _user)
        external
        view
        returns (uint256)
    {
        PoolInfo memory pool = poolInfo[_pid];
        UserInfo memory user = userInfo[_pid][_user];
        uint256 accPositionPerShare = pool.accPositionPerShare;
        uint256 lpSupply = pool.totalStaked;
        if (block.number > pool.lastRewardBlock && lpSupply != 0) {
            uint256 multiplier = getMultiplier(
                pool.lastRewardBlock,
                block.number
            );
            uint256 positionReward = multiplier
                .mul(positionPerBlock)
                .mul(pool.allocPoint)
                .div(totalAllocPoint);
            accPositionPerShare = accPositionPerShare.add(
                positionReward.mul(1e12).div(lpSupply)
            );
        }
        uint256 pending = user.amount.mul(accPositionPerShare).div(1e12).sub(
            user.rewardDebt
        );
        return pending.add(user.rewardLockedUp);
    }

    // View function to see if user can harvest Positions.
    function canHarvest(address _pid, address _user)
        public
        view
        returns (bool)
    {
        UserInfo memory user = userInfo[_pid][_user];
        return block.timestamp >= user.nextHarvestUntil;
    }

    // Update reward variables for all pools. Be careful of gas spending!
    function massUpdatePools() public {
        uint256 length = pools.length;
        for (uint256 i = 0; i < length; ++i) {
            updatePool(pools[i]);
        }
    }

    // Update reward variables of the given pool to be up-to-date.
    function updatePool(address _pid) public {
        PoolInfo storage pool = poolInfo[_pid];
        // SLOAD
        PoolInfo memory _pool = pool;
        if (block.number <= _pool.lastRewardBlock) {
            return;
        }
        uint256 lpSupply = _pool.totalStaked;
        if (lpSupply == 0 || _pool.allocPoint == 0) {
            pool.lastRewardBlock = block.number;
            return;
        }
        uint256 multiplier = getMultiplier(pool.lastRewardBlock, block.number);
        uint256 positionReward = multiplier
            .mul(positionPerBlock)
            .mul(pool.allocPoint)
            .div(totalAllocPoint);

        stakingMinted = stakingMinted.add(
            positionReward.add(positionReward.div(10))
        );
        posiTreasury.mint(address(this), positionReward);
        // transfer 10% to the dev wallet
        posiTreasury.mint(devAddress, positionReward.div(10));
        pool.accPositionPerShare = pool.accPositionPerShare.add(
            positionReward.mul(1e12).div(lpSupply)
        );
        pool.lastRewardBlock = block.number;
    }

    // Deposit LP tokens to PosiStakingManager for Position allocation.
    function stake(uint256 _nftId) public nonReentrant {
        _stake(_nftId, address(0));
    }

    function stakeWithReferral(uint256 _nftId, address _referrer)
        public
        nonReentrant
    {
        _stake(_nftId, _referrer);
    }

    function _stake(uint256 _nftId, address _referrer) internal {
        UserLiquidity.Data memory nftData = _getLiquidityManager(_nftId);
        address poolAddress = address(nftData.pool);
        require(
            poolInfo[poolAddress].poolId != address(0x00),
            "pool not created"
        );
        require(poolAddress != address(0x0), "invalid liquidity pool");
        uint256[] storage nftIds = userNft[msg.sender][poolAddress];
        if (nftIds.length == 0) {
            nftIds.push(0);
            nftOwnedIndex[0][poolAddress] = 0;
        }
        nftIds.push(_nftId);
        nftOwnedIndex[_nftId][poolAddress] = nftIds.length - 1;

        PoolInfo storage pool = poolInfo[poolAddress];
        UserInfo storage user = userInfo[poolAddress][msg.sender];
        updatePool(poolAddress);
        if (
            nftData.liquidity > 0 &&
            address(positionReferral) != address(0) &&
            _referrer != address(0) &&
            _referrer != msg.sender
        ) {
            positionReferral.recordReferral(msg.sender, _referrer);
        }
        payOrLockupPendingPosition(poolAddress);
        _transferNFTIn(_nftId);
        uint128 power = _calculatePower(
            nftData.indexedPipRange,
            uint32(nftData.pool.currentIndexedPipRange()),
            nftData.liquidity
        );
        user.amount = user.amount.add(power);
        user.rewardDebt = uint128(
            user.amount.mul(pool.accPositionPerShare).div(1e12)
        );
        pool.totalStaked += power;
        powerNft[_nftId] = power;
        emit Deposit(msg.sender, poolAddress, _nftId);
    }

    // Withdraw LP tokens from PosiStakingManager.
    function unstake(uint256 _nftId) public nonReentrant {
        _unstake(_nftId);
    }

    function _unstake(uint256 _nftId) internal {
        UserLiquidity.Data memory nftData = _getLiquidityManager(_nftId);
        address poolAddress = address(nftData.pool);

        PoolInfo storage pool = poolInfo[poolAddress];
        UserInfo storage user = userInfo[poolAddress][msg.sender];

        removeNftFromUser(_nftId, poolAddress);

        require(user.amount >= nftData.liquidity, "withdraw: not good");

        updatePool(poolAddress);

        payOrLockupPendingPosition(poolAddress);

        user.amount = user.amount.sub(nftData.liquidity);
        _transferNFTOut(_nftId);

        user.rewardDebt = uint128(
            user.amount.mul(pool.accPositionPerShare).div(1e12)
        );
        pool.totalStaked -= nftData.liquidity;

        emit Withdraw(msg.sender, poolAddress, _nftId);
    }

    function withdraw(address pid) public nonReentrant {
        _withdraw(pid);
    }

    function _withdraw(address pid) internal {
        uint256[] memory nfts = userNft[msg.sender][pid];
        for (uint8 index = 1; index < nfts.length; index++) {
            if (nfts[index] > 0) {
                _unstake(nfts[index]);
            }
        }
    }

    function harvest(address pid) public nonReentrant {
        _harvest(pid);
    }

    function _harvest(address pid) internal {
        PoolInfo storage pool = poolInfo[pid];
        UserInfo storage user = userInfo[pid][msg.sender];
        require(user.amount > 0, "No nft staked");
        updatePool(pid);
        payOrLockupPendingPosition(pid);
        user.rewardDebt = uint128(
            user.amount.mul(pool.accPositionPerShare).div(1e12)
        );
    }

    function exit(address pid) external nonReentrant {
        _withdraw(pid);
        //        _harvest(pid);
    }

    // Withdraw without caring about rewards. EMERGENCY ONLY.
    function emergencyWithdraw(address _pid) public nonReentrant {
        UserInfo storage user = userInfo[_pid][msg.sender];
        uint256 amount = user.amount;
        user.amount = 0;
        user.rewardDebt = 0;
        user.rewardLockedUp = 0;
        user.nextHarvestUntil = 0;
        uint256[] memory nfts = userNft[msg.sender][_pid];
        for (uint8 index = 1; index < nfts.length; index++) {
            uint256 _nftId = nfts[index];
            if (_nftId > 0) {
                _transferNFTOut(_nftId);
                emit EmergencyWithdraw(msg.sender, _pid, _nftId);
            }
        }
    }

    function isOwnerWhenStaking(address user, uint256 nftId)
        external
        view
        returns (bool, address)
    {
        UserLiquidity.Data memory nftData = _getLiquidityManager(nftId);
        uint256 indexNftId = nftOwnedIndex[nftId][address(nftData.pool)];
        return (
            userNft[user][address(nftData.pool)][indexNftId] == nftId,
            msg.sender
        );
    }

    function updateStakingLiquidity(
        address user,
        uint256 tokenId,
        address poolId,
        uint128 deltaLiquidityModify,
        IPositionNondisperseLiquidity.ModifyType modifyType
    ) external returns (address caller) {
        require(
            msg.sender == address(positionNondisperseLiquidity),
            "only concentrated liquidity"
        );
        PoolInfo storage pool = poolInfo[poolId];
        UserInfo storage user = userInfo[poolId][user];

        updatePool(poolId);

        payOrLockupPendingPosition(poolId);

        user.amount = modifyType == ILiquidityManager.ModifyType.INCREASE
            ? user.amount.add(deltaLiquidityModify)
            : user.amount.sub(deltaLiquidityModify);

        user.rewardDebt = uint128(
            user.amount.mul(pool.accPositionPerShare).div(1e12)
        );

        pool.totalStaked = modifyType == ILiquidityManager.ModifyType.INCREASE
            ? pool.totalStaked + deltaLiquidityModify
            : pool.totalStaked - deltaLiquidityModify;

        if (positionNondisperseLiquidity.ownerOf(tokenId) == address(this)) {}

        return msg.sender;
    }

    // Pay or lockup pending Positions.
    function payOrLockupPendingPosition(address _pid) internal {
        PoolInfo storage pool = poolInfo[_pid];
        UserInfo storage user = userInfo[_pid][msg.sender];

        if (user.nextHarvestUntil == 0) {
            user.nextHarvestUntil =
                uint128(block.timestamp) +
                pool.harvestInterval;
        }

        uint256 pending = user
            .amount
            .mul(pool.accPositionPerShare)
            .div(1e12)
            .sub(user.rewardDebt);
        if (canHarvest(_pid, msg.sender)) {
            if (pending > 0 || user.rewardLockedUp > 0) {
                uint256 totalRewards = pending.add(user.rewardLockedUp);

                // reset lockup
                totalLockedUpRewards = totalLockedUpRewards.sub(
                    user.rewardLockedUp
                );
                user.rewardLockedUp = 0;
                user.nextHarvestUntil =
                    uint128(block.timestamp) +
                    pool.harvestInterval;

                // send rewards
                safePositionTransfer(msg.sender, totalRewards);
                payReferralCommission(msg.sender, totalRewards);
            }
        } else if (pending > 0) {
            user.rewardLockedUp = uint128(
                user.rewardLockedUp.add(uint128(pending))
            );
            totalLockedUpRewards = totalLockedUpRewards.add(pending);
            emit RewardLockedUp(msg.sender, _pid, pending);
        }
    }

    function removeNftFromUser(uint256 _nftId, address _pid) internal {
        uint256[] memory _nftIds = userNft[msg.sender][_pid];
        uint256 nftIndex = nftOwnedIndex[_nftId][_pid];
        require(_nftIds[nftIndex] == _nftId, "not gegoId owner");
        uint256 _nftArrLength = _nftIds.length - 1;
        uint256 tailId = _nftIds[_nftArrLength];
        userNft[msg.sender][_pid][nftIndex] = tailId;
        userNft[msg.sender][_pid][_nftArrLength] = 0;
        userNft[msg.sender][_pid].pop();
        nftOwnedIndex[tailId][_pid] = nftIndex;
        nftOwnedIndex[_nftId][_pid] = 0;
    }

    // Safe position transfer function, just in case if rounding error causes pool to not have enough Positions.
    function safePositionTransfer(address _to, uint256 _amount) internal {
        uint256 positionBal = position.balanceOf(address(this));
        if (_amount > positionBal) {
            _amount = positionBal;
        }
        if (_isWhitelistVesting(msg.sender)) {
            position.transfer(_to, _amount);
        } else {
            // receive 5%
            position.transfer(_to, (_amount * 5) / 100);
            _addSchedules(_to, _amount);
        }
    }

    // Update dev address by the previous dev.
    function setDevAddress(address _devAddress) public {
        require(msg.sender == devAddress, "setDevAddress: FORBIDDEN");
        require(_devAddress != address(0), "setDevAddress: ZERO");
        devAddress = _devAddress;
    }

    function setFeeAddress(address _feeAddress) public {
        require(msg.sender == feeAddress, "setFeeAddress: FORBIDDEN");
        require(_feeAddress != address(0), "setFeeAddress: ZERO");
        feeAddress = _feeAddress;
    }

    // Update the position referral contract address by the owner
    function setPositionReferral(IPositionReferral _positionReferral)
        public
        onlyOwner
    {
        positionReferral = _positionReferral;
    }

    // Update referral commission rate by the owner
    function setReferralCommissionRate(uint16 _referralCommissionRate)
        public
        onlyOwner
    {
        require(
            _referralCommissionRate <= MAXIMUM_REFERRAL_COMMISSION_RATE,
            "setReferralCommissionRate: invalid referral commission rate basis points"
        );
        referralCommissionRate = _referralCommissionRate;
    }

    // Pay referral commission to the referrer who referred this user.
    function payReferralCommission(address _user, uint256 _pending) internal {
        if (
            address(positionReferral) != address(0) &&
            referralCommissionRate > 0
        ) {
            address referrer = positionReferral.getReferrer(_user);
            uint256 commissionAmount = _pending.mul(referralCommissionRate).div(
                10000
            );

            if (referrer != address(0) && commissionAmount > 0) {
                if (position.balanceOf(address(this)) < commissionAmount) {
                    posiTreasury.mint(address(this), commissionAmount);
                }
                position.transfer(referrer, commissionAmount);
                positionReferral.recordReferralCommission(
                    referrer,
                    commissionAmount
                );
                emit ReferralCommissionPaid(_user, referrer, commissionAmount);
            }
        }
    }

    function _transferNFTOut(uint256 id) internal {
        positionNondisperseLiquidity.safeTransferFrom(
            address(this),
            msg.sender,
            id
        );
    }

    function _transferNFTIn(uint256 id) internal {
        positionNondisperseLiquidity.safeTransferFrom(
            msg.sender,
            address(this),
            id
        );
    }

    function _transferLockedToken(address _to, uint192 _amount)
        internal
        override
    {
        position.transfer(_to, _amount);
    }

    function _getLiquidityManager(uint256 tokenId)
        internal
        view
        returns (UserLiquidity.Data memory data)
    {
        (
            data.liquidity,
            data.indexedPipRange,
            data.feeGrowthBase,
            data.feeGrowthQuote,
            data.pool
        ) = positionNondisperseLiquidity.concentratedLiquidity(tokenId);
    }

    function _calculatePower(
        uint32 indexedPipRangeNft,
        uint32 currentIndexedPipRange,
        uint256 liquidity
    ) internal view returns (uint128 power) {
        if (indexedPipRangeNft > currentIndexedPipRange) {
            power = uint128(
                liquidity / ((indexedPipRangeNft - currentIndexedPipRange) + 1)
            );
        } else {
            power = uint128(
                liquidity / ((currentIndexedPipRange - indexedPipRangeNft) + 1)
            );
        }
    }
}
