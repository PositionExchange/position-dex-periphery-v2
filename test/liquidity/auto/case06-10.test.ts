import {deployAndCreateRouterHelper, TestLiquidity} from "../test-liquidity";

describe("Integration-Case01", async function() {
    let testHelper: TestLiquidity

    beforeEach(async () => {
        testHelper = await deployAndCreateRouterHelper()
    })

    it("Case #6", async () => {
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
      Liquidity: 954.1923883101
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0
      BaseVirtual: 10
      QuoteVirtual: 180.3765750184
      BalanceBase: 9990.00000000000
      BalanceQuote: 9819.62342
- S2: AddLiquidity
  Action:
    Id: 1
    IndexPipRange: 5
    Asset: base
    AmountVirtual: 10
  Expect:
    Pool:
      Liquidity: 1908.3847766203
      BaseVirtual: 20
      QuoteVirtual: 360.7531500368
      BaseReal: 469.8118550329
      QuoteReal: 7751.8956080428
      IndexPipRange: 5 
      MaxPip: 179999 
      MinPip: 150000 
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0
    User:
      Id: 1
      TokenId: 1000002
      Liquidity: 954.1923883101
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0
      BaseVirtual: 10
      QuoteVirtual: 180.3765750184
      BalanceBase: 9980.00000
      BalanceQuote: 9639.24685
- S3: OpenLimit
  Action:
    Id: 2
    Asset: base
    Side: 1
    Quantity: 120.00001
    Price: 190000
  Expect:
    PendingOrder:
      OrderId: 1
      Price: 190000
      Size : 120.00001
      Side: 1
- S4: OpenMarket
  Action:
    Id: 3
    asset: base
    Side: 0
    Quantity: 20
  Expect:
    Pool: 
      Liquidity: 1908.3847766203
      BaseVirtual: 0
      QuoteVirtual: 705.4259514006
      BaseReal: 449.8118550329
      QuoteReal: 8096.5684094067
      IndexPipRange: 5
      MaxPip: 179999 
      MinPip: 150000 
      FeeGrowthBase: 0.000188641203
      FeeGrowthQuote: 0
    User:
      Id: 3
      BalanceBase: 10019.40000
      BalanceQuote: 9655.32720
- S5: OpenMarket
  Action:
    Id: 3
    asset: base
    Side: 0
    Quantity: 120
  Expect:
    Pool: 
      Liquidity: 1908.3847766203
      BaseVirtual: 0
      QuoteVirtual: 705.4259514006
      BaseReal: 449.8118550329
      QuoteReal: 8096.5684094067
      IndexPipRange: 5
      MaxPip: 179999 
      MinPip: 150000 
      FeeGrowthBase: 0.000188641203
      FeeGrowthQuote: 0
    User:
      Id: 3
      BalanceBase: 10135.80000
      BalanceQuote: 7375.32720
- S6: AddLiquidity
  Action:
    Id: 1
    IndexPipRange: 6
    Asset: base
    AmountVirtual: 10
  Expect:
    Pool:
      Liquidity: 893.0705176328
      BaseVirtual: 10
      QuoteVirtual: 103.8268212413
      BaseReal: 204.8844282009
      QuoteReal: 3892.8041358168
      IndexPipRange: 6 
      MaxPip: 209999 
      MinPip: 180000 
      FeeGrowthBase: 0
      FeeGrowthQuote: 0
    User:
      Id: 1
      TokenId: 1000003
      Liquidity: 893.0705176328
      FeeGrowthBase: 0
      FeeGrowthQuote: 0
      BaseVirtual: 10
      QuoteVirtual: 103.8268212413
      BalanceBase: 9970.00000
      BalanceQuote: 9535.42003
- S7: OpenLimit
  Action:
    Id: 2
    Asset: base
    Side: 1
    Quantity: 120.00065
    Price: 220000
  Expect:
    PendingOrder:
      OrderId: 1
      Price: 220000
      Size : 120.00065
      Side: 1
- S8: OpenMarket
  Action:
    Id: 3
    asset: base
    Side: 0
    Quantity: 10
  Expect:
    Pool: 
      Liquidity: 893.0705176328
      BaseVirtual: 0
      QuoteVirtual: 303.5761892003
      BaseReal: 194.8844282009
      QuoteReal: 4092.5535037758
      IndexPipRange: 6
      MaxPip: 209999 
      MinPip: 180000 
      FeeGrowthBase: 0.0002015518332
      FeeGrowthQuote: 0
    User:
      Id: 3
      BalanceBase: 10146.00000
      BalanceQuote: 7166.07783
- S9: AddLiquidity
  Action:
    Id: 1
    IndexPipRange: 6
    Asset: quote
    AmountVirtual: 100
  Expect:
    Pool:
      Liquidity: 1187.2538394491
      BaseVirtual: 0
      QuoteVirtual: 403.5761892003
      BaseReal: 259.0806448786
      QuoteReal: 5440.6676343856
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
      BalanceQuote: 9435.42003
- S10: OpenMarket
  Action:
    Id: 3
    asset: base
    Side: 0
    Quantity: 120
  Expect:
    User:
      Id: 3
      BalanceBase: 10262.40000
      BalanceQuote: 4527.57783
- S11: AddLiquidity
  Action:
    Id: 1
    IndexPipRange: 7
    Asset: base
    AmountVirtual: 10
  Expect:
    Pool:
      Liquidity: 1101.7892561621
      BaseVirtual: 10
      QuoteVirtual: 118.8170248549
      BaseReal: 234.9022586867
      QuoteReal: 5167.8496911067
      IndexPipRange: 7 
      MaxPip: 239999 
      MinPip: 210000 
      FeeGrowthBase: 0
      FeeGrowthQuote: 0
    User:
      Id: 1
      TokenId: 1000005
      Liquidity: 1101.7892561621
      FeeGrowthBase: 0
      FeeGrowthQuote: 0
      BaseVirtual: 10
      QuoteVirtual: 118.8170248549
      BalanceBase: 9960.00000
      BalanceQuote: 9316.60300
- S12: AddLiquidity
  Action:
    Id: 1
    IndexPipRange: 7
    Asset: base
    AmountVirtual: 10
  Expect:
    Pool:
      Liquidity: 2203.5785123241
      BaseVirtual: 20
      QuoteVirtual: 237.6340497099
      BaseReal: 469.8045173733
      QuoteReal: 10335.6993822134
      IndexPipRange: 7 
      MaxPip: 239999 
      MinPip: 210000 
      FeeGrowthBase: 0
      FeeGrowthQuote: 0
    User:
      Id: 1
      TokenId: 1000006
      Liquidity: 1101.7892561621
      FeeGrowthBase: 0
      FeeGrowthQuote: 0
      BaseVirtual: 10
      QuoteVirtual: 118.8170248549
      BalanceBase: 9950.00000
      BalanceQuote: 9197.78598
- S13: OpenMarket
  Action:
    Id: 2
    asset: base
    Side: 1
    Quantity: 23.4695867742
  Expect:
    Pool: 
      Liquidity: 1187.2538394491
      BaseVirtual: 12.4138502188
      QuoteVirtual: 154.8063823600
      BaseReal: 271.4944950974
      QuoteReal: 5191.8978275453
      IndexPipRange: 6
      MaxPip: 209999 
      MinPip: 180000 
      FeeGrowthBase: 0.0002015
      FeeGrowthQuote: 0.003952325006
    User:
      Id: 2
      BalanceBase: 9736.53041
      BalanceQuote: 10488.79834
- S14: RemoveLiquidity
  Action:
    Id: 1
    TokenId: 1000005
  Expect:
    Pool:
      Liquidity: 1101.78925616207
      BaseVirtual: 15.52786827770
      QuoteVirtual: 0
      BaseReal: 240.43012696437
      QuoteReal: 5049.03266625179
      IndexPipRange: 7
      MaxPip: 239999 
      MinPip: 210000
    User:
      Id: 1
      BalanceBase: 9934.47213
      BalanceQuote: 9199.97501
- S15: OpenMarket
  Action:
    Id: 2
    asset: base
    Side: 1
    Quantity: 21.38336
  Expect:
    Pool: 
      Liquidity: 1908.3847766203
      BaseVirtual: 13.0394395745
      QuoteVirtual: 477.3295503201
      BaseReal: 462.8512946074
      QuoteReal: 7868.4720083261
      IndexPipRange: 5
      MaxPip: 179999 
      MinPip: 150000 
      FeeGrowthBase: 0.000188641203
      FeeGrowthQuote: 0.002213785712
    User:
      Id: 3
      BalanceBase: 9715.14706
      BalanceQuote: 10871.24286
- S16: AddLiquidity
  Action:
    Id: 1
    IndexPipRange: 7
    Asset: base
    AmountVirtual: 10
  Expect:
    Pool:
      Liquidity: 1811.3452856554
      BaseVirtual: 25.5278682777
      QuoteVirtual: 0
      BaseReal: 395.2679467246
      QuoteReal: 8300.6268812171
      IndexPipRange: 7 
      MaxPip: 239999 
      MinPip: 210000 
      FeeGrowthBase: 0
      FeeGrowthQuote: 0.001986800857
    User:
      Id: 1
      TokenId: 1000007
      Liquidity: 709.5560294933
      FeeGrowthBase: 0
      FeeGrowthQuote: 0.001986800857
      BaseVirtual: 25.5278682777
      QuoteVirtual: 0
      BalanceBase: 9924.47213
      BalanceQuote: 9199.97501
- S17: RemoveLiquidity
  Action:
    Id: 1
    TokenId: 1000006
  Expect:
    Pool:
      Liquidity: 709.55602949328
      BaseVirtual: 10.00000000000
      QuoteVirtual: 0
      BaseReal: 154.83781976025
      QuoteReal: 3251.59421496526
      IndexPipRange: 7
      MaxPip: 239999 
      MinPip: 210000
    User:
      Id: 1
      BalanceBase: 9940.00000
      BalanceQuote: 9202.16405
- S18: AddLiquidity
  Action:
    Id: 1
    IndexPipRange: 6
    Asset: base
    AmountVirtual: 10
  Expect:
    Pool:
      Liquidity: 1759.2102255897
      BaseVirtual: 30.7577687428
      QuoteVirtual: 0
      BaseReal: 414.6498266824
      QuoteReal: 7463.6968802829
      IndexPipRange: 6 
      MaxPip: 209999 
      MinPip: 180000 
      FeeGrowthBase: 0.0002015518332
      FeeGrowthQuote: 0.006371482183
    User:
      Id: 1
      TokenId: 1000008
      Liquidity: 571.9563861406
      FeeGrowthBase: 0.0002015518332
      FeeGrowthQuote: 0.006371482183
      BaseVirtual: 10
      QuoteVirtual: 0
      BalanceBase: 9950.00000
      BalanceQuote: 9202.16405
- S19: RemoveLiquidity
  Action:
    Id: 1
    TokenId: 1000002
  Expect:
    Pool:
      Liquidity: 954.19238831013
      BaseVirtual: 6.51971978726
      QuoteVirtual: 238.66477516003
      BaseReal: 231.42564730371
      QuoteReal: 3934.23600416305
      IndexPipRange: 5
      MaxPip: 179999 
      MinPip: 150000
    User:
      Id: 1
      BalanceBase: 9956.69972
      BalanceQuote: 9442.94120
- S20: RemoveLiquidity
  Action:
    Id: 1
    TokenId: 1000001
  Expect:
    User:
      Id: 1
      BalanceBase: 9963.39944
      BalanceQuote: 9683.71836
- S21: RemoveLiquidity
  Action:
    Id: 1
    TokenId: 1000004
  Expect:
    Pool:
      Liquidity: 866.13970795687
      BaseVirtual: 15.14345724508
      QuoteVirtual: 0
      BaseReal: 204.15108698375
      QuoteReal: 3674.71956570745
      IndexPipRange: 6
      MaxPip: 209999 
      MinPip: 180000
    User:
      Id: 1
      BalanceBase: 9979.19375
      BalanceQuote: 9689.40854
- S22: OpenMarket
  Action:
    Id: 3
    asset: base
    Side: 1
    Quantity: 6.023429
  Expect:
    Pool: 
      Liquidity: 866.1397079569
      BaseVirtual: 9.1200286142
      QuoteVirtual: 111.7179258396
      BaseReal: 198.1276583528
      QuoteReal: 3786.4374915470
      IndexPipRange: 6
      MaxPip: 209999 
      MinPip: 180000 
      FeeGrowthBase: 0.0003267299244
      FeeGrowthQuote: 0.006371482183
    User:
      Id: 3
      BalanceBase: 10268.24273
      BalanceQuote: 4415.85990
- S23: RemoveLiquidity
  Action:
    Id: 1
    TokenId: 1000004
  Expect:
    Pool:
      Liquidity: 571.95638614056
      BaseVirtual: 6.02242174067
      QuoteVirtual: 73.77306518026
      BaseReal: 130.83383480166
      QuoteReal: 2500.37850027791
      IndexPipRange: 6
      MaxPip: 209999 
      MinPip: 180000
    User:
      Id: 1
      BalanceBase: 9982.32818
      BalanceQuote: 9729.22778
- S24: RemoveLiquidity
  Action:
    Id: 1
    TokenId: 1000008
  Expect:
    User:
      Id: 1
      BalanceBase: 9988.42220
      BalanceQuote: 9803.00085`
        )
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
      Liquidity: 954.1923883101
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
      TokenId: 1
      Liquidity: 944.6504644
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0
      BaseVirtual: 9.9
      QuoteVirtual: 178.5728093
      BalanceBase: 9990.00000
      BalanceQuote: 9821.42719
- S2: AddLiquidity
  Action:
    Id: 2
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
      TokenId: 2
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
    Quantity: 121
    Price: 190000
  Expect:
    PendingOrder:
      OrderId: 1
      Price: 190000
      Size : 121
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
      BalanceBase: 10134.24994
      BalanceQuote: 7378.77393
- S5.1: ClaimAsset
  Action:
    Id: 2
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
      TokenId: 4
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
    Quantity: 121
    Price: 220000
  Expect:
    PendingOrder:
      OrderId: 1
      Price: 220000
      Size : 121
      Side: 1
- S8: OpenMarket
  Action:
    Id: 3
    asset: base
    Side: 0
    Quantity: 10
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
    Asset: base
    AmountVirtual: 10
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
      Id: 2
      TokenId: 4
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
- S10.1: ClaimAsset
  Action:
    Id: 2
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
      TokenId: 5
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
      TokenId: 6
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
      FeeGrowthQuote: 0.003952325006
    User:
      Id: 3
      BalanceBase: 9734.49934
      BalanceQuote: 12689.75696
- S14: RemoveLiquidity
  Action:
    Id: 1
    TokenId: 5
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
      FeeGrowthQuote: 0.002213785712
    User:
      Id: 3
      BalanceBase: 9713.09510
      BalanceQuote: 13064.97051
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
      FeeGrowthQuote: 0.001986800857
    User:
      Id: 1
      TokenId: 7
      Liquidity: 702.4604691983
      FeeGrowthBase: 0
      FeeGrowthQuote: 0.001986800857
      BaseVirtual: 25.5278682777
      QuoteVirtual: 0
      BalanceBase: 9955.21886
      BalanceQuote: 9206.97526
- S17: RemoveLiquidity
  Action:
    Id: 1
    TokenId: 6
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
      FeeGrowthQuote: 0.006371482183
    User:
      Id: 1
      TokenId: 8
      Liquidity: 566.2368222792
      FeeGrowthBase: 0.0002015518332
      FeeGrowthQuote: 0.006371482183
      BaseVirtual: 9.9
      QuoteVirtual: 0
      BalanceBase: 9980.43773
      BalanceQuote: 9209.14241
- S19: RemoveLiquidity
  Action:
    Id: 1
    TokenId: 2
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
      BalanceBase: 9987.00412
      BalanceQuote: 9447.51179
- S20: RemoveLiquidity
  Action:
    Id: 1
    TokenId: 1
  Expect:
    User:
      Id: 1
      BalanceBase: 9993.57052
      BalanceQuote: 9685.88117
- S21: RemoveLiquidity
  Action:
    Id: 1
    TokenId: 4
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
      BalanceBase: 10009.05052
      BalanceQuote: 9691.51445
- S22: OpenMarket
  Action:
    Id: 3
    asset: base
    Side: 1
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
      FeeGrowthQuote: 0.006371482183
    User:
      Id: 3
      BalanceBase: 10264.79705
      BalanceQuote: 4430.04186
- S23: RemoveLiquidity
  Action:
    Id: 1
    TokenId: 4
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
      BalanceBase: 10012.15361
      BalanceQuote: 9731.33370
- S24: RemoveLiquidity
  Action:
    Id: 1
    TokenId: 8
  Expect:
    User:
      Id: 1
      BalanceBase: 10018.12636
      BalanceQuote: 9804.36903`
        )
    })
        
})