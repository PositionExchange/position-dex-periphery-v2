import {
    ForkMatchingEngineAMM,
    KillerPosition,
    MatchingEngineAMM, MockPairUni, MockTokenReward, MockTokenTreasury,
    MockUniRouter, PositionNondisperseLiquidity,
    PositionSpotFactory, PositionStakingDexManager,
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
    let pair: ForkMatchingEngineAMM;
    let dexNFT: PositionNondisperseLiquidity;
    let uniRouter: MockUniRouter;
    let mockPairUni: MockPairUni;
    let staking : PositionStakingDexManager


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



        await base.connect(users[1]).approve(dexNFT.address, ethers.constants.MaxInt256);
        await quote.connect(users[1]).approve(dexNFT.address, ethers.constants.MaxInt256);
        await reflex.connect(users[1]).approve(dexNFT.address, ethers.constants.MaxInt256);

        await base.mint(users[1].address, toWei(1000000000));
        await quote.mint(users[1].address, toWei(1000000000));


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
                spotHouse: deployer.address,
                router: deployer.address
            });
        await factory.addPairManagerManual(pair.address, base.address, quote.address);


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
        await dexNFT.connect(users[1]).setApprovalForAll(staking.address, true)


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

        await dexNFT.addLiquidity({
                amountVirtual: toWei(amountVirtual.toString()),
                indexedPipRange: indexInLiquidity,
                isBase: isBase,
                pool: pair.address
            },

            {value: ethers.utils.parseEther(valueEther.toString())})

    }
    async function shiftRange(tokenId, targetIndex , amountNeed : number,  isBase: boolean) {
        await dexNFT.shiftRange(tokenId, targetIndex, toWei(amountNeed), isBase)

    }

    async function logPower(user: string) {

        const power = await staking.userInfo(pair.address, user)
        console.log("power",power.amount.toString())

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

    async function logTotalStake() {

        const poolInfo = await staking.poolInfo(pair.address)
        console.log("poolInfo totalStaked: ", toEther(poolInfo.totalStaked.toString()));

        const userInfo = await staking.userInfo(pair.address, deployer.address)
        console.log("userInfo user amount: ", toEther(userInfo.amount.toString()));

    }

    function calPower(liquidity, indexPipRangeNft, currentIndexPipRange ){

        return liquidity / ( Math.abs(indexPipRangeNft - currentIndexPipRange) + 1);
    }

    async function logTotalLiquidity(listIndex : number[]) {

        let totalLiquidity = 0;
        const currentIndexPipRange = (await pair.currentIndexedPipRange()).toString();

        for (let i = 0; i < listIndex.length; i++) {
            const liquidity = (await pair.liquidityInfo(listIndex[i])).sqrtK.toString()
            const liquidityPower = calPower(toEther(liquidity), listIndex[i], currentIndexPipRange)
            totalLiquidity += liquidityPower;
        }

        console.log("totalLiquidity: ", totalLiquidity);

    }

    async function logLiquidity(listIndex : number[]) {
        console.log("**********START LOG LIQUIDITY**********")
        await logTotalStake()
        await logTotalLiquidity(listIndex)
        console.log("**********END LOG LIQUIDITY********** \n")

    }

    async function marketMaker(isBuy: boolean, size) {

        console.log("**********START LOG MARKET**********")
        const startPip = await pair.getCurrentPip()
        let currentIndex = await pair.currentIndexedPipRange()


        console.log(`Start pip: ${startPip.toString()}  , currentIndex: ${currentIndex.toString()} ` )
        await pair.openMarket(toWei(size), isBuy, deployer.address, 20)
        const endPip = await pair.getCurrentPip()
        currentIndex = await pair.currentIndexedPipRange()
        console.log(`End pip: ${endPip.toString()}, currentIndex: ${currentIndex.toString()} ` )
        console.log("**********END LOG MARKET********** \n")






    }

    describe("should update staking amount when liquidity action", function (){


        it("update increase liquidity", async ()=>{

            await addLiquidity(10, 1, true)

            await staking.stake(1000001)
            await logLiquidity([0,1,2,3,4,5])


            await mine(1000);
            await increaseLiquidity(1000001, 10, true)

            await logLiquidity([0,1,2,3,4,5])




            await addLiquidity(10, 1, true)
            await staking.stake(1000002)
            await mine(1000);
            await logLiquidity([0,1,2,3,4,5])


        })


        it("update decrease liquidity", async ()=>{

            await addLiquidity(10, 1, true)

            await staking.stake(1000001)
            await mine(1000);

            await addLiquidity(100, 1, true)
            await staking.stake(1000002)
            await mine(1000);
            // await staking.harvest(pair.address)
            await decreaseLiquidity(1000001, 5)

        })
    })

    describe("should staking ok", function (){

        it('should stake #1', async function () {

            await addLiquidity(10, 1, true)

            await staking.stake(1000001)

        });


        it('should stake #2 and unstake 1', async function () {

            await addLiquidity(20, 1, true)

            await staking.stake(1000001)

            await addLiquidity(100, 1, true)

            await staking.stake(1000002)

            await mine(1000);
            await balanceTokenReward(users[0].address)
            await staking.unstake(1000001)
            await balanceTokenReward(users[0].address)
        });

        it('should stake #2 and unstake all', async function () {

            await addLiquidity(20, 1, true)
            await staking.stake(1000001)
            await mine(10);


            await addLiquidity(100, 1, true)

            await staking.stake(1000002)

            await mine(10);

            const userInfo = await staking.userInfo(pair.address, users[0].address)

            console.log(userInfo)
            await staking.withdraw(pair.address)



        });
        it('should stake #2 and harvest', async function () {

            await addLiquidity(20, 1, true)
            await staking.stake(1000001)
            await mine(10);
            await addLiquidity(100, 1, true)
            await staking.stake(1000002)
            await mine(10);
            await balanceTokenReward(users[0].address)
            await staking.harvest(pair.address)
            await balanceTokenReward(users[0].address)
        });

        it('should stake #2 and shift', async function () {
            await dexNFT.donatePool(pair.address, toWei(1), toWei(1))



            await addLiquidity(100, 1, true)
            await staking.stake(1000001)
            await logPower(users[0].address)
            await logLiquidity([0,1,2,3,4,5])

            await mine(10);


            await addLiquidity(100, 1, true)
            await staking.stake(1000002)
            await logPower(users[0].address)
            await mine(10);




            console.log("shiftRange");
            await shiftRange(1000001, 2, 0, true);
            await logPower(users[0].address)
            await logLiquidity([0,1,2,3,4,5])



            await addLiquidity(100, 1, true)
            await staking.stake(1000003)
            await logPower(users[0].address)
            await logLiquidity([0,1,2,3,4,5])

            await mine(10);


            await addLiquidity(100, 1, true)
            await staking.stake(1000004)
            await logPower(users[0].address)
            await mine(10);


            await addLiquidity(100, 1, true)
            await staking.stake(1000005)
            await logPower(users[0].address)
            await mine(10);



            console.log("harvest");
            await staking.unstake(1000001)
            await mine(10);
            await staking.harvest(pair.address)

            await mine(10);
            await staking.exit(pair.address)
            //
            // await addLiquidity(100, 1, true)
            // await staking.stake(1000002)
            // await logPower(users[0].address)
            //
            // await mine(10);
            //
            // await addLiquidity(100, 1, true)
            // await staking.stake(1000003)
            // await logPower(users[0].address)
            // await mine(30);
            //
            // console.log("shift range")
            // // await  shiftRange(1000003, 2, 0, true);
            // await logPower(users[0].address)
            // await mine(30);
            //
            //
            // console.log("harvest");
            // await balanceTokenReward(users[0].address)
            // await staking.unstake(1000001)
            // // await staking.harvest(pair.address)
            // await balanceTokenReward(users[0].address)
        });

        it('should stake #3 and shift', async function () {
            await dexNFT.donatePool(pair.address, toWei(1), toWei(1))

            await addLiquidity(100, 1, true)
            await staking.stake(1000001)
            await logLiquidity([0,1,2,3,4,5])

            await mine(10);


            await addLiquidity(100, 1, true)
            await staking.stake(1000002)
            await logLiquidity([0,1,2,3,4,5])

            await mine(10);




            console.log("shiftRange");
            await shiftRange(1000001, 2, 0, true);
            await logLiquidity([0,1,2,3,4,5])


            await shiftRange(1000002, 0, 50, false);
            await logLiquidity([0,1,2,3,4,5])


            await shiftRange(1000002, 4, 50, true);
            await logLiquidity([0,1,2,3,4,5])


            await shiftRange(1000001, 4, 0, true);
            await logLiquidity([0,1,2,3,4,5])


            await addLiquidity(100, 1, true)
            await staking.stake(1000003)


            console.log("marketMaker")
            await marketMaker(true, 120)
            await logLiquidity([0,1,2,3,4,5])
            console.log("start addLiquidity")
            await addLiquidity(100, 1, false)
            await staking.stake(1000004)


            await logLiquidity([0,1,2,3,4,5])


        });
    })

})
