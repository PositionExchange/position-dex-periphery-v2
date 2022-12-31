import {deployAndCreateRouterHelper, TestLiquidity} from "../../test-liquidity";

describe("ReproduceManual", async function(){
    let testHelper: TestLiquidity

    beforeEach(async () => {
        testHelper = await deployAndCreateRouterHelper(10_000, true)
    })



    it ("Case 01", async () => {
        return testHelper.process(`
- S0: SetCurrentPrice
  Action:
    Price: 10000
- S1: AddLiquidity
  Action:
    Id: 1
    IndexPipRange: 0
    Asset: base
    AmountVirtual: 10
  Expect:
    Pool:
      Liquidity: 23.66025403784
      BaseVirtual: 10
      QuoteVirtual: 23.42365149747
      BaseReal: 23.660254037844
      QuoteReal: 23.660254037844
      IndexPipRange: 0 
      MaxPip: 29999 
      MinPip: 1 
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0
    User:
      Id: 1
      TokenId: 1000001
      Liquidity: 23.66025403784
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0
      BaseVirtual: 10
      QuoteVirtual: 23.42365149747
      BalanceBase: 9990.00000000000
      BalanceQuote: 9976.33974596216
`)
    })
})



describe("ReproduceManualPTX", async function(){
    let testHelper: TestLiquidity

    beforeEach(async () => {
        testHelper = await deployAndCreateRouterHelper(1_000, false)
    })



    it ("Limit PTX", async () => {
        return testHelper.process(`
- S0: SetCurrentPrice
  Action: 
    Price: 5104
- S1: OpenLimit
  Action:
    Id: 1
    Asset: base
    Side: 1
    Quantity: 1
    Price: 6000
  Expect:
    PendingOrder:
      OrderId: 1
      Price: 6000
      Size : 1
      Side: 1
- S2: OpenMarket
  Action:
    id: 2
    asset: base
    Side: 0
    Quantity: 0.1
- S3: OpenLimit
  Action:
    Id: 3
    Asset: base
    Side: 0
    Quantity: 0.1
    Price: 6000
- S4: OpenMarket
  Action:
    Id: 3
    Asset: base
    Side: 0
    Quantity: 0.1
    Price: 6000
- S5: Expect
  PendingOrder:
    OrderId: 1
    Price: 6000
    Size : 0.7
    Side: 1
`)
    })
})

describe("ReproduceManualBTC", async function(){
    let testHelper: TestLiquidity

    beforeEach(async () => {
        testHelper = await deployAndCreateRouterHelper(100_000_000_000, false, false, 3000000)
    })



it ("Limit BTC", async () => {
        return testHelper.process(`
- S0: SetCurrentPrice
  Action: 
    Price: 169210000
- S1: AddLiquidity
  Action:
    Id: 1
    IndexPipRange: 56
    Asset: base
    AmountVirtual: 10000
- S2: AddLiquidity
  Action:
    Id: 1
    IndexPipRange: 55
    Asset: quote
    AmountVirtual: 10000
- S3: AddLiquidity
  Action:
    Id: 1
    IndexPipRange: 57
    Asset: base
    AmountVirtual: 100
- S4: AddLiquidity
  Action:
    Id: 1
    IndexPipRange: 55
    Asset: quote
    AmountVirtual: 1000000
- S5: OpenLimit
  Action:
    Id: 1
    Asset: base
    Side: 0
    Quantity: 0.0058
    Price: 169210000
- S6: OpenLimit
  Action:
    Id: 1
    Asset: base
    Side: 0
    Quantity: 0.1
    Price: 169200000
- S7: OpenMarket
  Action:
    id: 1
    asset: base
    Side: 0
    Quantity: 0.01
`)
    })
it ("Add BTC", async () => {
        return testHelper.process(`
- S0: SetCurrentPrice
  Action: 
    Price: 169210000
- S1: AddLiquidity
  Action:
    Id: 1
    IndexPipRange: 56
    Asset: quote
    AmountVirtual: 1000000000
`)
    })
})
describe("ReproduceManualCHZ", async function(){
    let testHelper: TestLiquidity

    beforeEach(async () => {
        testHelper = await deployAndCreateRouterHelper(100_000_000_000, false, false, 30000)
    })
it ("Add CHZ", async () => {
        return testHelper.process(`
- S0: SetCurrentPrice
  Action: 
    Price: 33757
- S1: AddLiquidity
  Action:
    Id: 1
    IndexPipRange: 2
    Asset: base
    AmountVirtual: 1000000
`)
    })
})


describe("ReproduceManualAdd1M", async function(){
    let testHelper: TestLiquidity

    beforeEach(async () => {
        testHelper = await deployAndCreateRouterHelper(10_000_000, false, false, 30000)
    })



it ("Add 1M", async () => {
        return testHelper.process(`
- S0: SetCurrentPrice
  Action: 
    Price: 10000
- S1: AddLiquidity
  Action:
    Id: 1
    IndexPipRange: 0
    Asset: base
    AmountVirtual: 1000000
`)
    })
})


describe("OpenMarketWithQuote", async function(){
    let testHelper: TestLiquidity

    beforeEach(async () => {
        testHelper = await deployAndCreateRouterHelper(10_000, false)
    })



it ("OpenMarketWithQuote-sell-4", async () => {
        return testHelper.process(`
- S0: SetCurrentPrice
  Action:
    Price: 170000
- S1: AddLiquidity
  Action:
    Id: 3
    IndexPipRange: 5
    Asset: base
    AmountVirtual: 0.2704430339572
- S2: OpenLimit
  Action:
    Id: 1
    Asset: quote
    Side: 0
    Quantity: 50
    Price: 150000
- S3: OpenMarket
  Action:
    id: 2
    asset: quote
    Side: 1
    Quantity: 100
    `)
    })

})
