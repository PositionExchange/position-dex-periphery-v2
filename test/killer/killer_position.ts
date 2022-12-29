import {
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


describe("killer-position", async function ()  {


    let factory: PositionSpotFactory;
    let killer : KillerPosition;
    let pair: MatchingEngineAMM;
    let dexNFT: PositionNondisperseLiquidity;
    let uniRouter: MockUniRouter;
    let mockPairUni : MockPairUni;

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


        await mockPairUni.mint(deployer.address, toWei(10000000000000))




    })

    async function setTokenAndDeposit(token0: string, token1: string, amount0: any, amount1:  any){
        await uniRouter.setToken(token0, token1);
        await mockPairUni.setToken(token0, token1);
        await uniRouter.deposit(toWei(amount0), toWei(amount1))
    }

    async function addLiquidity(amountVirtual : number, indexInLiquidity : number, isBase : boolean) {

        await dexNFT.addLiquidity({
            amountVirtual:  amountVirtual,
            indexedPipRange : indexInLiquidity,
            isBase: isBase,
            pool: pair.address
        })

    }

    describe("posi/busd",  function ()  {

        beforeEach("init", async ()=>{
            console.log("start init")
            await pair.initialize(
                {
                    quoteAsset: quote.address,
                    baseAsset: reflex.address,
                    basisPoint: BASIS_POINT,
                    maxFindingWordsIndex: 10000,
                    initialPip: 75000,
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

        it('#case23', async ()=>{

            console.log("start set and deposit")

            await setTokenAndDeposit(reflex.address, quote.address, 100, 30)

            console.log("start migrate")

            await killer.migratePosition(mockPairUni.address, toWei(1000))


            const liquidity = await dexNFT.liquidity(1000001)
            console.log("baseVirtual: ", toEther(liquidity.baseVirtual.toString()))
            console.log("quoteVirtual: ",   toEther(liquidity.quoteVirtual.toString()))
            console.log("balance base: ", toEther( (await reflex.balanceOf(deployer.address)).toString()))
            console.log("balance quote: ", toEther( (await quote.balanceOf(deployer.address)).toString()))

        });

        it('#case24', async ()=>{

            console.log("start set and deposit")

            await setTokenAndDeposit(quote.address, reflex.address, 30, 100)

            console.log("start migrate")

            await killer.migratePosition(mockPairUni.address, toWei(1000))


            const liquidity = await dexNFT.liquidity(1000001)
            console.log("baseVirtual: ", toEther(liquidity.baseVirtual.toString()))
            console.log("quoteVirtual: ",   toEther(liquidity.quoteVirtual.toString()))
            console.log("balance base: ", toEther( (await reflex.balanceOf(deployer.address)).toString()))
            console.log("balance quote: ", toEther( (await quote.balanceOf(deployer.address)).toString()))

        });

        it('#case27 -- max index', async ()=>{

            console.log("start set and deposit")

            await setTokenAndDeposit(reflex.address, quote.address, 100, 100)

            console.log("start migrate")

            await killer.migratePosition(mockPairUni.address, toWei(1000))


            const liquidity = await dexNFT.liquidity(1000001)
            console.log("baseVirtual: ", toEther(liquidity.baseVirtual.toString()))
            console.log("quoteVirtual: ",   toEther(liquidity.quoteVirtual.toString()))
            console.log("balance base: ", toEther( (await reflex.balanceOf(deployer.address)).toString()))
            console.log("balance quote: ", toEther( (await quote.balanceOf(deployer.address)).toString()))

        });

        it('#case28 -- min index', async ()=>{

            console.log("start set and deposit")

            await setTokenAndDeposit(reflex.address, quote.address, 100, 100)

            console.log("start migrate")

            await killer.migratePosition(mockPairUni.address, toWei(1000))


            const liquidity = await dexNFT.liquidity(1000001)
            console.log("baseVirtual: ", toEther(liquidity.baseVirtual.toString()))
            console.log("quoteVirtual: ",   toEther(liquidity.quoteVirtual.toString()))
            console.log("balance base: ", toEther( (await reflex.balanceOf(deployer.address)).toString()))
            console.log("balance quote: ", toEther( (await quote.balanceOf(deployer.address)).toString()))

        });

    })

    describe("cake/busd",  function ()  {

        beforeEach("init", async ()=>{
            console.log("start init")
            await pair.initialize(
                {
                    quoteAsset: quote.address,
                    baseAsset: reflex.address,
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

            await factory.addPairManagerManual(pair.address, reflex.address, quote.address);
        })

        it('#1', async ()=>{

            console.log("start set and deposit")

            await setTokenAndDeposit(reflex.address, quote.address, 10, 10)

            console.log("start migrate")

            await killer.migratePosition(mockPairUni.address, toWei(1000))


            const liquidity = await dexNFT.liquidity(1000001)
            console.log("baseVirtual: ", toEther(liquidity.baseVirtual.toString()))
            console.log("quoteVirtual: ", toEther(liquidity.quoteVirtual.toString()))
            console.log("balance base: ", toEther( (await reflex.balanceOf(deployer.address)).toString()))
            console.log("balance quote: ", toEther( (await quote.balanceOf(deployer.address)).toString()))

        });

    })


})
