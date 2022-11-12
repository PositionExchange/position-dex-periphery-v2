import {deployAndCreateRouterHelper, TestLiquidity} from "../../test-liquidity";

describe("LiquidityActionCase06-10", async function(){
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
- S2: IncreaseLiquidity
  Action:
    Id: 1
    TokenId: 1000001
    Asset: quote
    AmountVirtual: 50
  Expect:
    User:
      Id: 1
      BalanceBase: 10000
      BalanceQuote: 9900
- S3: AddLiquidity
  Action:
    Id: 2
    IndexPipRange: 4
    Asset: quote
    AmountVirtual: 50
  Expect:
    Pool:
      Liquidity: 366.8658314300
      BaseVirtual: 0
      QuoteVirtual: 150
      BaseReal: 0
      QuoteReal: 1420.8605191955
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
    it ("Case #7", async () => {
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
      BaseReal: 0
      QuoteReal: 473.6201730652
      BalanceBase: 10000
      BalanceQuote: 9950
- S2: AddLiquidity
  Action:
    Id: 2
    IndexPipRange: 4
    Asset: quote
    AmountVirtual: 40
  Expect:
    Pool:
      Liquidity: 220.1194988580
      BaseVirtual: 0
      QuoteVirtual: 90
      BaseReal: 0
      QuoteReal: 852.5163115173
      IndexPipRange: 4
      MaxPip: 149999 
      MinPip: 120000 
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
    User:
      Id: 2
      TokenId: 1000002
      Liquidity: 97.8308883813
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
      BaseReal: 0
      QuoteReal: 378.8961384521
      BalanceBase: 10000
      BalanceQuote: 9960
- S3: AddLiquidity
  Action:
    Id: 3
    IndexPipRange: 4
    Asset: quote
    AmountVirtual: 50
  Expect:
    Pool:
      Liquidity: 342.4081093347
      BaseVirtual: 0
      QuoteVirtual: 140
      BaseReal: 0
      QuoteReal: 1326.1364845825
      IndexPipRange: 4
      MaxPip: 149999 
      MinPip: 120000 
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
    User:
      Id: 3
      TokenId: 1000003
      Liquidity: 122.2886104767
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
      BaseReal: 0
      QuoteReal: 473.6201730652
      BalanceBase: 10000
      BalanceQuote: 9950
- S4: OpenLimit
  Action:
    Id: 2
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
      Id: 2
      BalanceBase: 10000
      BalanceQuote: 9835
- S5: IncreaseLiquidity
  Action:
    Id: 1
    TokenId: 1000001
    Asset: quote
    AmountVirtual: 50
  Expect:
    User:
      Id: 1
      BalanceBase: 10000
      BalanceQuote: 9900
- S6: OpenMarket
  Action:
    Id: 3
    asset: base
    Side: 1
    Quantity: 16.4515036358
  Expect:
    Pool:
      Liquidity: 464.6967198113
      BaseVirtual: 11.4515036358
      QuoteVirtual: 33.1943512210
      BaseReal: 131.4360807095
      QuoteReal: 1642.9510088687
      IndexPipRange: 4
      MaxPip: 149999
      MinPip: 120000
      FeeGrowthBase: 0
      FeeGrowthQuote: 0
    User:
      Id: 3
      BalanceBase: 9983.5484963642
      BalanceQuote: 10169.3056487790
- S7: Expect
  User:
    Id: 2
    BalanceBase: 10000
    BalanceQuote: 9835     
- S8: IncreaseLiquidity
  Action:
    Id: 2
    TokenId: 1000002
    Asset: base
    AmountVirtual: 10
  Expect:
    User:
      Id: 2
      BalanceBase: 9990
      BalanceQuote: 9806.0131068576
- S9: RemoveLiquidity
  Action:
    Id: 1
    TokenId: 1000001
  Expect:
    Pool:
      Liquidity: 625.9148726274
      BaseVirtual: 15.4243964591
      QuoteVirtual: 44.7105331944
      BaseReal: 177.0354603521
      QuoteReal: 2212.9432544018
      IndexPipRange: 4
      MaxPip: 149999 
      MinPip: 120000 
    User:
      Id: 1
      TokenId: 1000001
      Liquidity: 0
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
      BalanceBase: 10006.0271071767
      BalanceQuote: 9917.4707111690
- S10: RemoveLiquidity
  Action:
    Id: 2
    TokenId: 1000002
  Expect:
    Pool:
      Liquidity: 122.2886104767
      BaseVirtual: 3.013553588
      QuoteVirtual: 8.7353555845
      BaseReal: 34.5884422920
      QuoteReal: 432.3555286497
      IndexPipRange: 4
      MaxPip: 149999 
      MinPip: 120000 
    User:
      Id: 2
      TokenId: 1000002
      Liquidity: 0
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
      BalanceBase: 10002.4108428707
      BalanceQuote: 9841.9882844676
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
      IndexPipRange: 4 
      MaxPip: 149999 
      MinPip: 120000 
    User:
      Id: 3
      TokenId: 1000003
      Liquidity: 0
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
      BalanceBase: 9986.5620499526
      BalanceQuote: 10178.0410043634
`)
    })
    it ("Case #8", async () => {
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
      TokenId: 1000001
      Liquidity: 9541.9238831013
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
      BaseVirtual: 100
      QuoteVirtual: 1803.7657501839
      BalanceBase: 9900
      BalanceQuote: 8196.2342498161
- S2: AddLiquidity
  Action:
    Id: 2
    IndexPipRange: 5
    Asset: base
    AmountVirtual: 50
  Expect:
    Pool:
      Liquidity: 14312.8858246520
      BaseVirtual: 150
      QuoteVirtual: 2705.6486252758
      BaseReal: 3523.5889127467
      QuoteReal: 58139.2170603210
      IndexPipRange: 5 
      MaxPip: 179999 
      MinPip: 150000 
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
    User:
      Id: 2
      TokenId: 1000002
      Liquidity: 4770.9619415507
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
      BaseVirtual: 50
      QuoteVirtual: 901.8828750919
      BalanceBase: 9950
      BalanceQuote: 9098.1171249081
- S3: DecreaseLiquidity
  Action:
    Id: 1
    TokenId: 1000001
    Liquidity: 5000
  Expect:
    User:
      Id: 1
      BalanceBase: 9952.4003341596
      BalanceQuote: 9141.4135303689
- S4: RemoveLiquidity
  Action:
    Id: 1
    TokenId: 1000001
  Expect:
    Pool:
      Liquidity: 4770.9619415507
      BaseVirtual: 50
      QuoteVirtual: 901.8828750919
      BaseReal: 1174.5296375822
      QuoteReal: 19379.7390201070
      IndexPipRange: 5 
      MaxPip: 179999 
      MinPip: 150000 
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
`)
    })
    it ("Case #9", async () => {
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
      TokenId: 1000001
      Liquidity: 9541.9238831013
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
      BaseVirtual: 100
      QuoteVirtual: 1803.7657501839
      BalanceBase: 9900
      BalanceQuote: 8196.2342498161
- S2: OpenLimit
  Action:
    Id: 2
    Asset: base
    Side: 1
    Quantity: 10
    Price: 200000
  Expect:
    PendingOrder:
      OrderId: 1
      Price: 200000
      Size : 10
      Side: 1
    User:
      Id: 2
      BalanceBase: 9990
      BalanceQuote: 10000
- S3: OpenMarket
  Action:
    Id: 3
    asset: base
    Side: 0
    Quantity: 34.8028021274
  Expect:
    Pool:
      Liquidity: 9541.9238831013
      BaseVirtual: 65.1971978726
      QuoteVirtual: 2386.6477516003
      BaseReal: 2314.2564730371
      QuoteReal: 39342.3600416305
      IndexPipRange: 5
      MaxPip: 179999
      MinPip: 150000
      FeeGrowthBase: 0
      FeeGrowthQuote: 0
    User:
      Id: 3
      BalanceBase: 10034.8028021274
      BalanceQuote: 9417.1179985836
- S4: AddLiquidity
  Action:
    Id: 2
    IndexPipRange: 5
    Asset: base
    AmountVirtual: 50
  Expect:
    Pool:
      Liquidity: 16859.6646713993
      BaseVirtual: 115.1971978726
      QuoteVirtual: 4216.9777577028
      BaseReal: 4089.0693089808
      QuoteReal: 69514.1782526738
      IndexPipRange: 5 
      MaxPip: 179999 
      MinPip: 150000 
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
    User:
      Id: 2
      TokenId: 1000002
      Liquidity: 7317.7407882980
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
      BaseVirtual: 50
      QuoteVirtual: 1830.3300061024
      BalanceBase: 9940
      BalanceQuote: 8169.6699938976
- S5: DecreaseLiquidity
  Action:
    Id: 1
    TokenId: 1000001
    Liquidity: 5000
  Expect:
    User:
      Id: 1
      BalanceBase: 9934.1635495479
      BalanceQuote: 9446.8456468673
- S6: OpenMarket
  Action:
    Id: 3
    asset: base
    Side: 0
    Quantity: 86.0336483247
  Expect:
    Pool:
      Liquidity: 11859.6646713993
      BaseVirtual: 0
      QuoteVirtual: 4383.8723388532
      BaseReal: 2795.3575354745
      QuoteReal: 50316.1561027872
      IndexPipRange: 5
      MaxPip: 179999
      MinPip: 150000
      FeeGrowthBase: 0
      FeeGrowthQuote: 0
    User:
      Id: 3
      BalanceBase: 10120.8364504521
      BalanceQuote: 7899.6120203818
- S7: Expect
  User:
    Id: 2
    BalanceBase: 9940
    BalanceQuote: 8169.6699938976
- S8: DecreaseLiquidity
  Action:
    Id: 2
    TokenId: 1000002
    Liquidity: 2000
  Expect:
    User:
      Id: 2
      BalanceBase: 9940
      BalanceQuote: 8908.9611054626
- S9: RemoveLiquidity
  Action:
    Id: 1
    TokenId: 1000001
  Expect:
    Pool:
      Liquidity: 5317.7407882980
      BaseVirtual: 0
      QuoteVirtual: 1965.6792491976
      BaseReal: 1253.4070056902
      QuoteReal: 22561.2007617236
      IndexPipRange: 5 
      MaxPip: 179999 
      MinPip: 150000 
    User:
      Id: 1
      TokenId: 1000001
      Liquidity: 0
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
      BalanceBase: 9934.1635495479
      BalanceQuote: 11125.7476249580
- S10: RemoveLiquidity
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
      BalanceBase: 9940
      BalanceQuote: 10874.6403546601
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
    Asset: base
    AmountVirtual: 100
  Expect:
    Pool:
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
      TokenId: 1000001
      Liquidity: 9541.9238831013
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
      BaseVirtual: 100
      QuoteVirtual: 1803.7657501839
      BalanceBase: 9900
      BalanceQuote: 8196.2342498161
- S2: OpenLimit
  Action:
    Id: 2
    Asset: base
    Side: 0
    Quantity: 10
    Price: 140000
  Expect:
    PendingOrder:
      OrderId: 1
      Price: 140000
      Size : 10
      Side: 0
    User:
      Id: 2
      BalanceBase: 10000
      BalanceQuote: 9860
- S3: OpenMarket
  Action:
    Id: 3
    asset: base
    Side: 1
    Quantity: 36.4216956108
  Expect:
    Pool:
      Liquidity: 9541.9238831013
      BaseVirtual: 136.4216956108
      QuoteVirtual: 1211.9832423751
      BaseReal: 2385.4809707753
      QuoteReal: 38167.6955324052
      IndexPipRange: 5
      MaxPip: 179999
      MinPip: 150000
      FeeGrowthBase: 0
      FeeGrowthQuote: 0
    User:
      Id: 3
      BalanceBase: 9963.5783043892
      BalanceQuote: 10591.7825078088
- S4: AddLiquidity
  Action:
    Id: 2
    IndexPipRange: 5
    Asset: base
    AmountVirtual: 50
  Expect:
    Pool:
      Liquidity: 13039.1403047183
      BaseVirtual: 186.4216956108
      QuoteVirtual: 1656.1879698373
      BaseReal: 3259.7850761796
      QuoteReal: 52156.5612188733
      IndexPipRange: 5 
      MaxPip: 179999 
      MinPip: 150000 
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
    User:
      Id: 2
      TokenId: 1000002
      Liquidity: 3497.2164216170
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
      BaseVirtual: 50
      QuoteVirtual: 444.2047274623
      BalanceBase: 9950
      BalanceQuote: 9415.7952725377
- S5: DecreaseLiquidity
  Action:
    Id: 1
    TokenId: 1000001
    Liquidity: 5000
  Expect:
    User:
      Id: 1
      BalanceBase: 9971.4854243663
      BalanceQuote: 8831.3175187790
- S6: OpenMarket
  Action:
    Id: 3
    asset: base
    Side: 1
    Quantity: 70.9120250203
  Expect:
    User:
      Id: 3
      BalanceBase: 9892.6662793688
      BalanceQuote: 11682.8872086832
- S7: Expect
  User:
    Id: 2
    BalanceBase: 9950
    BalanceQuote: 9415.7952725377
- S8: DecreaseLiquidity
  Action:
    Id: 2
    TokenId: 1000002
    Liquidity: 2000
  Expect:
    User:
      Id: 2
      BalanceBase: 9994.9919492408
      BalanceQuote: 9415.7952725377
- S9: RemoveLiquidity
  Action:
    Id: 1
    TokenId: 1000001
  Expect:
    Pool:
      Liquidity: 1497.2164216170
      BaseVirtual: 33.6813426220
      QuoteVirtual: 0
      BaseReal: 386.5796177727
      QuoteReal: 5798.6942665911
      IndexPipRange: 5 
      MaxPip: 179999 
      MinPip: 150000 
    User:
      Id: 1
      TokenId: 1000001
      Liquidity: 0
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
      BalanceBase: 10073.6604287684
      BalanceQuote: 8831.3175187790
- S10: RemoveLiquidity
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
      BalanceBase: 10028.6732918628
      BalanceQuote: 9415.7952725377
`)
    })

})
