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
    Quantity: 10
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


describe("OpenMarketWithQuote-Manual", async function(){
    let testHelper: TestLiquidity

    beforeEach(async () => {
        testHelper = await deployAndCreateRouterHelper(10_000, false)
    })



it ("OpenMarketWithQuote-fill-limit", async () => {
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
    id: 2
    asset: quote
    Side: 1
    Quantity: 4
    User:
      Id: 2
      BalanceBase: 1024
      BalanceQuote: 996
    `)
 })
it ("OpenMarketWithQuote-fill-limit-amm", async () => {
        return testHelper.process(`
- S0: SetCurrentPrice
  Action: 
    Price: 165000
- S1: AddLiquidity
  Action:
    Id: 1
    IndexPipRange: 5
    Asset: base
    AmountVirtual: 10
  Expect:
    Pool:
      K: 910483.1139089900
      Liquidity: 954.1923883101
      BaseVirtual: 10
      QuoteVirtual: 180.3765750184
      BaseReal: 234.9059275164
      QuoteReal: 3875.9478040214
      IndexPipRange: 5
      MaxPip: 179999
      MinPip: 150000
      FeeGrowthBase: 0  
      FeeGrowthQuote: 0
    User:
      Id: 1
      TokenId: 1000001
      Liquidity: 954.19238831013
      BaseVirtual: 10.00000000000
      QuoteVirtual: 180.3765750184
      BalanceBase: 9990.00000
      BalanceQuote: 9819.62342
- S2: AddLiquidity
  Action:
    Id: 2
    IndexPipRange: 5
    Asset: base
    AmountVirtual: 35
  Expect:
    Pool:
      K: 18437283.0566570000
      Liquidity: 4293.8657473956
      BaseVirtual: 45
      QuoteVirtual: 811.6945875827
      BaseReal: 1057.0766738240
      QuoteReal: 17441.7651180963
      IndexPipRange: 5
      MaxPip: 179999
      MinPip: 150000
      FeeGrowthBase: 0  
      FeeGrowthQuote: 0
    User:
      Id: 2
      TokenId: 1000002
      Liquidity: 3339.67335908545
      BaseVirtual: 35.00000000000
      QuoteVirtual: 631.31801256436
      BalanceBase: 9965.00000
      BalanceQuote: 9368.68199
- S3: AddLiquidity
  Action:
    Id: 1
    IndexPipRange: 5
    Asset: base
    AmountVirtual: 55
  Expect:
    Pool:
      K: 91048311.3908989000
      Liquidity: 9541.9238831013
      BaseVirtual: 100
      QuoteVirtual: 1803.7657501839
      BaseReal: 2349.0592751645
      QuoteReal: 38759.4780402140
      IndexPipRange: 5
      MaxPip: 179999
      MinPip: 150000
      FeeGrowthBase: 0  
      FeeGrowthQuote: 0
    User:
      Id: 1
      TokenId: 1000003
      Liquidity: 5248.05813570571
      BaseVirtual: 55.00000000000
      QuoteVirtual: 992.07116260114
      BalanceBase: 9935.00000
      BalanceQuote: 8827.55226
- S4: OpenLimit
  Action:
    Id: 4
    Asset: base
    Side: 0
    Quantity: 10
    Price: 165000
  Expect:
    PendingOrder:
      Id: 4
      OrderId: 1
      Price: 165000
      Size : 10
      Side: 0
- S5: OpenMarket
  Action:
    id: 3
    asset: quote
    Side: 1
    Quantity: 329.30057
  Expect:
    Pool:
      Liquidity: 9541.9238831013
      BaseVirtual: 110
      QuoteVirtual: 1639.4651815281
      BaseReal: 2359.0592751645
      QuoteReal: 38595.1774715583
      IndexPipRange: 5
      MaxPip: 179999
      MinPip: 150000
      FeeGrowthBase: 0  
      FeeGrowthQuote: 0
    User:
      Id: 3
      BalanceBase: 9980.00000
      BalanceQuote: 10329.30057
    `)
 })

})
describe("OpenMarketWithQuote-Manual", async function(){
    let testHelper: TestLiquidity

    beforeEach(async () => {
        testHelper = await deployAndCreateRouterHelper(10_000, false)
    })



it ("OpenMarketWithQuote-fill-limit", async () => {
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
    id: 2
    asset: quote
    Side: 1
    Quantity: 4
    User:
      Id: 2
      BalanceBase: 1024
      BalanceQuote: 996
    `)
 })
it ("OpenMarketWithQuote-fill-limit-amm", async () => {
        return testHelper.process(`
- S0: SetCurrentPrice
  Action: 
    Price: 165000
- S1: AddLiquidity
  Action:
    Id: 1
    IndexPipRange: 5
    Asset: base
    AmountVirtual: 10
  Expect:
    Pool:
      K: 910483.1139089900
      Liquidity: 954.1923883101
      BaseVirtual: 10
      QuoteVirtual: 180.3765750184
      BaseReal: 234.9059275164
      QuoteReal: 3875.9478040214
      IndexPipRange: 5
      MaxPip: 179999
      MinPip: 150000
      FeeGrowthBase: 0  
      FeeGrowthQuote: 0
    User:
      Id: 1
      TokenId: 1000001
      Liquidity: 954.19238831013
      BaseVirtual: 10.00000000000
      QuoteVirtual: 180.3765750184
      BalanceBase: 9990.00000
      BalanceQuote: 9819.62342
- S2: AddLiquidity
  Action:
    Id: 2
    IndexPipRange: 5
    Asset: base
    AmountVirtual: 35
  Expect:
    Pool:
      K: 18437283.0566570000
      Liquidity: 4293.8657473956
      BaseVirtual: 45
      QuoteVirtual: 811.6945875827
      BaseReal: 1057.0766738240
      QuoteReal: 17441.7651180963
      IndexPipRange: 5
      MaxPip: 179999
      MinPip: 150000
      FeeGrowthBase: 0  
      FeeGrowthQuote: 0
    User:
      Id: 2
      TokenId: 1000002
      Liquidity: 3339.67335908545
      BaseVirtual: 35.00000000000
      QuoteVirtual: 631.31801256436
      BalanceBase: 9965.00000
      BalanceQuote: 9368.68199
- S3: AddLiquidity
  Action:
    Id: 1
    IndexPipRange: 5
    Asset: base
    AmountVirtual: 55
  Expect:
    Pool:
      K: 91048311.3908989000
      Liquidity: 9541.9238831013
      BaseVirtual: 100
      QuoteVirtual: 1803.7657501839
      BaseReal: 2349.0592751645
      QuoteReal: 38759.4780402140
      IndexPipRange: 5
      MaxPip: 179999
      MinPip: 150000
      FeeGrowthBase: 0  
      FeeGrowthQuote: 0
    User:
      Id: 1
      TokenId: 1000003
      Liquidity: 5248.05813570571
      BaseVirtual: 55.00000000000
      QuoteVirtual: 992.07116260114
      BalanceBase: 9935.00000
      BalanceQuote: 8827.55226
- S4: OpenLimit
  Action:
    Id: 4
    Asset: base
    Side: 0
    Quantity: 10
    Price: 165000
  Expect:
    PendingOrder:
      OrderId: 1
      Price: 165000
      Size : 10
      Side: 0
- S5: OpenMarket
  Action:
    id: 3
    asset: quote
    Side: 1
    Quantity: 329.30057
  Expect:
    Pool:
      Liquidity: 9541.9238831013
      BaseVirtual: 110
      QuoteVirtual: 1639.4651815281
      BaseReal: 2359.0592751645
      QuoteReal: 38595.1774715583
      IndexPipRange: 5
      MaxPip: 179999
      MinPip: 150000
      FeeGrowthBase: 0  
      FeeGrowthQuote: 0
    User:
      Id: 3
      BalanceBase: 9980.00000
      BalanceQuote: 10329.30057
    `)
 })

})

describe("POSI/BNB", async function(){
    let testHelper: TestLiquidity

    beforeEach(async () => {
        testHelper = await deployAndCreateRouterHelper(10_000, false, true, 2000,  "quote", 1_000_000)
    })



    it ("OpenOrder", async () => {
        return testHelper.process(`
- S0: SetCurrentPrice
  Action: 
    Price: 3000
- S1: AddLiquidity
  Action:
    Id: 1
    IndexPipRange: 1
    BaseVirtual: 24.073632
    Asset: base
  Expect:
    Pool:
      Liquidity: 9.849879189561687774
      BaseVirtual: 24.073632
      QuoteVirtual: 0.099000111653359784
      IndexPipRange: 1
      MaxPip: 3999
      MinPip: 2000
- S2: OpenMarket
  Action:
    id: 1
    asset: base
    Side: 0
    Quantity: 0.001 
`)
    })

})



describe("basisPoint-6", async function(){
    let testHelper: TestLiquidity

    beforeEach(async () => {
        testHelper = await deployAndCreateRouterHelper(
            10_000_000,
            false,
            false,
            2000,
            'none',
            1_000_000
        )
    })



    it ("should basisPoint 6", async () => {
        return testHelper.process(`
- S0: SetCurrentPrice
  Action: 
    Price: 3000
- S1: AddLiquidity
  Action:
    Id: 1
    IndexPipRange: 1
    Asset: base
    AmountVirtual: 1000
- S2: OpenMarket
  Action:
    id: 1
    asset: base
    Side: 1
    Quantity: 10
`)
    })
})


describe("cancel-all-limit-order", async () => {
    let testHelper: TestLiquidity

    beforeEach(async () => {
        testHelper = await deployAndCreateRouterHelper(1_000_000, true, false, 30000,  )
    })



    it ("Cancel-All", async () => {
        return testHelper.process(`
- S0: SetCurrentPrice
  Action: 
    Price: 652547
- S1: OpenLimit
  Action:
    Id: 1
    Asset: base
    Side: 1
    Quantity: 52.418027262
    Price: 671386
- S2: OpenLimit
  Action:
    Id: 1
    Asset: base
    Side: 1
    Quantity: 139.46225042572198
    Price: 775465
- S3: OpenLimit
  Action:
    Id: 1
    Asset: base
    Side: 0
    Quantity: 192.86650427261443
    Price: 710617
- S4: OpenLimit
  Action:
    Id: 1
    Asset: base
    Side: 1
    Quantity: 94.91299088996044
    Price: 730940
- S5: OpenLimit
  Action:
    Id: 1
    Asset: base
    Side: 0
    Quantity: 99.66288628498255
    Price: 622868
- S6: OpenMarket
  Action:
    id: 1
    asset: base
    Side: 1
    Quantity: 131.74886564862416
- S7: OpenLimit
  Action:
    Id: 1
    Asset: base
    Side: 1
    Quantity: 152.15113297521154
    Price: 742048
- S8: OpenMarket
  Action:
    id: 1
    asset: base
    Side: 1
    Quantity: 57.79453010416853
- S9: OpenLimit
  Action:
    Id: 1
    Asset: base
    Side: 0
    Quantity: 114.92474495743375
    Price: 776413
`)
    })
})

describe("swap", async () => {
    let testHelper: TestLiquidity

    beforeEach(async () => {
        testHelper = await deployAndCreateRouterHelper(1_000_000, true, false, 2000  )
    })



    it ("swap", async () => {
        return testHelper.process(`
- S0: SetCurrentPrice
  Action: 
    Price: 3000
- S1: AddLiquidity
  Action:
    Id: 1
    IndexPipRange: 1
    Asset: base
    AmountVirtual: 50
- S2: OpenLimit
  Action:
    Id: 1
    Asset: base
    Side: 1
    Quantity: 1.2
    Price: 3030
- S3: OpenLimit
  Action:
    Id: 1
    Asset: base
    Side: 1
    Quantity: 0.6
    Price: 3025
- S4: OpenMarket
  Action:
    id: 1
    asset: quote
    Side: 0
    Quantity: 2
- S5: OpenMarket
  Action:
    id: 1
    asset: quote
    Side: 0
    Quantity: 2
`)
    })
})
