import {deployAndCreateRouterHelper, TestLiquidity} from "../../test-liquidity";

describe("LiquidityActionAddRemoveCase16-20", async function(){
    let testHelper: TestLiquidity

    beforeEach(async () => {
        testHelper = await deployAndCreateRouterHelper(10_000, false)
    })

    it ("Case #16", async () => {
        return testHelper.process(`
- S0: SetCurrentPrice
  Action:
    Price: 165000
- S1: AddLiquidity
  Action:
    Id: 1
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
      Id: 1
      TokenId: 1000001
      Liquidity: 2862.5771649304
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
      BaseVirtual: 30
      QuoteVirtual: 541.1297250552
      BalanceBase: 9970
      BalanceQuote: 9458.8702749448
- S2: AddLiquidity
  Action:
    Id: 2
    IndexPipRange: 5
    Asset: base
    AmountVirtual: 30
  Expect:
    Pool:
      Liquidity: 5725.1543298608
      BaseVirtual: 60
      QuoteVirtual: 1082.2594501103
      BaseReal: 1409.4355650987
      QuoteReal: 23255.6868241284
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
    Liquidity: 800
  Expect:
    Pool:
      Liquidity: 4925.1543298608
      BaseVirtual: 51.6159465345
      QuoteVirtual: 931.0307652219
      BaseReal: 1212.4891795318
      QuoteReal: 20006.0714622740
      IndexPipRange: 5 
      MaxPip: 179999 
      MinPip: 150000 
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
    User:
      Id: 1
      BalanceBase: 9978.3840534655
      BalanceQuote: 9610.0989598333
- S4: IncreaseLiquidity
  Action:
    Id: 2
    TokenId: 1000002
    Asset: base
    AmountVirtual: 30
  Expect:
    Pool:
      Liquidity: 7787.7314947912
      BaseVirtual: 81.6159465345
      QuoteVirtual: 1472.1604902771
      BaseReal: 1917.2069620811
      QuoteReal: 31633.9148743382
      IndexPipRange: 5 
      MaxPip: 179999 
      MinPip: 150000 
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
    User:
      Id: 2
      BalanceBase: 9940
      BalanceQuote: 8917.7405498897
- S5: OpenLimit
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
      BalanceBase: 9930
      BalanceQuote: 8917.7405498897
- S6: AddLiquidity
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
      QuoteReal: 12133.0271754882
      IndexPipRange: 6
      MaxPip: 209999 
      MinPip: 180000 
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
    User:
      Id: 1
      TokenId: 1000003
      Liquidity: 2859.7819307028
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
      BaseVirtual: 50
      QuoteVirtual: 0
      BalanceBase: 9928.3840534655
      BalanceQuote: 9610.0989598333
- S7: AddLiquidity
  Action:
    Id: 3
    IndexPipRange: 6
    Asset: base
    AmountVirtual: 20
  Expect:
    Pool:
      Liquidity: 4003.6947029839
      BaseVirtual: 70
      QuoteVirtual: 0
      BaseReal: 943.6798914269
      QuoteReal: 16986.2380456835
      IndexPipRange: 6
      MaxPip: 209999 
      MinPip: 180000 
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
    User:
      Id: 3
      TokenId: 1000004
      Liquidity: 1143.9127722811
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
      BaseVirtual: 20
      QuoteVirtual: 0
      BalanceBase: 9980
      BalanceQuote: 10000      
- S8: DecreaseLiquidity
  Action:
    Id: 1
    TokenId: 1000003
    Liquidity: 2859.7819307028
  Expect:
    Pool:
      Liquidity: 1143.9127722811
      BaseVirtual: 20
      QuoteVirtual: 0
      BaseReal: 269.6228261220
      QuoteReal: 4853.2108701953
      IndexPipRange: 6
      MaxPip: 209999 
      MinPip: 180000 
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0
    User:
      Id: 1
      BalanceBase: 9978.3840534655
      BalanceQuote: 9610.0989598333
- S9: IncreaseLiquidity
  Action:
    Id: 3
    TokenId: 1000004
    Asset: base
    AmountVirtual: 10
  Expect:
    Pool:
      Liquidity: 1715.8691584217
      BaseVirtual: 30
      QuoteVirtual: 0
      BaseReal: 404.4342391829
      QuoteReal: 7279.8163052929
      IndexPipRange: 6
      MaxPip: 209999 
      MinPip: 180000 
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0
    User:
      Id: 3
      BalanceBase: 9970
      BalanceQuote: 10000
- S10: OpenMarket
  Action:
    Id: 3
    asset: base
    Side: 0
    Quantity: 100
  Expect:
    Pool:
      Liquidity: 1715.8691584217
      BaseVirtual: 19.2131430222
      QuoteVirtual: 199.4839566053
      BaseReal: 393.6473822052
      QuoteReal: 7479.3002618983
      IndexPipRange: 6
      MaxPip: 209999
      MinPip: 180000
      FeeGrowthBase: 0
      FeeGrowthQuote: 0
    User:
      Id: 3
      BalanceBase: 10070
      BalanceQuote: 8249.6294637273
- S11: Expect
  User:
      Id: 2
      BalanceBase: 9930
      BalanceQuote: 8917.7405498897
- S12: DecreaseLiquidity
  Action:
    Id: 2
    TokenId: 1000002
    Liquidity: 2000
  Expect:
    Pool:
      Liquidity: 5787.7314947912
      BaseVirtual: 0
      QuoteVirtual: 2139.4092251118
      BaseReal: 1364.1851852932
      QuoteReal: 24555.1969167582
      IndexPipRange: 5 
      MaxPip: 179999 
      MinPip: 150000 
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
    User:
      Id: 2
      BalanceBase: 9930
      BalanceQuote: 9657.0316614546
- S13: DecreaseLiquidity
  Action:
    Id: 3
    TokenId: 1000004
    Liquidity: 1000
  Expect:
    Pool:
      Liquidity: 715.8691584217
      BaseVirtual: 8.0158189559
      QuoteVirtual: 83.2257001840
      BaseReal: 164.2316483346
      QuoteReal: 3120.4013183576
      IndexPipRange: 6
      MaxPip: 209999
      MinPip: 180000
      FeeGrowthBase: 0
      FeeGrowthQuote: 0
    User:
      Id: 3
      BalanceBase: 10081.1973240663
      BalanceQuote: 8365.8877201487
- S14: IncreaseLiquidity
  Action:
    Id: 1
    TokenId: 1000001
    Asset: quote
    AmountVirtual: 10
  Expect:
    Pool:
      Liquidity: 5814.7844373833
      BaseVirtual: 0
      QuoteVirtual: 2149.4092251118
      BaseReal: 1370.5616427249
      QuoteReal: 24669.9725128832
      IndexPipRange: 5 
      MaxPip: 179999 
      MinPip: 150000 
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
    User:
      Id: 1
      BalanceBase: 9978.3840534655
      BalanceQuote: 9600.0989598333
- S15: IncreaseLiquidity
  Action:
    Id: 1
    TokenId: 1000003
    Asset: base
    AmountVirtual: 100
  Expect:
    Pool:
      Liquidity: 9646.5743347494
      BaseVirtual: 108.0158189559
      QuoteVirtual: 1121.4939125973
      BaseReal: 2213.0759303435
      QuoteReal: 42048.4426765258
      IndexPipRange: 6
      MaxPip: 209999
      MinPip: 180000
      FeeGrowthBase: 0
      FeeGrowthQuote: 0
    User:
      Id: 1
      BalanceBase: 9878.3840534655
      BalanceQuote: 8561.8307474200
- S16: RemoveLiquidity
  Action:
    Id: 1
    TokenId: 1000001
  Expect:
    Pool:
      Liquidity: 3725.1543298608
      BaseVirtual: 0
      QuoteVirtual: 1376.9867426369
      BaseReal: 878.0297348452
      QuoteReal: 15804.4474242401
      IndexPipRange: 5 
      MaxPip: 179999 
      MinPip: 150000 
    User:
      Id: 1
      TokenId: 1000001
      Liquidity: 0
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
      BalanceBase: 9878.3840534655
      BalanceQuote: 9334.2532298949
- S17: RemoveLiquidity
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
      BalanceBase: 9930
      BalanceQuote: 11034.0184040915
- S18: RemoveLiquidity
  Action:
    Id: 1
    TokenId: 1000003
  Expect:
    Pool:
      Liquidity: 715.8691584217
      BaseVirtual: 8.015818956
      QuoteVirtual: 83.2257001840
      BaseReal: 164.2316483346
      QuoteReal: 3120.4013183576
      IndexPipRange: 6
      MaxPip: 209999 
      MinPip: 180000 
    User:
      Id: 1
      TokenId: 1000003
      Liquidity: 0
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
      BalanceBase: 9978.3840534655
      BalanceQuote: 10372.5214423082
- S19: RemoveLiquidity
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
      IndexPipRange: 6
      MaxPip: 209999 
      MinPip: 180000 
    User:
      Id: 3
      TokenId: 1000004
      Liquidity: 0
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
      BalanceBase: 10089.2131430222
      BalanceQuote: 8449.1134203327
`)
    })
    it ("Case #17", async () => {
        return testHelper.process(`
- S0: SetCurrentPrice
  Action:
    Price: 165000
- S1: AddLiquidity
  Action:
    Id: 1
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
      Id: 1
      TokenId: 1000001
      Liquidity: 2862.5771649304
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
      BaseVirtual: 30
      QuoteVirtual: 541.1297250552
      BalanceBase: 9970
      BalanceQuote: 9458.8702749448
- S2: AddLiquidity
  Action:
    Id: 2
    IndexPipRange: 5
    Asset: base
    AmountVirtual: 30
  Expect:
    Pool:
      Liquidity: 5725.1543298608
      BaseVirtual: 60
      QuoteVirtual: 1082.2594501103
      BaseReal: 1409.4355650987
      QuoteReal: 23255.6868241284
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
    Liquidity: 800
  Expect:
    Pool:
      Liquidity: 4925.1543298608
      BaseVirtual: 51.6159465345
      QuoteVirtual: 931.0307652219
      BaseReal: 1212.4891795318
      QuoteReal: 20006.0714622740
      IndexPipRange: 5 
      MaxPip: 179999 
      MinPip: 150000 
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
    User:
      Id: 1
      BalanceBase: 9978.3840534655
      BalanceQuote: 9610.0989598333
- S4: IncreaseLiquidity
  Action:
    Id: 2
    TokenId: 1000002
    Asset: base
    AmountVirtual: 30
  Expect:
    Pool:
      Liquidity: 7787.7314947912
      BaseVirtual: 81.6159465345
      QuoteVirtual: 1472.1604902771
      BaseReal: 1917.2069620811
      QuoteReal: 31633.9148743382
      IndexPipRange: 5 
      MaxPip: 179999 
      MinPip: 150000 
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0
    User:
      Id: 2
      BalanceBase: 9940
      BalanceQuote: 8917.7405498897
- S5: OpenLimit
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
      BalanceBase: 9940
      BalanceQuote: 8787.7405498897
- S6: OpenLimit
  Action:
    Id: 1
    Asset: base
    Side: 0
    Quantity: 10
    Price: 125000
  Expect:
    PendingOrder:
      OrderId: 1
      Price: 125000
      Size : 10
      Side: 0
    User:
      Id: 1
      BalanceBase: 9978.3840534655
      BalanceQuote: 9485.0989598333
- S7: AddLiquidity
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
      BaseReal: 31.5748887036
      QuoteReal: 473.6201730652
      IndexPipRange: 4
      MaxPip: 149999 
      MinPip: 120000 
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
    User:
      Id: 1
      TokenId: 1000003
      Liquidity: 122.2886104767
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
      BaseVirtual: 0
      QuoteVirtual: 50
      BalanceBase: 9978.3840534655
      BalanceQuote: 9435.0989598333
- S8: AddLiquidity
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
      BaseReal: 63.1497774072
      QuoteReal: 947.2403461304
      IndexPipRange: 4
      MaxPip: 149999 
      MinPip: 120000 
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
    User:
      Id: 2
      TokenId: 1000004
      Liquidity: 122.2886104767
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
      BaseVirtual: 0
      QuoteVirtual: 50
      BalanceBase: 9940
      BalanceQuote: 8737.7405498897
- S9: DecreaseLiquidity
  Action:
    Id: 1
    TokenId: 1000003
    Liquidity: 30
  Expect:
    Pool:
      Liquidity: 214.5772209533
      BaseVirtual: 0
      QuoteVirtual: 87.7339353669
      BaseReal: 55.4037848948
      QuoteReal: 831.0512330431
      IndexPipRange: 4
      MaxPip: 149999 
      MinPip: 120000 
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0
    User:
      Id: 1
      BalanceBase: 9978.3840534655
      BalanceQuote: 9447.3650244664
- S10: IncreaseLiquidity
  Action:
    Id: 2
    TokenId: 1000004
    Asset: quote
    AmountVirtual: 100
  Expect:
    Pool:
      Liquidity: 459.1544419067
      BaseVirtual: 0
      QuoteVirtual: 187.7339353669
      BaseReal: 118.5535623020
      QuoteReal: 1778.2915791735
      IndexPipRange: 4
      MaxPip: 149999 
      MinPip: 120000 
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0
    User:
      Id: 2
      BalanceBase: 9940
      BalanceQuote: 8637.7405498897
- S11: OpenMarket
  Action:
    Id: 3
    asset: base
    Side: 1
    Quantity: 120
  Expect:
    Pool:
      Liquidity: 459.1544419067
      BaseVirtual: 11.3149254917
      QuoteVirtual: 32.7984536141
      BaseReal: 129.8684877937
      QuoteReal: 1623.3560974207
      IndexPipRange: 4
      MaxPip: 149999
      MinPip: 120000
      FeeGrowthBase: 0
      FeeGrowthQuote: 0
    User:
      Id: 3
      BalanceBase: 9880
      BalanceQuote: 11820.9511093468
- S12: Expect
  User:
      Id: 2
      BalanceBase: 9940
      BalanceQuote: 8637.7405498897
- S13: Expect
  User:
      Id: 1
      BalanceBase: 9978.3840534655
      BalanceQuote: 9447.3650244664   
- S14: DecreaseLiquidity
  Action:
    Id: 2
    TokenId: 1000002
    Liquidity: 2000
  Expect:
    Pool:
      Liquidity: 5787.7314947912
      BaseVirtual: 130.2006608166
      QuoteVirtual: 0
      BaseReal: 1494.3858461098
      QuoteReal: 22415.7876916464
      IndexPipRange: 5
      MaxPip: 179999
      MinPip: 150000
      FeeGrowthBase: 0
      FeeGrowthQuote: 0
    User:
      Id: 2
      BalanceBase: 9984.9919492408
      BalanceQuote: 8637.7405498897
- S15: DecreaseLiquidity
  Action:
    Id: 2
    TokenId: 1000004
    Liquidity: 100
  Expect:
    Pool:
      Liquidity: 359.1544419067
      BaseVirtual: 8.8506292857
      QuoteVirtual: 25.6552245346
      BaseReal: 101.5842165462
      QuoteReal: 1269.8027068274
      IndexPipRange: 4
      MaxPip: 149999
      MinPip: 120000
      FeeGrowthBase: 0
      FeeGrowthQuote: 0
    User:
      Id: 2
      BalanceBase: 9987.4562454469
      BalanceQuote: 8644.8837789692
- S16: IncreaseLiquidity
  Action:
    Id: 1
    TokenId: 1000001
    Asset: base
    AmountVirtual: 10
  Expect:
    Pool:
      Liquidity: 6232.2554671344
      BaseVirtual: 140.2006608166
      QuoteVirtual: 0
      BaseReal: 1609.1614422348
      QuoteReal: 24137.4216335217
      IndexPipRange: 5
      MaxPip: 179999
      MinPip: 150000
      FeeGrowthBase: 0
      FeeGrowthQuote: 0
    User:
      Id: 1
      BalanceBase: 9968.3840534655
      BalanceQuote: 9447.3650244664
- S17: IncreaseLiquidity
  Action:
    Id: 1
    TokenId: 1000003
    Asset: base
    AmountVirtual: 100
  Expect:
    Pool:
      Liquidity: 4417.1081796009
      BaseVirtual: 108.8506292857
      QuoteVirtual: 315.5241559582
      BaseReal: 1249.3468588122
      QuoteReal: 15616.8357351519
      IndexPipRange: 4
      MaxPip: 149999
      MinPip: 120000
      FeeGrowthBase: 0
      FeeGrowthQuote: 0
    User:
      Id: 1
      BalanceBase: 9868.3840534655
      BalanceQuote: 9157.4960930428
- S18: RemoveLiquidity
  Action:
    Id: 1
    TokenId: 1000001
  Expect:
    Pool:
      Liquidity: 3725.1543298608
      BaseVirtual: 83.8009772617
      QuoteVirtual: 0
      BaseReal: 961.8307121069
      QuoteReal: 14427.4606816032
      IndexPipRange: 5 
      MaxPip: 179999 
      MinPip: 150000 
    User:
      Id: 1
      TokenId: 1000001
      Liquidity: 0
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
      BalanceBase: 9924.7837370205
      BalanceQuote: 9157.4960930428
- S19: RemoveLiquidity
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
      BalanceBase: 10071.2572227085
      BalanceQuote: 8644.8837789692
- S20: RemoveLiquidity
  Action:
    Id: 1
    TokenId: 1000003
  Expect:
    Pool:
      Liquidity: 266.8658314300
      BaseVirtual: 6.576364559
      QuoteVirtual: 19.0628376740
      BaseReal: 75.4810556285
      QuoteReal: 943.5131953557
      IndexPipRange: 4
      MaxPip: 149999 
      MinPip: 120000 
    User:
      Id: 1
      TokenId: 1000003
      Liquidity: 0
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
      BalanceBase: 10027.0580017470
      BalanceQuote: 9453.9574113270
- S21: RemoveLiquidity
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
      IndexPipRange: 4
      MaxPip: 149999 
      MinPip: 120000 
    User:
      Id: 2
      TokenId: 1000004
      Liquidity: 0
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
      BalanceBase: 10077.8335872676
      BalanceQuote: 8663.9466166431
`)
    })
    it ("Case #20", async () => {
        return testHelper.process(`
- S0: SetCurrentPrice
  Action:
    Price: 150000
- S1: AddLiquidity
  Action:
    Id: 1
    IndexPipRange: 5
    Asset: base
    AmountVirtual: 30
  Expect:
    Pool:
      Liquidity: 1333.5719170297
      BaseVirtual: 30
      QuoteVirtual: 0
      BaseReal: 344.3267883751
      QuoteReal: 5164.9018256260
      IndexPipRange: 5 
      MaxPip: 179999 
      MinPip: 150000 
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
    User:
      Id: 1
      TokenId: 1000001
      Liquidity: 1333.5719170297
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
      BaseVirtual: 30
      QuoteVirtual: 0
      BalanceBase: 9970
      BalanceQuote: 10000
- S2: AddLiquidity
  Action:
    Id: 2
    IndexPipRange: 5
    Asset: base
    AmountVirtual: 30
  Expect:
    Pool:
      Liquidity: 2667.1438340594
      BaseVirtual: 60
      QuoteVirtual: 0
      BaseReal: 688.6535767501
      QuoteReal: 10329.8036512519
      IndexPipRange: 5 
      MaxPip: 179999 
      MinPip: 150000 
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
    User:
      Id: 2
      TokenId: 1000002
      Liquidity: 1333.5719170297
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
    Liquidity: 800
  Expect:
    Pool:
      Liquidity: 1867.1438340594
      BaseVirtual: 42.0032203037
      QuoteVirtual: 0
      BaseReal: 482.0944649524
      QuoteReal: 7231.4169742860
      IndexPipRange: 5 
      MaxPip: 179999 
      MinPip: 150000 
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
    User:
      Id: 1
      BalanceBase: 9987.9967796963
      BalanceQuote: 10000
- S4: IncreaseLiquidity
  Action:
    Id: 2
    TokenId: 1000002
    Asset: base
    AmountVirtual: 30
  Expect:
    Pool:
      Liquidity: 3200.7157510891
      BaseVirtual: 72.0032203037
      QuoteVirtual: 0
      BaseReal: 826.4212533275
      QuoteReal: 12396.3187999119
      IndexPipRange: 5 
      MaxPip: 179999 
      MinPip: 150000 
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
    User:
      Id: 2
      BalanceBase: 9940
      BalanceQuote: 10000
- S5: OpenLimit
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
      BalanceBase: 9930
      BalanceQuote: 10000
- S6: AddLiquidity
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
      QuoteReal: 12133.0271754882
      IndexPipRange: 6
      MaxPip: 209999 
      MinPip: 180000 
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
    User:
      Id: 1
      TokenId: 1000003
      Liquidity: 2859.7819307028
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
      BaseVirtual: 50
      QuoteVirtual: 0
      BalanceBase: 9937.9967796963
      BalanceQuote: 10000
- S7: AddLiquidity
  Action:
    Id: 3
    IndexPipRange: 6
    Asset: base
    AmountVirtual: 20
  Expect:
    Pool:
      Liquidity: 4003.6947029839
      BaseVirtual: 70
      QuoteVirtual: 0
      BaseReal: 943.6798914269
      QuoteReal: 16986.2380456835
      IndexPipRange: 6
      MaxPip: 209999 
      MinPip: 180000 
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
    User:
      Id: 3
      TokenId: 1000004
      Liquidity: 1143.9127722811
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
      BaseVirtual: 20
      QuoteVirtual: 0
      BalanceBase: 9980
      BalanceQuote: 10000      
- S8: DecreaseLiquidity
  Action:
    Id: 1
    TokenId: 1000003
    Liquidity: 2859.7819307028
  Expect:
    Pool:
      Liquidity: 1143.9127722811
      BaseVirtual: 20
      QuoteVirtual: 0
      BaseReal: 269.6228261220
      QuoteReal: 4853.2108701953
      IndexPipRange: 6
      MaxPip: 209999 
      MinPip: 180000 
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0
    User:
      Id: 1
      BalanceBase: 9987.9967796963
      BalanceQuote: 10000
- S9: IncreaseLiquidity
  Action:
    Id: 3
    TokenId: 1000004
    Asset: base
    AmountVirtual: 10
  Expect:
    Pool:
      Liquidity: 1715.8691584217
      BaseVirtual: 30
      QuoteVirtual: 0
      BaseReal: 404.4342391829
      QuoteReal: 7279.8163052929
      IndexPipRange: 6
      MaxPip: 209999 
      MinPip: 180000 
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0
    User:
      Id: 3
      BalanceBase: 9970
      BalanceQuote: 10000
- S10: OpenMarket
  Action:
    Id: 3
    asset: base
    Side: 0
    Quantity: 112.00322030366700
  Expect:
    Pool:
      Liquidity: 1715.8691584217
      BaseVirtual: 0
      QuoteVirtual: 583.2652741249
      BaseReal: 374.4342391829
      QuoteReal: 7863.0815794179
      IndexPipRange: 6
      MaxPip: 209999
      MinPip: 180000
      FeeGrowthBase: 0
      FeeGrowthQuote: 0
    User:
      Id: 3
      BalanceBase: 10082.0032203037
      BalanceQuote: 8043.6043731620
- S11: Expect
  User:
      Id: 2
      BalanceBase: 9930
      BalanceQuote: 10000
- S12: DecreaseLiquidity
  Action:
    Id: 2
    TokenId: 1000002
    Liquidity: 2000
  Expect:
    Pool:
      Liquidity: 1200.7157510891
      BaseVirtual: 0
      QuoteVirtual: 443.8392411481
      BaseReal: 283.0122027703
      QuoteReal: 5094.1913486452
      IndexPipRange: 5 
      MaxPip: 179999 
      MinPip: 150000 
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
    User:
      Id: 2
      BalanceBase: 9930
      BalanceQuote: 10739.2911115650
- S13: DecreaseLiquidity
  Action:
    Id: 3
    TokenId: 1000004
    Liquidity: 1000
  Expect:
    Pool:
      Liquidity: 715.8691584217
      BaseVirtual: 0
      QuoteVirtual: 243.3411771959
      BaseReal: 156.2158293787
      QuoteReal: 3280.5167953695
      IndexPipRange: 6
      MaxPip: 209999
      MinPip: 180000
      FeeGrowthBase: 0
      FeeGrowthQuote: 0
    User:
      Id: 3
      BalanceBase: 10082.0032203037
      BalanceQuote: 8383.5284700911
- S14: IncreaseLiquidity
  Action:
    Id: 1
    TokenId: 1000001
    Asset: quote
    AmountVirtual: 10
  Expect:
    Pool:
      Liquidity: 1227.7686936812
      BaseVirtual: 0
      QuoteVirtual: 453.8392411481
      BaseReal: 289.3886602020
      QuoteReal: 5208.9669447702
      IndexPipRange: 5 
      MaxPip: 179999 
      MinPip: 150000 
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
    User:
      Id: 1
      BalanceBase: 9987.9967796963
      BalanceQuote: 9990
- S15: IncreaseLiquidity
  Action:
    Id: 1
    TokenId: 1000003
    Asset: quote
    AmountVirtual: 100
  Expect:
    Pool:
      Liquidity: 1010.0524802380
      BaseVirtual: 0
      QuoteVirtual: 343.3411771959
      BaseReal: 220.4120460564
      QuoteReal: 4628.6309259793
      IndexPipRange: 6
      MaxPip: 209999
      MinPip: 180000
      FeeGrowthBase: 0
      FeeGrowthQuote: 0
    User:
      Id: 1
      BalanceBase: 9987.9967796963
      BalanceQuote: 9890
- S16: RemoveLiquidity
  Action:
    Id: 1
    TokenId: 1000001
  Expect:
    Pool:
      Liquidity: 667.1438340594
      BaseVirtual: 0
      QuoteVirtual: 246.6067533277
      BaseReal: 157.2477464966
      QuoteReal: 2830.4437121648
      IndexPipRange: 5 
      MaxPip: 179999 
      MinPip: 150000 
    User:
      Id: 1
      TokenId: 1000001
      Liquidity: 0
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
      BalanceBase: 9987.9967796963
      BalanceQuote: 10097.2324878204
- S17: RemoveLiquidity
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
      BalanceBase: 9930
      BalanceQuote: 10985.8978648927
- S18: RemoveLiquidity
  Action:
    Id: 1
    TokenId: 1000003
  Expect:
    Pool:
      Liquidity: 715.8691584217
      BaseVirtual: 0
      QuoteVirtual: 243.3411771959
      BaseReal: 156.2158293787
      QuoteReal: 3280.5167953695
      IndexPipRange: 6
      MaxPip: 209999 
      MinPip: 180000 
    User:
      Id: 1
      TokenId: 1000003
      Liquidity: 0
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
      BalanceBase: 9987.9967796963
      BalanceQuote: 10197.2324878204
- S19: RemoveLiquidity
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
      IndexPipRange: 6
      MaxPip: 209999 
      MinPip: 180000 
    User:
      Id: 3
      TokenId: 1000004
      Liquidity: 0
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
      BalanceBase: 10082.0032203037
      BalanceQuote: 8626.8696472869
`)
    })
})
