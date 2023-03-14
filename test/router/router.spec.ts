import {
    EstimateLogic,
    ForkMatchingEngineAMM,
    KillerPosition, MockPairUni, MockTokenReward, MockTokenTreasury, MockUniRouter,
    PositionNondisperseLiquidity, PositionRouter,
    PositionSpotFactory, PositionStakingDexManager, SpotHouse
} from "../../typeChain";
import {SignerWithAddress} from "@nomiclabs/hardhat-ethers/signers";
import {deployContract, toWei, getAccount, SIDE, expectDataInRange, toEther} from "../utils/utils";
import {ethers} from "hardhat";
import {deployMockReflexToken, deployMockToken, deployMockWrappedBNB} from "../utils/mock";
import {boolean} from "hardhat/internal/core/params/argumentTypes";
import {expect} from "chai";



interface LimitOrder {
    isBuy: boolean,
    pip: number,
    quantity: number
}
describe("router", async () => {



    let factory: PositionSpotFactory;
    let killer: KillerPosition;
    let pairPosiBusd: ForkMatchingEngineAMM;
    let pair: ForkMatchingEngineAMM;
    let dexNFT: PositionNondisperseLiquidity;
    let uniRouter: MockUniRouter;
    let mockPairUni: MockPairUni;
    let staking : PositionStakingDexManager
    let spotHouse : SpotHouse;
    let posiRouter : PositionRouter
    let estLogic : EstimateLogic


    let rewardToken : MockTokenReward;
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
        spotHouse = await  deployContract("SpotHouse");
        await spotHouse.initialize();



        pair = await deployContract("ForkMatchingEngineAMM");

        estLogic = await deployContract("EstimateLogic");

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

        posiRouter = await  deployContract("PositionRouter");
        await posiRouter.initialize(factory.address, spotHouse.address, uniRouter.address, wbnb.address );

        await posiRouter.setEstimateLogic(estLogic.address);



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

        await base.mint(deployer.address, toWei(1000000000))
        await quote.mint(deployer.address, toWei(1000000000))
        await reflex.mint(deployer.address, toWei(1000000000))


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

        await factory.addPairManagerManual(pair.address, base.address, quote.address);
        await factory.addPairManagerManual(pairPosiBusd.address, reflex.address, quote.address);


        rewardToken = await deployContract("MockTokenReward")
        treasury = await deployContract("MockTokenTreasury", users[0].address,rewardToken.address)

        staking = await deployContract("PositionStakingDexManager")
        await rewardToken.setTreasuryAddress(treasury.address)
        await treasury.setPosition(rewardToken.address)
        await staking.initialize(rewardToken.address, dexNFT.address, 0)
        await staking.setPositionTreasury(treasury.address)
        await staking.add(pair.address, 10, 0,0,false)
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


    async function openLimitOrder(orders: LimitOrder[]) {

        for (let order of orders) {
            await spotHouse.openLimitOrder(
                pair.address,
                order.isBuy ? SIDE.BUY : SIDE.SELL,
                toWei(order.quantity),
                order.pip)
        }
    }

    async function addLiquidity(amountVirtual: number, indexInLiquidity: number, isBase: boolean, pair : string,valueEther = 0) {

        await dexNFT.addLiquidity({
                amountVirtual: toWei(amountVirtual.toString()),
                indexedPipRange: indexInLiquidity,
                isBase: isBase,
                pool: pair
            },

            {value: ethers.utils.parseEther(valueEther.toString())})

    }
    describe("est amount in", async () => {


        it("amount in when sell -- fill 1 pip ", async () => {

            await openLimitOrder([
                {quantity: 10, pip: 45000, isBuy: true},
                {quantity: 20, pip: 44000, isBuy: true},
                {quantity: 30, pip: 43000, isBuy: true},
            ])

            const amountsIn = await posiRouter.getAmountsIn(toWei(1), [base.address, quote.address]);// get  amount in ==> input amount out

            console.log("amountsIn: ", amountsIn);
            // expect(amountsIn[0]).to.equal(toWei(2.2222222));
            expect(expectDataInRange(Number(toEther(amountsIn[0].toString())),0.2222222, 0.001)).to.equal(true, "Estimate wrong");


        })

        it("amount in when sell - fill multi pip 1", async () => {

            await openLimitOrder([
                {quantity: 10, pip: 45000, isBuy: true},
                {quantity: 20, pip: 44000, isBuy: true},
                {quantity: 30, pip: 43000, isBuy: true},
            ])

            const amountsIn = await posiRouter.getAmountsIn(toWei(45), [base.address, quote.address]);// get  amount in ==> input amount out

            console.log("amountsIn: ", amountsIn);
            expect(amountsIn[0]).to.equal(toWei(10));

        })

        it("amount in when sell - fill multi pip", async () => {

            await openLimitOrder([
                {quantity: 10, pip: 45000, isBuy: true},
                {quantity: 20, pip: 44000, isBuy: true},
                {quantity: 30, pip: 43000, isBuy: true},
            ])

            const amountsIn = await posiRouter.getAmountsIn(toWei(90), [base.address, quote.address]);// get  amount in ==> input amount out

            console.log("amountsIn: ", amountsIn);
            // expect(amountsIn[0]).to.equal(toWei(20.227272727272727));
            expect(expectDataInRange(Number(toEther(amountsIn[0].toString())),20.227272727272727, 0.001)).to.equal(true, "Estimate wrong");


        })

        it("amount in when buy - fill 1 pip", async () => {

            await openLimitOrder([
                {quantity: 10, pip: 53000, isBuy: false},
                {quantity: 20, pip: 52000, isBuy: false},
                {quantity: 30, pip: 51000, isBuy: false},
            ])

            const amountsIn = await posiRouter.getAmountsIn(toWei(1), [quote.address, base.address]);// get  amount in ==> input amount out

            console.log("amountsIn: ", amountsIn);
            expect(amountsIn[0]).to.equal(toWei(5.1));

        })


        it("amount in when buy - fill multi pip", async () => {

            await openLimitOrder([
                {quantity: 10, pip: 53000, isBuy: false},
                {quantity: 20, pip: 52000, isBuy: false},
                {quantity: 30, pip: 51000, isBuy: false},
            ])

            const amountsIn = await posiRouter.getAmountsIn(toWei(55), [quote.address, base.address]);// get  amount in ==> input amount out

            console.log("amountsIn: ", amountsIn);
            expect(amountsIn[0]).to.equal(toWei(283.5));

        })
    })


    describe("est amount out", async () =>  {


        it("amount out when buy - fill 1 pip",async ()=>{

            await openLimitOrder([
                {quantity: 10, pip: 53000, isBuy: false},
                {quantity: 20, pip: 52000, isBuy: false},
                {quantity: 30, pip: 51000, isBuy: false},
            ])

            const amountsOut = await  posiRouter.getAmountsOut(toWei(5.1), [quote.address,base.address]);// get  amount out ==> input amount in

            console.log("amountsOut: ", amountsOut);
            expect(amountsOut[1]).to.equal(toWei(1));

        })

        it("amount out when buy - fill multi pip",async ()=>{

            await openLimitOrder([
                {quantity: 10, pip: 53000, isBuy: false},
                {quantity: 20, pip: 52000, isBuy: false},
                {quantity: 30, pip: 51000, isBuy: false},
            ])

            const amountsOut = await  posiRouter.getAmountsOut(toWei(283.5), [quote.address,base.address]);// get  amount out ==> input amount in

            console.log("amountsOut: ", amountsOut);
            expect(amountsOut[1]).to.equal(toWei(55));

        })

        it("amount out when sell - fill 1 pip",async ()=>{

            await openLimitOrder([
                {quantity: 10, pip: 43000, isBuy: true},
                {quantity: 20, pip: 42000, isBuy: true},
                {quantity: 30, pip: 41000, isBuy: true},
            ])

            const amountsOut = await  posiRouter.getAmountsOut(toWei(1), [base.address,quote.address]);// get  amount out ==> input amount in

            console.log("amountsOut: ", amountsOut);
            expect(amountsOut[1]).to.equal(toWei(4.3));

        })

        it("amount out when sell - fill multi pip",async ()=>{

            await openLimitOrder([
                {quantity: 10, pip: 43000, isBuy: true},
                {quantity: 20, pip: 42000, isBuy: true},
                {quantity: 30, pip: 41000, isBuy: true},
            ])

            const amountsOut = await  posiRouter.getAmountsOut(toWei(55), [base.address,quote.address]);// get  amount out ==> input amount in

            console.log("amountsOut: ", amountsOut);
            expect(amountsOut[1]).to.equal(toWei(229.50000000000));

        })

    })


    describe("est amount out has liquidity ", async () => {


        it("est sell when pair has only liquidity",async ()=>{

           await  addLiquidity(10, 1, true, pair.address)


            // await openLimitOrder([
            //     {quantity: 10, pip: 53000, isBuy: false},
            //     {quantity: 20, pip: 52000, isBuy: false},
            //     {quantity: 30, pip: 51000, isBuy: false},
            // ])

            const amountsOut = await  posiRouter.getAmountsOut(toWei(13.54821005595), [base.address,quote.address]);// get  amount out ==> input amount in

            console.log("amountsOut: ", amountsOut);

            expect(expectDataInRange(Number(toEther(amountsOut[1].toString())),60.589437314956013220, 0.001)).to.equal(true, "Estimate wrong");

        })

        it("est sell when pair has limit order and liquidity1",async ()=>{

            await  addLiquidity(10, 1, true, pair.address)


            await openLimitOrder([
                {quantity: 10, pip: 40000, isBuy: true}

            ])

            const amountsOut = await  posiRouter.getAmountsOut(toWei(18.54821005595), [base.address,quote.address]);// get  amount out ==> input amount in

            console.log("amountsOut: ", amountsOut);
            expect(expectDataInRange(Number(toEther(amountsOut[1].toString())),80.58943731710, 0.001)).to.equal(true, "Estimate wrong");



        })

        it("est sell when pair has limit order and liquidity2",async ()=>{

            await  addLiquidity(10, 1, true, pair.address)


            await openLimitOrder([
                {quantity: 5, pip: 45000, isBuy: true}

            ])

            const amountsOut = await  posiRouter.getAmountsOut(toWei(18.54821005595), [base.address,quote.address]);// get  amount out ==> input amount in

            console.log("amountsOut: ", amountsOut);
            expect(expectDataInRange(Number(toEther(amountsOut[1].toString())),83.08943731710, 0.001)).to.equal(true, "Estimate wrong");

        })

        it("est sell when pair has limit order and liquidity and not reach target pip",async ()=>{

            await  addLiquidity(10, 1, true, pair.address)


            await openLimitOrder([
                {quantity: 10, pip: 40000, isBuy: true}

            ])

            const amountsOut = await  posiRouter.getAmountsOut(toWei(10), [base.address,quote.address]);// get  amount out ==> input amount in

            console.log("amountsOut: ", amountsOut);

            expect(expectDataInRange(Number(toEther(amountsOut[1].toString())),45.99302072495, 0.001)).to.equal(true, "Estimate wrong");

        })


        it("est buy when pair has only liquidity",async ()=>{

            await  addLiquidity(10, 1, true, pair.address)


            // await openLimitOrder([
            //     {quantity: 10, pip: 53000, isBuy: false},
            //     {quantity: 20, pip: 52000, isBuy: false},
            //     {quantity: 30, pip: 51000, isBuy: false},
            // ])

            const amountsOut = await  posiRouter.getAmountsOut(toWei(28.01195378559), [quote.address,base.address]);// get  amount out ==> input amount in

            console.log("amountsOut: ", amountsOut);
            expect(expectDataInRange(Number(toEther(amountsOut[1].toString())),5.34166999725, 0.001)).to.equal(true, "Estimate wrong");

        })

        it("est buy when pair has limit order and liquidity1",async ()=>{

            await  addLiquidity(10, 1, true, pair.address)


            await openLimitOrder([
                {quantity: 10, pip: 55000, isBuy: false}

            ])

            const amountsOut = await  posiRouter.getAmountsOut(toWei(55.51195378559), [quote.address,base.address]);// get  amount out ==> input amount in

            console.log("amountsOut: ", amountsOut);
            expect(expectDataInRange(Number(toEther(amountsOut[1].toString())),10.34166999725, 0.001)).to.equal(true, "Estimate wrong");


        })

        it("est buy when pair has limit order and liquidity2",async ()=>{

            await  addLiquidity(10, 1, true, pair.address)


            await openLimitOrder([
                {quantity: 5, pip: 52000, isBuy: false}

            ])

            const amountsOut = await  posiRouter.getAmountsOut(toWei(54.01195), [quote.address,base.address]);// get  amount out ==> input amount in

            console.log("amountsOut: ", amountsOut);

            expect(expectDataInRange(Number(toEther(amountsOut[1].toString())),10.34166999725, 0.001)).to.equal(true, "Estimate wrong");


        })

        it("est buy when pair has limit order and liquidity and not reach target pip",async ()=>{

            await  addLiquidity(10, 1, true, pair.address)


            await openLimitOrder([
                {quantity: 10, pip: 56000, isBuy: false}

            ])

            const amountsOut = await  posiRouter.getAmountsOut(toWei(20), [quote.address,base.address]);// get  amount out ==> input amount in

            console.log("amountsOut: ", amountsOut);
            expect(expectDataInRange(Number(toEther(amountsOut[1].toString())),3.86529977088, 0.001)).to.equal(true, "Estimate wrong");


        })


    })

    describe("est amount in has liquidity ", async () => {


        it("est sell when pair has only liquidity",async ()=>{

            await  addLiquidity(10, 1, true, pair.address)


            // await openLimitOrder([
            //     {quantity: 10, pip: 53000, isBuy: false},
            //     {quantity: 20, pip: 52000, isBuy: false},
            //     {quantity: 30, pip: 51000, isBuy: false},
            // ])

            const amountsIn = await  posiRouter.getAmountsIn(toWei( 60.589437314956013220), [base.address,quote.address]);// get  amount in ==> input amount out

            console.log("amountsIn: ", amountsIn);
            expect(expectDataInRange(Number(toEther(amountsIn[0].toString())),13.54821005595, 0.001)).to.equal(true, "Estimate wrong");



        })

        it("est sell when pair has limit order and liquidity1",async ()=>{

            await  addLiquidity(10, 1, true, pair.address)


            await openLimitOrder([
                {quantity: 10, pip: 40000, isBuy: true}

            ])

            const amountsIn = await  posiRouter.getAmountsIn(toWei(80.58943731710), [base.address,quote.address]);// get  amount out ==> input amount in

            console.log("amountsIn: ", amountsIn);
            // expect(amountsIn[0]).to.equal(toWei( 18.54821005595));
            expect(expectDataInRange(Number(toEther(amountsIn[0].toString())),18.5482100559595, 0.001)).to.equal(true, "Estimate wrong");


        })

        it("est sell when pair has limit order and liquidity2",async ()=>{

            await  addLiquidity(10, 1, true, pair.address)


            await openLimitOrder([
                {quantity: 5, pip: 45000, isBuy: true}

            ])

            const amountsIn = await  posiRouter.getAmountsIn(toWei(83.08943731710), [base.address,quote.address]);// get  amount out ==> input amount in

            console.log("amountsIn: ", amountsIn);
            expect(expectDataInRange(Number(toEther(amountsIn[0].toString())),18.5482100559595, 0.001)).to.equal(true, "Estimate wrong");


        })

        it("est sell when pair has limit order and liquidity and not reach target pip",async ()=>{

            await  addLiquidity(10, 1, true, pair.address)


            await openLimitOrder([
                {quantity: 10, pip: 40000, isBuy: true}

            ])

            const amountsIn = await  posiRouter.getAmountsIn(toWei(45.99302072495), [base.address,quote.address]);// get  amount out ==> input amount in

            console.log("amountsIn: ", amountsIn);
            // expect(amountsIn[0]).to.equal(toWei(10));

            expect(expectDataInRange(Number(toEther(amountsIn[0].toString())),10, 0.001)).to.equal(true, "Estimate wrong");



        })

        it("est buy when pair has limit order and liquidity1",async ()=>{

            await  addLiquidity(10, 1, true, pair.address)


            await openLimitOrder([
                {quantity: 10, pip: 55000, isBuy: false}

            ])

            const amountsIn = await  posiRouter.getAmountsIn(toWei(10.34166999725), [quote.address,base.address]);// get  amount out ==> input amount in

            console.log("amountsIn: ", amountsIn);
            expect(expectDataInRange(Number(toEther(amountsIn[0].toString())),55.51195378559, 0.001)).to.equal(true, "Estimate wrong");

            // expect(amountsIn[0]).to.equal(toWei(55.51195378559));

        })

        it("est buy when pair has limit order and liquidity2",async ()=>{

            await  addLiquidity(10, 1, true, pair.address)


            await openLimitOrder([
                {quantity: 5, pip: 52000, isBuy: false}

            ])

            const amountsIn = await  posiRouter.getAmountsIn(toWei(10.34166999725), [quote.address,base.address]);// get  amount out ==> input amount in

            console.log("amountsIn: ", amountsIn);
            // expect(amountsIn[0]).to.equal(toWei(58.01195378559));
            expect(expectDataInRange(Number(toEther(amountsIn[0].toString())),54.01195 , 0.001)).to.equal(true, "Estimate wrong");


        })

        it("est buy when pair has limit order and liquidity and not reach target pip",async ()=>{

            await  addLiquidity(10, 1, true, pair.address)


            await openLimitOrder([
                {quantity: 10, pip: 56000, isBuy: false}

            ])

            const amountsIn = await  posiRouter.getAmountsIn(toWei(3.86529977088), [quote.address,base.address]);// get  amount out ==> input amount in

            console.log("amountsIn: ", amountsIn);
            // expect(amountsIn[0]).to.equal(toWei(3.86529977088));
            expect(expectDataInRange(Number(toEther(amountsIn[0].toString())),20, 0.001)).to.equal(true, "Estimate wrong");


        })



    })

})
