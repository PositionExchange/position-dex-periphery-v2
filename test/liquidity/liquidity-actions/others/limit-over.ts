import {deployAndCreateRouterHelper, TestLiquidity} from "../../test-liquidity";

describe("LimitOver", async function(){
    let testHelper: TestLiquidity

    beforeEach(async () => {
        testHelper = await deployAndCreateRouterHelper(10_000, true)
    })


    it ("Case-LimitOver", async () => {
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
    Quantity: 121
    Price: 190000
  Expect:
    PendingOrder:
      OrderId: 1
      Price: 190000
      Size : 121
      Side: 1
- S4: OpenLimit
  Action:
    Id: 3
    Asset: base
    Side: 0
    Quantity: 20
    Price: 190000
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
- S5: OpenLimit
  Action:
    Id: 3
    Asset: base
    Side: 0
    Quantity: 120
    Price: 200000
  Expect:
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
    Quantity: 121
    Price: 220000
  Expect:
    PendingOrder:
      OrderId: 1
      Price: 220000
      Size : 121
      Side: 1
- S7.1: CancelLimitOrder
  Action:
    Id: 2
    Price: 190000
    OrderId: 0
  Expect:
    User:
      Id: 2
      BalanceBase: 9759.00000
      BalanceQuote: 12211.60000
- S8: OpenLimit
  Action:
    Id: 3
    Asset: base
    Side: 0
    Quantity: 10
    Price: 200000
  Expect:
    Pool: 
      Liquidity: 893.0705176328
      BaseVirtual: 4.8122104119
      QuoteVirtual: 204.9554576801
      BaseReal: 199.6966386128
      QuoteReal: 3993.9327722556
      IndexPipRange: 6
      MaxPip: 209999 
      MinPip: 180000 
      FeeGrowthBase: 0.0001045608502
      FeeGrowthQuote: 0
    User:
      Id: 3
      BalanceBase: 10140.83216
      BalanceQuote: 7177.95435
- S8.1: OpenLimit
  Action:
    Id: 5
    Asset: base
    Side: 0
    Quantity: 4.812210
    Price: 210000
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
      Id: 5
      BalanceBase: 10004.66784
      BalanceQuote: 9901.37926847985
- S9: AddLiquidity
  Action:
    Id: 1
    IndexPipRange: 6
    Asset: quote
    AmountVirtual: 100.0000000000
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
      FeeGrowthBase: 0
      FeeGrowthQuote: 0
    User:
      Id: 1
      TokenId: 1000004
      Liquidity: 294.18332181632
      FeeGrowthBase: 0
      FeeGrowthQuote: 0
      BaseVirtual: 0
      QuoteVirtual: 100.0000000000
      BalanceBase: 9970.00000
      BalanceQuote: 9435.42003
- S10: OpenLimit
  Action:
    Id: 3
    Asset: base
    Side: 0
    Quantity: 120
    Price: 220000
  Expect:
    User:
      Id: 3
      BalanceBase: 10257.23216
      BalanceQuote: 4537.95435
- S10.1: CancelLimitOrder
  Action:
    Id: 2
    Price: 220000
    OrderId: 1
  Expect:
    User:
      Id: 2
      BalanceBase: 9760.00000
      BalanceQuote: 14772.40000
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
- S13: OpenLimit
  Action:
    Id: 2
    Asset: base
    Side: 1
    Quantity: 11.05574
    Price: 210000
  Expect:
    Pool: 
      Liquidity: 2203.5785123241
      BaseVirtual: 31.0557365554
      QuoteVirtual: 0
      BaseReal: 480.8602539287
      QuoteReal: 10098.0653325036
      IndexPipRange: 7
      MaxPip: 239999 
      MinPip: 210000 
      FeeGrowthBase: 0
      FeeGrowthQuote: 0.001941121168
    User:
      Id: 2
      BalanceBase: 9748.94426
      BalanceQuote: 15002.90503
- S14: OpenLimit
  Action:
    Id: 1
    Asset: base
    Side: 1
    Quantity: 13
    Price: 205000
  Expect:
    Pool: 
      Liquidity: 1187.2538394491
      BaseVirtual: 3.1398617786
      QuoteVirtual: 338.4289412866
      BaseReal: 262.2205066572
      QuoteReal: 5375.5203864719
      IndexPipRange: 6
      MaxPip: 209999 
      MinPip: 180000 
      FeeGrowthBase: 0.0002015518332
      FeeGrowthQuote: 0.0009876998696
    User:
      Id: 1
      BalanceBase: 9937.00000
      BalanceQuote: 9260.97881
- S15: OpenLimit
  Action:
    Id: 2
    Asset: base
    Side: 1
    Quantity: 10
    Price: 200000
  Expect:
    Pool: 
      Liquidity: 1187.2538394491
      BaseVirtual: 6.3973842770
      QuoteVirtual: 272.4691379263
      BaseReal: 265.4780291556
      QuoteReal: 5309.5605831116
      IndexPipRange: 6
      MaxPip: 209999 
      MinPip: 180000 
      FeeGrowthBase: 0.0002015518332
      FeeGrowthQuote: 0.001987718923
    User:
      Id: 2
      BalanceBase: 9738.94426
      BalanceQuote: 15160.24292
- S16: RemoveLiquidity
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
      BalanceBase: 9952.52787
      BalanceQuote: 9263.11752
- S17: OpenLimit
  Action:
    Id: 2
    Asset: base
    Side: 1
    Quantity: 27.39982
    Price: 170000
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
      FeeGrowthQuote: 0.002151418975
    User:
      Id: 2
      BalanceBase: 9711.54444
      BalanceQuote: 15645.7667
- S18: AddLiquidity
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
      FeeGrowthQuote: 0
    User:
      Id: 1
      TokenId: 1000007
      Liquidity: 709.5560294933
      FeeGrowthBase: 0
      FeeGrowthQuote: 0.001941121168
      BaseVirtual: 10
      QuoteVirtual: 0
      BalanceBase: 9942.52787
      BalanceQuote: 9263.11752
- S19: RemoveLiquidity
  Action:
    Id: 1
    TokenId: 1000006
  Expect:
    Pool:
      Liquidity: 1811.34528565535
      BaseVirtual: 10.00000000000
      QuoteVirtual: 0
      BaseReal: 154.83781976025
      QuoteReal: 3251.59421496526
      IndexPipRange: 7
      MaxPip: 239999 
      MinPip: 210000
    User:
      Id: 1
      BalanceBase: 9958.05574
      BalanceQuote: 9265.25622
- S20: AddLiquidity
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
      FeeGrowthQuote: 0.006118633745
    User:
      Id: 1
      TokenId: 1000008
      Liquidity: 571.9563861406
      FeeGrowthBase: 0.0002015518332
      FeeGrowthQuote: 0.006118633745
      BaseVirtual: 10
      QuoteVirtual: 0
      BalanceBase: 9948.05574
      BalanceQuote: 9265.25622
- S21: RemoveLiquidity
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
      BalanceBase: 9954.75546
      BalanceQuote: 9505.97387
- S22: RemoveLiquidity
  Action:
    Id: 1
    TokenId: 1000001
  Expect:
    User:
      Id: 1
      BalanceBase: 9961.45518
      BalanceQuote: 9746.69151
- S23: RemoveLiquidity
  Action:
    Id: 1
    TokenId: 1000003
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
      BalanceBase: 9977.24949
      BalanceQuote: 9752.15588
- S24: OpenMarket
  Action:
    Id: 3
    asset: base
    Side: 0
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
      FeeGrowthQuote: 0.006118633745
    User:
      Id: 3
      BalanceBase: 10263.07488
      BalanceQuote: 4426.23643
- S25: RemoveLiquidity
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
      BalanceBase: 9980.38392
      BalanceQuote: 9791.90074
- S26: RemoveLiquidity
  Action:
    Id: 1
    TokenId: 1000008
  Expect:
    User:
      Id: 1
      BalanceBase: 9986.47794
      BalanceQuote: 9865.67381
`)
    })
})
