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
      TokenId: 1000001
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
    TokenId: 1000001
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
      TokenId: 1000001
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
    TokenId: 1000001
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
      TokenId: 1000001
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
      TokenId: 1000002
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
      TokenId: 1000003
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
      TokenId: 1000004
      Liquidity: 23.22850776472
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0
      BaseVirtual: 0
      QuoteVirtual: 140
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
    TokenId: 1000001
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
    TokenId: 1000002
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
    TokenId: 1000003
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
    TokenId: 1000004
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
    it ("Case #4", async () => {
        return testHelper.process(`
- S0: SetCurrentPrice
  Action:
    Price: 50000
- S1: OpenLimit
  Action:
    Id: 1
    Asset: base
    Side: 1
    Quantity: 21
    Price: 80000
  Expect:
    PendingOrder:
      OrderId: 1
      Price: 80000
      Size : 21
      Side: 1
- S2: AddLiquidity
  Action:
    Id: 2
    IndexPipRange: 1
    Asset: base
    AmountVirtual: 10
  Expect:
    Pool:
      Liquidity: 256.66097519371
      BaseVirtual: 10
      QuoteVirtual: 129.3615383
      BaseReal: 114.7822775409
      QuoteReal: 573.9113877045
      IndexPipRange: 1 
      MaxPip: 59999 
      MinPip: 30000 
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0
    User:
      Id: 2
      TokenId: 1000001
      Liquidity: 256.66097519371
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0
      BaseVirtual: 10
      QuoteVirtual: 129.3615383
      BalanceBase: 990.00000
      BalanceQuote: 870.63846
- S3: AddLiquidity
  Action:
    Id: 1
    IndexPipRange: 1
    Asset: base
    AmountVirtual: 20
  Expect:
    Pool:
      Liquidity: 769.98292558113
      BaseVirtual: 30
      QuoteVirtual: 388.084615
      BaseReal: 344.3468326227
      QuoteReal: 1721.7341631136
      IndexPipRange: 1 
      MaxPip: 59999 
      MinPip: 30000 
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0
    User:
      Id: 1
      TokenId: 1000002
      Liquidity: 513.32195
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0
      BaseVirtual: 20
      QuoteVirtual: 258.7230767
      BalanceBase: 959.00000
      BalanceQuote: 741.27692
- S4: AddLiquidity
  Action:
    Id: 2
    IndexPipRange: 2
    Asset: base
    AmountVirtual: 80
  Expect:
    Pool:
      Liquidity: 1067.90393641912
      BaseVirtual: 80
      QuoteVirtual: 0
      BaseReal: 435.96995642274
      QuoteReal: 0
      IndexPipRange: 2 
      MaxPip: 89999 
      MinPip: 60000 
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0
    User:
      Id: 2
      TokenId: 1000003
      Liquidity: 1067.90393641912
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0
      BaseVirtual: 80
      QuoteVirtual: 0
      BalanceBase: 910.00000
      BalanceQuote: 870.63846
- S5: AddLiquidity
  Action:
    Id: 1
    IndexPipRange: 2
    Asset: base
    AmountVirtual: 40
  Expect:
    Pool:
      Liquidity: 1601.85590462868
      BaseVirtual: 120
      QuoteVirtual: 0
      BaseReal: 653.9549346341
      QuoteReal: 0
      IndexPipRange: 2 
      MaxPip: 89999 
      MinPip: 60000 
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0
    User:
      Id: 1
      TokenId: 1000004
      Liquidity: 533.95196820956
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0
      BaseVirtual: 40
      QuoteVirtual: 0
      BalanceBase: 919.00000
      BalanceQuote: 741.27692
- S6: OpenMarket
  Action:
    Id: 3
    asset: base
    Side: 0
    Quantity: 137.61334831078
  Expect:
    Pool: 
      Liquidity: 1601.85590462868
      BaseVirtual: 32.3866516892
      QuoteVirtual: 607.0030827820
      BaseReal: 566.3415863233
      QuoteReal: 4530.7326905866
      IndexPipRange: 2
      MaxPip: 89999 
      MinPip: 60000 
      FeeGrowthBase: 0.0009845081977
      FeeGrowthQuote: 0
    User:
      Id: 3
      BalanceBase: 1133.48495
      BalanceQuote: 68.68152
- S7: RemoveLiquidity
  Action:
    Id: 2
    TokenId: 1000001
  Expect:
    Pool:
      Liquidity: 513.32195038742
      BaseVirtual: 0
      QuoteVirtual: 368.26667532398
      BaseReal: 209.56455508181
      QuoteReal: 1257.36637403534
      IndexPipRange: 1 
      MaxPip: 59999 
      MinPip: 30000
    User:
      Id: 2
      BalanceBase: 910.18000
      BalanceQuote: 1054.77180
- S8: RemoveLiquidity
  Action:
    Id: 1
    TokenId: 1000002
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
      BalanceBase: 919.36000
      BalanceQuote: 1109.54360
- S9: RemoveLiquidity
  Action:
    Id: 2
    TokenId: 1000003
  Expect:
    Pool:
      Liquidity: 533.95196820956
      BaseVirtual: 10.79555056307
      QuoteVirtual: 202.33436092733
      BaseReal: 188.78052877444
      QuoteReal: 1510.24423019554
      IndexPipRange: 2 
      MaxPip: 89999 
      MinPip: 60000
    User:
      Id: 2
      BalanceBase: 932.82246
      BalanceQuote: 1459.44052
- S10: RemoveLiquidity
  Action:
    Id: 1
    TokenId: 1000004
  Expect:
    Pool:
      Liquidity: 0
      BaseVirtual: 0
      QuoteVirtual: 0
      BaseReal: 0
      QuoteReal: 0
      IndexPipRange: 2 
      MaxPip: 89999 
      MinPip: 60000
    User:
      Id: 1
      BalanceBase: 930.68123
      BalanceQuote: 1311.87796`)
    })
    it ("Case #5", async () => {
        return testHelper.process(`
- S0: SetCurrentPrice
  Action:
    Price: 179999
- S1: AddLiquidity
  Action:
    Id: 1
    IndexPipRange: 5
    Asset: quote
    AmountVirtual: 100.00000000000
  Expect:
    Pool:
      Liquidity: 270.52942592077
      BaseVirtual: 0
      QuoteVirtual: 100.00000000000
      BaseReal: 0
      QuoteReal: 1147.75596125021
      IndexPipRange: 5 
      MaxPip: 179999 
      MinPip: 150000 
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0
    User:
      Id: 1
      TokenId: 1000001
      Liquidity: 270.52942592077
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0
      BaseVirtual: 0
      QuoteVirtual: 100.00000000000
      BalanceBase: 1000.00000000000
      BalanceQuote: 900.00000
- S2: AddLiquidity
  Action:
    Id: 2
    IndexPipRange: 5
    Asset: quote
    AmountVirtual: 200.00000000000
  Expect:
    Pool:
      Liquidity: 811.58827776232
      BaseVirtual: 0
      QuoteVirtual: 300.00000000000
      BaseReal: 0
      QuoteReal: 3443.26788375064
      IndexPipRange: 5 
      MaxPip: 179999 
      MinPip: 150000 
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0
    User:
      Id: 2
      TokenId: 1000002
      Liquidity: 541.05885184155
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0
      BaseVirtual: 0
      QuoteVirtual: 200.00000000000
      BalanceBase: 1000.00000000000
      BalanceQuote: 800.00000
- S3: RemoveLiquidity
  Action:
    Id: 1
    TokenId: 1000001
  Expect:
    Pool:
      Liquidity: 270.52942592077
      BaseVirtual: 0
      QuoteVirtual: 200.00000000000
      BaseReal: 0
      QuoteReal: 2295.51192250042
      IndexPipRange: 5
      MaxPip: 179999 
      MinPip: 150000
    User:
      Id: 1
      BalanceBase: 1000.00000
      BalanceQuote: 1000.00000
- S4: AddLiquidity
  Action:
    Id: 2
    IndexPipRange: 6
    Asset: base
    AmountVirtual: 55
  Expect:
    Pool:
      Liquidity: 3145.76012377308
      BaseVirtual: 55
      QuoteVirtual: 0
      BaseReal: 741.46277183539
      QuoteReal: 0
      IndexPipRange: 6 
      MaxPip: 209999 
      MinPip: 180000 
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0
    User:
      Id: 2
      TokenId: 1000003
      Liquidity: 3145.76012377308
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0
      BaseVirtual: 55
      QuoteVirtual: 0
      BalanceBase: 945.00000
      BalanceQuote: 800.00000
- S5: OpenMarket
  Action:
    Id: 3
    asset: base
    Side: 0
    Quantity: 4.08522542399
  Expect:
    Pool: 
      Liquidity: 3145.76012377308
      BaseVirtual: 50.91477457601
      QuoteVirtual: 73.94145165038
      BaseReal: 737.37754641140
      QuoteReal: 13420.27134468740
      IndexPipRange: 6
      MaxPip: 209999 
      MinPip: 180000 
      FeeGrowthBase: 0.00002337560867
      FeeGrowthQuote: 0
    User:
      Id: 3
      BalanceBase: 1003.96267
      BalanceQuote: 926.05855
- S6: RemoveLiquidity
  Action:
    Id: 2
    TokenId: 1000002
  Expect:
    Pool:
      Liquidity: 0
      BaseVirtual: 0
      QuoteVirtual: 0
      BaseReal: 0
      QuoteReal: 0
      IndexPipRange: 5
      MaxPip: 179999 
      MinPip: 150000
    User:
      Id: 2
      BalanceBase: 945.01265
      BalanceQuote: 1000.00000
- S7: RemoveLiquidity
  Action:
    Id: 2
    TokenId: 1000003
  Expect:
    Pool:
      Liquidity: 0
      BaseVirtual: 0
      QuoteVirtual: 0
      BaseReal: 0
      QuoteReal: 0
      IndexPipRange: 6
      MaxPip: 209999 
      MinPip: 180000
    User:
      Id: 2
      BalanceBase: 996.00096
      BalanceQuote: 1073.94145`
        )
    })
})
