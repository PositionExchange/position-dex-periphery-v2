import {deployAndCreateRouterHelper, TestLiquidity} from "../../test-liquidity";

describe("LiquidityActionCase06-10", async function(){
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
    IndexPipRange: 6
    Asset: base
    AmountVirtual: 50
  Expect:
    Pool:
      Liquidity: 2859.7819307028
      BaseVirtual: 50
      QuoteVirtual: 0
      BaseReal: 674.0570653049
      QuoteReal: 0
      IndexPipRange: 6
      MaxPip: 209999 
      MinPip: 180000 
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
    User:
      Id: 1
      TokenId: 1000001
      Liquidity: 2859.7819307028
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
      BaseVirtual: 50
      QuoteVirtual: 0
      BalanceBase: 9950
      BalanceQuote: 10000
- S2: AddLiquidity
  Action:
    Id: 2
    IndexPipRange: 6
    Asset: base
    AmountVirtual: 30
  Expect:
    Pool:
      Liquidity: 4575.6510891245
      BaseVirtual: 80
      QuoteVirtual: 0
      BaseReal: 1078.4913044878
      QuoteReal: 0
      IndexPipRange: 6 
      MaxPip: 209999 
      MinPip: 180000 
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
    User:
      Id: 2
      TokenId: 1000002
      Liquidity: 1715.8691584217
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
      BaseVirtual: 30
      QuoteVirtual: 0
      BalanceBase: 9970
      BalanceQuote: 10000
- S3: DecreaseLiquidity
  Action:
    Id: 1
    TokenId: 1000001
    Liquidity: 500
  Expect:
    User:
      Id: 1
      BalanceBase: 9958.7419252956
      BalanceQuote: 10000
- S4: RemoveLiquidity
  Action:
    Id: 1
    TokenId: 1000001
  Expect:
    Pool:
      Liquidity: 1715.8691584217
      BaseVirtual: 30
      QuoteVirtual: 0
      BaseReal: 404.4342391829
      QuoteReal: 0
      IndexPipRange: 6
      MaxPip: 209999 
      MinPip: 180000 
    User:
      Id: 1
      TokenId: 1000001
      Liquidity: 0
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
      BalanceBase: 10000
      BalanceQuote: 10000
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
      IndexPipRange: 6
      MaxPip: 209999 
      MinPip: 180000 
    User:
      Id: 2
      TokenId: 1000002
      Liquidity: 0
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
      BalanceBase: 10000
      BalanceQuote: 10000
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
    IndexPipRange: 6
    Asset: base
    AmountVirtual: 50
  Expect:
    Pool:
      Liquidity: 2859.7819307028
      BaseVirtual: 50
      QuoteVirtual: 0
      BaseReal: 674.0570653049
      QuoteReal: 0
      IndexPipRange: 6
      MaxPip: 209999 
      MinPip: 180000 
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
    User:
      Id: 1
      TokenId: 1000001
      Liquidity: 2859.7819307028
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
      BaseVirtual: 50
      QuoteVirtual: 0
      BalanceBase: 9950
      BalanceQuote: 10000
- S2: AddLiquidity
  Action:
    Id: 2
    IndexPipRange: 6
    Asset: base
    AmountVirtual: 15
  Expect:
    Pool:
      Liquidity: 3717.7165099136
      BaseVirtual: 65
      QuoteVirtual: 0
      BaseReal: 876.2741848964
      QuoteReal: 0
      IndexPipRange: 6
      MaxPip: 209999 
      MinPip: 180000 
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
    User:
      Id: 2
      TokenId: 1000002
      Liquidity: 857.9345792108
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
      BaseVirtual: 15
      QuoteVirtual: 0
      BalanceBase: 9985
      BalanceQuote: 10000
- S3: OpenLimit
  Action:
    Id: 2
    Asset: base
    Side: 1
    Quantity: 10
    Price: 190000
  Expect:
    PendingOrder:
      OrderId: 1
      Price: 190000
      Size : 10
      Side: 1
    User:
      Id: 2
      BalanceBase: 9975
      BalanceQuote: 10000
- S4: DecreaseLiquidity
  Action:
    Id: 1
    TokenId: 1000001
    Liquidity: 1300
  Expect:
    User:
      Id: 1
      BalanceBase: 9972.7290057686
      BalanceQuote: 10000
- S5: OpenMarket
  Action:
    Id: 3
    asset: base
    Side: 0
    Quantity: 15.1990389694
  Expect:
    Pool:
      Liquidity: 2417.7165099136
      BaseVirtual: 27.0719552620
      QuoteVirtual: 281.0795059638
      BaseReal: 554.6622074128
      QuoteReal: 10538.5819408434
      IndexPipRange: 6
      MaxPip: 209999
      MinPip: 180000
      FeeGrowthBase: 0
      FeeGrowthQuote: 0
    User:
      Id: 3
      BalanceBase: 10015.1990389694
      BalanceQuote: 9718.9204940362
- S6: AddLiquidity
  Action:
    Id: 3
    IndexPipRange: 6
    Asset: base
    AmountVirtual: 30
  Expect:
    Pool:
      Liquidity: 5096.9280628120
      BaseVirtual: 57.0719552620
      QuoteVirtual: 592.5599696878
      BaseReal: 1169.3154920155
      QuoteReal: 22216.9943482938
      IndexPipRange: 6
      MaxPip: 209999 
      MinPip: 180000 
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
    User:
      Id: 3
      TokenId: 1000003
      Liquidity: 2679.2115528983
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
      BaseVirtual: 30
      QuoteVirtual: 311.4804637240
      BalanceBase: 9985.1990389694
      BalanceQuote: 9407.4400303122
- S7: DecreaseLiquidity
  Action:
    Id: 1
    TokenId: 1000001
    Liquidity: 500
  Expect:
    User:
      Id: 1
      BalanceBase: 9978.3276678018
      BalanceQuote: 10058.1291282107
- S8: DecreaseLiquidity
  Action:
    Id: 3
    TokenId: 1000003
    Liquidity: 2000
  Expect:
    User:
      Id: 3
      BalanceBase: 10007.5936871020
      BalanceQuote: 9639.9565431550
- S9: RemoveLiquidity
  Action:
    Id: 1
    TokenId: 1000001
  Expect:
    Pool:
      Liquidity: 1537.1461321092
      BaseVirtual: 17.2119233785
      QuoteVirtual: 178.7059291839
      BaseReal: 352.6455079641
      QuoteReal: 6700.2646513182
      IndexPipRange: 6
      MaxPip: 209999 
      MinPip: 180000 
    User:
      Id: 1
      TokenId: 1000001
      Liquidity: 0
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
      BalanceBase: 9990.1943895195
      BalanceQuote: 10181.3375276611
- S10: RemoveLiquidity
  Action:
    Id: 2
    TokenId: 1000002
  Expect:
    Pool:
      Liquidity: 679.2115528983
      BaseVirtual: 7.6053518674
      QuoteVirtual: 78.9639508812
      BaseReal: 155.8218168615
      QuoteReal: 2960.6145203691
      IndexPipRange: 6
      MaxPip: 209999 
      MinPip: 180000 
    User:
      Id: 2
      TokenId: 1000002
      Liquidity: 0
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
      BalanceBase: 9984.6065715111
      BalanceQuote: 10099.7419783027
- S11: RemoveLiquidity
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
      IndexPipRange: 6
      MaxPip: 209999 
      MinPip: 180000 
    User:
      Id: 3
      TokenId: 1000003
      Liquidity: 0
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
      BalanceBase: 10015.199039
      BalanceQuote: 9718.920495
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
    IndexPipRange: 4
    Asset: quote
    AmountVirtual: 50
  Expect:
    Pool:
      Liquidity: 122.2886104767
      BaseVirtual: 0
      QuoteVirtual: 50
      BaseReal: 0
      QuoteReal: 473.6201730652
      IndexPipRange: 4
      MaxPip: 149999 
      MinPip: 120000 
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
    User:
      Id: 1
      TokenId: 1000001
      Liquidity: 122.2886104767
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
      BaseVirtual: 0
      QuoteVirtual: 50
      BalanceBase: 10000
      BalanceQuote: 9950
- S2: DecreaseLiquidity
  Action:
    Id: 1
    TokenId: 1000001
    Liquidity: 50
  Expect:
    User:
      Id: 1
      BalanceBase: 10000
      BalanceQuote: 9970.4434410552
- S3: AddLiquidity
  Action:
    Id: 2
    IndexPipRange: 4
    Asset: quote
    AmountVirtual: 50
  Expect:
    Pool:
      Liquidity: 194.5772209533
      BaseVirtual: 0
      QuoteVirtual: 79.5565589448
      BaseReal: 0
      QuoteReal: 753.5918243183
      IndexPipRange: 4
      MaxPip: 149999 
      MinPip: 120000 
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
    User:
      Id: 2
      TokenId: 1000002
      Liquidity: 122.2886104767
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
      BaseVirtual: 0
      QuoteVirtual: 50
      BalanceBase: 10000
      BalanceQuote: 9950
- S4: RemoveLiquidity
  Action:
    Id: 1
    TokenId: 1000001
  Expect:
    Pool:
      Liquidity: 122.2886104767
      BaseVirtual: 0
      QuoteVirtual: 50
      BaseReal: 0
      QuoteReal: 473.6201730652
      IndexPipRange: 4
      MaxPip: 149999 
      MinPip: 120000 
    User:
      Id: 1
      TokenId: 1000001
      Liquidity: 0
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
      BalanceBase: 10000
      BalanceQuote: 10000
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
      IndexPipRange: 4
      MaxPip: 149999 
      MinPip: 120000 
    User:
      Id: 2
      TokenId: 1000002
      Liquidity: 0
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
      BalanceBase: 10000
      BalanceQuote: 10000
`)
    })
    it ("Case #14", async () => {
        return testHelper.process(`
- S0: SetCurrentPrice
  Action:
    Price: 165000
- S1: AddLiquidity
  Action:
    Id: 1
    IndexPipRange: 4
    Asset: quote
    AmountVirtual: 50
  Expect:
    Pool:
      Liquidity: 122.2886104767
      BaseVirtual: 0
      QuoteVirtual: 50
      BaseReal: 0
      QuoteReal: 473.6201730652
      IndexPipRange: 4
      MaxPip: 149999 
      MinPip: 120000 
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
    User:
      Id: 1
      TokenId: 1000001
      Liquidity: 122.2886104767
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
      BaseVirtual: 50
      QuoteVirtual: 0
      BalanceBase: 10000
      BalanceQuote: 9950
- S2: AddLiquidity
  Action:
    Id: 2
    IndexPipRange: 4
    Asset: quote
    AmountVirtual: 50
  Expect:
    Pool:
      Liquidity: 244.5772209533
      BaseVirtual: 0
      QuoteVirtual: 100
      BaseReal: 0
      QuoteReal: 947.2403461304
      IndexPipRange: 4
      MaxPip: 149999 
      MinPip: 120000 
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
    User:
      Id: 2
      TokenId: 1000002
      Liquidity: 122.2886104767
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
      BaseVirtual: 0
      QuoteVirtual: 50
      BalanceBase: 10000
      BalanceQuote: 9950
- S3: OpenLimit
  Action:
    Id: 2
    Asset: base
    Side: 0
    Quantity: 10
    Price: 130000
  Expect:
    PendingOrder:
      OrderId: 1
      Price: 130000
      Size : 10
      Side: 0
    User:
      Id: 2
      BalanceBase: 10000
      BalanceQuote: 9820
- S4: DecreaseLiquidity
  Action:
    Id: 1
    TokenId: 1000001
    Liquidity: 30
  Expect:
    User:
      Id: 1
      BalanceBase: 10000
      BalanceQuote: 9962.2660646331
- S5: OpenMarket
  Action:
    Id: 3
    asset: base
    Side: 1
    Quantity: 15
  Expect:
    Pool:
      Liquidity: 214.5772209533
      BaseVirtual: 5
      QuoteVirtual: 18.9426142195
      BaseReal: 60.4037848948
      QuoteReal: 762.2599118957
      IndexPipRange: 4
      MaxPip: 149999
      MinPip: 120000
      FeeGrowthBase: 0
      FeeGrowthQuote: 0
    User:
      Id: 3
      BalanceBase: 9985
      BalanceQuote: 10198.7913211474
- S6: Expect
  User:
    Id: 2
    BalanceBase: 10010
    BalanceQuote: 9820   
- S7: AddLiquidity
  Action:
    Id: 3
    IndexPipRange: 4
    Asset: base
    AmountVirtual: 30
  Expect:
    Pool:
      Liquidity: 1502.0405466734
      BaseVirtual: 35
      QuoteVirtual: 132.5982995363
      BaseReal: 422.8264942634
      QuoteReal: 5335.8193832699
      IndexPipRange: 4
      MaxPip: 149999 
      MinPip: 120000 
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
    User:
      Id: 3
      TokenId: 1000003
      Liquidity: 1287.4633257200
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
      BaseVirtual: 30
      QuoteVirtual: 113.6556853169
      BalanceBase: 9955
      BalanceQuote: 10085.1356358305
- S8: DecreaseLiquidity
  Action:
    Id: 1
    TokenId: 1000001
    Liquidity: 52
  Expect:
    User:
      Id: 1
      BalanceBase: 10001.2116850001
      BalanceQuote: 9966.8565609357
- S9: DecreaseLiquidity
  Action:
    Id: 3
    TokenId: 1000003
    Liquidity: 500
  Expect:
    User:
      Id: 3
      BalanceBase: 9966.6508173090
      BalanceQuote: 10129.2750233557
- S10: RemoveLiquidity
  Action:
    Id: 1
    TokenId: 1000001
  Expect:
    Pool:
      Liquidity: 909.7519361967
      BaseVirtual: 21.1987072103
      QuoteVirtual: 80.3117865272
      BaseReal: 256.0964300753
      QuoteReal: 3231.7849380808
      IndexPipRange: 4
      MaxPip: 149999 
      MinPip: 120000 
    User:
      Id: 1
      TokenId: 1000001
      Liquidity: 0
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
      BalanceBase: 10002.1504754807
      BalanceQuote: 9970.4131901171
- S11: RemoveLiquidity
  Action:
    Id: 2
    TokenId: 1000002
  Expect:
    Pool:
      Liquidity: 787.4633257200
      BaseVirtual: 18.3491826910
      QuoteVirtual: 69.5162977917
      BaseReal: 221.6720168524
      QuoteReal: 2797.3692762802
      IndexPipRange: 4
      MaxPip: 149999 
      MinPip: 120000 
    User:
      Id: 2
      TokenId: 1000002
      Liquidity: 0
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
      BalanceBase: 10012.8495245193
      BalanceQuote: 9830.7954887355
- S12: RemoveLiquidity
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
      IndexPipRange: 4
      MaxPip: 149999 
      MinPip: 120000 
    User:
      Id: 3
      TokenId: 1000003
      Liquidity: 0
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
      BalanceBase: 9985
      BalanceQuote: 10198.7913211474
`)
    })
    it ("Case #15", async () => {
        return testHelper.process(`
- S0: SetCurrentPrice
  Action:
    Price: 165000
- S1: AddLiquidity
  Action:
    Id: 1
    IndexPipRange: 4
    Asset: quote
    AmountVirtual: 50
  Expect:
    Pool:
      Liquidity: 122.2886104767
      BaseVirtual: 0
      QuoteVirtual: 50
      BaseReal: 0
      QuoteReal: 473.6201730652
      IndexPipRange: 4
      MaxPip: 149999 
      MinPip: 120000 
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
    User:
      Id: 1
      TokenId: 1000001
      Liquidity: 122.2886104767
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
      BaseVirtual: 50
      QuoteVirtual: 0
      BalanceBase: 10000
      BalanceQuote: 9950
- S2: AddLiquidity
  Action:
    Id: 2
    IndexPipRange: 5
    Asset: base
    AmountVirtual: 30
  Expect:
    Pool:
      Liquidity: 2862.5771649304
      BaseVirtual: 30
      QuoteVirtual: 541.1297250552
      BaseReal: 704.7177825493
      QuoteReal: 11627.8434120642
      IndexPipRange: 5
      MaxPip: 179999 
      MinPip: 150000 
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
    User:
      Id: 2
      TokenId: 1000002
      Liquidity: 2862.5771649304
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
      BaseVirtual: 30
      QuoteVirtual: 541.1297250552
      BalanceBase: 9970
      BalanceQuote: 9458.8702749448
- S3: DecreaseLiquidity
  Action:
    Id: 1
    TokenId: 1000001
    Liquidity: 122.2886104767
  Expect:
    User:
      Id: 1
      BalanceBase: 10000
      BalanceQuote: 10000
- S4: AddLiquidity
  Action:
    Id: 3
    IndexPipRange: 6
    Asset: base
    AmountVirtual: 15
  Expect:
    Pool:
      Liquidity: 857.9345792108
      BaseVirtual: 15
      QuoteVirtual: 0
      BaseReal: 202.2171195915
      QuoteReal: 0
      IndexPipRange: 6 
      MaxPip: 209999 
      MinPip: 180000 
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
    User:
      Id: 3
      TokenId: 1000003
      Liquidity: 857.9345792108
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
      BaseVirtual: 15
      QuoteVirtual: 0
      BalanceBase: 9985
      BalanceQuote: 10000
- S5: DecreaseLiquidity
  Action:
    Id: 2
    TokenId: 1000002
    Liquidity: 2862.5771649304
  Expect:
    User:
      Id: 2
      BalanceBase: 10000
      BalanceQuote: 10000
- S6: DecreaseLiquidity
  Action:
    Id: 3
    TokenId: 1000003
    Liquidity: 857.9345792108
  Expect:
    User:
      Id: 3
      BalanceBase: 10000
      BalanceQuote: 10000
- S4: RemoveLiquidity
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
      IndexPipRange: 4
      MaxPip: 149999 
      MinPip: 120000 
    User:
      Id: 1
      TokenId: 1000001
      Liquidity: 0
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
      BalanceBase: 10000
      BalanceQuote: 10000
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
      TokenId: 1000002
      Liquidity: 0
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
      BalanceBase: 10000
      BalanceQuote: 10000  
- S5: RemoveLiquidity
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
      IndexPipRange: 6
      MaxPip: 209999 
      MinPip: 180000 
    User:
      Id: 3
      TokenId: 1000003
      Liquidity: 0
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
      BalanceBase: 10000
      BalanceQuote: 10000
`)
    })
})
