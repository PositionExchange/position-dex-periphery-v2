import {
    EstimateLogic,
    ForkMatchingEngineAMM,
    KillerPosition, MockPairUni, MockTokenReward, MockTokenTreasury, MockUniRouter,
    PositionNondisperseLiquidity, PositionRouter,
    PositionSpotFactory, PositionStakingDexManager, SpotHouse
} from "../../typeChain";
import {SignerWithAddress} from "@nomiclabs/hardhat-ethers/signers";
import {deployContract, expectDataInRange, getAccount, SIDE, toEther, toWei} from "../utils/utils";
import {deployMockReflexToken, deployMockToken, deployMockWrappedBNB} from "../utils/mock";
import {ethers} from "hardhat";
import {boolean} from "hardhat/internal/core/params/argumentTypes";
import {LimitOrder} from "../utils/interfaces";
import {expect} from "chai";

describe("multi router", async () => {


    let factory: PositionSpotFactory;
    let killer: KillerPosition;
    let pairPosiBusd: ForkMatchingEngineAMM;
    let pair: ForkMatchingEngineAMM;
    let pairPosiBNB: ForkMatchingEngineAMM;
    let pairBase1Quote1: ForkMatchingEngineAMM;
    let pairBase1Quote: ForkMatchingEngineAMM;
    let dexNFT: PositionNondisperseLiquidity;
    let uniRouter: MockUniRouter;
    let mockPairUni: MockPairUni;
    let staking: PositionStakingDexManager
    let spotHouse: SpotHouse;
    let posiRouter: PositionRouter
    let estLogic: EstimateLogic


    let rewardToken: MockTokenReward;
    let treasury: MockTokenTreasury;


    let quote: any;
    let base: any;
    let quote1: any;
    let quote2: any;
    let base1: any;
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
        pairBase1Quote1 = await deployContract("ForkMatchingEngineAMM");
        pairPosiBusd = await deployContract("ForkMatchingEngineAMM");
        pairPosiBNB = await deployContract("ForkMatchingEngineAMM");
        pairBase1Quote = await deployContract("ForkMatchingEngineAMM");


        estLogic = await deployContract("EstimateLogic");


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
        quote1 = await deployMockToken("quote1");
        quote2 = await deployMockToken("quote2");
        base1 = await deployMockToken("base1");
        reflex = await deployMockReflexToken("posi");
        await uniRouter.setWBNB(wbnb.address)

        killer = await deployContract("KillerPosition", deployer,
            uniRouter.address, dexNFT.address, factory.address, wbnb.address);

        posiRouter = await deployContract("PositionRouter");
        await posiRouter.initialize(factory.address, spotHouse.address, uniRouter.address, wbnb.address);

        await posiRouter.setEstimateLogic(estLogic.address);


        await base.approve(uniRouter.address, ethers.constants.MaxInt256);
        await quote.approve(uniRouter.address, ethers.constants.MaxInt256);
        await reflex.approve(uniRouter.address, ethers.constants.MaxInt256);

        await base.approve(posiRouter.address, ethers.constants.MaxInt256);
        await quote.approve(posiRouter.address, ethers.constants.MaxInt256);
        await base1.approve(posiRouter.address, ethers.constants.MaxInt256);
        await quote1.approve(posiRouter.address, ethers.constants.MaxInt256);
        await quote2.approve(posiRouter.address, ethers.constants.MaxInt256);
        await reflex.approve(posiRouter.address, ethers.constants.MaxInt256);


        await base.approve(dexNFT.address, ethers.constants.MaxInt256);
        await quote.approve(dexNFT.address, ethers.constants.MaxInt256);
        await base1.approve(dexNFT.address, ethers.constants.MaxInt256);
        await quote1.approve(dexNFT.address, ethers.constants.MaxInt256);
        await quote2.approve(dexNFT.address, ethers.constants.MaxInt256);
        await reflex.approve(dexNFT.address, ethers.constants.MaxInt256);

        await base.approve(spotHouse.address, ethers.constants.MaxInt256);
        await quote.approve(spotHouse.address, ethers.constants.MaxInt256);
        await base1.approve(spotHouse.address, ethers.constants.MaxInt256);
        await quote1.approve(spotHouse.address, ethers.constants.MaxInt256);
        await quote2.approve(spotHouse.address, ethers.constants.MaxInt256);
        await reflex.approve(spotHouse.address, ethers.constants.MaxInt256);

        await base.connect(users[1]).approve(spotHouse.address, ethers.constants.MaxInt256);
        await quote.connect(users[1]).approve(spotHouse.address, ethers.constants.MaxInt256);
        await base1.connect(users[1]).approve(spotHouse.address, ethers.constants.MaxInt256);
        await quote1.connect(users[1]).approve(spotHouse.address, ethers.constants.MaxInt256);
        await quote2.connect(users[1]).approve(spotHouse.address, ethers.constants.MaxInt256);
        await reflex.connect(users[1]).approve(spotHouse.address, ethers.constants.MaxInt256);

        await base.connect(users[1]).mint(users[1].address, toWei(10000))
        await quote.connect(users[1]).mint(users[1].address, toWei(10000))
        await base1.connect(users[1]).mint(users[1].address, toWei(10000))
        await quote1.connect(users[1]).mint(users[1].address, toWei(10000))
        await quote2.connect(users[1]).mint(users[1].address, toWei(10000))
        await reflex.connect(users[1]).mint(users[1].address, toWei(10000))


        await mockPairUni.mint(deployer.address, toWei(10000000000000))
        await dexNFT.setBNB(wbnb.address);

        await pair.initialize(
            {
                quoteAsset: quote.address,
                baseAsset: base.address,
                basisPoint: 10_000,
                maxFindingWordsIndex: 10000,
                initialPip: 50000,
                pipRange: 30000,
                tickSpace: 1,
                positionLiquidity: dexNFT.address,
                spotHouse: spotHouse.address,
                router: posiRouter.address
            });
        await pairBase1Quote1.initialize(
            {
                quoteAsset: quote1.address,
                baseAsset: base1.address,
                basisPoint: 100,
                maxFindingWordsIndex: 10000,
                initialPip: 5000,
                pipRange: 30000,
                tickSpace: 1,
                positionLiquidity: dexNFT.address,
                spotHouse: spotHouse.address,
                router: posiRouter.address
            });

        await pairBase1Quote.initialize(
            {
                quoteAsset: quote.address,
                baseAsset: base1.address,
                basisPoint: 10000,
                maxFindingWordsIndex: 10000,
                initialPip: 60000,
                pipRange: 30000,
                tickSpace: 1,
                positionLiquidity: dexNFT.address,
                spotHouse: spotHouse.address,
                router: posiRouter.address
            });

        await pairPosiBusd.initialize(
            {
                quoteAsset: quote2.address,
                baseAsset: reflex.address,
                basisPoint: 10_000,
                maxFindingWordsIndex: 10000,
                initialPip: 7000,
                pipRange: 30000,
                tickSpace: 1,
                positionLiquidity: dexNFT.address,
                spotHouse: spotHouse.address,
                router: posiRouter.address
            });

        await pairPosiBNB.initialize(
            {
                quoteAsset: wbnb.address,
                baseAsset: reflex.address,
                basisPoint: 10_000,
                maxFindingWordsIndex: 10000,
                initialPip: 1000,
                pipRange: 30000,
                tickSpace: 1,
                positionLiquidity: dexNFT.address,
                spotHouse: spotHouse.address,
                router: posiRouter.address
            });

        await factory.addPairManagerManual(pair.address, base.address, quote.address);
        await factory.addPairManagerManual(pairPosiBusd.address, reflex.address, quote2.address);
        await factory.addPairManagerManual(pairPosiBNB.address, reflex.address, wbnb.address);
        await factory.addPairManagerManual(pairBase1Quote1.address, base1.address, quote1.address);
        await factory.addPairManagerManual(pairBase1Quote.address, base1.address, quote.address);


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
    })

    async function addLiquidity(amountVirtual: number, indexInLiquidity: number, isBase: boolean, pair: string, valueEther = 0) {

        await dexNFT.addLiquidity({
                amountVirtual: toWei(amountVirtual.toString()),
                indexedPipRange: indexInLiquidity,
                isBase: isBase,
                pool: pair
            },

            {value: ethers.utils.parseEther(valueEther.toString())})

    }

    async function openLimitOrder(orders: LimitOrder[],pair:ForkMatchingEngineAMM) {

        for (let order of orders) {
            await spotHouse.connect(users[1]).openLimitOrder(
                pair.address,
                order.isBuy ? SIDE.BUY : SIDE.SELL,
                toWei(order.quantity),
                order.pip)
        }
    }

    async function expectBalance(base: any, quote:any, baseExpected?: number, quotExpected?: number,) {

        const balanceQuote = await quote.balanceOf(deployer.address);
        const balanceBase = await base.balanceOf(deployer.address);

        if  (balanceQuote) expect(expectDataInRange(Number(toEther(balanceQuote.toString())),quotExpected, 0.001)).to.equal(true, "quote wrong");
        if (balanceBase) expect(expectDataInRange(Number(toEther(balanceBase.toString())),baseExpected, 0.001)).to.equal(true, "base wrong");

    }

    async function logBalance(base:any,quote:any){
        console.log("Balance quote: ", toEther( ( await quote.balanceOf(deployer.address)).toString()))
        console.log("Balance base: ", toEther( ( await base.balanceOf(deployer.address)).toString()))
    }

    describe("Normal token", async () => {
        it('should swap 1 pairs', async function () {

            await openLimitOrder([
                {quantity: 10, pip: 45000, isBuy: true},
                {quantity: 20, pip: 46000, isBuy: true},
                {quantity: 30, pip: 47000, isBuy: true}],pair
            )

            await posiRouter.swapExactTokensForTokensMultiRouter(
                [
                    {amountIn: toWei(35), amountOutMin:0, path: [base.address, quote.address]},
                ],
                deployer.address,
                999999999999999)
            await logBalance(base,quote);

            await expectBalance(base,quote,9965,10164)

        });

        it('should swap 3 difference pairs and all are for sell', async function () {

            await openLimitOrder([
                {quantity: 10, pip: 45000, isBuy: true},
                {quantity: 20, pip: 46000, isBuy: true},
                {quantity: 30, pip: 47000, isBuy: true}],pair
            )

            await openLimitOrder([
                {quantity: 10, pip: 4500, isBuy: true},
                {quantity: 20, pip: 4600, isBuy: true},
                {quantity: 30, pip: 4700, isBuy: true}],pairBase1Quote1
            )

            await openLimitOrder([
                {quantity: 10, pip: 6000, isBuy: true},
                {quantity: 20, pip: 5000, isBuy: true},
                {quantity: 30, pip: 4000, isBuy: true}],pairPosiBusd
            )

            await posiRouter.swapExactTokensForTokensMultiRouter(
                [
                    {amountIn: toWei(35), amountOutMin:0, path: [base.address,quote.address]},
                    {amountIn: toWei(40), amountOutMin:0, path: [base1.address,quote1.address]},
                    {amountIn: toWei(45), amountOutMin:0, path: [reflex.address,quote2.address]}
                ],
                deployer.address,
                999999999999999)
            await logBalance(base,quote);
            await logBalance(base1,quote1);
            await logBalance(reflex,quote2);

            await expectBalance(base,quote,9965,10164)
            await expectBalance(base1,quote1,9960,11870)
            await expectBalance(reflex,quote2,9955,10021.82)

        });

        it('should swap 3 difference pairs and all are for buy', async function () {

            await openLimitOrder([
                {quantity: 10, pip: 55000, isBuy: false},
                {quantity: 20, pip: 56000, isBuy: false},
                {quantity: 30, pip: 57000, isBuy: false}],pair
            )

            await openLimitOrder([
                {quantity: 10, pip: 5500, isBuy: false},
                {quantity: 20, pip: 5600, isBuy: false},
                {quantity: 30, pip: 5700, isBuy: false}],pairBase1Quote1
            )

            await openLimitOrder([
                {quantity: 10, pip: 8000, isBuy: false},
                {quantity: 20, pip: 8500, isBuy: false},
                {quantity: 30, pip: 9000, isBuy: false}],pairPosiBusd
            )


            await posiRouter.swapExactTokensForTokensMultiRouter(
                [
                    {amountIn: toWei(195.5), amountOutMin:0, path: [quote.address,base.address]},
                    {amountIn: toWei(2240), amountOutMin:0, path: [quote1.address,base1.address]},
                    {amountIn: toWei(38.5), amountOutMin:0, path: [quote2.address,reflex.address]}
                ],
                deployer.address,
                999999999999999)

            await expectBalance(base,quote,10035,9804.5)
            await expectBalance(base1,quote1,10040,7760)
            await expectBalance(reflex,quote2,10045,9961.5)

        });

        it('should swap 3 difference pairs and all are for buy and sell', async function () {

            await openLimitOrder([
                {quantity: 10, pip: 55000, isBuy: false},
                {quantity: 20, pip: 56000, isBuy: false},
                {quantity: 30, pip: 57000, isBuy: false}],pair
            )

            await openLimitOrder([
                {quantity: 10, pip: 4500, isBuy: true},
                {quantity: 20, pip: 4600, isBuy: true},
                {quantity: 30, pip: 4700, isBuy: true}],pairBase1Quote1
            )

            await openLimitOrder([
                {quantity: 10, pip: 8000, isBuy: false},
                {quantity: 20, pip: 8500, isBuy: false},
                {quantity: 30, pip: 9000, isBuy: false}],pairPosiBusd
            )


            await posiRouter.swapExactTokensForTokensMultiRouter(
                [
                    {amountIn: toWei(195.5), amountOutMin:0, path: [quote.address,base.address]},
                    {amountIn: toWei(40), amountOutMin:0, path: [base1.address,quote1.address]},
                    {amountIn: toWei(38.5), amountOutMin:0, path: [quote2.address,reflex.address]}
                ],
                deployer.address,
                999999999999999)

            await expectBalance(base,quote,10035,9804.5)
            await expectBalance(base1,quote1,9960,11870)
            await expectBalance(reflex,quote2,10045,9961.5)

        });

        it('should swap 3 difference pairs and quote pairA = base pairB', async function () {

            await openLimitOrder([
                {quantity: 10, pip: 55000, isBuy: false},
                {quantity: 20, pip: 56000, isBuy: false},
                {quantity: 30, pip: 57000, isBuy: false}],pair
            )

            await openLimitOrder([
                {quantity: 10, pip: 60000, isBuy: false},
                {quantity: 20, pip: 70000, isBuy: false},
                {quantity: 30, pip: 77000, isBuy: false}],pairBase1Quote
            )



            await posiRouter.swapExactTokensForTokensMultiRouter(
                [
                    {amountIn: toWei(195.5), amountOutMin:0, path: [quote.address,base.address]},
                    {amountIn: toWei(277), amountOutMin:0, path: [quote.address,base1.address]}
                ],
                deployer.address,
                999999999999999)

            await expectBalance(base,quote,10035,9527.5)
            await expectBalance(base1,quote,10040,9527.5)

        });


    })

    describe("Bridge swap", async () => {

        it('should 1 bridge swap  ', async function () {

            await openLimitOrder([
                {quantity: 10, pip: 45000, isBuy: true},
                {quantity: 20, pip: 46000, isBuy: true},
                {quantity: 30, pip: 47000, isBuy: true}], pair
            )

            await openLimitOrder([
                {quantity: 10, pip: 60000, isBuy: false},
                {quantity: 20, pip: 70000, isBuy: false},
                {quantity: 30, pip: 77000, isBuy: false}], pairBase1Quote
            )

            await posiRouter.swapExactTokensForTokensMultiRouter(
                [
                    {amountIn: toWei(20), amountOutMin: 0, path: [base.address, quote.address, base1.address]},
                    // {amountIn: toWei(277), amountOutMin:0, path: [quote.address,base1.address]}
                ],
                deployer.address,
                999999999999999)

            await expectBalance(base1, quote, 10014.857142857142858, 10000)
            await expectBalance(base, quote, 9980, 10000)

        });

        it('should multi bridge swap  ', async function () {

            await openLimitOrder([
                {quantity: 10, pip: 45000, isBuy: true},
                {quantity: 20, pip: 46000, isBuy: true},
                {quantity: 30, pip: 47000, isBuy: true},

                {quantity: 10, pip: 51000, isBuy: false},
                {quantity: 20, pip: 52000, isBuy: false},
                {quantity: 30, pip: 53000, isBuy: false}], pair
            )

            await openLimitOrder([
                {quantity: 10, pip: 60000, isBuy: false},
                {quantity: 20, pip: 70000, isBuy: false},
                {quantity: 30, pip: 77000, isBuy: false},

                {quantity: 10, pip: 57000, isBuy: true},
                {quantity: 20, pip: 56000, isBuy: true},
                {quantity: 30, pip: 55000, isBuy: true}], pairBase1Quote
            )

            await posiRouter.swapExactTokensForTokensMultiRouter(
                [
                    {amountIn: toWei(20), amountOutMin: 0, path: [base.address, quote.address, base1.address]},
                    {amountIn: toWei(35), amountOutMin: 0, path: [base1.address, quote.address, base.address]}
                    // {amountIn: toWei(277), amountOutMin:0, path: [quote.address,base1.address]}
                ],
                deployer.address,
                999999999999999)

            await expectBalance(base1, quote, 9979.857142857143, 10000)
            await expectBalance(base, quote, 10017.830188679245, 10000)

        });


        it('should multi bridge swap and not enough liquidity   ', async function () {

            await openLimitOrder([
                {quantity: 10, pip: 45000, isBuy: true},
                {quantity: 20, pip: 46000, isBuy: true},
                {quantity: 30, pip: 47000, isBuy: true},

                {quantity: 1, pip: 51000, isBuy: false},
                {quantity: 2, pip: 52000, isBuy: false},
                {quantity: 3, pip: 53000, isBuy: false}], pair
            )

            await openLimitOrder([
                {quantity: 10, pip: 60000, isBuy: false},
                {quantity: 20, pip: 70000, isBuy: false},
                {quantity: 30, pip: 77000, isBuy: false},

                {quantity: 10, pip: 57000, isBuy: true},
                {quantity: 20, pip: 56000, isBuy: true},
                {quantity: 30, pip: 55000, isBuy: true}], pairBase1Quote
            )

            await posiRouter.swapExactTokensForTokensMultiRouter(
                [
                    {amountIn: toWei(20), amountOutMin: 0, path: [base.address, quote.address, base1.address]},
                    {amountIn: toWei(35), amountOutMin: 0, path: [base1.address, quote.address, base.address]}
                    // {amountIn: toWei(277), amountOutMin:0, path: [quote.address,base1.address]}
                ],
                deployer.address,
                999999999999999)

            await expectBalance(base1, quote, 9979.857142857143, 10000)
            await expectBalance(base, quote, 10017.830188679245, 10000)

        });

        it('should 4 bridge swap', async function () {

            await openLimitOrder([
                {quantity: 10, pip: 45000, isBuy: true}, //10
                {quantity: 20, pip: 46000, isBuy: true}, //20
                {quantity: 30, pip: 47000, isBuy: true},//10

                {quantity: 10, pip: 51000, isBuy: false},
                {quantity: 20, pip: 52000, isBuy: false},
                {quantity: 30, pip: 53000, isBuy: false}], pair //22.169811320754718
            )

            await openLimitOrder([
                {quantity: 10, pip: 60000, isBuy: false},
                {quantity: 20, pip: 70000, isBuy: false}, //15.142857142857142
                {quantity: 30, pip: 77000, isBuy: false}, //30

                {quantity: 10, pip: 57000, isBuy: true},
                {quantity: 20, pip: 56000, isBuy: true},
                {quantity: 30, pip: 55000, isBuy: true}], pairBase1Quote //25
            )

            await openLimitOrder([
                {quantity: 10, pip: 6000, isBuy: false},
                {quantity: 20, pip: 7000, isBuy: false},
                {quantity: 30, pip: 7700, isBuy: false},

                {quantity: 10, pip: 5700, isBuy: true},
                {quantity: 20, pip: 5600, isBuy: true},
                {quantity: 30, pip: 5500, isBuy: true}], pairBase1Quote1
            )

            await posiRouter.swapExactTokensForTokensMultiRouter(
                [
                    {amountIn: toWei(20), amountOutMin: 0, path: [base.address, quote.address, base1.address]},
                    {amountIn: toWei(35), amountOutMin: 0, path: [base1.address, quote.address, base.address]},

                    {amountIn: toWei(143.4), amountOutMin: 0, path: [quote.address, base1.address, quote1.address]},
                    {amountIn: toWei(750), amountOutMin: 0, path: [quote1.address, base1.address, quote.address]}

                ],
                deployer.address,
                999999999999999)

            await expectBalance(base1, quote1, 9979.857142857143, 10380)
            await expectBalance(base, quote, 10017.830188679245, 9923.385714285714)



        });

    })

    describe("Bridge swap POSI - BNB", async () => {

        it('should 1 bridge swap POSI - BNB  ', async function () {

            await openLimitOrder([
                {quantity: 10, pip: 2000, isBuy: false},
                {quantity: 20, pip: 3000, isBuy: false},
                {quantity: 30, pip: 4000, isBuy: false}], pairPosiBNB
            )

            await openLimitOrder([
                {quantity: 10, pip: 40000, isBuy: true},
                {quantity: 20, pip: 30000, isBuy: true},
                {quantity: 30, pip: 20000, isBuy: true}], pairPosiBusd
            )

            await posiRouter.swapExactTokensForTokensMultiRouter(
                [
                    {amountIn: toWei(20), amountOutMin: 0, path: [wbnb.address, reflex.address, quote.address]},

                ],
                deployer.address,
                999999999999999)

            await expectBalance(base1, quote, 10014.857142857142858, 10000)
            await expectBalance(base, quote, 9980, 10000)

        });



    })

})
