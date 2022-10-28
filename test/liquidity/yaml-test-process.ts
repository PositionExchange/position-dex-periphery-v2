import {expect, use} from "chai";
import {TestLiquidity} from "./test-liquidity";
import {getAccount, SIDE} from "../utils/utils";
//
// import {waffle} from "hardhat";
// const {solidity} = waffle
// use(solidity);

export class YamlTestProcess {
    testHelper: TestLiquidity;


    constructor(testHelper: TestLiquidity) {
        this.testHelper = testHelper;
    }

    extractAction(action)
    {
        const id = action.getProp("Id");
        const asset = action.getProp("Asset")
        const side = (action.getProp("Side")) == 0 ? SIDE.BUY : SIDE.SELL
        const quantity = action.getProp("Quantity")
        const price = action.getProp("Price")

        const indexPipRange = action.getProp("IndexPipRange")
        const baseVirtual = action.getProp("BaseVirtual")
        const quoteVirtual = action.getProp("QuoteVirtual")
        const liquidity = action.getProp("Liquidity")
        const revert = action.getProp("Revert")

        const amountVirtual = action.getProp("AmountVirtual")



        return {
            id,
            asset,
            side,
            quantity,
            price,
            indexPipRange,
            baseVirtual,
            quoteVirtual,
            liquidity,
            revert,
            amountVirtual
        }
    }

    extractPending(expect) {

        const orderId = expect.getProp("orderId");
        const size = expect.getProp("size");
        const side = expect.getProp("side");
        const price = expect.getProp("price");

        return {
            orderId,
            size,
            side,
            price
        }

    }
    extractPool(expect){

        const liquidity = expect.getProp("Liquidity")
        const baseVirtual = expect.getProp("BaseVirtual")
        const quoteVirtual = expect.getProp("QuoteVirtual")

        const baseReal = expect.getProp("BaseReal")
        const quoteReal = expect.getProp("QuoteReal")


        const indexPipRange = expect.getProp("IndexPipRange")

        const maxPip = expect.getProp("MaxPip")
        const minPip = expect.getProp("MinPip")

        const feeGrowthBase = expect.getProp("FeeGrowthBase")
        const feeGrowthQuote = expect.getProp("FeeGrowthQuote")
        const k = expect.getProp("K")

        return{
            liquidity,
            baseVirtual,
            quoteVirtual,
            baseReal,
            quoteReal,
            indexPipRange,
            maxPip,
            minPip,
            feeGrowthBase,
            feeGrowthQuote,
            k
        }
    }

    extractUser(expect){

        const id = expect.getProp("Id")
        const tokenId = expect.getProp("TokenId")
        const liquidity = expect.getProp("Liquidity")

        const feeGrowthBase = expect.getProp("FeeGrowthBase")
        const feeGrowthQuote = expect.getProp("FeeGrowthQuote")


        const baseVirtual = expect.getProp("BaseVirtual")
        const quoteVirtual = expect.getProp("QuoteVirtual")

        const balanceBase = expect.getProp("BalanceBase")
        const balanceQuote = expect.getProp("BalanceQuote")
        return{
            liquidity,
            id,
            tokenId,
            baseVirtual,
            quoteVirtual,
            feeGrowthBase,
            feeGrowthQuote,
            balanceBase,
            balanceQuote
        }
    }


    async expectTest(expectData) {


        const expectPool= expectData.getProp("Pool");
        const expectPendingOrder = expectData.getProp("PendingOrder");
        const expectUser = expectData.getProp("User");


        if (expectPendingOrder) {
            console.log("[IT] PendingOrder");
            const extract = this.extractPending(expectPendingOrder)
            console.log("extract: ", extract);
            await this.testHelper.expectPending(extract.orderId, extract.price, extract.side, extract.size);
        }

        if ( expect) {
            // TODO implement
            const extractUser = this.extractUser(expectUser)

            await  this.testHelper.expectUserLiquidity();
        }

        if (expectPool) {
            const extract = this.extractPool(expectPool)

            await this.testHelper.expectPool({
                Liquidity: extract.liquidity,
                BaseVirtual: extract.baseVirtual,
                QuoteVirtual: extract.quoteVirtual,
                BaseReal: extract.baseReal,
                QuoteReal: extract.quoteReal,
                IndexPipRange: extract.indexPipRange,
                MaxPip: extract.maxPip,
                MinPip: extract.minPip,
                FeeGrowthBase: extract.feeGrowthBase,
                FeeGrowthQuote: extract.feeGrowthQuote,
                K : extract.k
            })

        }
    }

    async SetCurrentPrice(stepData) {
        console.log("[IT] SetCurrentPrice: ",stepData );
        const action = this.extractAction(stepData.getProp("Action"));
        if (action) { await this.testHelper.setCurrentPrice(action.price)}
        const expectData = stepData.getProp("Expect");
        if (expectData) await this.expectTest(expectData);
    }

    async AddLiquidity(stepData) {
        const action = this.extractAction(stepData.getProp("Action"));
        if (action) { await this.testHelper.addLiquidity(action.baseVirtual, action.quoteVirtual, action.indexPipRange)}
        const expectData = stepData.getProp("Expect");
        if (expectData) await this.expectTest(expectData);
    }

    log(...args){
        console.log(`[YamlTestCaseProcess]: `, ...args)
    }

    async RemoveLiquidity(stepData) {
        const action = this.extractAction(stepData.getProp("Action"));
        if (action) { await this.testHelper.removeLiquidity( action.indexPipRange, action.liquidity)}
        const expectData = stepData.getProp("Expect");
        if (expectData) await this.expectTest(expectData);
    }


    async IncreaseLiquidity(stepData) {
        const action = this.extractAction(stepData.getProp("Action"));


    }
    async DecreaseLiquidity(stepData) {
        const action = this.extractAction(stepData.getProp("Action"));


    }

    async ShiftRange(stepData) {
        const action = this.extractAction(stepData.getProp("Action"));
    }






    async OpenLimit(stepData) {

        const action = this.extractAction(stepData.getProp("Action"));
        if (action) { await this.testHelper.openLimitOrder( action.price, action.side, action.quantity, action.id, {revert : action.revert} )}
        const expectData = stepData.getProp("Expect");
        if (expectData) await this.expectTest(expectData);
    }
    async OpenMarket(stepData) {
        const action = this.extractAction(stepData.getProp("Action"));
        if (action) { await this.testHelper.openMarketOrder(  action.side, action.quantity, action.asset, {revert : action.revert})}

        if (action.revert === undefined){
            const expectData = stepData.getProp("Expect");
            if (expectData) await this.expectTest(expectData);
        }

    }
    async Expect(stepData) {
        if (stepData) await this.expectTest(stepData);
    }
}
