import {
    ForkMatchingEngineAMM,
    MockMatchingEngineAMM,
    MockSpotHouse,
    MockToken,
    PositionNondisperseLiquidity,
    PositionSpotFactory
} from "../../typeChain";
import {BASIS_POINT, TestLiquidity} from "./test-liquidity";
import {approve, approveAndMintToken, deployContract, getAccount, toWei} from "../utils/utils";
import {deployMockToken} from "../utils/mock";
import {exchange} from "../../typeChain/@positionex/matching-engine/contracts/libraries";
import {expect} from "chai";

describe("manage liquidity", async () => {
    let matching: ForkMatchingEngineAMM
    let spotHouse: MockSpotHouse
    let factory: PositionSpotFactory
    let quote: MockToken;
    let base: MockToken;
    let testHelper: TestLiquidity;
    let dexNFT: PositionNondisperseLiquidity;


    let users: any[] = [];
    before("", async () => {
            users = await getAccount() as unknown as any[];
            const deployer = users[0];
            matching = await deployContract("ForkMatchingEngineAMM", deployer);
            spotHouse = await deployContract("MockSpotHouse", deployer);
            factory = await deployContract("PositionSpotFactory", deployer);
            dexNFT = await deployContract("PositionNondisperseLiquidity", deployer);
            quote = await deployMockToken("Quote");
            base = await deployMockToken("Base");


            console.log("TTT", quote, base)

            await matching.initialize(
                {
                    quoteAsset: quote.address,
                    baseAsset: base.address,
                    basisPoint: BASIS_POINT,
                    maxFindingWordsIndex: 1000,
                    initialPip: 100000,
                    pipRange: 30_000,
                    tickSpace: 1,
                    owner: deployer.address,
                    positionLiquidity: deployer.address,
                    spotHouse: deployer.address,
                    feeShareAmm: 0,
                    router : deployer.address
                }
            );

            await spotHouse.initialize();

            await spotHouse.setFactory(factory.address);

            await dexNFT.setFactory(factory.address)
            await dexNFT.initialize()

            await factory.addPairManagerManual(matching.address, base.address, quote.address);
            await matching.setCounterParty02(spotHouse.address);
            await approveAndMintToken(quote, base, dexNFT, users)
            await approve(quote, base, spotHouse, users)
            //await matching.approve()
        }
    )

    describe("add liquidity", async () => {
        it("add new liquidity", async () => {

            await dexNFT.addLiquidity({
                pool: matching.address,
                amountVirtual: toWei(100),
                isBase: false,
                indexedPipRange: 2
            });

            const data = await dexNFT.concentratedLiquidity(1000001)
            console.log(data.toString());
            console.log("liquidity: ", data.liquidity.toString());
            expect(data.pool).to.equal(matching.address)
        })

    })

    describe("remove liquidity", async () => {

        it("remove liquidity", async () => {

            console.log("current pip : ", matching.pipRange())

            await dexNFT.addLiquidity({
                pool: matching.address,
                amountVirtual: toWei(100),
                isBase: false,
                indexedPipRange: 2
            });

            const data = await dexNFT.concentratedLiquidity(1000001)
            console.log(data.toString());
            console.log("liquidity: ", data.liquidity.toString());
            expect(data.pool).to.equal(matching.address)
            await dexNFT.removeLiquidity( 1000001
            );
        })

    })

    describe("increase liquidity", async () => {

        it("increase liquidity", async () => {

            console.log("current pip : ", matching.pipRange())

            await dexNFT.addLiquidity({
                pool: matching.address,
                amountVirtual: toWei(100),
                isBase: false,
                indexedPipRange: 2
            });

            const dataBefore = await dexNFT.concentratedLiquidity(1000001)
            console.log(dataBefore.toString());
            console.log("liquidity: ", dataBefore.liquidity.toString());
            expect(dataBefore.pool).to.equal(matching.address)
            console.log("dexNFT: ", dexNFT.address)

            await dexNFT.increaseLiquidity( 1000001, toWei(100), false);
            console.log("dexNFT: ", dexNFT.address)

            const dataAfter = await dexNFT.concentratedLiquidity(1000001)
            console.log('dataAfter', dataAfter.toString());
            console.log("liquidity: ", dataAfter.liquidity.toString());
        })
    })

    describe("decrease liquidity", async () => {

        it("decrease liquidity", async () => {

            await dexNFT.addLiquidity({
                pool: matching.address,
                amountVirtual: toWei(100),
                isBase: false,
                indexedPipRange: 2
            });

            const dataBefore = await dexNFT.concentratedLiquidity(1000001)
            console.log(dataBefore.toString());
            console.log("liquidity: ", dataBefore.liquidity.toString());
            expect(dataBefore.pool).to.equal(matching.address)

            await dexNFT.decreaseLiquidity( 1000001,100000);

            const dataAfter = await dexNFT.concentratedLiquidity(1000001)
            console.log(dataAfter.toString());
            console.log("liquidity: ", dataAfter.liquidity.toString());
        })
    })
})