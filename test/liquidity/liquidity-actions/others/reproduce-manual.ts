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
