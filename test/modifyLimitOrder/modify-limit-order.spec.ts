import {
    ForkMatchingEngineAMM,
    KillerPosition,
    MatchingEngineAMM, MockPairUni, MockTokenReward, MockTokenTreasury,
    MockUniRouter, PositionNondisperseLiquidity, PositionRouter,
    PositionSpotFactory, PositionStakingDexManager, SpotHouse,
} from "../../typeChain";
import {deployContract, expectDataInRange, getAccount, SIDE, toEther, toWei} from "../utils/utils";
import {deployMockReflexToken, deployMockToken, deployMockWrappedBNB} from "../utils/mock";
import {BASIS_POINT} from "../liquidity/test-liquidity";
import {ethers} from "hardhat";
import {SignerWithAddress} from "@nomiclabs/hardhat-ethers/signers";
import {mine} from "@nomicfoundation/hardhat-network-helpers";
import {boolean} from "hardhat/internal/core/params/argumentTypes";
import {BigNumber} from "ethers";
import {expect} from "chai";


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
    partialFilled: number

    amountRemainFill: number,


}

interface ExpectPending {
    orderIdx : number,
    pip : number,
    quantity : number,
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
        await posiRouter.setWBNB(wbnb.address);
        await posiRouter.setFactory(factory.address);
        await posiRouter.setSpotHouse(spotHouse.address);
        await spotHouse.setFee(0);
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
                isBuy:order.isBuy,
                pip: order.pip.toNumber(),
                quantity: Number(toEther(order.quantity.toString())),
                partialFilled: Number(toEther(order.partialFilled.toString())),
                amountRemainFill: Number(toEther(order.quantity.toString())) - Number(toEther(order.partialFilled.toString())),
                orderIdOfTrader: order.orderIdOfTrader.toNumber()
            })

        })
        console.table(pending)
    }

    async function expectPendingOrders(expected: ExpectPending[]) {

        const pendingOrders = await spotHouse.getPendingLimitOrders(pair.address, deployer.address);

        expected.forEach(value => {

            let pe = pendingOrders.find((p) => {return p.orderIdOfTrader.toNumber() === value.orderIdx})
            if (pe){
                expect(pe.pip).to.be.equal(value.pip);
                expect(expectDataInRange(Number(toEther(pe.quantity.toString()))- Number(toEther( pe.partialFilled.toString())),value.quantity, 0.001)).to.equal(true, "quantity wrong");
            }

        });
    }

    async function expectBalance(baseExpected?: number, quotExpected?: number) {

        const balanceQuote = await quote.balanceOf(deployer.address);
        const balanceBase = await base.balanceOf(deployer.address);

        if  (balanceQuote) expect(expectDataInRange(Number(toEther(balanceQuote.toString())),quotExpected, 0.001)).to.equal(true, "quote wrong");
        if (balanceBase) expect(expectDataInRange(Number(toEther(balanceBase.toString())),baseExpected, 0.001)).to.equal(true, "base wrong");

    }

    describe("modify limit order", async () => {

        it("should modify limit sell order", async () => {

            await openLimitOrder([{quantity: 1, pip: 55000, isBuy: false}])
            await logPendingOrders();
            await logBalance()
            await spotHouse.modifyLimitOrder(pair.address, [{orderIdx:0, editToPip: 60000}])
            await logPendingOrders();

            await expectPendingOrders([{orderIdx:0, pip: 60000, quantity: 1}])

            await expectBalance(9999,10000);
        })



        it("should modify limit sell partial fill order", async () => {
            await logBalance();
            await openLimitOrder([{quantity: 10, pip: 55000, isBuy: false}])
            await logBalance()
            await openMarket(true, 5)

            await spotHouse.modifyLimitOrder(pair.address, [{orderIdx:0, editToPip: 60000}])
            await openMarket(true, 2)
            await spotHouse.modifyLimitOrder(pair.address, [{orderIdx:0, editToPip: 61000}])
            await logBalance()
            await logPendingOrders();
            await expectPendingOrders([{orderIdx:0, pip: 61000, quantity: 3}])

            await expectBalance(9990,10039.5);
        })

        it("should modify limit sell partial fill order and cancel", async () => {
            await logBalance()
            await openLimitOrder([{quantity: 10, pip: 55000, isBuy: false}])
            await logBalance()
            await openMarket(true, 5)

            await spotHouse.modifyLimitOrder(pair.address, [{orderIdx:0, editToPip: 60000}])
            await openMarket(true, 2)
            await spotHouse.modifyLimitOrder(pair.address, [{orderIdx:0, editToPip: 61000}])
            await spotHouse.cancelLimitOrder(pair.address,0,61000)
            await logBalance()
            await logPendingOrders()

            await expectBalance(9993,10039.5);
        })

        it("should modify limit sell partial fill order and claim", async () => {
            await logBalance()
            await openLimitOrder([{quantity: 10, pip: 55000, isBuy: false}])
            await logBalance()
            await openMarket(true, 5)

            await spotHouse.modifyLimitOrder(pair.address, [{orderIdx:0, editToPip: 60000}])
            await openMarket(true, 2)
            await spotHouse.claimAsset(pair.address)
            await logBalance()
            await logPendingOrders()
            await expectPendingOrders([{orderIdx:0, pip: 60000, quantity: 3}])
            await expectBalance(9990,10039.5);
        })


        it("should ignore limit sell full fill order", async () => {
            await logBalance()
            await openLimitOrder([{quantity: 10, pip: 55000, isBuy: false}])
            await logBalance()
            await logPendingOrders();


            await spotHouse.modifyLimitOrder(pair.address, [{orderIdx:0, editToPip: 60000}])
            await openMarket(true, 10)
            await logPendingOrders();

            await logBalance()
            await logPendingOrders();

            await spotHouse.claimAsset(pair.address);
            await logBalance()
            await expectBalance(9990,10060);
        })

        it("should modify multi limit sell order", async () => {

            await openLimitOrder([
                {quantity: 10, pip: 55000, isBuy: false},
                {quantity: 20, pip: 56000, isBuy: false},
                {quantity: 30, pip: 57000, isBuy: false}  ])

            await logPendingOrders();

            await spotHouse.modifyLimitOrder(pair.address, [
                {orderIdx:0, editToPip: 61000},
                {orderIdx:1, editToPip: 62000},
                {orderIdx:2, editToPip: 63000},
            ])
            await logPendingOrders();
            await expectPendingOrders([
                {orderIdx:0, pip: 61000, quantity: 10},
                {orderIdx:1, pip: 62000, quantity: 20},
                {orderIdx:2, pip: 63000, quantity: 30}])

            await expectBalance(9940,10000);
        })

        it("should modify multi limit sell partial fill order", async () => {
            await openLimitOrder([
                {quantity: 10, pip: 55000, isBuy: false},
                {quantity: 20, pip: 56000, isBuy: false},
                {quantity: 30, pip: 57000, isBuy: false}  ])
            await logPendingOrders();
            await logBalance()
            await openMarket(true, 35)
            await logBalance()


            await spotHouse.modifyLimitOrder(pair.address, [
                {orderIdx:2, editToPip: 62000}
            ])
            await logBalance()
            await logPendingOrders();

            await expectPendingOrders([
                {orderIdx:2, pip: 62000, quantity: 25}])

            await expectBalance(9940,10028.5);
        });


        it("should modify multi limit sell partial fill order 2", async () => {
            await openLimitOrder([
                {quantity: 10, pip: 55000, isBuy: false},
                {quantity: 20, pip: 56000, isBuy: false},
                {quantity: 30, pip: 57000, isBuy: false}  ])
            await logPendingOrders();
            await logBalance()
            await spotHouse.modifyLimitOrder(pair.address, [
                {orderIdx:0, editToPip: 62000},
                {orderIdx:1, editToPip: 62000},
                {orderIdx:2, editToPip: 63000}
            ])
            await logPendingOrders();
            await openMarket(true, 35)
            await logBalance();
            await logPendingOrders();

            await expectPendingOrders([
                {orderIdx:2, pip: 63000, quantity: 25}])
            await spotHouse.claimAsset(pair.address);
            await expectBalance(9940,10217.5);
        });


        it("should modify multi limit sell partial fill and ignore full fill order", async () => {
            await openLimitOrder([
                {quantity: 10, pip: 55000, isBuy: false},
                {quantity: 20, pip: 56000, isBuy: false},
                {quantity: 30, pip: 57000, isBuy: false}  ])
            await logPendingOrders();
            await logBalance()
            // await openMarket(true, 20)

            await spotHouse.modifyLimitOrder(pair.address, [
                {orderIdx:0, editToPip: 57000},
                {orderIdx:1, editToPip: 58000},
                {orderIdx:2, editToPip: 55000},
            ])
            await logBalance()
            await logPendingOrders()
            await openMarket(true, 35)
            await expectPendingOrders([
                {orderIdx:0, pip: 57000, quantity: 5},
                {orderIdx:1, pip: 58000, quantity: 20}
            ])
            await spotHouse.claimAsset(pair.address);
            await expectBalance(9940,10193.5);

        });


        it("should modify multi limit BUY SELL", async () => {
            await openLimitOrder([
                {quantity: 10, pip: 55000, isBuy: false},
                {quantity: 20, pip: 56000, isBuy: false},
                {quantity: 30, pip: 57000, isBuy: false},

                {quantity: 10, pip: 49000, isBuy: true},
                {quantity: 20, pip: 47000, isBuy: true},
                {quantity: 20, pip: 45000, isBuy: true}]);

            await logPendingOrders();
            await logBalance()

            await spotHouse.modifyLimitOrder(pair.address, [
                {orderIdx:0, editToPip: 51000},
                {orderIdx:1, editToPip: 62000},
                {orderIdx:2, editToPip: 57000},
                {orderIdx:3, editToPip: 49500},
                {orderIdx:4, editToPip: 46000},
                {orderIdx:5, editToPip: 45000}
            ])
            await logPendingOrders();
            await openMarket(true, 35)
            await logBalance();
            await logPendingOrders();

            await expectPendingOrders([
                {orderIdx:1, pip: 62000, quantity: 20},
                {orderIdx:2, pip: 57000, quantity: 5},
                {orderIdx:3, pip: 49500, quantity: 9.898989898989898},
                {orderIdx:4, pip: 46000, quantity: 20.434782608695652},
                {orderIdx:5, pip: 45000, quantity: 20}
            ])
            await spotHouse.modifyLimitOrder(pair.address, [
                {orderIdx:1, editToPip: 59000},
                {orderIdx:2, editToPip: 59000},
                {orderIdx:3, editToPip: 49500},
                {orderIdx:4, editToPip: 45000}

            ])
            await logPendingOrders();
            await openMarket(true, 23)
            await openMarket(false, 25)
            await logBalance();
            await logPendingOrders();
            await expectPendingOrders([
                {orderIdx:2, pip: 59000, quantity: 2},
                {orderIdx:4, pip: 45000, quantity: 20.88888888888889},
                {orderIdx:5, pip: 45000, quantity: 4.8989898989899}
            ])

        });


        // *************** BUY BUY BUY **************************

        it("should modify limit buy order", async () => {

            await openLimitOrder([{quantity: 1, pip: 45000, isBuy: true}])
            await logPendingOrders();

            await spotHouse.modifyLimitOrder(pair.address, [{orderIdx:0, editToPip: 40000}])
            await logPendingOrders();
            await expectPendingOrders([
                {orderIdx:0, pip: 40000, quantity: 1.125}])

            await spotHouse.modifyLimitOrder(pair.address, [{orderIdx:0, editToPip: 49000}])
            await logPendingOrders();
            await expectPendingOrders([
                {orderIdx:0, pip: 49000, quantity: 0.9183673469387754}])
            await spotHouse.claimAsset(pair.address);
            await expectBalance(10001,9995.5);

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

            await openMarket(false, 2)
            await logPendingOrders();
            await logBalance()

            await spotHouse.modifyLimitOrder(pair.address, [{orderIdx:0, editToPip: 39000}])
            await logPendingOrders();
            await logBalance()

            await expectPendingOrders([{orderIdx:0, pip: 39000, quantity: 3.717948717948718}])

            await expectBalance(10000,9955);

        })


        it("should modify limit buy partial fill order and cancel", async () => {

                      await openLimitOrder([{quantity: 10, pip: 45000, isBuy: true}])
                      await logBalance()
                      await logPendingOrders();

                      await openMarket(false, 5)
                      await logBalance()

                      await spotHouse.modifyLimitOrder(pair.address, [{orderIdx:0, editToPip: 40000}])
                      await logPendingOrders();
                      await logBalance()

                      await openMarket(false, 2)
                      await logPendingOrders();
                      await logBalance()

                      await spotHouse.modifyLimitOrder(pair.address, [{orderIdx:0, editToPip: 39000}])
                      await logPendingOrders();
                      await logBalance()
                      await spotHouse.cancelLimitOrder(pair.address,0,39000)

                      await expectBalance(10007,9969.5);

                  })
        it("should modify limit buy partial fill order and claim", async () => {

            await openLimitOrder([{quantity: 10, pip: 45000, isBuy: true}])
            await logBalance()
            await logPendingOrders();

            await openMarket(false, 5)
            await logBalance()

            await spotHouse.modifyLimitOrder(pair.address, [{orderIdx:0, editToPip: 40000}])
            await logPendingOrders();
            await logBalance()

            await openMarket(false, 2)
            await logPendingOrders();
            await logBalance()

            await spotHouse.modifyLimitOrder(pair.address, [{orderIdx:0, editToPip: 39000}])
            await logPendingOrders();
            await logBalance()
            await spotHouse.claimAsset(pair.address)

            await expectBalance(10007,9955);

        })

        it("should ignore limit buy full fill order", async () => {

            await openLimitOrder([{quantity: 10, pip: 45000, isBuy: true}])
            await logBalance()
            await logPendingOrders();

            await spotHouse.modifyLimitOrder(pair.address, [{orderIdx:0, editToPip: 40000}])
            await logPendingOrders();
            await logBalance()

            await openMarket(false, 11.25)
            await logBalance()

            await spotHouse.claimAsset(pair.address);
            await logBalance()
            await expectBalance(10011.25,9955);

        })

        it("should multi modify limit buy order", async () => {

            await openLimitOrder([
                {quantity: 10, pip: 45000, isBuy: true},
                {quantity: 20, pip: 45000, isBuy: true},
                {quantity: 30, pip: 43000, isBuy: true},
            ])
            await logPendingOrders();

            await spotHouse.modifyLimitOrder(pair.address, [
                {orderIdx:0, editToPip: 44000},
                {orderIdx:1, editToPip: 44000},
                {orderIdx:2, editToPip: 44000},
            ])
            await expectPendingOrders([
                {orderIdx:0, pip: 44000, quantity: 10.227272727272727},
                {orderIdx:1, pip: 44000, quantity: 20.454545454545453},
                {orderIdx:2, pip: 44000, quantity: 29.318181818181817}
            ])
            await openMarket(false, 36)
            await logPendingOrders();
            await logBalance()

            await expectPendingOrders([

                {orderIdx:2, pip: 44000, quantity: 23.999999999999996}
            ])
            await expectBalance(10000,9736);

        })



    })


})
