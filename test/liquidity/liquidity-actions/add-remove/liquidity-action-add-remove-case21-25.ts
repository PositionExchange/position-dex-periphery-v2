import {deployAndCreateRouterHelper, TestLiquidity} from "../../test-liquidity";

describe("LiquidityActionAddRemoveCase21-25", async function(){
    let testHelper: TestLiquidity

    beforeEach(async () => {
        testHelper = await deployAndCreateRouterHelper(10_000, false)
    })

    it ("Case #21", async () => {
        return testHelper.process(`
- S0: SetCurrentPrice
  Action:
    Price: 179999
- S1: AddLiquidity
  Action:
    Id: 1
    IndexPipRange: 5
    Asset: quote
    AmountVirtual: 30
  Expect:
    Pool:
      Liquidity: 81.1588277762
      BaseVirtual: 0
      QuoteVirtual: 30
      BaseReal: 19.1293722951
      QuoteReal: 344.3267883751
      IndexPipRange: 5 
      MaxPip: 179999 
      MinPip: 150000 
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
    User:
      Id: 1
      TokenId: 1000001
      Liquidity: 81.1588277762
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
      BaseVirtual: 0
      QuoteVirtual: 30
      BalanceBase: 10000
      BalanceQuote: 9970
- S2: AddLiquidity
  Action:
    Id: 2
    IndexPipRange: 5
    Asset: quote
    AmountVirtual: 30
  Expect:
    Pool:
      Liquidity: 162.3176555525
      BaseVirtual: 0
      QuoteVirtual: 60
      BaseReal: 38.2587445903
      QuoteReal: 688.6535767501
      IndexPipRange: 5 
      MaxPip: 179999 
      MinPip: 150000 
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
    User:
      Id: 2
      TokenId: 1000002
      Liquidity: 81.1588277762
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
      BaseVirtual: 0
      QuoteVirtual: 30
      BalanceBase: 10000
      BalanceQuote: 9970
- S3: DecreaseLiquidity
  Action:
    Id: 1
    TokenId: 1000001
    Liquidity: 10
  Expect:
    Pool:
      Liquidity: 152.3176555525
      BaseVirtual: 0
      QuoteVirtual: 56.3035444422
      BaseReal: 35.9017154390
      QuoteReal: 646.2272877302
      IndexPipRange: 5 
      MaxPip: 179999 
      MinPip: 150000 
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
    User:
      Id: 1
      BalanceBase: 10000
      BalanceQuote: 9973.6964555578
- S4: IncreaseLiquidity
  Action:
    Id: 2
    TokenId: 1000002
    Asset: quote
    AmountVirtual: 10
  Expect:
    Pool:
      Liquidity: 179.3705981445
      BaseVirtual: 0
      QuoteVirtual: 66.3035444422
      BaseReal: 42.2781728707
      QuoteReal: 761.0028838552
      IndexPipRange: 5 
      MaxPip: 179999 
      MinPip: 150000 
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0
    User:
      Id: 2
      BalanceBase: 10000
      BalanceQuote: 9960
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
      BalanceBase: 10000
      BalanceQuote: 9830
- S6: OpenLimit
  Action:
    Id: 1
    Asset: base
    Side: 0
    Quantity: 10.001
    Price: 125000
  Expect:
    PendingOrder:
      OrderId: 1
      Price: 125000
      Size : 10.001
      Side: 0
    User:
      Id: 1
      BalanceBase: 10000
      BalanceQuote: 9848.6964555578
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
      BalanceBase: 10000
      BalanceQuote: 9798.6964555578
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
      BalanceBase: 10000
      BalanceQuote: 9780
- S9: DecreaseLiquidity
  Action:
    Id: 1
    TokenId: 1000003
    Liquidity: 122.2886104767
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
      BalanceBase: 10000
      BalanceQuote: 9848.6964555578
- S10: IncreaseLiquidity
  Action:
    Id: 2
    TokenId: 1000004
    Asset: quote
    AmountVirtual: 100
  Expect:
    Pool:
      Liquidity: 366.8658314300
      BaseVirtual: 0
      QuoteVirtual: 150
      BaseReal: 94.7246661108
      QuoteReal: 1420.8605191955
      IndexPipRange: 4
      MaxPip: 149999 
      MinPip: 120000 
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0
    User:
      Id: 2
      BalanceBase: 10000
      BalanceQuote: 9680
- S11: OpenMarket
  Action:
    Id: 3
    asset: base
    Side: 1
    Quantity: 35.21549357899340
  Expect:
    Pool:
      Liquidity: 366.8658314300
      BaseVirtual: 13.9929080152
      QuoteVirtual: 0
      BaseReal: 105.9050432663
      QuoteReal: 1270.8605191955
      IndexPipRange: 4
      MaxPip: 149999
      MinPip: 120000
      FeeGrowthBase: 0
      FeeGrowthQuote: 0
    User:
      Id: 3
      BalanceBase: 9964.7845064210
      BalanceQuote: 10471.3035444422
- S12: Expect
  User:
      Id: 2
      BalanceBase: 10000
      BalanceQuote: 9680
- S13: Expect
  User:
      Id: 1
      BalanceBase: 10000
      BalanceQuote: 9848.6964555578
- S14: DecreaseLiquidity
  Action:
    Id: 2
    TokenId: 1000002
    Liquidity: 20
  Expect:
    Pool:
      Liquidity: 159.3705981445
      BaseVirtual: 3.5851969311
      QuoteVirtual: 0
      BaseReal: 41.1493114993
      QuoteReal: 617.2396724889
      IndexPipRange: 5
      MaxPip: 179999
      MinPip: 150000
      FeeGrowthBase: 0
      FeeGrowthQuote: 0
    User:
      Id: 2
      BalanceBase: 10000.4499194924
      BalanceQuote: 9680
- S15: DecreaseLiquidity
  Action:
    Id: 2
    TokenId: 1000004
    Liquidity: 100
  Expect:
    Pool:
      Liquidity: 266.8658314300
      BaseVirtual: 8.1328387374
      QuoteVirtual: 0
      BaseReal: 77.0375298068
      QuoteReal: 924.4503576818
      IndexPipRange: 4
      MaxPip: 149999
      MinPip: 120000
      FeeGrowthBase: 0
      FeeGrowthQuote: 0
    User:
      Id: 2
      BalanceBase: 10003.4974579104
      BalanceQuote: 9680
- S16: IncreaseLiquidity
  Action:
    Id: 1
    TokenId: 1000001
    Asset: base
    AmountVirtual: 10
  Expect:
    Pool:
      Liquidity: 603.8945704878
      BaseVirtual: 13.5851969311
      QuoteVirtual: 0
      BaseReal: 155.9249076243
      QuoteReal: 2338.8736143642
      IndexPipRange: 5
      MaxPip: 179999
      MinPip: 150000
      FeeGrowthBase: 0
      FeeGrowthQuote: 0
    User:
      Id: 1
      BalanceBase: 9990
      BalanceQuote: 9848.6964555578
- S17: IncreaseLiquidity
  Action:
    Id: 1
    TokenId: 1000003
    Asset: base
    AmountVirtual: 100
  Expect:
    Pool:
      Liquidity: 3548.2026443838
      BaseVirtual: 108.1328387374
      QuoteVirtual: 0
      BaseReal: 1024.2778759372
      QuoteReal: 12291.3345112461
      IndexPipRange: 4
      MaxPip: 149999
      MinPip: 120000
      FeeGrowthBase: 0
      FeeGrowthQuote: 0
    User:
      Id: 1
      BalanceBase: 9890
      BalanceQuote: 9848.6964555578
- S18: RemoveLiquidity
  Action:
    Id: 1
    TokenId: 1000001
  Expect:
    Pool:
      Liquidity: 88.2117703683
      BaseVirtual: 1.9844097474
      QuoteVirtual: 0
      BaseReal: 22.7761811717
      QuoteReal: 341.6427175759
      IndexPipRange: 5 
      MaxPip: 179999 
      MinPip: 150000 
    User:
      Id: 1
      TokenId: 1000001
      Liquidity: 0
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
      BalanceBase: 9901.6007871837
      BalanceQuote: 9848.6964555578
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
      BalanceBase: 10005.4818676579
      BalanceQuote: 9680
- S20: RemoveLiquidity
  Action:
    Id: 1
    TokenId: 1000003
  Expect:
    Pool:
      Liquidity: 266.8658314300
      BaseVirtual: 8.1328387374
      QuoteVirtual: 0
      BaseReal: 77.0375298068
      QuoteReal: 924.4503576818
      IndexPipRange: 4
      MaxPip: 149999 
      MinPip: 120000 
    User:
      Id: 1
      TokenId: 1000003
      Liquidity: 0
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
      BalanceBase: 10001.6007871837
      BalanceQuote: 9848.6964555578
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
      BalanceBase: 10013.6147063953
      BalanceQuote: 9680
`)
    })
})
