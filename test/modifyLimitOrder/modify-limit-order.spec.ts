import {
    ForkMatchingEngineAMM,
    KillerPosition,
    MatchingEngineAMM, MockPairUni, MockTokenReward, MockTokenTreasury,
    MockUniRouter, PositionNondisperseLiquidity, PositionRouter,
    PositionSpotFactory, PositionStakingDexManager, SpotHouse,
} from "../../typeChain";
import {deployContract, getAccount, SIDE, toEther, toWei} from "../utils/utils";
import {deployMockReflexToken, deployMockToken, deployMockWrappedBNB} from "../utils/mock";
import {BASIS_POINT} from "../liquidity/test-liquidity";
import {ethers} from "hardhat";
import {SignerWithAddress} from "@nomiclabs/hardhat-ethers/signers";
import {mine} from "@nomicfoundation/hardhat-network-helpers";
import {boolean} from "hardhat/internal/core/params/argumentTypes";
import {BigNumber} from "ethers";


enum ActionType {

    Decrease = 0,
    Increase = 1,
    Shift = 2
}

interface LimitOrder {
    isBuy: boolean,
    pip: number,
    quantity: number
}

interface Pending {
    isBuy: boolean,
    pip: number,
    quantity: number,
    orderIdOfTrader: number,
    partialFilled: boolean



}

describe("killer-position", async function () {


    let factory: PositionSpotFactory;
    let killer: KillerPosition;
    let pairPosiBusd: ForkMatchingEngineAMM;
    let pair: ForkMatchingEngineAMM;
    let dexNFT: PositionNondisperseLiquidity;
    let uniRouter: MockUniRouter;
    let mockPairUni: MockPairUni;
    let staking: PositionStakingDexManager
    let spotHouse: SpotHouse;
    let posiRouter: PositionRouter


    let rewardToken: MockTokenReward;
    let treasury: MockTokenTreasury;


    let quote: any;
    let base: any;
    let reflex: any;
    let wbnb: any
    let users: any[] = [];
    let deployer: SignerWithAddress;


    beforeEach(async () => {

        users = await getAccount() as unknown as SignerWithAddress[];


        deployer = users[0];


        deployer = users[0];
        spotHouse = await deployContract("SpotHouse");
        await spotHouse.initialize();


        pair = await deployContract("ForkMatchingEngineAMM");

        pairPosiBusd = await deployContract("ForkMatchingEngineAMM");

        factory = await deployContract("PositionSpotFactory");
        await factory.initialize();


        dexNFT = await deployContract("PositionNondisperseLiquidity");

        await dexNFT.initialize();
        await dexNFT.setFactory(factory.address);

        uniRouter = await deployContract("MockUniRouter");


        mockPairUni = await deployContract("MockPairUni");


        wbnb = await deployMockWrappedBNB();
        quote = await deployMockToken("quote");
        base = await deployMockToken("base");
        reflex = await deployMockReflexToken("posi");
        await uniRouter.setWBNB(wbnb.address)

        killer = await deployContract("KillerPosition", deployer,
            uniRouter.address, dexNFT.address, factory.address, wbnb.address);

        posiRouter = await deployContract("PositionRouter");
        await posiRouter.initialize(factory.address, spotHouse.address, uniRouter.address, wbnb.address);


        await base.approve(uniRouter.address, ethers.constants.MaxInt256);
        await quote.approve(uniRouter.address, ethers.constants.MaxInt256);
        await reflex.approve(uniRouter.address, ethers.constants.MaxInt256);

        await mockPairUni.approve(killer.address, ethers.constants.MaxInt256);


        await base.approve(dexNFT.address, ethers.constants.MaxInt256);
        await quote.approve(dexNFT.address, ethers.constants.MaxInt256);
        await reflex.approve(dexNFT.address, ethers.constants.MaxInt256);

        await base.approve(spotHouse.address, ethers.constants.MaxInt256);
        await quote.approve(spotHouse.address, ethers.constants.MaxInt256);
        await reflex.approve(spotHouse.address, ethers.constants.MaxInt256);


        await base.connect(users[1]).approve(spotHouse.address, ethers.constants.MaxInt256);
        await quote.connect(users[1]).approve(spotHouse.address, ethers.constants.MaxInt256);
        await reflex.connect(users[1]).approve(spotHouse.address, ethers.constants.MaxInt256);

        // await base.mint(deployer.address, toWei(1000000000))
        // await quote.mint(deployer.address, toWei(1000000000))
        await base.mint(users[1].address, toWei(1000000000))
        await quote.mint(users[1].address, toWei(1000000000))
        await reflex.mint(deployer.address, toWei(1000000000))


        await mockPairUni.mint(deployer.address, toWei(10000000000000))
        await dexNFT.setBNB(wbnb.address);

        await pair.initialize(
            {
                quoteAsset: quote.address,
                baseAsset: base.address,
                basisPoint: BASIS_POINT,
                maxFindingWordsIndex: 10000,
                initialPip: 50000,
                pipRange: 30000,
                tickSpace: 1,
                positionLiquidity: dexNFT.address,
                spotHouse: spotHouse.address,
                router: posiRouter.address
            });

        await pairPosiBusd.initialize(
            {
                quoteAsset: quote.address,
                baseAsset: reflex.address,
                basisPoint: BASIS_POINT,
                maxFindingWordsIndex: 10000,
                initialPip: 50000,
                pipRange: 30000,
                tickSpace: 1,
                positionLiquidity: dexNFT.address,
                spotHouse: spotHouse.address,
                router: posiRouter.address
            });
        await factory.addPairManagerManual(pair.address, base.address, quote.address);
        await factory.addPairManagerManual(pairPosiBusd.address, reflex.address, quote.address);


        rewardToken = await deployContract("MockTokenReward")
        treasury = await deployContract("MockTokenTreasury", users[0].address, rewardToken.address)

        staking = await deployContract("PositionStakingDexManager")
        await rewardToken.setTreasuryAddress(treasury.address)
        await treasury.setPosition(rewardToken.address)
        await staking.initialize(rewardToken.address, dexNFT.address, 0)
        await staking.setPositionTreasury(treasury.address)
        await staking.add(pair.address, 10, 0, 0, false)
        await staking.setPositionPerBlock(toWei(5))
        await treasury.setPositionStakingManager(staking.address)

        await factory.setStakingManagerForPair(pair.address, staking.address);

        await dexNFT.setApprovalForAll(staking.address, true)


        await spotHouse.setWBNB(wbnb.address);
        await spotHouse.setFactory(factory.address);
        await spotHouse.setPosiToken(reflex.address);
        await spotHouse.setPositionRouter(posiRouter.address);


        await posiRouter.setWBNB(wbnb.address);
        await posiRouter.setFactory(factory.address);
        await posiRouter.setSpotHouse(spotHouse.address);
    })


    async function openLimitOrder(orders: LimitOrder[]) {

        for (let order of orders) {
            await spotHouse.openLimitOrder(
                pair.address,
                order.isBuy ? SIDE.BUY : SIDE.SELL,
                toWei(order.quantity),
                order.pip)
        }
    }

    async function openMarket(isBuy: boolean, quantity: number) {

        await spotHouse.connect(users[1]).openMarketOrder(
            pair.address,
            isBuy ? SIDE.BUY : SIDE.SELL,
            toWei(quantity))
    }

    async function logBalance(){
        console.log("Balance quote: ", toEther( ( await quote.balanceOf(deployer.address)).toString()))
        console.log("Balance base: ", toEther( ( await base.balanceOf(deployer.address)).toString()))
    }
    async function logPendingOrders(){

        const pendingOrders = await spotHouse.getPendingLimitOrders(pair.address, deployer.address);


        let pending :Pending[] =[]
        pendingOrders.map((order) => {

            pending.push({
                partialFilled: !order.partialFilled,
                isBuy:order.isBuy,
                pip: order.pip.toNumber(),
                quantity: Number(toEther(order.quantity.toString())),
                orderIdOfTrader: order.orderIdOfTrader.toNumber()
            })

        })
        console.table(pending)
    }

    describe("modify limit order", async () => {

        it("should modify limit sell order", async () => {

            await openLimitOrder([{quantity: 1, pip: 55000, isBuy: false}])
            await logPendingOrders();

            await spotHouse.modifyLimitOrder(pair.address, [{orderIdx:0, editToPip: 60000}])
            await logPendingOrders();
        })

        it("should modify multi limit sell order", async () => {

            await openLimitOrder([
                {quantity: 10, pip: 55000, isBuy: false},
                {quantity: 20, pip: 56000, isBuy: false},
                {quantity: 30, pip: 57000, isBuy: false}  ])

            await logPendingOrders();

            await spotHouse.modifyLimitOrder(pair.address, [
                {orderIdx:0, editToPip: 60000},
                {orderIdx:1, editToPip: 61000},
                {orderIdx:2, editToPip: 62000},
            ])
            await logPendingOrders();
        })

        it("should modify limit sell partial fill order", async () => {
            await logBalance()
            await openLimitOrder([{quantity: 10, pip: 55000, isBuy: false}])
            await logBalance()
            await openMarket(true, 5)


            await spotHouse.modifyLimitOrder(pair.address, [{orderIdx:0, editToPip: 60000}])
            await logBalance()
            await logPendingOrders();
        })

        it("should ignore limit sell full fill order", async () => {
            await logBalance()
            await openLimitOrder([{quantity: 10, pip: 55000, isBuy: false}])
            await logBalance()
            await logPendingOrders();

            await openMarket(true, 10)
            await logPendingOrders();

            await spotHouse.modifyLimitOrder(pair.address, [{orderIdx:0, editToPip: 60000}])
            await logBalance()
            await logPendingOrders();

            await spotHouse.claimAsset(pair.address);
            await logBalance()

        })

        it("should modify multi limit sell partial fill order", async () => {
            await openLimitOrder([
                {quantity: 10, pip: 55000, isBuy: false},
                {quantity: 20, pip: 56000, isBuy: false},
                {quantity: 30, pip: 57000, isBuy: false}  ])
            await logPendingOrders();
            await logBalance()
            await openMarket(true, 5)


            await spotHouse.modifyLimitOrder(pair.address, [
                {orderIdx:0, editToPip: 60000},
                {orderIdx:1, editToPip: 61000},
                {orderIdx:2, editToPip: 62000},
            ])
            await logBalance()
            await logPendingOrders();
        });

        it("should modify multi limit sell partial fill and ignore full fill order", async () => {
            await openLimitOrder([
                {quantity: 10, pip: 55000, isBuy: false},
                {quantity: 20, pip: 56000, isBuy: false},
                {quantity: 30, pip: 57000, isBuy: false}  ])
            await logPendingOrders();
            await logBalance()
            await openMarket(true, 20)

            await spotHouse.modifyLimitOrder(pair.address, [
                {orderIdx:0, editToPip: 67000},
                {orderIdx:1, editToPip: 58000},
                {orderIdx:2, editToPip: 59000},
            ])
            await logBalance()
            await logPendingOrders();

            await spotHouse.claimAsset(pair.address);
            await logBalance()

        });


        // *************** BUY BUY BUY **************************

        it("should modify limit buy order", async () => {

            await openLimitOrder([{quantity: 1, pip: 45000, isBuy: true}])
            await logPendingOrders();

            await spotHouse.modifyLimitOrder(pair.address, [{orderIdx:0, editToPip: 40000}])
            await logPendingOrders();

        })



        it("should multi modify limit buy order", async () => {

            await openLimitOrder([
                {quantity: 10, pip: 45000, isBuy: true},
                {quantity: 20, pip: 44000, isBuy: true},
                {quantity: 30, pip: 43000, isBuy: true},
            ])
            await logPendingOrders();

            await spotHouse.modifyLimitOrder(pair.address, [
                {orderIdx:0, editToPip: 49000},
                {orderIdx:1, editToPip: 48000},
                {orderIdx:2, editToPip: 47000},
            ])
            await logPendingOrders();

        })


        it("should multi modify limit partial fill buy order", async () => {

            await openLimitOrder([
                {quantity: 10, pip: 45000, isBuy: true},
                {quantity: 20, pip: 44000, isBuy: true},
                {quantity: 30, pip: 43000, isBuy: true},
            ])
            await logPendingOrders();

            await openMarket(false, 5)


            await spotHouse.modifyLimitOrder(pair.address, [
                {orderIdx:0, editToPip: 44000},
                {orderIdx:1, editToPip: 43000},
                {orderIdx:2, editToPip: 42000},
            ])
            await logPendingOrders();

        })
        it("should multi modify limit partial fill and ignore full fill buy order", async () => {

            await openLimitOrder([
                {quantity: 10, pip: 45000, isBuy: true},
                {quantity: 20, pip: 44000, isBuy: true},
                {quantity: 30, pip: 43000, isBuy: true},
            ])
            await logPendingOrders();

            await openMarket(false, 20)


            await spotHouse.modifyLimitOrder(pair.address, [
                {orderIdx:0, editToPip: 43000},
                {orderIdx:1, editToPip: 42000},
                {orderIdx:2, editToPip: 41000},
            ])
            await logPendingOrders();


            await spotHouse.claimAsset(pair.address);
            await logBalance()

        })

        it("should modify limit buy partial fill order", async () => {

            await openLimitOrder([{quantity: 10, pip: 45000, isBuy: true}])
            await logBalance()
            await logPendingOrders();

            await openMarket(false, 5)
            await logBalance()

            await spotHouse.modifyLimitOrder(pair.address, [{orderIdx:0, editToPip: 40000}])
            await logPendingOrders();
            await logBalance()

        })

        it("should ignore limit buy full fill order", async () => {

            await openLimitOrder([{quantity: 10, pip: 45000, isBuy: true}])
            await logBalance()
            await logPendingOrders();

            await openMarket(false, 10)
            await logBalance()

            await spotHouse.modifyLimitOrder(pair.address, [{orderIdx:0, editToPip: 40000}])
            await logPendingOrders();
            await logBalance()

            await spotHouse.claimAsset(pair.address);
            await logBalance()


        })
    })


})
