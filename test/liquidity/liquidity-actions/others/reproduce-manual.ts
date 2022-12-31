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

describe("basisPoint-8", async function(){
    let testHelper: TestLiquidity

    beforeEach(async () => {
        testHelper = await deployAndCreateRouterHelper(10_000_000, false, false, 30000,'none', 100_000_000 )
    })



it ("should basisPoint 8", async () => {
        return testHelper.process(`
- S0: SetCurrentPrice
  Action: 
    Price: 70000
- S1: AddLiquidity
  Action:
    Id: 1
    IndexPipRange: 2
    Asset: base
    AmountVirtual: 10
  Expect:
    Pool:
      K: 5.02065162127
      Liquidity: 2.24068106193
      BaseVirtual: 10
      QuoteVirtual: 0.004397595792321
      BaseReal: 84.689783675264
      QuoteReal: 0.05928284857
      IndexPipRange: 2
      MaxPip: 89999
      MinPip: 60000
- S2: AddLiquidity
  Action:
    Id: 1
    IndexPipRange: 2
    Asset: base
    AmountVirtual: 20
  Expect:
    Pool:
      K: 45.18586459147
      Liquidity: 2.24068106193
      BaseVirtual: 10
      QuoteVirtual: 0.013192787376962
      BaseReal: 254.069351025793
      QuoteReal: 0.17784854572
      IndexPipRange: 2
      MaxPip: 89999
      MinPip: 60000
- S3: OpenLimit
  Action:
    Id: 2
    Asset: base
    Side: 1
    Quantity: 20
    Price: 70000
- S4: OpenLimit
  Action:
    Id: 2
    Asset: base
    Side: 1
    Quantity: 10
    Price: 80000
- S5: OpenMarket
  Action:
    Id: 3
    asset: base
    Side: 0
    Quantity: 25.27537070102
  Expect:
    Pool: 
      Liquidity: 45.18586459147
      BaseVirtual: 24.72462929898
      QuoteVirtual: 0.01696384730
      BaseReal: 248.793980324777
      QuoteReal: 0.18161960564
      IndexPipRange: 2
      MaxPip: 89999 
      MinPip: 60000 
- S6: OpenMarket
  Action:
    Id: 3
    asset: base
    Side: 0
    Quantity: 34.62462929898
  Expect:
    Pool: 
      Liquidity: 45.18586459147
      BaseVirtual: 0
      QuoteVirtual: 0.03700441689
      BaseReal: 224.069351025793
      QuoteReal: 0.20166017523
      IndexPipRange: 2
      MaxPip: 89999 
      MinPip: 60000 
- S7: OpenLimit
  Action:
    Id: 2
    Asset: base
    Side: 0
    Quantity: 10
    Price: 85000
- S8: OpenMarket
  Action:
    Id: 3
    asset: base
    Side: 1
    Quantity: 16.49482809977
  Expect:
    Pool: 
      Liquidity: 45.18586459147
      BaseVirtual: 6.49482809977
      QuoteVirtual: 0.03132379392
      BaseReal: 230.56417912556
      QuoteReal: 0.19597955226
      IndexPipRange: 2
      MaxPip: 89999 
      MinPip: 60000 
- S9: OpenMarket
  Action:
    Id: 3
    asset: base
    Side: 1
    Quantity: 43.56208477626
  Expect:
    Pool: 
      Liquidity: 45.18586459147
      BaseVirtual: 60.48048921403
      QuoteVirtual: 0
      BaseReal: 274.42626390182
      QuoteReal: 0.16465575834
      IndexPipRange: 2
      MaxPip: 89999 
      MinPip: 60000
`)
    })
it ("should basisPoint 8-noliquidity", async () => {
        return testHelper.process(`
- S0: SetCurrentPrice
  Action: 
    Price: 70000
- S1: OpenLimit
  Action:
    Id: 1
    Asset: base
    Side: 0
    Quantity: 10
    Price: 60000
- S2: OpenMarket
  Action:
    Id: 3
    Asset: base
    Side: 1
    Quantity: 1
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
