import {
    ForkMatchingEngineAMM,
    KillerPosition,
    MatchingEngineAMM, MockPairUni,
    MockUniRouter, PositionNondisperseLiquidity,
    PositionSpotFactory,
} from "../../typeChain";
import {deployContract, getAccount, toEther, toWei} from "../utils/utils";
import {deployMockReflexToken, deployMockToken, deployMockWrappedBNB} from "../utils/mock";
import {BASIS_POINT} from "../liquidity/test-liquidity";
import {ethers} from "hardhat";
import {SignerWithAddress} from "@nomiclabs/hardhat-ethers/signers";


describe("killer-position", async function () {


    let factory: PositionSpotFactory;
    let killer: KillerPosition;
    let pair: ForkMatchingEngineAMM;
    let dexNFT: PositionNondisperseLiquidity;
    let uniRouter: MockUniRouter;
    let mockPairUni: MockPairUni;

    let quote: any;
    let base: any;
    let reflex: any;
    let wbnb: any
    let users: any[] = [];
    let deployer: SignerWithAddress;


    beforeEach(async () => {

        users = await getAccount() as unknown as SignerWithAddress[];
        // console.log("users: ", users[0])
        // deployer = users[0];
        //
        // console.log("deployer: ", deployer)


        deployer = users[0];
        pair = await deployContract("ForkMatchingEngineAMM");

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


        await base.approve(uniRouter.address, ethers.constants.MaxInt256);
        await quote.approve(uniRouter.address, ethers.constants.MaxInt256);
        await reflex.approve(uniRouter.address, ethers.constants.MaxInt256);
        await mockPairUni.approve(killer.address, ethers.constants.MaxInt256);


        await base.approve(dexNFT.address, ethers.constants.MaxInt256);
        await quote.approve(dexNFT.address, ethers.constants.MaxInt256);
        await reflex.approve(dexNFT.address, ethers.constants.MaxInt256);


        await mockPairUni.mint(deployer.address, toWei(10000000000000))
        await dexNFT.setBNB(wbnb.address);


    })

    async function setTokenAndDeposit(token0: string, token1: string, amount0: any, amount1: any) {
        await uniRouter.setToken(token0, token1);
        await mockPairUni.setToken(token0, token1);
        let _value;

        if (token0 === wbnb.address) {
            _value = ethers.utils.parseEther(amount0.toString());
        }
        if (token1 === wbnb.address) {
            _value = ethers.utils.parseEther(amount1.toString());
        }
        console.log("_value: ", _value);
        await uniRouter.deposit(toWei(amount0), toWei(amount1), {value: _value})
    }

    async function addLiquidity(amountVirtual: number, indexInLiquidity: number, isBase: boolean, valueEther = 0) {

        console.log("value ether");
        await dexNFT.addLiquidity({
                amountVirtual: toWei(amountVirtual.toString()),
                indexedPipRange: indexInLiquidity,
                isBase: isBase,
                pool: pair.address
            },

            {value: ethers.utils.parseEther(valueEther.toString())})

    }


    async function getLiquidityInfo(index: number, nftId) {

        const info = await pair.liquidityInfo(index)

        console.log("liquidity base real: ", toEther(info.baseReal.toString()));
        console.log("liquidity quote real: ", toEther(info.quoteReal.toString()));


        const liquidity = await dexNFT.liquidity(nftId)
        console.log("baseVirtual: ", toEther(liquidity.baseVirtual.toString()))
        console.log("quoteVirtual: ", toEther(liquidity.quoteVirtual.toString()))
    }

    describe("posi/busd", function () {

        beforeEach("init", async () => {
            console.log("start init")
            await pair.initialize(
                {
                    quoteAsset: quote.address,
                    baseAsset: reflex.address,
                    basisPoint: BASIS_POINT,
                    maxFindingWordsIndex: 10000,
                    initialPip: 89999,
                    pipRange: 30000,
                    tickSpace: 1,
                    owner: deployer.address,
                    positionLiquidity: dexNFT.address,
                    spotHouse: deployer.address,
                    feeShareAmm: 0,
                    router: deployer.address
                });

            await factory.addPairManagerManual(pair.address, reflex.address, quote.address);
        })

        it('#case23', async () => {

            console.log("start set and deposit")

            await pair.setCurrentPip(70000)

            await setTokenAndDeposit(reflex.address, quote.address, 100, 30)


            console.log("start migrate")

            await killer.migratePosition(mockPairUni.address, toWei(1000))


            const liquidity = await dexNFT.liquidity(1000001)
            console.log("baseVirtual: ", toEther(liquidity.baseVirtual.toString()))
            console.log("quoteVirtual: ", toEther(liquidity.quoteVirtual.toString()))
            console.log("balance base: ", toEther((await reflex.balanceOf(deployer.address)).toString()))
            console.log("balance quote: ", toEther((await quote.balanceOf(deployer.address)).toString()))

        });

        it('#case24', async () => {

            console.log("start set and deposit")
            await pair.setCurrentPip(70000)

            await setTokenAndDeposit(quote.address, reflex.address, 30, 100)

            console.log("start migrate")

            await killer.migratePosition(mockPairUni.address, toWei(1000))


            const liquidity = await dexNFT.liquidity(1000001)
            console.log("baseVirtual: ", toEther(liquidity.baseVirtual.toString()))
            console.log("quoteVirtual: ", toEther(liquidity.quoteVirtual.toString()))
            console.log("balance base: ", toEther((await reflex.balanceOf(deployer.address)).toString()))
            console.log("balance quote: ", toEther((await quote.balanceOf(deployer.address)).toString()))

        });

        it('#case27 -- max index', async () => {

            console.log("start set and deposit")
            await pair.setCurrentPip(89999)

            await setTokenAndDeposit(reflex.address, quote.address, 100, 100)

            console.log("start migrate")

            await killer.migratePosition(mockPairUni.address, toWei(1000))


            const liquidity = await dexNFT.liquidity(1000001)
            console.log("baseVirtual: ", toEther(liquidity.baseVirtual.toString()))
            console.log("quoteVirtual: ", toEther(liquidity.quoteVirtual.toString()))
            console.log("balance base: ", toEther((await reflex.balanceOf(deployer.address)).toString()))
            console.log("balance quote: ", toEther((await quote.balanceOf(deployer.address)).toString()))

        });

        it('#case28 -- min index', async () => {

            console.log("start set and deposit")
            await pair.setCurrentPip(60000)

            await setTokenAndDeposit(reflex.address, quote.address, 100, 100)

            console.log("start migrate")

            await killer.migratePosition(mockPairUni.address, toWei(1000))


            const liquidity = await dexNFT.liquidity(1000001)
            console.log("baseVirtual: ", toEther(liquidity.baseVirtual.toString()))
            console.log("quoteVirtual: ", toEther(liquidity.quoteVirtual.toString()))
            console.log("balance base: ", toEther((await reflex.balanceOf(deployer.address)).toString()))
            console.log("balance quote: ", toEther((await quote.balanceOf(deployer.address)).toString()))

        });

        it('#case29 has liquidity', async () => {

            console.log("start set and deposit")

            await pair.setCurrentPip(70000)
            await setTokenAndDeposit(reflex.address, quote.address, 100, 100)
            await addLiquidity(27.28763753357, 2, true)

            console.log("start migrate")

            await killer.migratePosition(mockPairUni.address, toWei(1000))

            //
            // const liquidity = await dexNFT.liquidity(1000001)
            // console.log("baseVirtual: ", toEther(liquidity.baseVirtual.toString()))
            // console.log("quoteVirtual: ",   toEther(liquidity.quoteVirtual.toString()))
            await getLiquidityInfo(2, 1000002)

            console.log("balance base: ", toEther((await reflex.balanceOf(deployer.address)).toString()))
            console.log("balance quote: ", toEther((await quote.balanceOf(deployer.address)).toString()))

        });

        it('#case31 enough base, quote', async () => {

            console.log("start set and deposit")

            await pair.setCurrentPip(70000)
            await setTokenAndDeposit(reflex.address, quote.address, 27.84168710700, 120)
            // await  addLiquidity(27.56327,2,true)

            console.log("start migrate")

            await killer.migratePosition(mockPairUni.address, toWei(1000))

            //
            // const liquidity = await dexNFT.liquidity(1000001)
            // console.log("baseVirtual: ", toEther(liquidity.baseVirtual.toString()))
            // console.log("quoteVirtual: ",   toEther(liquidity.quoteVirtual.toString()))
            await getLiquidityInfo(2, 1000001)

            console.log("balance base: ", toEther((await reflex.balanceOf(deployer.address)).toString()))
            console.log("balance quote: ", toEther((await quote.balanceOf(deployer.address)).toString()))

        });

        it('#case32 b<Q', async () => {

            console.log("start set and deposit")

            await pair.setCurrentPip(70000)
            await setTokenAndDeposit(reflex.address, quote.address, 20, 120)
            // await  addLiquidity(27.56327,2,true)

            console.log("start migrate")

            await killer.migratePosition(mockPairUni.address, toWei(1000))

            //
            // const liquidity = await dexNFT.liquidity(1000001)
            // console.log("baseVirtual: ", toEther(liquidity.baseVirtual.toString()))
            // console.log("quoteVirtual: ",   toEther(liquidity.quoteVirtual.toString()))
            await getLiquidityInfo(2, 1000001)

            console.log("balance base: ", toEther((await reflex.balanceOf(deployer.address)).toString()))
            console.log("balance quote: ", toEther((await quote.balanceOf(deployer.address)).toString()))

        });

        it('#case33 b>Q', async () => {

            console.log("start set and deposit")

            await pair.setCurrentPip(70000)
            await setTokenAndDeposit(reflex.address, quote.address, 20, 65)
            // await  addLiquidity(27.56327,2,true)

            console.log("start migrate")

            await killer.migratePosition(mockPairUni.address, toWei(1000))

            //
            // const liquidity = await dexNFT.liquidity(1000001)
            // console.log("baseVirtual: ", toEther(liquidity.baseVirtual.toString()))
            // console.log("quoteVirtual: ",   toEther(liquidity.quoteVirtual.toString()))
            await getLiquidityInfo(2, 1000001)

            console.log("balance base: ", toEther((await reflex.balanceOf(deployer.address)).toString()))
            console.log("balance quote: ", toEther((await quote.balanceOf(deployer.address)).toString()))

        });

    })

    describe("cake/busd", function () {

        beforeEach("init", async () => {
            console.log("start init")
            await pair.initialize(
                {
                    quoteAsset: quote.address,
                    baseAsset: base.address,
                    basisPoint: BASIS_POINT,
                    maxFindingWordsIndex: 10000,
                    initialPip: 100000,
                    pipRange: 30000,
                    tickSpace: 1,
                    owner: deployer.address,
                    positionLiquidity: dexNFT.address,
                    spotHouse: deployer.address,
                    feeShareAmm: 0,
                    router: deployer.address
                });

            await factory.addPairManagerManual(pair.address, base.address, quote.address);
        })

        it('#1', async () => {

            console.log("start set and deposit")
            await pair.setCurrentPip(70000)

            await setTokenAndDeposit(base.address, quote.address, 100, 100)

            console.log("start migrate")

            await killer.migratePosition(mockPairUni.address, toWei(1000))


            // const liquidity = await dexNFT.liquidity(1000001)
            // console.log("baseVirtual: ", toEther(liquidity.baseVirtual.toString()))
            // console.log("quoteVirtual: ", toEther(liquidity.quoteVirtual.toString()))
            await getLiquidityInfo(2, 1000001)
            console.log("balance base: ", toEther((await reflex.balanceOf(deployer.address)).toString()))
            console.log("balance quote: ", toEther((await quote.balanceOf(deployer.address)).toString()))

        });

    })


    describe("cake/bnb", function () {

        beforeEach("init", async () => {
            console.log("start init")
            await pair.initialize(
                {
                    quoteAsset: wbnb.address,
                    baseAsset: base.address,
                    basisPoint: BASIS_POINT,
                    maxFindingWordsIndex: 10000,
                    initialPip: 1000,
                    pipRange: 30000,
                    tickSpace: 1,
                    owner: deployer.address,
                    positionLiquidity: dexNFT.address,
                    spotHouse: deployer.address,
                    feeShareAmm: 0,
                    router: deployer.address
                });

            await factory.addPairManagerManual(pair.address, base.address, wbnb.address);
        })

        it('#1 amount0 >> amount1', async () => {


            console.log("start set and deposit")
            await pair.setCurrentPip(1000)

            await setTokenAndDeposit(base.address, wbnb.address, 100, 1)

            console.log("start migrate")

            await killer.migratePosition(mockPairUni.address, toWei(1000))


            await getLiquidityInfo(0, 1000001)
            console.log("balance base: ", toEther((await base.balanceOf(deployer.address)).toString()))
            // console.log("balance quote: ", toEther( (await quote.balanceOf(deployer.address)).toString()))

        });
        it('#2 amount == amount', async () => {

            console.log("start set and deposit")
            await pair.setCurrentPip(1000)

            await setTokenAndDeposit(base.address, wbnb.address, 1, 1)

            console.log("start migrate")

            await killer.migratePosition(mockPairUni.address, toWei(1000))


            await getLiquidityInfo(0, 1000001)
            console.log("balance base: ", toEther((await base.balanceOf(deployer.address)).toString()))
            // console.log("balance quote: ", toEther( (await quote.balanceOf(deployer.address)).toString()))

        });


        it('#2 token1 is base amount1 >> amount0', async () => {


            console.log("start set and deposit")
            await pair.setCurrentPip(1000)

            await setTokenAndDeposit(wbnb.address, base.address, 1, 100)

            console.log("start migrate")

            await killer.migratePosition(mockPairUni.address, toWei(1000))


            await getLiquidityInfo(0, 1000001)
            console.log("balance base: ", toEther((await base.balanceOf(deployer.address)).toString()))
            // console.log("balance quote: ", toEther( (await quote.balanceOf(deployer.address)).toString()))

        });
        it('#2 token1 is base amount == amount', async () => {

            console.log("start set and deposit")
            await pair.setCurrentPip(1000)

            await setTokenAndDeposit(wbnb.address, base.address, 1, 1)

            console.log("start migrate")

            await killer.migratePosition(mockPairUni.address, toWei(1000))


            await getLiquidityInfo(0, 1000001)
            console.log("balance base: ", toEther((await base.balanceOf(deployer.address)).toString()))
            // console.log("balance quote: ", toEther( (await quote.balanceOf(deployer.address)).toString()))

        });

    })

    describe("posi/bnb", function () {

        beforeEach("init", async () => {
            console.log("start init")
            await pair.initialize(
                {
                    quoteAsset: wbnb.address,
                    baseAsset: reflex.address,
                    basisPoint: BASIS_POINT,
                    maxFindingWordsIndex: 10000,
                    initialPip: 1000,
                    pipRange: 30000,
                    tickSpace: 1,
                    owner: deployer.address,
                    positionLiquidity: dexNFT.address,
                    spotHouse: deployer.address,
                    feeShareAmm: 0,
                    router: deployer.address
                });

            await factory.addPairManagerManual(pair.address, reflex.address, wbnb.address);
        })

        it('#case12', async () => {

            console.log("start set and deposit")
            console.log("balance quote 1: ", toEther((await deployer.getBalance()).toString()))


            await pair.setCurrentPip(7000)

            await setTokenAndDeposit(reflex.address, wbnb.address, 10, 1)


            console.log("start migrate")

            await killer.migratePosition(mockPairUni.address, toWei(1000))


            const liquidity = await dexNFT.liquidity(1000001)
            console.log("baseVirtual: ", toEther(liquidity.baseVirtual.toString()))
            console.log("quoteVirtual: ", toEther(liquidity.quoteVirtual.toString()))
            console.log("balance base: ", toEther((await reflex.balanceOf(deployer.address)).toString()))
            console.log("balance quote: ", toEther((await deployer.getBalance()).toString()))

        });

        it('#case13', async () => {

            console.log("start set and deposit")
            console.log("balance quote 1: ", toEther((await deployer.getBalance()).toString()))


            await pair.setCurrentPip(7000)

            await setTokenAndDeposit(wbnb.address, reflex.address, 1, 10)


            console.log("start migrate")

            await killer.migratePosition(mockPairUni.address, toWei(1000))


            const liquidity = await dexNFT.liquidity(1000001)
            console.log("baseVirtual: ", toEther(liquidity.baseVirtual.toString()))
            console.log("quoteVirtual: ", toEther(liquidity.quoteVirtual.toString()))
            console.log("balance base: ", toEther((await reflex.balanceOf(deployer.address)).toString()))
            console.log("balance quote: ", toEther((await deployer.getBalance()).toString()))

        });


        it('#case16 -- max index', async () => {

            console.log("start set and deposit")
            await pair.setCurrentPip(89999)

            await setTokenAndDeposit(reflex.address, wbnb.address, 10, 1)

            console.log("start migrate")

            await killer.migratePosition(mockPairUni.address, toWei(1000))


            const liquidity = await dexNFT.liquidity(1000001)
            console.log("baseVirtual: ", toEther(liquidity.baseVirtual.toString()))
            console.log("quoteVirtual: ", toEther(liquidity.quoteVirtual.toString()))
            console.log("balance base: ", toEther((await reflex.balanceOf(deployer.address)).toString()))
            console.log("balance quote: ", toEther((await deployer.getBalance()).toString()))

            // console.log("balance quote: ", toEther( (await quote.balanceOf(deployer.address)).toString()))

        });

        it('#case17 -- min index', async () => {

            console.log("start set and deposit")
            await pair.setCurrentPip(60000)

            await setTokenAndDeposit(reflex.address, wbnb.address, 100, 100)

            console.log("start migrate")

            await killer.migratePosition(mockPairUni.address, toWei(1000))


            const liquidity = await dexNFT.liquidity(1000001)
            console.log("baseVirtual: ", toEther(liquidity.baseVirtual.toString()))
            console.log("quoteVirtual: ", toEther(liquidity.quoteVirtual.toString()))
            console.log("balance base: ", toEther((await reflex.balanceOf(deployer.address)).toString()))
            console.log("balance quote: ", toEther((await deployer.getBalance()).toString()))

            // console.log("balance quote: ", toEther( (await quote.balanceOf(deployer.address)).toString()))

        });

        it('#case18 has liquidity', async () => {

            console.log("start set and deposit")

            await pair.setCurrentPip(70000)
            await setTokenAndDeposit(reflex.address, wbnb.address, 100, 65)
            await addLiquidity(27.56327023593, 2, true, 121)

            console.log("start migrate")

            await killer.migratePosition(mockPairUni.address, toWei(1000))

            //
            // const liquidity = await dexNFT.liquidity(1000001)
            // console.log("baseVirtual: ", toEther(liquidity.baseVirtual.toString()))
            // console.log("quoteVirtual: ",   toEther(liquidity.quoteVirtual.toString()))
            await getLiquidityInfo(2, 1000002);
            console.log("balance base: ", toEther((await reflex.balanceOf(deployer.address)).toString()))
            console.log("balance quote: ", toEther((await deployer.getBalance()).toString()))

            // console.log("balance quote: ", toEther( (await quote.balanceOf(deployer.address)).toString()))

        });

        it('#case20 enough base, quote', async () => {

            console.log("start set and deposit")

            await pair.setCurrentPip(70000)
            await setTokenAndDeposit(reflex.address, wbnb.address, 27.84168710700, 120)
            // await  addLiquidity(27.56327,2,true)

            console.log("start migrate")

            await killer.migratePosition(mockPairUni.address, toWei(1000))

            //
            // const liquidity = await dexNFT.liquidity(1000001)
            // console.log("baseVirtual: ", toEther(liquidity.baseVirtual.toString()))
            // console.log("quoteVirtual: ",   toEther(liquidity.quoteVirtual.toString()))
            await getLiquidityInfo(2, 1000001)

            console.log("balance base: ", toEther((await reflex.balanceOf(deployer.address)).toString()))
            console.log("balance quote: ", toEther((await deployer.getBalance()).toString()))

            // console.log("balance quote: ", toEther((await quote.balanceOf(deployer.address)).toString()))

        });

        it('#case21 b<Q', async () => {

            console.log("start set and deposit")

            await pair.setCurrentPip(70000)
            await setTokenAndDeposit(reflex.address, wbnb.address, 20, 120)
            // await  addLiquidity(27.56327,2,true)

            console.log("start migrate")

            await killer.migratePosition(mockPairUni.address, toWei(1000))

            //
            // const liquidity = await dexNFT.liquidity(1000001)
            // console.log("baseVirtual: ", toEther(liquidity.baseVirtual.toString()))
            // console.log("quoteVirtual: ",   toEther(liquidity.quoteVirtual.toString()))
            await getLiquidityInfo(2, 1000001)

            console.log("balance base: ", toEther((await reflex.balanceOf(deployer.address)).toString()))
            console.log("balance quote: ", toEther((await deployer.getBalance()).toString()))

            // console.log("balance quote: ", toEther((await quote.balanceOf(deployer.address)).toString()))

        });

        it('#case22 b>Q', async () => {

            console.log("start set and deposit")

            await pair.setCurrentPip(70000)
            await setTokenAndDeposit(reflex.address, wbnb.address, 20, 65)
            // await  addLiquidity(27.56327,2,true)

            console.log("start migrate")

            await killer.migratePosition(mockPairUni.address, toWei(1000))

            //
            // const liquidity = await dexNFT.liquidity(1000001)
            // console.log("baseVirtual: ", toEther(liquidity.baseVirtual.toString()))
            // console.log("quoteVirtual: ",   toEther(liquidity.quoteVirtual.toString()))
            await getLiquidityInfo(2, 1000001)

            console.log("balance base: ", toEther((await reflex.balanceOf(deployer.address)).toString()))
            console.log("balance quote: ", toEther((await deployer.getBalance()).toString()))

            // console.log("balance quote: ", toEther((await quote.balanceOf(deployer.address)).toString()))

        });

    })

    describe("cake/posi", function () {

        beforeEach("init", async () => {
            console.log("start init")
            await pair.initialize(
                {
                    quoteAsset: reflex.address,
                    baseAsset: base.address,
                    basisPoint: BASIS_POINT,
                    maxFindingWordsIndex: 10000,
                    initialPip: 1000,
                    pipRange: 30000,
                    tickSpace: 1,
                    owner: deployer.address,
                    positionLiquidity: dexNFT.address,
                    spotHouse: deployer.address,
                    feeShareAmm: 0,
                    router: deployer.address
                });

            await factory.addPairManagerManual(pair.address, base.address, reflex.address);
        })

        it('#case34', async () => {

            console.log("start set and deposit")
            console.log("balance quote 1: ", toEther((await deployer.getBalance()).toString()))


            await pair.setCurrentPip(70000)

            await setTokenAndDeposit(base.address, reflex.address, 10, 10)


            console.log("start migrate")

            await killer.migratePosition(mockPairUni.address, toWei(1000))


            const liquidity = await dexNFT.liquidity(1000001)
            console.log("baseVirtual: ", toEther(liquidity.baseVirtual.toString()))
            console.log("quoteVirtual: ", toEther(liquidity.quoteVirtual.toString()))
            console.log("balance base: ", toEther((await base.balanceOf(deployer.address)).toString()))
            console.log("balance quote: ", toEther((await reflex.balanceOf(deployer.address)).toString()))

        });

        it('#case35', async () => {

            console.log("start set and deposit")
            console.log("balance quote 1: ", toEther((await deployer.getBalance()).toString()))


            await pair.setCurrentPip(70000)

            await setTokenAndDeposit(reflex.address, base.address, 10, 10)


            console.log("start migrate")

            await killer.migratePosition(mockPairUni.address, toWei(1000))


            const liquidity = await dexNFT.liquidity(1000001)
            console.log("baseVirtual: ", toEther(liquidity.baseVirtual.toString()))
            console.log("quoteVirtual: ", toEther(liquidity.quoteVirtual.toString()))
            console.log("balance base: ", toEther((await base.balanceOf(deployer.address)).toString()))
            console.log("balance quote: ", toEther((await reflex.balanceOf(deployer.address)).toString()))

        });



        it('#case38 -- max index', async () => {

            console.log("start set and deposit")
            await pair.setCurrentPip(89999)

            await setTokenAndDeposit(reflex.address, base.address, 100, 1)

            console.log("start migrate")

            await killer.migratePosition(mockPairUni.address, toWei(1000))


            const liquidity = await dexNFT.liquidity(1000001)
            console.log("baseVirtual: ", toEther(liquidity.baseVirtual.toString()))
            console.log("quoteVirtual: ", toEther(liquidity.quoteVirtual.toString()))
            console.log("balance base: ", toEther((await base.balanceOf(deployer.address)).toString()))
            console.log("balance quote: ", toEther((await reflex.balanceOf(deployer.address)).toString()))

            // console.log("balance quote: ", toEther( (await quote.balanceOf(deployer.address)).toString()))

        });

        it('#case39 -- min index', async () => {

            console.log("start set and deposit")
            await pair.setCurrentPip(60000)

            await setTokenAndDeposit(reflex.address, base.address, 1, 100)

            console.log("start migrate")

            await killer.migratePosition(mockPairUni.address, toWei(1000))


            const liquidity = await dexNFT.liquidity(1000001)
            console.log("baseVirtual: ", toEther(liquidity.baseVirtual.toString()))
            console.log("quoteVirtual: ", toEther(liquidity.quoteVirtual.toString()))
            console.log("balance base: ", toEther((await base.balanceOf(deployer.address)).toString()))
            console.log("balance quote: ", toEther((await reflex.balanceOf(deployer.address)).toString()))

            // console.log("balance quote: ", toEther( (await quote.balanceOf(deployer.address)).toString()))

        });

        it('#case42 has liquidity', async () => {

            console.log("start set and deposit")

            await pair.setCurrentPip(70000)
            await setTokenAndDeposit(reflex.address, base.address, 100, 65)
            await addLiquidity(27.28763753357, 2, false)

            console.log("start migrate")

            await killer.migratePosition(mockPairUni.address, toWei(1000))

            //
            // const liquidity = await dexNFT.liquidity(1000001)
            // console.log("baseVirtual: ", toEther(liquidity.baseVirtual.toString()))
            // console.log("quoteVirtual: ",   toEther(liquidity.quoteVirtual.toString()))
            await getLiquidityInfo(2, 1000002);
            console.log("balance base: ", toEther((await base.balanceOf(deployer.address)).toString()))
            console.log("balance quote: ", toEther((await reflex.balanceOf(deployer.address)).toString()))

            // console.log("balance quote: ", toEther( (await quote.balanceOf(deployer.address)).toString()))

        });

        it('#case43 enough base, quote', async () => {

            console.log("start set and deposit")

            await pair.setCurrentPip(70000)
            await setTokenAndDeposit(reflex.address, base.address, 100, 22.26489077759)
            // await  addLiquidity(27.56327,2,true)

            console.log("start migrate")

            await killer.migratePosition(mockPairUni.address, toWei(1000))

            //
            // const liquidity = await dexNFT.liquidity(1000001)
            // console.log("baseVirtual: ", toEther(liquidity.baseVirtual.toString()))
            // console.log("quoteVirtual: ",   toEther(liquidity.quoteVirtual.toString()))
            await getLiquidityInfo(2, 1000001)

            console.log("balance base: ", toEther((await base.balanceOf(deployer.address)).toString()))
            console.log("balance quote: ", toEther((await reflex.balanceOf(deployer.address)).toString()))

            // console.log("balance quote: ", toEther((await quote.balanceOf(deployer.address)).toString()))

        });

        it('#case44 b<Q', async () => {

            console.log("start set and deposit")

            await pair.setCurrentPip(70000)
            await setTokenAndDeposit(reflex.address, base.address, 120, 20)
            // await  addLiquidity(27.56327,2,true)

            console.log("start migrate")

            await killer.migratePosition(mockPairUni.address, toWei(1000))

            //
            // const liquidity = await dexNFT.liquidity(1000001)
            // console.log("baseVirtual: ", toEther(liquidity.baseVirtual.toString()))
            // console.log("quoteVirtual: ",   toEther(liquidity.quoteVirtual.toString()))
            await getLiquidityInfo(2, 1000001)

            console.log("balance base: ", toEther((await base.balanceOf(deployer.address)).toString()))
            console.log("balance quote: ", toEther((await reflex.balanceOf(deployer.address)).toString()))

            // console.log("balance quote: ", toEther((await quote.balanceOf(deployer.address)).toString()))

        });

        it('#case45 b>Q', async () => {

            console.log("start set and deposit")

            await pair.setCurrentPip(70000)
            await setTokenAndDeposit(reflex.address, base.address, 65, 20)
            // await  addLiquidity(27.56327,2,true)

            console.log("start migrate")

            await killer.migratePosition(mockPairUni.address, toWei(1000))

            //
            // const liquidity = await dexNFT.liquidity(1000001)
            // console.log("baseVirtual: ", toEther(liquidity.baseVirtual.toString()))
            // console.log("quoteVirtual: ",   toEther(liquidity.quoteVirtual.toString()))
            await getLiquidityInfo(2, 1000001)

            console.log("balance base: ", toEther((await base.balanceOf(deployer.address)).toString()))
            console.log("balance quote: ", toEther((await reflex.balanceOf(deployer.address)).toString()))

            // console.log("balance quote: ", toEther((await quote.balanceOf(deployer.address)).toString()))

        });

    })
})
