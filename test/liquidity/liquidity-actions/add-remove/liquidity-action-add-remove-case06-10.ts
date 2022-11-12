import {deployAndCreateRouterHelper, TestLiquidity} from "../../test-liquidity";

describe("LiquidityActionAddRemoveCase06-10", async function(){
    let testHelper: TestLiquidity

    beforeEach(async () => {
        testHelper = await deployAndCreateRouterHelper(10_000, false)
    })

    it ("Case #6", async () => {
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
      Liquidity: 2001.8473514920
      BaseVirtual: 35
      QuoteVirtual: 0
      BaseReal: 471.8399457134
      QuoteReal: 0
      IndexPipRange: 6
      MaxPip: 209999
      MinPip: 180000
      FeeGrowthBase: 0  
      FeeGrowthQuote: 0
    User:
      Id: 2
      TokenId: 1000002
      Liquidity: 2001.84735149196
      BaseVirtual: 35
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
      BaseVirtual: 55
      QuoteVirtual: 992.07116260114
      BalanceBase: 9935.00000
      BalanceQuote: 8827.55226
- S4: AddLiquidity
  Action:
    Id: 2
    IndexPipRange: 6
    AmountVirtual: 25
    Asset: base
  Expect:
    Pool:
      K: 11776827.87529090000
      Liquidity: 3431.73831684336
      BaseVirtual: 60
      QuoteVirtual: 0
      BaseReal: 808.86847836588
      QuoteReal: 0
      IndexPipRange: 6
      MaxPip: 209999
      MinPip: 180000
      FeeGrowthBase: 0  
      FeeGrowthQuote: 0
    User:
      Id: 2
      TokenId: 1000004
      Liquidity: 1429.89096535140
      BaseVirtual: 25
      QuoteVirtual: 0
      BalanceBase: 9940.00000
      BalanceQuote: 10000.00000
- S5: OpenMarket
  Action:
    id: 3
    asset: base
    Side: 0
    Quantity: 69.45660955345
  Expect:
    Pool:
      Liquidity: 3431.73831684336
      BaseVirtual: 55.54339044655
      QuoteVirtual: 80.66340180042
      BaseReal: 804.41186881243
      QuoteReal: 14640.29601238630
      IndexPipRange: 6
      MaxPip: 209999
      MinPip: 180000
      FeeGrowthBase: 0  
      FeeGrowthQuote: 0
    User:
      Id: 3
      BalanceBase: 10069.45661
      BalanceQuote: 8799.14999
- S6: RemoveLiquidity
  Action:
    Id: 1
    TokenId: 1000001
  Expect:
    Pool:
      Liquidity: 5248.05813570571
      BaseVirtual: 0
      QuoteVirtual: 0
      BaseReal: 1236.98260134047
      QuoteReal: 22265.56312586830
      IndexPipRange: 5
      MaxPip: 179999
      MinPip: 150000
    User:
      Id: 1
      BalanceBase: 9935.00000
      BalanceQuote: 9180.26524
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
      BalanceBase: 9935.00000
      BalanceQuote: 11120.18660
- S8: RemoveLiquidity
  Action:
    Id: 2
    TokenId: 1000002
  Expect:
    Pool:
      Liquidity: 1429.89096535140
      BaseVirtual: 0
      QuoteVirtual: 0
      BaseReal: 335.17161200518
      QuoteReal: 6100.12333849429
      IndexPipRange: 6
      MaxPip: 209999
      MinPip: 180000
    User:
      Id: 2
      BalanceBase: 9972.40031
      BalanceQuote: 10047.05365
- S9: RemoveLiquidity
  Action:
    Id: 2
    TokenId: 1000004
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
      BalanceBase: 9995.54339
      BalanceQuote: 10080.66340
`)
    })
    it ("Case #7", async () => {
        return testHelper.process(`
- S0: SetCurrentPrice
  Action: 
    Price: 165000
- S1: AddLiquidity
  Action:
    Id: 1
    IndexPipRange: 5
    Asset: quote
    AmountVirtual: 180.37657501839
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
      BaseVirtual: 10
      QuoteVirtual: 180.3765750184
      BalanceBase: 9990.00000
      BalanceQuote: 9819.62342
- S2: AddLiquidity
  Action:
    Id: 2
    IndexPipRange: 5
    Asset: quote
    AmountVirtual: 992.07116260114
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
      Liquidity: 5248.05813570571
      BaseVirtual: 55
      QuoteVirtual: 992.07116260114
      BalanceBase: 9945.00000
      BalanceQuote: 9007.92884
- S3: AddLiquidity
  Action:
    Id: 2
    IndexPipRange: 4
    Asset: quote
    AmountVirtual: 35
  Expect:
    Pool:
      K: 7327.70708363406
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
      TokenId: 1000003
      Liquidity: 85.60202733367
      BaseVirtual: 0
      QuoteVirtual: 35
      BalanceBase: 9945.00000
      BalanceQuote: 8972.92884
- S4: AddLiquidity
  Action:
    Id: 3
    IndexPipRange: 4
    Asset: quote
    AmountVirtual: 45
  Expect:
    Pool:
      K: 38283.53088592490
      Liquidity: 195.66177676267
      BaseVirtual: 0
      QuoteVirtual: 35
      BaseReal: 0
      QuoteReal: 757.79227690429
      IndexPipRange: 4
      MaxPip: 149999
      MinPip: 120000
      FeeGrowthBase: 0  
      FeeGrowthQuote: 0
    User:
      Id: 3
      TokenId: 1000004
      Liquidity: 110.05974942900
      BaseVirtual: 0
      QuoteVirtual: 45
      BalanceBase: 10000.00000
      BalanceQuote: 9955.00000
- S5: OpenMarket
  Action:
    id: 3
    asset: base
    Side: 1
    Quantity: 77.25823903361
  Expect:
    Pool:
      Liquidity: 195.66177676267
      BaseVirtual: 2.73256865589
      QuoteVirtual: 41.11499594805
      BaseReal: 53.25239058165
      QuoteReal: 718.90727285234
      IndexPipRange: 4
      MaxPip: 149999
      MinPip: 120000
      FeeGrowthBase: 0  
      FeeGrowthQuote: 0
    User:
      Id: 3
      BalanceBase: 9922.74176
      BalanceQuote: 11166.33274
- S6: RemoveLiquidity
  Action:
    Id: 1
    TokenId: 1000001
  Expect:
    Pool:
      Liquidity: 5248.05813570571
      BaseVirtual: 0
      QuoteVirtual: 0
      BaseReal: 1355.04278396777
      QuoteReal: 20325.64175951660
      IndexPipRange: 5
      MaxPip: 179999
      MinPip: 150000
    User:
      Id: 1
      BalanceBase: 10011.46549
      BalanceQuote: 9819.62342
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
      BalanceBase: 10063.06018
      BalanceQuote: 8972.92884
- S8: RemoveLiquidity
  Action:
    Id: 2
    TokenId: 1000003
  Expect:
    Pool:
      Liquidity: 110.05974942900
      BaseVirtual: 0
      QuoteVirtual: 0
      BaseReal: 29.95446970218
      QuoteReal: 404.38534097944
      IndexPipRange: 4
      MaxPip: 149999
      MinPip: 120000
    User:
      Id: 2
      BalanceBase: 10064.25568
      BalanceQuote: 8990.91665
- S9: RemoveLiquidity
  Action:
    Id: 3
    TokenId: 1000004
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
      Id: 3
      BalanceBase: 9924.27883
      BalanceQuote: 11189.45993
`)
    })
    it ("Case #10", async () => {
        return testHelper.process(`
- S0: SetCurrentPrice
  Action: 
    Price: 165000
- S1: AddLiquidity
  Action:
    Id: 1
    IndexPipRange: 5
    Asset: quote
    AmountVirtual: 180.376575
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
      BaseVirtual: 10.000000
      QuoteVirtual: 180.376575
      BalanceBase: 9990.00000
      BalanceQuote: 9819.62342
- S2: AddLiquidity
  Action:
    Id: 2
    IndexPipRange: 5
    Asset: quote
    AmountVirtual: 992.071163
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
      BaseVirtual: 55.000000
      QuoteVirtual: 992.071163
      BalanceBase: 9945.00000
      BalanceQuote: 9007.92884
- S3: OpenMarket
  Action:
    id: 2
    asset: base
    Side: 0
    Quantity: 65
  Expect:
    Pool:
      Liquidity: 6202.2505240158
      BaseVirtual: 0
      QuoteVirtual: 2292.6343420520
      BaseReal: 1461.8885288569
      QuoteReal: 26313.8473305716
      IndexPipRange: 5
      MaxPip: 179999
      MinPip: 150000
      FeeGrowthBase: 0  
      FeeGrowthQuote: 0
    User:
      Id: 2
      BalanceBase: 10010.00000
      BalanceQuote: 7887.74223
- S4: RemoveLiquidity
  Action:
    Id: 1
    TokenId: 1000001
  Expect:
    Pool:
      Liquidity: 5248.0581357057
      BaseVirtual: 0
      QuoteVirtual: 0
      BaseReal: 1236.9826013405
      QuoteReal: 22265.5631258683
      IndexPipRange: 5
      MaxPip: 179999
      MinPip: 150000
    User:
      Id: 1
      BalanceBase: 9990.00000
      BalanceQuote: 10172.33640
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
      BalanceBase: 10010.00000
      BalanceQuote: 9827.66360
`)
    })
})
