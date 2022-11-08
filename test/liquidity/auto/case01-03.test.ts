import {deployAndCreateRouterHelper, TestLiquidity} from "../test-liquidity";

describe("Integration-Case01", async function(){
    let testHelper: TestLiquidity

    beforeEach(async () => {
        testHelper = await deployAndCreateRouterHelper()
    })

    it ("Case #1", async () => {
        return testHelper.process(`
- S0: SetCurrentPrice
  Action:
    Price: 50000
- S1: OpenLimit
  Action:
    Id: 1
    Asset: base
    Side: 0
    Quantity: 10
    Price: 30000
  Expect:
    PendingOrder:
      OrderId: 1
      Price: 30000
      Size : 10
      Side: 0
- S2: OpenLimit
  Action:
    Id: 2
    Asset: base
    Side: 0
    Quantity: 20
    Price: 30000
  Expect:
    PendingOrder:
      OrderId: 2
      Price: 30000
      Size : 20
      Side: 0
- S3: AddLiquidity
  Action:
    Id: 3
    IndexPipRange: 1
    Asset: base
    BaseVirtual: 20
    QuoteVirtual: 258.7230767
  Expect:
    Pool:
      Liquidity: 513.32195038742
      BaseVirtual: 20
      QuoteVirtual: 258.7230767
      BaseReal: 229.5645550818
      QuoteReal: 1147.8227754090
      IndexPipRange: 1 
      MaxPip: 59999 
      MinPip: 30000 
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0
    User:
      Id: 3
      TokenId: 1
      Liquidity: 513.32195038742
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0
      BaseVirtual: 20
      QuoteVirtual: 258.7230767
      BalanceBase: 980
      BalanceQuote: 741.2769233
- S4: OpenLimit
  Action:
    Id: 4
    Asset: base
    Side: 0
    Quantity: 15
    Price: 30000
  Expect:
    PendingOrder:
      OrderId: 3
      Price: 30000
      Size : 15
      Side: 0
- S5: OpenMarket
  Action:
    Id: 3
    asset: base
    Side: 1
    Quantity: 66.80201115531140
  Expect:
    Pool: 
      Liquidity: 513.32195038742
      BaseVirtual: 86.80201115531140
      QuoteVirtual: 0
      BaseReal: 296.3665662371
      QuoteReal: 889.0996987114
      IndexPipRange: 1
      MaxPip: 59999 
      MinPip: 30000 
      FeeGrowthBase: 0
      FeeGrowthQuote: 0.009072309059
- S6: OpenMarket
  Action:
    Id: 3
    asset: base
    Side: 1
    Quantity: 45
  Expect:
   User:
      Id: 3
      BalanceBase: 868.19799
      BalanceQuote: 1123.18831
- S7: RemoveLiquidity
  Action:
    Id: 3
    TokenId: 1
  Expect:
    Pool:
      Liquidity: 0
      BaseVirtual: 0
      QuoteVirtual: 0
      BaseReal: 0
      QuoteReal: 0
      IndexPipRange: 1 
      MaxPip: 59999 
      MinPip: 30000
    User:
      Id: 3
      BalanceBase: 955.00000
      BalanceQuote: 1118.53129
- S8: Expect
  User:
    Id: 1
    BalanceBase: 1009.70000
    BalanceQuote: 970
- S9: Expect
  User:
    Id: 2
    BalanceBase: 1019.40000
    BalanceQuote: 940
- S10: Expect
  User:
    Id: 4
    BalanceBase: 1014.55000
    BalanceQuote: 955.00000`
        )
    })
})