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
    it ("Case #3", async () => {
        return testHelper.process(`
- S0: SetCurrentPrice
  Action:
    Price: 50000
- S1: OpenLimit
  Action:
    Id: 1
    Asset: base
    Side: 0
    Quantity: 11
    Price: 20000
  Expect:
    PendingOrder:
      OrderId: 1
      Price: 20000
      Size : 11
      Side: 0
- S2: AddLiquidity
  Action:
    Id: 2
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
      Id: 2
      TokenId: 1
      Liquidity: 513.32195038742
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0
      BaseVirtual: 20
      QuoteVirtual: 258.7230767
      BalanceBase: 980.00000
      BalanceQuote: 741.27692
- S3: AddLiquidity
  Action:
    Id: 1
    IndexPipRange: 1
    Asset: base
    AmountVirtual: 30
  Expect:
    Pool:
      Liquidity: 1283.30487596855
      BaseVirtual: 50
      QuoteVirtual: 646.8076917
      BaseReal: 573.9113877045
      QuoteReal: 2869.5569385226
      IndexPipRange: 1 
      MaxPip: 59999 
      MinPip: 30000 
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0
    User:
      Id: 1
      TokenId: 2
      Liquidity: 769.98292558113
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0
      BaseVirtual: 30
      QuoteVirtual: 388.084615
      BalanceBase: 970.00000
      BalanceQuote: 591.91538
- S4: AddLiquidity
  Action:
    Id: 2
    IndexPipRange: 0
    Asset: quote
    AmountVirtual: 100
  Expect:
    Pool:
      Liquidity: 58.07126941179
      BaseVirtual: 0
      QuoteVirtual: 100
      BaseReal: 0.0000000000
      QuoteReal: 100.5807126941
      IndexPipRange: 0 
      MaxPip: 29999 
      MinPip: 1 
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0
    User:
      Id: 2
      TokenId: 3
      Liquidity: 58.07126941179
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0
      BaseVirtual: 0
      QuoteVirtual: 100
      BalanceBase: 980.00000
      BalanceQuote: 641.27692
- S5: AddLiquidity
  Action:
    Id: 1
    IndexPipRange: 0
    Asset: quote
    AmountVirtual: 40
  Expect:
    Pool:
      Liquidity: 81.29977717650
      BaseVirtual: 0
      QuoteVirtual: 140
      BaseReal: 0.0000000000
      QuoteReal: 140.8129977718
      IndexPipRange: 0 
      MaxPip: 29999 
      MinPip: 1 
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0
    User:
      Id: 1
      TokenId: 4
      Liquidity: 23.22850776472
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0
      BaseVirtual: 0
      QuoteVirtual: 40
      BalanceBase: 970.00000
      BalanceQuote: 551.91538
- S6: OpenMarket
  Action:
    Id: 3
    asset: base
    Side: 1
    Quantity: 187.55342107380
  Expect:
    Pool: 
      Liquidity: 81.29977717650
      BaseVirtual: 10.54839318552130
      QuoteVirtual: 114.1622497292
      BaseReal: 57.4876237505
      QuoteReal: 114.9752475009
      IndexPipRange: 0
      MaxPip: 29999 
      MinPip: 1 
      FeeGrowthBase: 0
      FeeGrowthQuote: 0.005720550794
      FeeBase: 0.3
      FeeQuote: 20.77936326
    User:
      Id: 3
      BalanceBase: 812.44658
      BalanceQuote: 1671.86608
- S7: RemoveLiquidity
  Action:
    Id: 2
    TokenId: 1
  Expect:
    Pool:
      Liquidity: 769.98292558113
      BaseVirtual: 130.20301673297
      QuoteVirtual: 0
      BaseReal: 444.54984935568
      QuoteReal: 1333.64954806704
      IndexPipRange: 1 
      MaxPip: 59999 
      MinPip: 30000
    User:
      Id: 2
      BalanceBase: 1066.80201
      BalanceQuote: 645.93394
- S8: RemoveLiquidity
  Action:
    Id: 1
    TokenId: 2
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
      Id: 1
      BalanceBase: 1100.20302
      BalanceQuote: 556.90091
- S9: RemoveLiquidity
  Action:
    Id: 2
    TokenId: 3
  Expect:
    Pool:
      Liquidity: 23.22850776472
      BaseVirtual: 3.01382662443
      QuoteVirtual: 32.61778563690
      BaseReal: 16.42503535727
      QuoteReal: 32.85007071455
      IndexPipRange: 0 
      MaxPip: 29999 
      MinPip: 1
    User:
      Id: 2
      BalanceBase: 1074.33658
      BalanceQuote: 727.81060
- S10: RemoveLiquidity
  Action:
    Id: 1
    TokenId: 4
  Expect:
    Pool:
      Liquidity: 0
      BaseVirtual: 0
      QuoteVirtual: 0
      BaseReal: 0
      QuoteReal: 0
      IndexPipRange: 0 
      MaxPip: 29999 
      MinPip: 1
    User:
      Id: 1
      BalanceBase: 1103.21684
      BalanceQuote: 589.65157`)
    })
})
