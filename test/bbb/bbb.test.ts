import {
    ForkMatchingEngineAMM,
    KillerPosition,
    MatchingEngineAMM, MockPairUni, MockTokenReward, MockTokenTreasury,
    MockUniRouter, PositionNondisperseLiquidity, PositionRouter,
    PositionSpotFactory, PositionStakingDexManager, SpotHouse,
} from "../../typeChain";
import {deployContract, getAccount, toEther, toWei} from "../utils/utils";
import {deployMockReflexToken, deployMockToken, deployMockWrappedBNB} from "../utils/mock";
import {BASIS_POINT} from "../liquidity/test-liquidity";
import {ethers} from "hardhat";
import {SignerWithAddress} from "@nomiclabs/hardhat-ethers/signers";
import { mine } from "@nomicfoundation/hardhat-network-helpers";


enum ActionType {

    Decrease = 0,
    Increase = 1,
    Shift = 2
}
describe("killer-position", async function () {


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

        await  addLiquidity(10_000, 1, true, pairPosiBusd.address)
        await  addLiquidity(10_000, 1, true, pair.address)


        await spotHouse.setWBNB(wbnb.address);
        await spotHouse.setFactory(factory.address);
        await spotHouse.setPosiToken(reflex.address);
        await spotHouse.setPositionRouter(posiRouter.address);


        await posiRouter.setWBNB(wbnb.address);
        await posiRouter.setFactory(factory.address);
        await posiRouter.setSpotHouse(spotHouse.address);





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

    async function addLiquidity(amountVirtual: number, indexInLiquidity: number, isBase: boolean, pair : string,valueEther = 0) {

        console.log("value ether");
        await dexNFT.addLiquidity({
                amountVirtual: toWei(amountVirtual.toString()),
                indexedPipRange: indexInLiquidity,
                isBase: isBase,
                pool: pair
            },

            {value: ethers.utils.parseEther(valueEther.toString())})

    }
    async function shiftRange(tokenId, targetIndex , amountNeed : number,  isBase: boolean) {
        await dexNFT.shiftRange(tokenId, targetIndex, toWei(amountNeed), isBase)

    }


    async function balanceTokenReward(user : string) {
        const balance  = await rewardToken.balanceOf(user)
        console.log("Balance of token reward: ", toEther(balance.toString()))
    }


    async function increaseLiquidity(nftId : number, amountModify: number, isBase : boolean){

        await dexNFT.increaseLiquidity(nftId, toWei(amountModify), isBase)

    }

    async function decreaseLiquidity(nftId: number, liquidity: number){
        await dexNFT.decreaseLiquidity(nftId, toWei(liquidity))

    }

    async function getLiquidityInfo(index: number, nftId) {

        const info = await pair.liquidityInfo(index)

        console.log("liquidity base real: ", toEther(info.baseReal.toString()));
        console.log("liquidity quote real: ", toEther(info.quoteReal.toString()));


        const liquidity = await dexNFT.liquidity(nftId)
        console.log("baseVirtual: ", toEther(liquidity.baseVirtual.toString()))
        console.log("quoteVirtual: ", toEther(liquidity.quoteVirtual.toString()))
    }


    describe("bbb", async () => {


        it('should bbb', async function () {

            await spotHouse.openMarketOrder(pair.address, 0, toWei(1000))
            await spotHouse.openMarketOrder(pair.address, 1, toWei(1000))


            console.log("Start buy back")
            await spotHouse.buyBackAndBurn(pair.address, [quote.address, reflex.address])


            const balanceBurned = await reflex.balanceOf("0x000000000000000000000000000000000000dEaD")
            console.log( (await spotHouse.totalBurned()).toString())
            console.log(toEther(balanceBurned.toString()))

        });


    })
})
