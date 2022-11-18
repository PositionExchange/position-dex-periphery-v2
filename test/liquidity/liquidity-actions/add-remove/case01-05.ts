import {deployAndCreateRouterHelper, TestLiquidity} from "../../test-liquidity";

describe("LiquidityActionAddRemoveCase01-05", async function(){
    let testHelper: TestLiquidity

    beforeEach(async () => {
        testHelper = await deployAndCreateRouterHelper(10_000, false)
    })

    it ("Case #1", async () => {
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
      BaseVirtual: 10
      QuoteVirtual: 180.3765750184
      BalanceBase: 9990.00000000000
      BalanceQuote: 9819.62342
- S2: AddLiquidity
  Action:
    Id: 1
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
      Id: 1
      TokenId: 1000002
      Liquidity: 3339.67335908545
      BaseVirtual: 35.00000000000
      QuoteVirtual: 631.31801256436
      BalanceBase: 9955.00000
      BalanceQuote: 9188.30541
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
      BalanceBase: 9900.00000
      BalanceQuote: 8196.23425
- S4: AddLiquidity
  Action:
    Id: 1
    IndexPipRange: 5
    Asset: base
    AmountVirtual: 33
  Expect:
    Pool:
      K: 161055358.0193610000
      Liquidity: 12690.7587645247
      BaseVirtual: 133
      QuoteVirtual: 2399.0084477446
      BaseReal: 3124.2488359688
      QuoteReal: 51550.1057934846
      IndexPipRange: 5
      MaxPip: 179999
      MinPip: 150000
      FeeGrowthBase: 0  
      FeeGrowthQuote: 0
    User:
      Id: 1
      TokenId: 1000004
      Liquidity: 3148.83488142343
      BaseVirtual: 33.00000000000
      QuoteVirtual: 595.24269756068
      BalanceBase: 9867.00000
      BalanceQuote: 7600.99155
- S5: RemoveLiquidity
  Action:
    Id: 1
    TokenId: 1000002
  Expect:
    Pool:
      Liquidity: 9351.08540543927
      BaseVirtual: 98.00000000000
      QuoteVirtual: 1767.69043518021
      BaseReal: 2302.07808966120
      QuoteReal: 37984.28847940970
      IndexPipRange: 5
      MaxPip: 179999
      MinPip: 150000
    User:
      Id: 1
      BalanceBase: 9902.00000
      BalanceQuote: 8232.30956
- S6: RemoveLiquidity
  Action:
    Id: 1
    TokenId: 1000001
  Expect:
    Pool:
      Liquidity: 8396.89301712914
      BaseVirtual: 88.00000000000
      QuoteVirtual: 1587.31386016182
      BaseReal: 2067.17216214475
      QuoteReal: 34108.34067538830
      IndexPipRange: 5
      MaxPip: 179999
      MinPip: 150000
    User:
      Id: 1
      BalanceBase: 9912.00000
      BalanceQuote: 8412.68614
- S7: RemoveLiquidity
  Action:
    Id: 1
    TokenId: 1000004
  Expect:
    Pool:
      Liquidity: 5248.05813570571
      BaseVirtual: 55.00000000000
      QuoteVirtual: 992.07116260114
      BaseReal: 1291.98260134047
      QuoteReal: 21317.71292211770
      IndexPipRange: 5
      MaxPip: 179999
      MinPip: 150000
    User:
      Id: 1
      BalanceBase: 9945.00000
      BalanceQuote: 9007.92884
- S7: RemoveLiquidity
  Action:
    Id: 1
    TokenId: 1000003
  Expect:
    User:
      Id: 1
      BalanceBase: 10000.00000
      BalanceQuote: 10000.00000
`)
    })
    it ("Case #3", async () => {
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
    asset: base
    Side: 1
    Quantity: 20
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
- S6: RemoveLiquidity
  Action:
    Id: 1
    TokenId: 1000001
  Expect:
    Pool:
      Liquidity: 8587.73149479117
      BaseVirtual: 0
      QuoteVirtual: 0
      BaseReal: 2123.15334764804
      QuoteReal: 34735.65972440240
      IndexPipRange: 5
      MaxPip: 179999
      MinPip: 150000
    User:
      Id: 1
      BalanceBase: 9946.00000
      BalanceQuote: 8991.49878
- S7: RemoveLiquidity
  Action:
    Id: 1
    TokenId: 1000003
  Expect:
    Pool:
      Liquidity: 3339.67335908546
      BaseVirtual: 0
      QuoteVirtual: 0
      BaseReal: 825.67074630757
      QuoteReal: 13508.31211504540
      IndexPipRange: 5
      MaxPip: 179999
      MinPip: 150000
    User:
      Id: 1
      BalanceBase: 10006.50000
      BalanceQuote: 9893.20463
- S8: RemoveLiquidity
  Action:
    Id: 2
    TokenId: 1000002
  Expect:
    User:
      Id: 2
      BalanceBase: 10003.50000
      BalanceQuote: 9942.49480
`)
    })
    it ("Case #4", async () => {
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
      QuoteVirtual: 180.37657501839
      BalanceBase: 9990.00000
      BalanceQuote: 9819.62342
- S2: AddLiquidity
  Action:
    Id: 2
    IndexPipRange: 6
    Asset: base
    AmountVirtual: 35
  Expect:
    Pool:
      K: 4007392.8186753700
      Liquidity: 2001.84735149196
      BaseVirtual: 35
      QuoteVirtual: 0
      BaseReal: 471.8399457134
      QuoteReal: 8493.11902284176
      IndexPipRange: 6
      MaxPip: 209999
      MinPip: 180000
      FeeGrowthBase: 0  
      FeeGrowthQuote: 0
    User:
      Id: 2
      TokenId: 1000002
      Liquidity: 2001.84735149196
      BaseVirtual: 35.00000000000
      QuoteVirtual: 0
      BalanceBase: 9965.00000
      BalanceQuote: 10000.00000
- S3: AddLiquidity
  Action:
    Id: 1
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
    Side: 1
    Quantity: 10
    Price: 165000
  Expect:
    PendingOrder:
      OrderId: 1
      Price: 165000
      Size : 10
      Side: 1
- S5: OpenMarket
  Action:
    id: 3
    asset: base
    Side: 0
    Quantity: 20
  Expect:
    Pool:
      Liquidity: 6202.2505240158
      BaseVirtual: 55
      QuoteVirtual: 1338.5354905879
      BaseReal: 1516.8885288569
      QuoteReal: 25359.7484791075
      IndexPipRange: 5
      MaxPip: 179999
      MinPip: 150000
      FeeGrowthBase: 0  
      FeeGrowthQuote: 0
    User:
      Id: 3
      BalanceBase: 10020.00000
      BalanceQuote: 9668.91225
- S6: RemoveLiquidity
  Action:
    Id: 1
    TokenId: 1000001
  Expect:
    Pool:
      Liquidity: 5248.05813570571
      BaseVirtual: 0
      QuoteVirtual: 0
      BaseReal: 1283.52106287893
      QuoteReal: 21458.24871309100
      IndexPipRange: 5
      MaxPip: 179999
      MinPip: 150000
    User:
      Id: 1
      BalanceBase: 9943.46154
      BalanceQuote: 9033.48080
- S7: RemoveLiquidity
  Action:
    Id: 1
    TokenId: 1000003
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
      BalanceBase: 9990.00000
      BalanceQuote: 10166.08775
- S8: RemoveLiquidity
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
      IndexPipRange: 6
      MaxPip: 209999
      MinPip: 180000
    User:
      Id: 2
      BalanceBase: 10000.00000
      BalanceQuote: 10000.00000
`)
    })
    it ("Case #5", async () => {
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
      QuoteVirtual: 180.37657501839
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
      Liquidity: 85.6020273337
      BaseVirtual: 0
      QuoteVirtual: 35
      BaseReal: 22.10242209252
      QuoteReal: 331.5341211456
      IndexPipRange: 4
      MaxPip: 149999
      MinPip: 120000
      FeeGrowthBase: 0  
      FeeGrowthQuote: 0
    User:
      Id: 2
      TokenId: 1000002
      Liquidity: 85.60202733367
      BaseVirtual: 0
      QuoteVirtual: 35
      BalanceBase: 10000.00000
      BalanceQuote: 9965.00000
- S3: AddLiquidity
  Action:
    Id: 3
    IndexPipRange: 3
    Asset: quote
    AmountVirtual: 15
  Expect:
    Pool:
      K: 1044.6802213900
      Liquidity: 32.3215132905
      BaseVirtual: 0
      QuoteVirtual: 15
      BaseReal: 9.33045607643
      QuoteReal: 111.9645398716
      IndexPipRange: 3
      MaxPip: 119999
      MinPip: 90000
      FeeGrowthBase: 0  
      FeeGrowthQuote: 0
    User:
      Id: 3
      TokenId: 1000003
      Liquidity: 32.32151329053
      BaseVirtual: 0
      QuoteVirtual: 15
      BalanceBase: 10000.00000
      BalanceQuote: 9985.00000
- S4: AddLiquidity
  Action:
    Id: 1
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
      Id: 1
      TokenId: 1000004
      Liquidity: 5248.05813570571
      BaseVirtual: 55.00000000000
      QuoteVirtual: 992.07116260114
      BalanceBase: 9935.00000
      BalanceQuote: 8827.55226
- S5: OpenLimit
  Action:
    Id: 1
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
- S6: OpenMarket
  Action:
    id: 3
    asset: base
    Side: 1
    Quantity: 20
  Expect:
    Pool:
      Liquidity: 6202.2505240158
      BaseVirtual: 75
      QuoteVirtual: 1008.5213353262
      BaseReal: 1536.8885288569
      QuoteReal: 25029.7343238458
      IndexPipRange: 5
      MaxPip: 179999
      MinPip: 150000
      FeeGrowthBase: 0  
      FeeGrowthQuote: 0
    User:
      Id: 3
      BalanceBase: 9980.00000
      BalanceQuote: 10313.92640
- S7: RemoveLiquidity
  Action:
    Id: 1
    TokenId: 1000001
  Expect:
    Pool:
      Liquidity: 5248.05813570571
      BaseVirtual: 0
      QuoteVirtual: 0
      BaseReal: 1300.44413980201
      QuoteReal: 21179.00596633110
      IndexPipRange: 5
      MaxPip: 179999
      MinPip: 150000
    User:
      Id: 1
      BalanceBase: 9946.53846
      BalanceQuote: 8817.70939
- S8: RemoveLiquidity
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
      IndexPipRange: 5
      MaxPip: 179999
      MinPip: 150000
    User:
      Id: 1
      BalanceBase: 10010.00000
      BalanceQuote: 9671.07360
- S9: RemoveLiquidity
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
      BalanceBase: 10000.00000
      BalanceQuote: 10000.00000
- S10: RemoveLiquidity
  Action:
    Id: 3
    TokenId: 1000003
  Expect:
    Pool:
      Liquidity: 0
      BaseVirtual: 0
      QuoteVirtual: 0
      BaseReal: 0
      QuoteReal: 0
      IndexPipRange: 3
      MaxPip: 119999
      MinPip: 90000
    User:
      Id: 3
      BalanceBase: 9980.00000
      BalanceQuote: 10328.92640
`)
    })

})
