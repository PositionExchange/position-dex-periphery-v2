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
    AmountVirtual: 20
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
    Quantity: 16
    Price: 30000
  Expect:
    PendingOrder:
      OrderId: 3
      Price: 30000
      Size : 16
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
    User:
      Id: 3
      BalanceBase: 913.19799
      BalanceQuote: 992.23831
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
      BalanceQuote: 1127.84532
- S8: Expect
  User:
    Id: 1
    BalanceBase: 1009.70000
    BalanceQuote: 970
- S9: Expect
  User:
    Id: 2
    BalanceBase: 1000
    BalanceQuote: 940
- S10: Expect
  User:
    Id: 4
    BalanceBase: 1000
    BalanceQuote: 952.00000
`)
    })
    it ("Case #2", async () => {
        return testHelper.process(`
- S0: SetCurrentPrice
  Action:
    Price: 50000
- S1: OpenLimit
  Action:
    Id: 1
    Asset: base
    Side: 1
    Quantity: 10
    Price: 59999
  Expect:
    PendingOrder:
      OrderId: 1
      Price: 59999
      Size : 10
      Side: 1
- S2: OpenLimit
  Action:
    Id: 2
    Asset: base
    Side: 1
    Quantity: 20
    Price: 59999
  Expect:
    PendingOrder:
      OrderId: 2
      Price: 59999
      Size : 20
      Side: 1
- S3: AddLiquidity
  Action:
    Id: 3
    IndexPipRange: 1
    Asset: base
    AmountVirtual: 1.546054589
  Expect:
    Pool:
      Liquidity: 39.68118785069
      BaseVirtual: 1.546054589
      QuoteVirtual: 20
      BaseReal: 17.7459666924
      QuoteReal: 88.7298334621
      IndexPipRange: 1 
      MaxPip: 59999 
      MinPip: 30000 
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0
    User:
      Id: 3
      TokenId: 1
      Liquidity: 39.68118785069
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0
      BaseVirtual: 1.546054589
      QuoteVirtual: 20
      BalanceBase: 998.45395
      BalanceQuote: 980.00000
- S4: OpenLimit
  Action:
    Id: 4
    Asset: base
    Side: 1
    Quantity: 16
    Price: 59999
  Expect:
    PendingOrder:
      OrderId: 3
      Price: 59999
      Size : 16
      Side: 1
- S5: OpenMarket
  Action:
    Id: 3
    asset: base
    Side: 0
    Quantity: 46.54605458897
  Expect:
    Pool: 
      Liquidity: 39.68118785069
      BaseVirtual: 0
      QuoteVirtual: 28.46801916741
      BaseReal: 16.19991210345
      QuoteReal: 97.19785262948
      IndexPipRange: 1
      MaxPip: 59999 
      MinPip: 30000 
      FeeGrowthBase: 0.0007013142526
      FeeGrowthQuote: 0
      FeeBase: 0.02783
      FeeQuote: 0
    User:
      Id: 3
      BalanceBase: 1043.60362
      BalanceQuote: 695.53658
- S6: RemoveLiquidity
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
      BalanceBase: 1043.63145
      BalanceQuote: 724.00460
- S7: Expect
  User:
    Id: 1
    BalanceBase: 990.00000
    BalanceQuote: 1000.00000
- S8: Expect
  User:
    Id: 2
    BalanceBase: 980.00000
    BalanceQuote: 1000.00000
- S9: Expect
  User:
    Id: 4
    BalanceBase: 985.00000
    BalanceQuote: 1000.00000`
        )
    })
    
})
