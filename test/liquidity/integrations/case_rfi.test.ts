import {deployAndCreateRouterHelper, TestLiquidity} from "../test-liquidity";

describe("Integration-Case-RFI", async function() {
    let testHelper: TestLiquidity

    beforeEach(async () => {
        testHelper = await deployAndCreateRouterHelper(10000, true, true )
    })
    it("Case #7", async () => {
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
      Liquidity: 944.6504644
      BaseVirtual: 9.9
      QuoteVirtual: 178.5728093
      BaseReal: 232.5568682
      QuoteReal: 3837.188326
      IndexPipRange: 5 
      MaxPip: 179999 
      MinPip: 150000 
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0
    User:
      Id: 1
      TokenId: 1000001
      Liquidity: 944.6504644
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0
      BaseVirtual: 9.9
      QuoteVirtual: 178.5728093
      BalanceBase: 9990.00000
      BalanceQuote: 9821.42719
- S2: AddLiquidity
  Action:
    Id: 1
    IndexPipRange: 5
    Asset: base
    AmountVirtual: 10
  Expect:
    Pool:
      Liquidity: 1889.300929
      BaseVirtual: 19.8
      QuoteVirtual: 357.1456185
      BaseReal: 465.1137365
      QuoteReal: 7674.376652
      IndexPipRange: 5 
      MaxPip: 179999 
      MinPip: 150000 
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0
    User:
      Id: 1
      TokenId: 1000002
      Liquidity: 944.6504644
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0
      BaseVirtual: 9.9
      QuoteVirtual: 178.5728093
      BalanceBase: 9980.00000
      BalanceQuote: 9642.85438
- S3: OpenLimit
  Action:
    Id: 2
    Asset: base
    Side: 1
    Quantity: 123
    Price: 190000
  Expect:
    PendingOrder:
      OrderId: 1
      Price: 190000
      Size : 121.77
      Side: 1
- S4: OpenMarket
  Action:
    Id: 3
    asset: base
    Side: 0
    Quantity: 19.8
  Expect:
    Pool: 
      Liquidity: 1889.300929
      BaseVirtual: 0
      QuoteVirtual: 698.3716919
      BaseReal: 445.3137365
      QuoteReal: 8015.602725
      IndexPipRange: 5
      MaxPip: 179999 
      MinPip: 150000 
      FeeGrowthBase: 0.000188641203
      FeeGrowthQuote: 0
    User:
      Id: 3
      BalanceBase: 10019.01394
      BalanceQuote: 9658.77393
- S5: OpenMarket
  Action:
    Id: 3
    asset: base
    Side: 0
    Quantity: 120
  Expect:
    User:
      Id: 3
      BalanceBase: 10134.24994
      BalanceQuote: 7378.77393
- S6: AddLiquidity
  Action:
    Id: 1
    IndexPipRange: 6
    Asset: base
    AmountVirtual: 10
  Expect:
    Pool:
      Liquidity: 884.1398125
      BaseVirtual: 9.9
      QuoteVirtual: 102.788553
      BaseReal: 202.8355839
      QuoteReal: 3853.876094
      IndexPipRange: 6 
      MaxPip: 209999 
      MinPip: 180000 
      FeeGrowthBase: 0
      FeeGrowthQuote: 0
    User:
      Id: 1
      TokenId: 1000003
      Liquidity: 884.1398125
      FeeGrowthBase: 0
      FeeGrowthQuote: 0
      BaseVirtual: 9.9
      QuoteVirtual: 102.788553
      BalanceBase: 9970.00000
      BalanceQuote: 9540.06583
- S7: OpenLimit
  Action:
    Id: 2
    Asset: base
    Side: 1
    Quantity: 123
    Price: 220000
  Expect:
    PendingOrder:
      OrderId: 1
      Price: 220000
      Size : 121.77
      Side: 1
- S7.1: CancelLimitOrder
  Action:
    Id: 2
    Price: 190000
    OrderId: 0
- S8: OpenMarket
  Action:
    Id: 3
    asset: base
    Side: 0
    Quantity: 9.9
  Expect:
    Pool: 
      Liquidity: 884.1398125
      BaseVirtual: 0
      QuoteVirtual: 300.5404273
      BaseReal: 192.9355839
      QuoteReal: 4051.627969
      IndexPipRange: 6
      MaxPip: 209999 
      MinPip: 180000 
      FeeGrowthBase: 0.0002015518332
      FeeGrowthQuote: 0
    User:
      Id: 3
      BalanceBase: 10143.75691
      BalanceQuote: 7181.02205
- S9: AddLiquidity
  Action:
    Id: 1
    IndexPipRange: 6
    Asset: quote
    AmountVirtual: 100
  Expect:
    Pool:
      Liquidity: 1178.323134
      BaseVirtual: 0
      QuoteVirtual: 400.5404273
      BaseReal: 257.1318006
      QuoteReal: 5399.742099
      IndexPipRange: 6 
      MaxPip: 209999 
      MinPip: 180000 
      FeeGrowthBase: 0.0002015518332
      FeeGrowthQuote: 0
    User:
      Id: 1
      TokenId: 1000004
      Liquidity: 294.18332181632
      FeeGrowthBase: 0.0002015518332
      FeeGrowthQuote: 0
      BaseVirtual: 0
      QuoteVirtual: 100.0000000000
      BalanceBase: 9970.00000
      BalanceQuote: 9440.06583
- S10: OpenMarket
  Action:
    Id: 3
    asset: base
    Side: 0
    Quantity: 120
  Expect:
    User:
      Id: 3
      BalanceBase: 10258.99291
      BalanceQuote: 4541.02205
- S10.1: CancelLimitOrder
  Action:
    Id: 2
    Price: 220000
    OrderId: 1
- S11: AddLiquidity
  Action:
    Id: 1
    IndexPipRange: 7
    Asset: base
    AmountVirtual: 10
  Expect:
    Pool:
      Liquidity: 1090.771364
      BaseVirtual: 9.9
      QuoteVirtual: 117.6288546
      BaseReal: 232.5532361
      QuoteReal: 5116.171194
      IndexPipRange: 7 
      MaxPip: 239999 
      MinPip: 210000 
      FeeGrowthBase: 0
      FeeGrowthQuote: 0
    User:
      Id: 1
      TokenId: 1000005
      Liquidity: 1090.771364
      FeeGrowthBase: 0
      FeeGrowthQuote: 0
      BaseVirtual: 9.9
      QuoteVirtual: 117.6288546
      BalanceBase: 9960.00000
      BalanceQuote: 9322.43697
- S12: AddLiquidity
  Action:
    Id: 1
    IndexPipRange: 7
    Asset: base
    AmountVirtual: 10
  Expect:
    Pool:
      Liquidity: 2181.542727
      BaseVirtual: 19.8
      QuoteVirtual: 235.2577092
      BaseReal: 465.1064722
      QuoteReal: 10232.34239
      IndexPipRange: 7 
      MaxPip: 239999 
      MinPip: 210000 
      FeeGrowthBase: 0
      FeeGrowthQuote: 0
    User:
      Id: 1
      TokenId: 1000006
      Liquidity: 1090.771364
      FeeGrowthBase: 0
      FeeGrowthQuote: 0
      BaseVirtual: 9.9
      QuoteVirtual: 117.6288546
      BalanceBase: 9950.00000
      BalanceQuote: 9204.80812
- S13: OpenMarket
  Action:
    Id: 2
    asset: base
    Side: 1
    Quantity: 23.5006571
  Expect:
    Pool: 
      Liquidity: 1178.323134
      BaseVirtual: 12.32047134
      QuoteVirtual: 153.641905
      BaseReal: 269.4522719
      QuoteReal: 5152.843577
      IndexPipRange: 6
      MaxPip: 209999 
      MinPip: 180000 
      FeeGrowthBase: 0.0002015518332
      FeeGrowthQuote: 0.003771608374
    User:
      Id: 2
      BalanceBase: 9734.00394
      BalanceQuote: 15240.09154
- S14: RemoveLiquidity
  Action:
    Id: 1
    TokenId: 1000005
  Expect:
    Pool:
      Liquidity: 2181.542727
      BaseVirtual: 15.37258959
      QuoteVirtual: 0
      BaseReal: 238.0258257
      QuoteReal: 4998.54234
      IndexPipRange: 7
      MaxPip: 239999 
      MinPip: 210000
    User:
      Id: 1
      BalanceBase: 9965.21886
      BalanceQuote: 9206.97526
- S15: OpenMarket
  Action:
    Id: 2
    asset: base
    Side: 1
    Quantity: 21.40424189
  Expect:
    Pool: 
      Liquidity: 1889.300929
      BaseVirtual: 12.90904518
      QuoteVirtual: 472.5562548
      BaseReal: 458.2227817
      QuoteReal: 7789.787288
      IndexPipRange: 5
      MaxPip: 179999 
      MinPip: 150000 
      FeeGrowthBase: 0.000188641203
      FeeGrowthQuote: 0.002151418975
    User:
      Id: 2
      BalanceBase: 9712.59970
      BalanceQuote: 15608.16517
- S16: AddLiquidity
  Action:
    Id: 1
    IndexPipRange: 7
    Asset: base
    AmountVirtual: 10
  Expect:
    Pool:
      Liquidity: 1793.2318327988
      BaseVirtual: 25.27258959
      QuoteVirtual: 0
      BaseReal: 391.3152673
      QuoteReal: 8217.620612
      IndexPipRange: 7 
      MaxPip: 239999 
      MinPip: 210000 
      FeeGrowthBase: 0
      FeeGrowthQuote: 0.001941121168
    User:
      Id: 1
      TokenId: 1000007
      Liquidity: 702.4604691983
      FeeGrowthBase: 0
      FeeGrowthQuote: 0.001941121168
      BaseVirtual: 25.5278682777
      QuoteVirtual: 0
      BalanceBase: 9955.21886
      BalanceQuote: 9206.97526
- S17: RemoveLiquidity
  Action:
    Id: 1
    TokenId: 1000006
  Expect:
    Pool:
      Liquidity: 702.4604691983
      BaseVirtual: 9.9
      QuoteVirtual: 0
      BaseReal: 153.2894416
      QuoteReal: 3219.078273
      IndexPipRange: 7
      MaxPip: 239999 
      MinPip: 210000
    User:
      Id: 1
      BalanceBase: 9970.43773
      BalanceQuote: 9209.14241
- S18: AddLiquidity
  Action:
    Id: 1
    IndexPipRange: 6
    Asset: base
    AmountVirtual: 10
  Expect:
    Pool:
      Liquidity: 1744.5599565519
      BaseVirtual: 30.50162563
      QuoteVirtual: 0
      BaseReal: 411.1967252
      QuoteReal: 7401.541053
      IndexPipRange: 6 
      MaxPip: 209999 
      MinPip: 180000 
      FeeGrowthBase: 0.0002015518332
      FeeGrowthQuote: 0.006118633745
    User:
      Id: 1
      TokenId: 1000008
      Liquidity: 566.2368222792
      FeeGrowthBase: 0.0002015518332
      FeeGrowthQuote: 0.006118633745
      BaseVirtual: 9.9
      QuoteVirtual: 0
      BalanceBase: 9960.43773
      BalanceQuote: 9209.04276
- S19: RemoveLiquidity
  Action:
    Id: 1
    TokenId: 1000002
  Expect:
    Pool:
      Liquidity: 944.6504644
      BaseVirtual: 6.454522589
      QuoteVirtual: 236.2781274
      BaseReal: 229.1113908
      QuoteReal: 3894.893644
      IndexPipRange: 5
      MaxPip: 179999 
      MinPip: 150000
    User:
      Id: 1
      BalanceBase: 9967.00412
      BalanceQuote: 9447.35322
- S20: RemoveLiquidity
  Action:
    Id: 1
    TokenId: 1000001
  Expect:
    User:
      Id: 1
      BalanceBase: 9973.57052
      BalanceQuote: 9685.66369
- S21: RemoveLiquidity
  Action:
    Id: 1
    TokenId: 1000003
  Expect:
    Pool:
      Liquidity: 860.4201440955
      BaseVirtual: 15.04345725
      QuoteVirtual: 0
      BaseReal: 202.8029729
      QuoteReal: 3650.453511
      IndexPipRange: 6
      MaxPip: 209999 
      MinPip: 180000
    User:
      Id: 1
      BalanceBase: 9989.05052
      BalanceQuote: 9691.07342
- S22: OpenMarket
  Action:
    Id: 3
    asset: base
    Side: 0
    Quantity: 5.983652848
  Expect:
    Pool: 
      Liquidity: 860.4201440955
      BaseVirtual: 9.059804397
      QuoteVirtual: 110.9801952
      BaseReal: 196.81932
      QuoteReal: 3761.433707
      IndexPipRange: 6
      MaxPip: 209999 
      MinPip: 180000 
      FeeGrowthBase: 0.0003267299244
      FeeGrowthQuote: 0.006118633745
    User:
      Id: 3
      BalanceBase: 10264.79705
      BalanceQuote: 4430.04186
- S23: RemoveLiquidity
  Action:
    Id: 1
    TokenId: 1000004
  Expect:
    Pool:
      Liquidity: 566.2368222792
      BaseVirtual: 5.962197523
      QuoteVirtual: 73.03533453
      BaseReal: 129.5254965
      QuoteReal: 2475.374715
      IndexPipRange: 6
      MaxPip: 209999 
      MinPip: 180000
    User:
      Id: 1
      BalanceBase: 9992.15361
      BalanceQuote: 9730.81828
- S24: RemoveLiquidity
  Action:
    Id: 1
    TokenId: 1000008
  Expect:
    User:
      Id: 1
      BalanceBase: 9998.18669
      BalanceQuote: 9803.85361`
        )
    })
})