import {
    ForkMatchingEngineAMM,
    MockMatchingEngineAMM,
    MockSpotHouse,
    MockToken,
    PositionConcentratedLiquidity,
    PositionSpotFactory
} from "../../typeChain";
import {BASIS_POINT, TestLiquidity} from "./test-liquidity";
import {approveAndMintToken, deployContract, getAccount, toWei} from "../utils/utils";
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
    let dexNFT: PositionConcentratedLiquidity;


    let users: any[] = [];
    before("", async () => {
            users = await getAccount() as unknown as any[];
            const deployer = users[0];
            matching = await deployContract("ForkMatchingEngineAMM", deployer);
            spotHouse = await deployContract("MockSpotHouse", deployer);
            factory = await deployContract("PositionSpotFactory", deployer);
            dexNFT = await deployContract("PositionConcentratedLiquidity", deployer);

            quote = await deployMockToken("Quote");
            base = await deployMockToken("Base");


            await matching.initialize(
                quote.address,
                base.address,
                BASIS_POINT,
                BASIS_POINT ** 2,
                1000,
                100000,
                30_000,
                1,
                deployer.address);

            await spotHouse.initialize(dexNFT.address);

            await spotHouse.setFactory(factory.address);

            await dexNFT.setFactory(factory.address)
            await dexNFT.initialize()


            await factory.addPairManagerManual(matching.address, base.address, quote.address);
            await approveAndMintToken(quote, base, dexNFT, users)
            await approveAndMintToken(quote, base, dexNFT, users)
            await matching.approve(base.address, quote.address, dexNFT.address)
        }
    )

    describe("add liquidity", async () => {
        it("add new liquidity", async () => {

            await dexNFT.addLiquidity({
                pool: matching.address,
                amountVirtual: toWei(100),
                isBase: true,
                indexedPipRange: 2
            });

            const data = await dexNFT.concentratedLiquidity(1000001)
            console.log(data.toString());
            console.log("baseAmount: ", data.baseVirtual.toString());
            console.log("quoteAmount: ", data.quoteVirtual.toString());
            console.log("liquidity: ", data.liquidity.toString());
            expect(data.pool).to.equal(matching.address)
        })

        // it("remove liquidity", async () => {
        //
        //     await dexNFT.addLiquidity({
        //         pool: matching.address,
        //         amountVirtual: toWei(100),
        //         isBase: true,
        //         indexedPipRange: 2
        //     });
        //
        //     const data = await dexNFT.concentratedLiquidity(1000001)
        //     console.log(data.toString());
        //     console.log("baseAmount: ", data.baseVirtual.toString());
        //     console.log("quoteAmount: ", data.quoteVirtual.toString());
        //     console.log("liquidity: ", data.liquidity.toString());
        //     expect(data.pool).to.equal(matching.address)
        //     await dexNFT.removeLiquidity( 1000001
        //     );
        // })

    })

    describe("remove liquidity", async () => {

        it("remove liquidity", async () => {

            await dexNFT.addLiquidity({
                pool: matching.address,
                amountVirtual: toWei(100),
                isBase: true,
                indexedPipRange: 2
            });

            const data = await dexNFT.concentratedLiquidity(1000001)
            console.log(data.toString());
            console.log("baseAmount: ", data.baseVirtual.toString());
            console.log("quoteAmount: ", data.quoteVirtual.toString());
            console.log("liquidity: ", data.liquidity.toString());
            expect(data.pool).to.equal(matching.address)
            await dexNFT.removeLiquidity( 1000001
            );
        })

    })

    describe("increase liquidity", async () => {

        it("increase liquidity", async () => {

            await dexNFT.addLiquidity({
                pool: matching.address,
                amountVirtual: toWei(100),
                isBase: true,
                indexedPipRange: 2
            });

            const data = await dexNFT.concentratedLiquidity(1000001)
            console.log(data.toString());
            console.log("baseAmount: ", data.baseVirtual.toString());
            console.log("quoteAmount: ", data.quoteVirtual.toString());
            console.log("liquidity: ", data.liquidity.toString());
            expect(data.pool).to.equal(matching.address)
            await dexNFT.increaseLiquidity( 1000001, toWei(100), false)



            ;
        })

    })

})