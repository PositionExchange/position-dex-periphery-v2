import {expect, use} from "chai";
import YAML from "js-yaml";
    import {
    ForkMatchingEngineAMM, MockReflexToken__factory,
    MockSpotHouse,
    MockToken,
    MockReflexToken,
    PositionSpotFactory, PositionNondisperseLiquidity, MockWBNB, WithdrawBNB, PositionRouter
} from "../../typeChain";
import {SignerWithAddress} from "@nomiclabs/hardhat-ethers/signers";
import {
    approve,
    approveAndMintToken,
    deployContract,
    expectRevert,
    fromWei,
    getAccount,
    SIDE,
    toWei
} from "../utils/utils";
import {BigNumber, ethers} from "ethers";
import {YamlTestProcess} from "./yaml-test-process";
import Decimal from "decimal.js";
import {deployMockReflexToken, deployMockToken, deployMockWrappedBNB} from "../utils/mock";
import {EventFragment} from "@ethersproject/abi";

// import {waffle} from "hardhat";
// const {solidity} = waffle
// use(solidity);

export type SNumber = number | string | BigNumber
export type StringOrNumber = string | number
export type UseEther = 'none' | 'quote' | 'base';

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

export  interface ExpectUser {
    BalanceQuote? : SNumber,
    BalanceBase? :SNumber,
    TokenId?: SNumber,
    Liquidity?: SNumber,
    FeeGrowthBase?: SNumber,
    FeeGrowthQuote?: SNumber,
    BaseVirtual?: SNumber,
    QuoteVirtual ?: SNumber,
    Id: number
}
export interface ExpectAddLiquidityResult extends ExpectedPoolData {
    userDebt?: StringOrNumber;
}

export const BASIS_POINT = 10000;


function pipToPrice(currentPip: StringOrNumber, basisPoint) {
    return Number(currentPip) / basisPoint;
}

// function price2Pip(currentPrice: number | string) {
//     return new Decimal(currentPrice).mul(BASIS_POINT).toNumber();
// }

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
export async function deployAndCreateRouterHelper(
    amountMint?: number,
    isUseFee = true,
    isRFI = false,
    pipRange= 30_000,
    userEther  :UseEther= 'none',
    basisPoint = 10_000) {
    let matching: ForkMatchingEngineAMM
    let spotHouse : MockSpotHouse
    let factory : PositionSpotFactory
    let quote : any;
    let base : any;
    let wbnb : MockWBNB;
    let withdrawBNB : WithdrawBNB
    let testHelper: TestLiquidity;
    let dexNFT : PositionNondisperseLiquidity;
    let router : PositionRouter;


    let users  : any[] = [];
    users = await getAccount() as unknown as any[];
    const deployer = users[0];
    matching = await deployContract("ForkMatchingEngineAMM", deployer );
    spotHouse = await deployContract("MockSpotHouse", deployer );
    factory = await deployContract("PositionSpotFactory", deployer );
    dexNFT = await deployContract("PositionNondisperseLiquidity", deployer );
    router = await deployContract("PositionRouter", deployer );
    wbnb = await  deployMockWrappedBNB();
    withdrawBNB = await deployContract("WithdrawBNB", deployer, wbnb.address);


    quote = await deployMockToken("Quote");
    if (isRFI) {
        base = await deployMockReflexToken("Base");
    } else {
        base = await deployMockToken("Base");
    }
    if (userEther !== 'none'){
        if ( userEther === 'quote') {
            quote = wbnb;
        }else if ( userEther === 'base') {
            base = wbnb;
        }
    }

    await matching.initialize(
        {
            quoteAsset: quote.address,
            baseAsset: base.address,
            basisPoint: basisPoint,
            maxFindingWordsIndex: 10000,
            initialPip: 100000,
            pipRange: pipRange,
            tickSpace: 1,
            owner: deployer.address,
            positionLiquidity: dexNFT.address,
            spotHouse: spotHouse.address,
            feeShareAmm: 6000,
            router :router.address
        });

    await spotHouse.initialize();

    await spotHouse.setWBNB(wbnb.address);
    await spotHouse.setFactory(factory.address);
    await spotHouse.setWithdrawBNB(withdrawBNB.address);
    await dexNFT.initialize();
    await dexNFT.setFactory(factory.address);
    await dexNFT.setBNB(wbnb.address)
    await dexNFT.setWithdrawBNB(withdrawBNB.address);
    await factory.initialize();

    await factory.addPairManagerManual(matching.address, base.address, quote.address);

    // await matching.setCounterParty02(spotHouse.address)
    await approveAndMintToken(quote, base, dexNFT, users, amountMint)
    await approve(quote, base, spotHouse, users)
    await matching.approveForTest(spotHouse.address, dexNFT.address);
    await dexNFT.donatePool(matching.address, toWei(1), toWei(1));
    if (!isUseFee) {
        await matching.resetFeeShareAmm();
        await spotHouse.setFee(0);
    }else {
        await spotHouse.setFee(300);

    }


    testHelper = new TestLiquidity(
        spotHouse,
        matching,
        factory,
        dexNFT,
        quote,
        base,
        deployer  ,{
        users
    });
    // TODO approve and mint token base and quote
    return testHelper;
}

export class TestLiquidity {
    mockSpotHouse: MockSpotHouse;
    mockMatching : ForkMatchingEngineAMM;
    factory : PositionSpotFactory;
    dexNFT : PositionNondisperseLiquidity;
    quote : MockToken;
    base : MockToken;

    defaultPoolId: string;
    defaultSender: SignerWithAddress;
    nftTokenId: number = 1000000;
    baseToken: MockToken;
    quoteToken: MockToken;
    spotFee: number;
    verbose = true;
    users : SignerWithAddress[]


    constructor(
        _mockSpotHouse: MockSpotHouse,
        _mockMatching : ForkMatchingEngineAMM,
        _factory :PositionSpotFactory,
        _dexNFT : PositionNondisperseLiquidity,
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
        this.baseToken = _base;
        this.quoteToken = _quote;
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

    async addLiquidity(amountVirtual: StringOrNumber, indexPip : StringOrNumber, asset : string, idSender : number ,opts: CallOptions = {}): Promise<number> {

        console.group(`AddLiquidity`);
        console.log("id sender: ", idSender);
        await this.dexNFT.connect(this.users[idSender]).addLiquidity({pool : this.mockMatching.address, amountVirtual :toWei(amountVirtual), indexedPipRange :indexPip, isBase : asset.toLowerCase() == "base" });
        return 0;
    }


    async removeLiquidity(tokenId: SNumber,  idSender : number, opts: CallOptions = {}) {
        console.group(`RemoveLiquidity`);
        await this.dexNFT.connect(this.users[idSender]).removeLiquidity(tokenId)
        const currentPrice = await this.getCurrentPrice();
        console.log("[removeLiquidity] currentPrice : ", currentPrice)
        console.groupEnd();
    }

    async increaseLiquidity(tokenId : SNumber, amountVirtual: SNumber, asset: string, idSender : number , opts?: CallOptions) {
        console.group(`IncreaseLiquidity`);
        console.log("asset: ", asset);
        await  this.dexNFT.connect(this.users[idSender]).increaseLiquidity(tokenId, toWei(amountVirtual), asset.toLowerCase() === "base");
        console.groupEnd();

    }

    async decreaseLiquidity(tokenId : SNumber, liquidity: SNumber, asset: string, idSender : number , opts?: CallOptions){
        console.group(`DecreaseLiquidity`);
        console.log("decreaseLiquidity liquidity: ", liquidity)
        await  this.dexNFT.connect(this.users[idSender]).decreaseLiquidity(tokenId, toWei(liquidity.toString()));
        console.groupEnd();
    }

    async openLimitOrder(pip: number, side: number, size: number, idSender : number, asset  = 'base',  opts?: CallOptions) {
        console.group(`OpenLimitOrder`);
        console.log("[openLimitOrder] currentPrice before : ", (await this.getCurrentPrice()))
        if ( asset === 'base'){
            await  this.mockSpotHouse.connect(this.users[idSender]).openLimitOrder(this.mockMatching.address, side, toWei(size), pip);
        }else {
            console.log("this.users[idSender]: ",this.users[idSender].address);
            await  this.mockSpotHouse.connect(this.users[idSender]).openBuyLimitOrderWithQuote(this.mockMatching.address, side, toWei(size), pip);
        }
        const listOrderUser = await  this.mockSpotHouse.getPendingLimitOrders(this.mockMatching.address, this.users[idSender].address);
        // console.log("[openLimitOrder] listOrderUser: ", listOrderUser)
        const currentPrice = await this.getCurrentPrice();
        console.log("[openLimitOrder] currentPrice  after: ", currentPrice)
        console.groupEnd();
    }

    async cancelLimitOrder(pip: number, orderId: SNumber, idSender : number, opts?: CallOptions) {

        console.group(`CancelLimitOrder`);
        const listOrderUser = await  this.mockSpotHouse.getPendingLimitOrders(this.mockMatching.address, this.users[2].address);
        console.log("[cancelLimitOrder] listOrderUser before: ", listOrderUser);
        console.log("orderId, pip: ", orderId, pip)
        await  this.mockSpotHouse.connect(this.users[idSender]).cancelLimitOrder(this.mockMatching.address, orderId, pip);
        const listOrderUserAf = await  this.mockSpotHouse.getPendingLimitOrders(this.mockMatching.address, this.users[idSender].address);
        console.log("[cancelLimitOrder] listOrderUser after: ", listOrderUserAf);
        console.log("orderId, pip: ", orderId, pip)
        const balanceBase = await this.baseToken.balanceOf(this.users[2].address);
        const balanceQuote = await this.quoteToken.balanceOf(this.users[2].address);
        console.log("[openMarketOrder] balanceBase balanceQuote after: ",balanceBase, balanceQuote);
        console.groupEnd();
    }

    async cancelAllLimitOrder(pip: number, orderId: SNumber, idSender : number, opts?: CallOptions) {

        console.group(`CancelAllLimitOrder`);
        await  this.mockSpotHouse.connect(this.users[idSender]).cancelAllLimitOrder(this.mockMatching.address);

        console.groupEnd();
    }

    async openMarketOrder( side: number, size: number, asset : String, idSender : number,opts?: CallOptions) {
        console.group(`OpenMarketOrder`);
        const tx = await  this.mockSpotHouse.connect(this.users[idSender])["openMarketOrder(address,uint8,uint256)"](this.mockMatching.address, side, toWei(size));
        const listOrderUserAf = await  this.mockSpotHouse.getPendingLimitOrders(this.mockMatching.address, this.users[4].address);
        const balanceBase = await this.baseToken.balanceOf(this.users[2].address);
        const balanceQuote = await this.quoteToken.balanceOf(this.users[2].address);
        const currentPrice = await this.getCurrentPrice();
        const receipt = await tx.wait(0)
        console.log("gas used: ", receipt.cumulativeGasUsed.toString());
        console.log("[openMarketOrder] currentPrice : ", currentPrice)
        console.groupEnd();
    }

    async openMarketOrderWithQuote( side: number, size: number, asset : String, idSender : number,opts?: CallOptions) {
        console.group(`openMarketOrderWithQuote`);
        await  this.mockSpotHouse.connect(this.users[idSender])["openMarketOrderWithQuote(address,uint8,uint256)"](this.mockMatching.address, side, toWei(size));
        // const listOrderUserAf = await  this.mockSpotHouse.getPendingLimitOrders(this.mockMatching.address, this.users[4].address);
        // const balanceBase = await this.baseToken.balanceOf(this.users[2].address);
        // const balanceQuote = await this.quoteToken.balanceOf(this.users[2].address);
        // console.log("[openMarketOrder] listOrderUser after: ", listOrderUserAf);
        // console.log("[openMarketOrder] balanceBase balanceQuote after: ",balanceBase, balanceQuote);
        const currentPrice = await this.getCurrentPrice();
        console.log("[openMarketOrder] currentPrice : ", currentPrice)
        console.groupEnd();
    }

    async claimAsset( idSender : number) {
        console.group(`ClaimAsset`);
        await  this.mockSpotHouse.connect(this.users[idSender]).claimAsset(this.mockMatching.address);
        console.groupEnd();
    }


    async  shiftRange(tokenId : number,targetIndexPipRange :  number, amountVirtual : number, asset : string,  idSender: number){
        console.group(`ShiftRange`);
        await  this.dexNFT.connect(this.users[idSender]).shiftRange(tokenId, targetIndexPipRange, toWei(amountVirtual), asset.toLowerCase() === "base",);
        console.groupEnd();

    }



    async expectPool( expectData: ExpectedPoolData) {

        const poolData = await this.mockMatching.liquidityInfo(expectData.IndexPipRange);

        console.log(" START expectPool : ", expectData);
        console.log("FeeGrowthQuote: ", Number(expectData.FeeGrowthQuote),fromWeiAndFormat(poolData.feeGrowthQuote.toString()));
        console.log("FeeGrowthBase: ", Number(expectData.FeeGrowthBase), fromWeiAndFormat(poolData.feeGrowthBase));
        console.log("BaseReal: ", Number(expectData.BaseReal), fromWeiAndFormat(poolData.baseReal));
        console.log("QuoteReal", Number(expectData.QuoteReal), fromWeiAndFormat(poolData.quoteReal));
        console.log("K", sqrt(Number(expectData.K)),fromWeiAndFormat(poolData.sqrtK));
        // console.log("MaxPip: ", Number(expectData.MaxPip), Number(poolData.sqrtMaxPip)*Number(poolData.sqrtMaxPip));


        if (expectData.MaxPip) expect(this.expectDataInRange(Math.round(sqrt(Number(expectData.MaxPip))* 10**12),Number(poolData.sqrtMaxPip), 0.001)).to.equal(true, "MaxPip");
        if (expectData.MinPip) expect(this.expectDataInRange(Math.round( sqrt( Number(expectData.MinPip))* 10**12),Number( poolData.sqrtMinPip), 0.001)).to.equal(true, "MinPip");
        if (expectData.FeeGrowthBase) expect(this.expectDataInRange(Number(expectData.FeeGrowthBase),fromWeiAndFormat(poolData.feeGrowthBase, 15), 0.001)).to.equal(true, "FeeGrowthBase");
        if (expectData.FeeGrowthQuote) expect(this.expectDataInRange(Number(expectData.FeeGrowthQuote),fromWeiAndFormat(poolData.feeGrowthQuote, 15), 0.001)).to.equal(true, "FeeGrowthQuote")



        if (expectData.BaseReal) expect(this.expectDataInRange(Number(expectData.BaseReal),fromWeiAndFormat(poolData.baseReal), 0.001)).to.equal(true, "BaseReal");
        if (expectData.QuoteReal) expect(this.expectDataInRange(Number(expectData.QuoteReal),fromWeiAndFormat(poolData.quoteReal), 0.001)).to.equal(true, "QuoteReal");
        if (expectData.K) expect(this.expectDataInRange(sqrt(Number(expectData.K)),fromWeiAndFormat(poolData.sqrtK), 0.001)).to.equal(true, "K");

    }

    async expectUser() {
        // TODO implement
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

    async  expectPrice (price : number | string) {

        const currentPrice = (await this.mockMatching.getCurrentPip()).toString()

        expect(currentPrice).to.be.equal(price.toString())
    }



    async  expectPending(orderId : number, price : number, side : any, _size : number, id : number){

        console.log("price: ", price);

        const  {isFilled, isBuy, size, partialFilled} =  await this.mockMatching
            .getPendingOrderDetail(price, orderId)


        console.log("isFilled, isBuy, size, partialFilled: ", isFilled.toString(), isBuy.toString(), size.toString(), partialFilled.toString());

        console.log("size: ", size,fromWeiAndFormat(size), _size );
        if (size.gt(0) ){
            await expect( side == SIDE.BUY).to.eq(isBuy);

        }


        if (id !== undefined){
            const orderIdOfTrader = await this.mockSpotHouse.getOrderIdOfTrader(this.mockMatching.address, this.users[id].address,price, orderId )

            const listPendingOrder = await  this.mockSpotHouse.getPendingLimitOrders(this.mockMatching.address, this.users[id].address);

            const order = listPendingOrder[orderIdOfTrader.toString()]

            console.log("order: ", order);
        }



    }


    async expectUserLiquidity( expectData:ExpectUser){
        console.log("expectUserLiquidity")

        if (expectData.TokenId) {
            // expect(await this.dexNFT.ownerOf(expectData.TokenId)).to.be.equal(this.users[expectData.Id].address);

            const liquidityInfo = await this.dexNFT.concentratedLiquidity(expectData.TokenId);
            console.log("liquidityInfo feeGrowthBase: ",fromWeiAndFormat(liquidityInfo.feeGrowthBase, 15) ,Number(expectData.FeeGrowthBase));
            console.log("liquidityInfo feeGrowthQuote: ",fromWeiAndFormat(liquidityInfo.feeGrowthQuote, 15) ,Number(expectData.FeeGrowthQuote));
            console.log("liquidityInfo liquidity: ",fromWeiAndFormat(liquidityInfo.liquidity) ,Number(expectData.Liquidity));

            if (expectData.Liquidity) expect(this.expectDataInRange( fromWeiAndFormat(liquidityInfo.liquidity) ,Number(expectData.Liquidity) , 0.01)).to.equal(true, "Liquidity user");
            if (expectData.FeeGrowthBase) expect(this.expectDataInRange( fromWeiAndFormat(liquidityInfo.feeGrowthBase, 15) ,Number(expectData.FeeGrowthBase) , 0.001)).to.equal(true, "FeeGrowthBase user");
            if (expectData.FeeGrowthQuote) expect(this.expectDataInRange( fromWeiAndFormat(liquidityInfo.feeGrowthQuote, 15) ,Number(expectData.FeeGrowthQuote) , 0.001)).to.equal(true, "FeeGrowthQuote user");
            // if (expectData.QuoteVirtual) expect(this.expectDataInRange( fromWeiAndFormat(liquidityInfo.quoteVirtual) ,Number(expectData.QuoteVirtual) , 0.01)).to.equal(true, "QuoteVirtual user");
            // if (expectData.BaseVirtual) expect(this.expectDataInRange( fromWeiAndFormat(liquidityInfo.baseVirtual) ,Number(expectData.BaseVirtual) , 0.01)).to.equal(true, "BaseVirtual user");

        }
        const balanceBase = await this.baseToken.balanceOf(this.users[expectData.Id].address);
        const balanceQuote = await this.quoteToken.balanceOf(this.users[expectData.Id].address);
        console.log("balance base and expect:" , fromWeiAndFormat(balanceBase.toString()), Number(expectData.BalanceBase));
        console.log("balance quote and expect:" , fromWeiAndFormat(balanceQuote.toString()), Number(expectData.BalanceQuote));
        if ( expectData.BalanceBase) expect(this.expectDataInRange( fromWeiAndFormat(await this.baseToken.balanceOf(this.users[expectData.Id].address)) ,Number(expectData.BalanceBase) , 0.0001)).to.equal(true, "BalanceBase user");
        if ( expectData.BalanceQuote)    expect(this.expectDataInRange( fromWeiAndFormat(await this.quoteToken.balanceOf(this.users[expectData.Id].address)) ,Number(expectData.BalanceQuote) , 0.0001)).to.equal(true, "BalanceQuote user");

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

        const basisPoint = (await this.mockMatching.basisPoint()).toString()
        console.log("basisPoint: ", basisPoint);
        return pipToPrice((await this.mockMatching.getCurrentPip()).toString(), Number(basisPoint) );
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
