import {deployAndCreateRouterHelper, TestLiquidity} from "../../test-liquidity";

describe("LiquidityActionAddRemoveCase11-15", async function(){
    let testHelper: TestLiquidity

    beforeEach(async () => {
        testHelper = await deployAndCreateRouterHelper(10_000, false)
    })

    it ("Case #11", async () => {
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
      Liquidity: 954.1923883101
      FeeGrowthBase: 0
      FeeGrowthQuote: 0
      BaseVirtual: 10.00000
      QuoteVirtual: 180.37658
      BalanceBase: 9990.00000
      BalanceQuote: 9819.62342
- S2: AddLiquidity
  Action:
    Id: 2
    IndexPipRange: 5
    Asset: base
    AmountVirtual: 55
  Expect:
    Pool:
      K: 38467911.5626548000
      Liquidity: 6202.2505240158
      BaseVirtual: 65
      QuoteVirtual: 1172.4477376195
      BaseReal: 1526.8885288569
      QuoteReal: 25193.6607261391
      IndexPipRange: 5
      MaxPip: 179999
      MinPip: 150000
      FeeGrowthBase: 0  
      FeeGrowthQuote: 0
    User:
      Id: 2
      TokenId: 1000002
      Liquidity: 5248.0581357057
      FeeGrowthBase: 0
      FeeGrowthQuote: 0
      BaseVirtual: 55.00000
      QuoteVirtual: 992.07116
      BalanceBase: 9945.00000
      BalanceQuote: 9007.92884
- S3: OpenMarket
  Action:
    id: 2
    asset: base
    Side: 1
    Quantity: 74.52567
  Expect:
    Pool:
      Liquidity: 6202.2505240158
      BaseVirtual: 139.5256703777
      QuoteVirtual: 0
      BaseReal: 1601.4141992346
      QuoteReal: 24021.2129885196
      IndexPipRange: 5
      MaxPip: 179999
      MinPip: 150000
      FeeGrowthBase: 0  
      FeeGrowthQuote: 0
    User:
      Id: 2
      BalanceBase: 9870.47433
      BalanceQuote: 10180.37658
- S4: RemoveLiquidity
  Action:
    Id: 1
    TokenId: 1000001
  Expect:
    Pool:
      Liquidity: 5248.0581357057
      BaseVirtual: 0
      QuoteVirtual: 0
      BaseReal: 1355.0427839678
      QuoteReal: 20325.6417595166
      IndexPipRange: 5
      MaxPip: 179999
      MinPip: 150000
    User:
      Id: 1
      BalanceBase: 10011.46549
      BalanceQuote: 9819.62342
- S5: RemoveLiquidity
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
      BalanceBase: 9988.53451
      BalanceQuote: 10180.37658
`)
    })
    it ("Case #12", async () => {
        return testHelper.process(`
- S0: SetCurrentPrice
  Action: 
    Price: 165000
- S1: AddLiquidity
  Action:
    Id: 1
    IndexPipRange: 5
    Asset: base
    AmountVirtual: 100
  Expect:
    Pool:
      K: 91048311.3908990000
      Liquidity: 9541.9238831013
      BaseVirtual: 100
      QuoteVirtual: 1803.76575
      BaseReal: 2349.059275164
      QuoteReal: 38759.478040214
      IndexPipRange: 5
      MaxPip: 179999
      MinPip: 150000
      FeeGrowthBase: 0  
      FeeGrowthQuote: 0
    User:
      Id: 1
      TokenId: 1000001
      Liquidity: 9541.9238831013
      FeeGrowthBase: 0
      FeeGrowthQuote: 0
      BaseVirtual: 100.00000
      QuoteVirtual: 1803.76575
      BalanceBase: 9900.00000
      BalanceQuote: 8196.23425
- S2: AddLiquidity
  Action:
    Id: 2
    IndexPipRange: 4
    Asset: quote
    AmountVirtual: 200
  Expect:
    Pool:
      K: 239272.06803703000
      Liquidity: 489.15444190668
      BaseVirtual: 0
      QuoteVirtual: 200
      BaseReal: 0
      QuoteReal: 1894.48069226072
      IndexPipRange: 4
      MaxPip: 149999
      MinPip: 120000
      FeeGrowthBase: 0  
      FeeGrowthQuote: 0
    User:
      Id: 2
      TokenId: 1000002
      Liquidity: 489.15444190668
      FeeGrowthBase: 0
      FeeGrowthQuote: 0
      BaseVirtual: 0
      QuoteVirtual: 200
      BalanceBase: 10000.00000
      BalanceQuote: 9800.00000
- S3: AddLiquidity
  Action:
    Id: 1
    IndexPipRange: 5
    Asset: base
    AmountVirtual: 200
  Expect:
    Pool:
      K: 819434802.5180910000
      Liquidity: 28625.7716493039
      BaseVirtual: 300
      QuoteVirtual: 5411.2972505517
      BaseReal: 7047.1778254935
      QuoteReal: 116278.4341206420
      IndexPipRange: 5
      MaxPip: 179999
      MinPip: 150000
      FeeGrowthBase: 0  
      FeeGrowthQuote: 0
    User:
      Id: 1
      TokenId: 1000003
      Liquidity: 19083.8477662026
      FeeGrowthBase: 0
      FeeGrowthQuote: 0
      BaseVirtual: 200.00000
      QuoteVirtual: 3607.53150
      BalanceBase: 9700.00000
      BalanceQuote: 4588.70275
- S4: RemoveLiquidity
  Action:
    Id: 1
    TokenId: 1000001
  Expect:
    Pool:
      Liquidity: 19083.8477662026
      BaseVirtual: 0
      QuoteVirtual: 0
      BaseReal: 4698.1185503290
      QuoteReal: 77518.9560804281
      IndexPipRange: 5
      MaxPip: 179999
      MinPip: 150000
    User:
      Id: 1
      BalanceBase: 9800.00000
      BalanceQuote: 6392.46850
- S5: OpenMarket
  Action:
    id: 2
    asset: base
    Side: 1
    Quantity: 240
  Expect:
    Pool:
      Liquidity: 489.15444190668
      BaseVirtual: 10.6902449916
      QuoteVirtual: 52.1607976591
      BaseReal: 136.9897998060
      QuoteReal: 1746.6414899198
      IndexPipRange: 4
      MaxPip: 149999
      MinPip: 120000
      FeeGrowthBase: 0  
      FeeGrowthQuote: 0
    User:
      Id: 2
      BalanceBase: 9760.00000
      BalanceQuote: 13555.37070
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
      IndexPipRange: 4
      MaxPip: 149999
      MinPip: 120000
    User:
      Id: 2
      BalanceBase: 9770.69024
      BalanceQuote: 13607.53150
- S7: AddLiquidity
  Action:
    Id: 4
    IndexPipRange: 5
    Asset: base
    AmountVirtual: 199
  Expect:
    Pool:
      K: 780077907.2281020000
      Liquidity: 27929.8748158330
      BaseVirtual: 628.3097550084
      QuoteVirtual: 0
      BaseReal: 7211.4626682253
      QuoteReal: 108171.9400233790
      IndexPipRange: 5
      MaxPip: 179999
      MinPip: 150000
      FeeGrowthBase: 0  
      FeeGrowthQuote: 0
    User:
      Id: 4
      TokenId: 1000004
      Liquidity: 8846.02704963039
      FeeGrowthBase: 0
      FeeGrowthQuote: 0
      BaseVirtual: 199.00000
      QuoteVirtual: 0
      BalanceBase: 9801.00000
      BalanceQuote: 10000.00000
- S8: AddLiquidity
  Action:
    Id: 1
    IndexPipRange: 6
    Asset: base
    AmountVirtual: 100
  Expect:
    Pool:
      K: 32713410.7646969000
      Liquidity: 5719.5638614056
      BaseVirtual: 100
      QuoteVirtual: 0
      BaseReal: 1348.11413060980
      QuoteReal: 0
      IndexPipRange: 6
      MaxPip: 209999
      MinPip: 180000
      FeeGrowthBase: 0  
      FeeGrowthQuote: 0
    User:
      Id: 1
      TokenId: 1000005
      Liquidity: 5719.56386140560
      FeeGrowthBase: 0
      FeeGrowthQuote: 0
      BaseVirtual: 100.00000
      QuoteVirtual: 0
      BalanceBase: 9700.00000
      BalanceQuote: 6392.46850
- S9: OpenLimit
  Action:
    Id: 2
    Asset: base
    Side: 1
    Quantity: 190
    Price: 190000
  Expect:
    PendingOrder:
      OrderId: 1
      Price: 190000
      Size : 190
      Side: 1
- S10: OpenLimit
  Action:
    Id: 2
    Asset: base
    Side: 0
    Quantity: 120
    Price: 160000
  Expect:
    PendingOrder:
      OrderId: 1
      Price: 160000
      Size : 120
      Side: 0
- S11: OpenMarket
  Action:
    id: 2
    asset: base
    Side: 0
    Quantity: 228.99396
  Expect:
    Pool:
      Liquidity: 27929.8748158330
      BaseVirtual: 399.3157907414
      QuoteVirtual: 3547.5592399528
      BaseReal: 6982.4687039583
      QuoteReal: 111719.4992633320
      IndexPipRange: 5
      MaxPip: 179999
      MinPip: 150000
      FeeGrowthBase: 0  
      FeeGrowthQuote: 0
    User:
      Id: 2
      BalanceBase: 9809.68421
      BalanceQuote: 8139.97226
- S12: OpenMarket
  Action:
    id: 2
    asset: base
    Side: 1
    Quantity: 120
  Expect:
    Pool:
      Liquidity: 27929.8748158330
      BaseVirtual: 399.3157907414
      QuoteVirtual: 3547.5592399528
      BaseReal: 6982.4687039583
      QuoteReal: 111719.4992633320
      IndexPipRange: 5
      MaxPip: 179999
      MinPip: 150000
      FeeGrowthBase: 0  
      FeeGrowthQuote: 0
    User:
      Id: 2
      BalanceBase: 9689.68421
      BalanceQuote: 10059.97226
- S13: RemoveLiquidity
  Action:
    Id: 1
    TokenId: 1000003
  Expect:
    Pool:
      Liquidity: 8846.0270496304
      BaseVirtual: 0
      QuoteVirtual: 0
      BaseReal: 2211.5067624076
      QuoteReal: 35384.1081985215
      IndexPipRange: 5
      MaxPip: 179999
      MinPip: 150000
    User:
      Id: 1
      BalanceBase: 9972.84339
      BalanceQuote: 8816.43498
- S14: RemoveLiquidity
  Action:
    Id: 4
    TokenId: 1000004
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
      Id: 4
      BalanceBase: 9927.47240
      BalanceQuote: 11123.59276
- S15: RemoveLiquidity
  Action:
    Id: 1
    TokenId: 1000005
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
      Id: 1
      BalanceBase: 10072.84339
      BalanceQuote: 8816.43498
`)
    })
    it ("Case #13", async () => {
        return testHelper.process(`
- S0: SetCurrentPrice
  Action:
    Price: 165000
- S1: AddLiquidity
  Action:
    Id: 1
    IndexPipRange: 5
    Asset: quote
    AmountVirtual: 180.3765750184
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
      Liquidity: 954.1923883101
      FeeGrowthBase: 0
      FeeGrowthQuote: 0
      BaseVirtual: 10
      QuoteVirtual: 180.3765750184
      BalanceBase: 9990.00000
      BalanceQuote: 9819.62342
- S2: AddLiquidity
  Action:
    Id: 2
    IndexPipRange: 4
    Asset: quote
    AmountVirtual: 35
  Expect:
    Pool:
      K: 7327.7070836341
      Liquidity: 85.60202733367
      BaseVirtual: 0
      QuoteVirtual: 35
      BaseReal: 0
      QuoteReal: 331.53412114563
      IndexPipRange: 4
      MaxPip: 149999
      MinPip: 120000
      FeeGrowthBase: 0
      FeeGrowthQuote: 0
    User:
      Id: 2
      TokenId: 1000002
      Liquidity: 85.60202733367
      FeeGrowthBase: 0
      FeeGrowthQuote: 0
      BaseVirtual: 0
      QuoteVirtual: 35
      BalanceBase: 10000.00000
      BalanceQuote: 9965.00000
- S3: AddLiquidity
  Action:
    Id: 3
    IndexPipRange: 5
    Asset: base
    AmountVirtual: 55
  Expect:
    Pool:
      K: 38467911.5626548000
      Liquidity: 6202.2505240158
      BaseVirtual: 65
      QuoteVirtual: 1172.4477376195
      BaseReal: 1526.8885288569
      QuoteReal: 25193.6607261391
      IndexPipRange: 5
      MaxPip: 179999
      MinPip: 150000
      FeeGrowthBase: 0
      FeeGrowthQuote: 0
    User:
      Id: 3
      TokenId: 1000003
      Liquidity: 5248.0581357057
      FeeGrowthBase: 0
      FeeGrowthQuote: 0
      BaseVirtual: 55
      QuoteVirtual: 992.0711626011
      BalanceBase: 9945.00000
      BalanceQuote: 9007.92884
- S4: OpenMarket
  Action:
    id: 4
    asset: base
    Side: 1
    Quantity: 23.67410
  Expect:
    Pool:
      Liquidity: 6202.2505240158
      BaseVirtual: 88.6741021470
      QuoteVirtual: 787.7891075438
      BaseReal: 1550.5626310040
      QuoteReal: 24809.0020960634
      IndexPipRange: 5
      MaxPip: 179999
      MinPip: 150000
      FeeGrowthBase: 0
      FeeGrowthQuote: 0
    User:
      Id: 4
      BalanceBase: 9976.32590
      BalanceQuote: 10384.65863
- S5: OpenMarket
  Action:
    id: 5
    asset: base
    Side: 1
    Quantity: 50.8515682307
  Expect:
    Pool:
      Liquidity: 6202.2505240158
      BaseVirtual: 139.5256703777
      QuoteVirtual: 0
      BaseReal: 1601.4141992346
      QuoteReal: 24021.2129885196
      IndexPipRange: 5
      MaxPip: 179999
      MinPip: 150000
      FeeGrowthBase: 0
      FeeGrowthQuote: 0
    User:
      Id: 5
      BalanceBase: 9949.14843
      BalanceQuote: 10787.78911
- S6: AddLiquidity
  Action:
    Id: 6
    IndexPipRange: 5
    Asset: base
    AmountVirtual: 20
  Expect:
    Pool:
      K: 50286513.97221980000
      Liquidity: 7091.2984687023
      BaseVirtual: 159.5256703777
      QuoteVirtual: 0
      BaseReal: 1830.9653914847
      QuoteReal: 27464.4808722702
      IndexPipRange: 5
      MaxPip: 179999
      MinPip: 150000
      FeeGrowthBase: 0
      FeeGrowthQuote: 0
    User:
      Id: 6
      TokenId: 1000004
      Liquidity: 889.0479446865
      FeeGrowthBase: 0
      FeeGrowthQuote: 0
      BaseVirtual: 20
      QuoteVirtual: 0
      BalanceBase: 9980.00000
      BalanceQuote: 10000.00000
- S7: AddLiquidity
  Action:
    Id: 2
    IndexPipRange: 4
    Asset: quote
    AmountVirtual: 20
  Expect:
    Pool:
      K: 18094.9501453004
      Liquidity: 134.51747152434
      BaseVirtual: 0
      QuoteVirtual: 55
      BaseReal: 0
      QuoteReal: 520.9821903717
      IndexPipRange: 4
      MaxPip: 149999
      MinPip: 120000
      FeeGrowthBase: 0
      FeeGrowthQuote: 0
    User:
      Id: 2
      TokenId: 1000005
      Liquidity: 48.91544419067
      FeeGrowthBase: 0
      FeeGrowthQuote: 0
      BaseVirtual: 0
      QuoteVirtual: 55
      BalanceBase: 10000.00000
      BalanceQuote: 9945.00000
- S8: OpenMarket
  Action:
    id: 4
    asset: base
    Side: 0
    Quantity: 29.77378
  Expect:
    Pool:
      Liquidity: 7091.2984687023
      BaseVirtual: 129.7518911359
      QuoteVirtual: 453.9891174947
      BaseReal: 1801.1916122429
      QuoteReal: 27918.4699897650
      IndexPipRange: 5
      MaxPip: 179999
      MinPip: 150000
      FeeGrowthBase: 0
      FeeGrowthQuote: 0
    User:
      Id: 4
      BalanceBase: 10006.09968
      BalanceQuote: 9930.66951
- S9: OpenMarket
  Action:
    id: 5
    asset: base
    Side: 1
    Quantity: 30.99271
  Expect:
    Pool:
      Liquidity: 134.51747152434
      BaseVirtual: 1.2189289245
      QuoteVirtual: 37.3361006075
      BaseReal: 35.9513064985
      QuoteReal: 503.3182909792
      IndexPipRange: 4
      MaxPip: 149999
      MinPip: 120000
      FeeGrowthBase: 0
      FeeGrowthQuote: 0
    User:
      Id: 5
      BalanceBase: 9918.15572
      BalanceQuote: 11259.44212
- S10: RemoveLiquidity
  Action:
    Id: 1
    TokenId: 1000001
  Expect:
    Pool:
      Liquidity: 6137.1060803922
      BaseVirtual: 0
      QuoteVirtual: 0
      BaseReal: 1584.5939762178
      QuoteReal: 23768.9096432672
      IndexPipRange: 5
      MaxPip: 179999
      MinPip: 150000
    User:
      Id: 1
      BalanceBase: 10011.46549
      BalanceQuote: 9819.62342
- S11: RemoveLiquidity
  Action:
    Id: 2
    TokenId: 1000002
  Expect:
    Pool:
      Liquidity: 48.9154441907
      BaseVirtual: 0
      QuoteVirtual: 0
      BaseReal: 13.0732023631
      QuoteReal: 183.0248330833
      IndexPipRange: 4
      MaxPip: 149999
      MinPip: 120000
    User:
      Id: 2
      BalanceBase: 10000.77568
      BalanceQuote: 9968.75934
- S12: OpenLimit
  Action:
    Id: 3
    Asset: base
    Side: 0
    Quantity: 143
    Price: 135000
  Expect:
    PendingOrder:
      OrderId: 1
      Price: 135000
      Size : 143
      Side: 0
- S13: OpenMarket
  Action:
    id: 4
    asset: base
    Side: 0
    Quantity: 0.44325
  Expect:
    Pool:
      Liquidity: 48.9154441907
      BaseVirtual: 0
      QuoteVirtual: 20
      BaseReal: 12.6299554814
      QuoteReal: 189.4480692261
      IndexPipRange: 4
      MaxPip: 149999
      MinPip: 120000
      FeeGrowthBase: 0
      FeeGrowthQuote: 0
    User:
      Id: 4
      BalanceBase: 10006.54292
      BalanceQuote: 9924.24628
- S14: RemoveLiquidity
  Action:
    Id: 3
    TokenId: 1000003
  Expect:
    Pool:
      Liquidity: 889.0479446865
      BaseVirtual: 0
      QuoteVirtual: 0
      BaseReal: 229.5511922500
      QuoteReal: 3443.2678837506
      IndexPipRange: 5
      MaxPip: 179999
      MinPip: 150000
    User:
      Id: 3
      BalanceBase: 10063.06018
      BalanceQuote: 7077.42884
- S15: RemoveLiquidity
  Action:
    Id: 6
    TokenId: 1000004
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
      Id: 6
      BalanceBase: 10000.00000
      BalanceQuote: 10000.00000
- S16: RemoveLiquidity
  Action:
    Id: 2
    TokenId: 1000005
  Expect:
    Pool:
      Liquidity: 0
      BaseVirtual: 0
      QuoteVirtual: 0
      BaseReal: 0
      QuoteReal: 0
      IndexPipRange: 4
      MaxPip: 149999
      MinPip: 120000
    User:
      Id: 2
      BalanceBase: 10000.77568
      BalanceQuote: 9988.75934
`)
    })
    it ("Case #14   ", async () => {
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
      K: 73186.17028902370
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
      QuoteVirtual: 100
      BalanceBase: 10000.00000
      BalanceQuote: 9900.00000
- S2: AddLiquidity
  Action:
    Id: 2
    IndexPipRange: 5
    Asset: quote
    AmountVirtual: 200.00000000000
  Expect:
    Pool:
      K: 73186.17028902370
      Liquidity: 811.58827776232
      BaseVirtual: 0
      QuoteVirtual: 200
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
      QuoteVirtual: 100
      BalanceBase: 10000.00000
      BalanceQuote: 9800.00000
- S3: RemoveLiquidity
  Action:
    Id: 1
    TokenId: 1000001
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
      Id: 1
      BalanceBase: 10000.77568
      BalanceQuote: 10000.00000
- S4: AddLiquidity
  Action:
    Id: 2
    IndexPipRange: 6
    Asset: base
    AmountVirtual: 55
  Expect:
    Pool:
      K: 73186.17028902370
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
      BaseVirtual: 0
      QuoteVirtual: 100
      BalanceBase: 9945.00000
      BalanceQuote: 9800.00000
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
    User:
      Id: 3
      BalanceBase: 10004.08523
      BalanceQuote: 9926.05855
- S6: OpenMarket
  Action:
    Id: 5
    asset: base
    Side: 1
    Quantity: 5.89388
  Expect:
    Pool: 
      Liquidity: 541.0588518415
      BaseVirtual: 1.8086551767
      QuoteVirtual: 167.8996441908
      BaseReal: 129.3378038109
      QuoteReal: 2263.4115666912
      IndexPipRange: 5
      MaxPip: 179999 
      MinPip: 150000 
    User:
      Id: 5
      BalanceBase: 9994.10612
      BalanceQuote: 10106.04181
- S7: RemoveLiquidity
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
      BalanceBase: 9946.80866
      BalanceQuote: 9967.89964
- S8: RemoveLiquidity
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
      BalanceBase: 10001.80866
      BalanceQuote: 9967.89964
`)
    })
})
