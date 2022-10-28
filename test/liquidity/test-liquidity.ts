import {expect, use} from "chai";
import YAML from "js-yaml";
    import {
    MockMatchingEngineAMM,
    MockSpotHouse,
    MockToken,
        NonfungiblePositionLiquidityPool,
    PositionSpotFactory
} from "../../typeChain";
import {SignerWithAddress} from "@nomiclabs/hardhat-ethers/signers";
import {deployContract, expectRevert, fromWei, getAccount, SIDE, toWei} from "../utils/utils";
import {BigNumber, ethers} from "ethers";
import {YamlTestProcess} from "./yaml-test-process";
import Decimal from "decimal.js";
import {deployMockToken} from "../utils/mock";
import {EventFragment} from "@ethersproject/abi";

// import {waffle} from "hardhat";
// const {solidity} = waffle
// use(solidity);

export type SNumber = number | string | BigNumber
export type StringOrNumber = string | number

export interface CallOptions {
    sender?: SignerWithAddress;
    poolId?: string;
    revert? : any;
    [k: string]: any
}

export interface PoolLiquidityInfo {
    pairManager: string;
    strategy: string;
    totalQuoteDeposited: BigNumber;
    totalFundingCertificates: BigNumber;
    baseLiquidity: BigNumber;
    quoteLiquidity: BigNumber;
    soRemovablePosBuy: BigNumber;
    soRemovablePosSell: BigNumber;
}

interface ExpectRemoveLiquidity {
    baseOut: StringOrNumber;
    quoteOut: StringOrNumber;
    totalReceiveInQuote?: StringOrNumber;
    pnl?: StringOrNumber;
    poolExpect?: ExpectedPoolData;
}


export interface ExpectedPoolData {
    Liquidity?: SNumber;
    BaseVirtual?: SNumber;
    QuoteVirtual?: SNumber;
    BaseReal?: SNumber;
    QuoteReal?: SNumber;
    IndexPipRange? : SNumber;
    MaxPip? : SNumber;
    MinPip? : SNumber;
    FeeGrowthBase?: SNumber;
    FeeGrowthQuote? : SNumber;
    K? : SNumber;
}
export interface ExpectAddLiquidityResult extends ExpectedPoolData {
    userDebt?: StringOrNumber;
}

export const BASIS_POINT = 10000;


function pipToPrice(currentPip: StringOrNumber) {
    return Number(currentPip) / BASIS_POINT;
}

function price2Pip(currentPrice: number | string) {
    return new Decimal(currentPrice).mul(BASIS_POINT).toNumber();
}

function fromWeiAndFormat(n, decimal = 6): number{
    return new Decimal(fromWei(n).toString()).toDP(decimal).toNumber()
}
function sqrt(n: number) :number {

    return Math.sqrt(n);
}

function roundNumber(n, decimal = 6){
    return new Decimal((n).toString()).toDP(decimal).toNumber()
}

// useWBNB: 0 is not use, 1 is WBNB Quote, 2 is WBNB Base
export async function deployAndCreateRouterHelper() {
    let matching: MockMatchingEngineAMM
    let spotHouse : MockSpotHouse
    let factory : PositionSpotFactory
    let quote : MockToken;
    let base : MockToken;
    let testHelper: TestLiquidity;
    let dexNFT : NonfungiblePositionLiquidityPool;


    let users  : any[] = [];
    users = await getAccount() as unknown as any[];
    const deployer = users[0];
    matching = await deployContract("MockMatchingEngineAMM", deployer );
    spotHouse = await deployContract("MockSpotHouse", deployer );
    factory = await deployContract("PositionSpotFactory", deployer );
    dexNFT = await deployContract("NonfungiblePositionLiquidityPool", deployer );

    quote = await deployMockToken("Quote");
    base = await deployMockToken("Base");


    await matching.initialize(
        quote.address,
        base.address,
        BASIS_POINT,
        BASIS_POINT**2,
        1000,
        100000,
        30_000,
        1,
        deployer.address);

    await spotHouse.initialize(dexNFT.address);

    await spotHouse.setFactory(factory.address);

    await factory.addPairManagerManual(matching.address, base.address, quote.address);





    testHelper = new TestLiquidity(
        spotHouse,
        matching,
        factory,
        dexNFT,
        base,
        quote,
        deployer  ,{
        users
    });
    // TODO approve and mint token base and quote
    return testHelper;
}



export class TestLiquidity {
    mockSpotHouse: MockSpotHouse;
    mockMatching : MockMatchingEngineAMM;
    factory : PositionSpotFactory;
    dexNFT : NonfungiblePositionLiquidityPool;
    quote : MockToken;
    base : MockToken;

    defaultPoolId: string;
    defaultSender: SignerWithAddress;
    nftTokenId: number = 1000000;
    baseToken: MockToken;
    quoteToken: MockToken;
    // @notice fee in %
    spotFee: number;
    verbose = true;
    users : SignerWithAddress[]


    constructor(
        _mockSpotHouse: MockSpotHouse,
        _mockMatching : MockMatchingEngineAMM,
        _factory :PositionSpotFactory,
        _dexNFT : NonfungiblePositionLiquidityPool,
        _quote : MockToken,
        _base : MockToken,
        _defaultSender: SignerWithAddress,
        opts: {
        users : SignerWithAddress[]
    }) {
        this.mockSpotHouse = _mockSpotHouse;
        this.mockMatching = _mockMatching;
        this.factory = _factory;
        this.dexNFT = _dexNFT;
        this.base = _base;
        this.quote = _quote;
        this.defaultSender = _defaultSender;
        this.users = opts.users;
    }

    async printPoolData(poolId) {
        // const poolData = await this.getPoolData(poolId);
        // const poolLiquidity = await this.mockSpotHouse.getPoolLiquidity(poolId);
        // if (this.verbose) {
        //     // this.log("poolData: ", poolData);
        //     const obj = {};
        //     Object.keys(poolData).forEach(k => {
        //         if (!isNaN(Number(k))) return;
        //         if (poolData[k]._isBigNumber) {
        //             obj[k] = (poolData[k]);
        //             return;
        //         }
        //         return obj[k] = poolData[k];
        //     });
        //     obj["baseLiquidity"] = fromWei(poolLiquidity.base);
        //     obj["quoteLiquidity"] = fromWei(poolLiquidity.quote);
        //     console.table({
        //         ...obj
        //     });
        // }
    }


    expectDataInRange(_expect: number, _actual: number, _percentage: number): boolean {
        if (_actual > 0) {
            return _expect >= _actual * (1 - _percentage) && _expect <= _actual * (1 + _percentage);
        }
        return _expect <= _actual * (1 - _percentage) && _expect >= _actual * (1 + _percentage);

    }

    async setCurrentPrice(price : StringOrNumber) {
        await this.mockMatching.setCurrentPip(price);
    }

    async addLiquidity(baseVirtual: StringOrNumber, quoteVirtual: StringOrNumber, indexPip : StringOrNumber, opts: CallOptions = {}): Promise<number> {

        console.group(`AddLiquidity`);
        // console.l

        // TODO call add liquidity in spotHouse
        return 0;
    }


    async removeLiquidity(indexPip: SNumber, liquidity : SNumber, opts: CallOptions = {}) {
        console.group(`RemoveLiquidity`);

        // TODO call add remove liquidity in spotHouse

        console.groupEnd();
    }

    async increaseLiquidity(tokenId : SNumber, asset: string, amountVirtual: SNumber, opts?: CallOptions) {

        // TODO implement increaseLiquidity

    }

    async decreaseLiquidity(){
        // TODO implement decreaseLiquidity
    }



    async expectPool( expectData: ExpectedPoolData) {

        const poolData = await this.mockMatching.liquidityInfo(expectData.IndexPipRange);


        if (expectData.MaxPip) expect(this.expectDataInRange(Math.round(sqrt(Number(expectData.MaxPip))* 10**9),Number(poolData.sqrtMaxPip), 0.01)).to.equal(true, "MaxPip");
        if (expectData.MinPip) expect(this.expectDataInRange(Math.round( sqrt( Number(expectData.MinPip))* 10**9),Number( poolData.sqrtMinPip), 0.01)).to.equal(true, "MinPip");
        if (expectData.FeeGrowthBase) expect(this.expectDataInRange(Number(expectData.FeeGrowthBase),fromWeiAndFormat(poolData.feeGrowthBase), 0.01)).to.equal(true, "FeeGrowthBase");
        if (expectData.FeeGrowthQuote) expect(this.expectDataInRange(Number(expectData.FeeGrowthQuote),fromWeiAndFormat(poolData.feeGrowthQuote), 0.01)).to.equal(true, "FeeGrowthQuote")



        if (expectData.BaseReal) expect(this.expectDataInRange(Number(expectData.BaseReal),fromWeiAndFormat(poolData.baseReal), 0.01)).to.equal(true, "BaseReal");
        if (expectData.QuoteReal) expect(this.expectDataInRange(Number(expectData.QuoteReal),fromWeiAndFormat(poolData.quoteReal), 0.01)).to.equal(true, "QuoteReal");
        if (expectData.K) expect(this.expectDataInRange(sqrt(Number(expectData.K)),fromWeiAndFormat(poolData.sqrtK), 0.01)).to.equal(true, "K");

    }



    // process test case by yaml
    async process(yaml) {
        let docs;
        try {
            docs = YAML.loadAll(yaml);
        } catch (e) {
            throw new Error(`Parse YAML error: ${e.message}. Please check the format.`);
        }
        this.log(`Total cases: ${docs.length}`);
        const processor = new YamlTestProcess(this);
        let i = 0;
        for (const steps of docs) {
            console.group(`------------- Run case #${i}`);
            for (let step of steps) {
                const stepIdentityKey = Object.keys(step)[0];
                let stepFnName = step[stepIdentityKey];
                if(typeof stepFnName === 'object'){
                    step = stepFnName
                    stepFnName = Object.keys(stepFnName)[0];
                }
                this.log("stepFnName", stepFnName);
                if (!processor[stepFnName]) {
                    throw new Error(`${stepFnName} is not supported yet. Told your developer to implement it.`);
                }
                this.log("\x1b[33m%s\x1b[0m", `--- Processing ${stepIdentityKey} ${stepFnName}`);
                await processor[stepFnName](step);
            }
            i++;
            console.groupEnd();
        }
    }

    async setPrice(price: number | string) {
    }



    async openLimitOrder(pip: number, side: number, size: number,id : number, opts?: CallOptions) {
        // const pip = price2Pip(price)

        // TODO implement

    }

    async openMarketOrder( side: number, size: number, asset : String, opts?: CallOptions) {
    }

    async  expectPending(orderId : number, price : number, side : any, _size : number){

        console.log("price: ", price);

        const  {isFilled, isBuy, size} =  await this.mockMatching
            .getPendingOrderDetail(price, orderId)
        console.log("size: ", size,fromWeiAndFormat(size), _size );

        expect( this.expectDataInRange(fromWeiAndFormat(size), Number(_size), 0.01))
            .to
            .eq(true, `pending base is not correct, expect ${fromWei(size)} in range of to ${_size}`);

        await expect( side == SIDE.BUY).to.eq(isBuy);

    }

    async expectUserLiquidity(){
        // TODO implement

    }


    async getOrderBook(limit = 10) {
        const currentPip = await this.mockMatching.getCurrentPip();
        console.log("currentPip: ", currentPip.toString());
        const bid = await this.mockMatching.getLiquidityInPipRange(currentPip, limit, false).then(
            dt => dt[0].map(d => ({ pip: (d["pip"].toString()), liquidity: (d["liquidity"]).toString(), liquidityFormat: fromWei(d['liquidity']) }))
        );
        const ask = await this.mockMatching.getLiquidityInPipRange(currentPip, limit, true).then(
            dt => dt[0].map(d => ({ pip: (d["pip"].toString()), liquidity: (d["liquidity"]).toString(), liquidityFormat: fromWei(d['liquidity']) }))
        );
        return { ask: ask.filter(obj => Number(obj.pip) != 0), bid: bid.filter(obj => Number(obj.pip) != 0) };
    }

    async getCurrentPrice() {
        return pipToPrice((await this.mockMatching.getCurrentPip()).toString());
    }

    async getPoolData(pId?): Promise<PoolLiquidityInfo> {
        return undefined;
    }

    async getPoolBalance() {
        return this.getBaseQuoteAddress(this.mockSpotHouse.address);
    }



    async getBaseQuoteAddress(address) {
        const baseBalance = await this.baseToken.balanceOf(address);
        const quoteBalance = await this.quoteToken.balanceOf(address);
        return {
            baseBalance: fromWei(baseBalance),
            quoteBalance: fromWei(quoteBalance)
        };
    }

    poolId(argPid) {
        return argPid || this.defaultPoolId;
    }

    getSigner(opts) {
        return opts.signer || this.defaultSender;
    }

    log(...args) {
        if (this.verbose) {
            console.log('[TestLiquidityPoolHelper]: ', ...args);
        }
    }
}
