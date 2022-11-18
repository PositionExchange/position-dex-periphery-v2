import {deployAndCreateRouterHelper, TestLiquidity} from "../../test-liquidity";

describe("ShiftRangeCase36-40", async function() {
    let testHelper: TestLiquidity

    beforeEach(async () => {
        testHelper = await deployAndCreateRouterHelper(10_000, false)
    })

    it("Case #36", async () => {
        return testHelper.process(`
- S0: SetCurrentPrice
  Action:
    Price: 165000
- S1: OpenLimit
  Action:
    Id: 1
    Asset: base
    Side: 0
    Quantity: 10
    Price: 150000
  Expect:
    PendingOrder:
      OrderId: 1
      Price: 150000
      Size : 10
      Side: 0
    User:
      Id: 1
      BalanceBase: 10000
      BalanceQuote: 9850
- S2: OpenMarket
  Action:
    Id: 2
    asset: base
    Side: 1
    Quantity: 10
  Expect:
    User:
      Id: 2
      BalanceBase: 9990\t
      BalanceQuote: 10150
- S3: AddLiquidity
  Action:
    Id: 1
    IndexPipRange: 5
    Asset: base
    AmountVirtual: 100
  Expect:
    Pool:
      Liquidity: 4445.2397234324
      BaseVirtual: 100
      QuoteVirtual: 0
      BaseReal: 1147.7559612502
      QuoteReal: 17216.3394187532
      IndexPipRange: 5
      MaxPip: 179999 
      MinPip: 150000 
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
    User:
      Id: 1
      TokenId: 1000001
      Liquidity: 4445.2397234324
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
      BaseVirtual: 100
      QuoteVirtual: 0
      BalanceBase: 9900
      BalanceQuote: 9850
- S4: AddLiquidity
  Action:
    Id: 1
    IndexPipRange: 5
    Asset: base
    AmountVirtual: 30
  Expect:
    Pool:
      Liquidity: 5778.8116404621
      BaseVirtual: 130
      QuoteVirtual: 0
      BaseReal: 1492.0827496253
      QuoteReal: 22381.2412443791
      IndexPipRange: 5
      MaxPip: 179999 
      MinPip: 150000 
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
    User:
      Id: 1
      TokenId: 1000002
      Liquidity: 1333.5719170297
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
      BaseVirtual: 30
      QuoteVirtual: 0
      BalanceBase: 9870
      BalanceQuote: 9850
- S5: AddLiquidity
  Action:
    Id: 2
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
      Id: 2
      TokenId: 1000003
      Liquidity: 122.2886104767
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
      BaseVirtual: 0
      QuoteVirtual: 50
      BalanceBase: 9990
      BalanceQuote: 10100
- S6: OpenLimit
  Action:
    Id: 2
    Asset: base
    Side: 1
    Quantity: 120
    Price: 160000
  Expect:
    PendingOrder:
      OrderId: 1
      Price: 160000
      Size : 120
      Side: 1
    User:
      Id: 2
      BalanceBase: 9870
      BalanceQuote: 10100
- S7: AddLiquidity
  Action:
    Id: 2
    IndexPipRange: 6
    Asset: base
    AmountVirtual: 100
  Expect:
    Pool:
      Liquidity: 5719.5638614056
      BaseVirtual: 100
      QuoteVirtual: 0
      BaseReal: 1348.1141306098
      QuoteReal: 24266.0543509765
      IndexPipRange: 6
      MaxPip: 209999 
      MinPip: 180000 
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
    User:
      Id: 2
      TokenId: 1000004
      Liquidity: 5719.5638614056
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
      BaseVirtual: 100
      QuoteVirtual: 0
      BalanceBase: 9770
      BalanceQuote: 10100
- S8: DecreaseLiquidity
  Action:
    Id: 1
    TokenId: 1000001
    Liquidity: 1000
  Expect:
    Pool:
      Liquidity: 4778.8116404621
      BaseVirtual: 107.5040253796
      QuoteVirtual: 0
      BaseReal: 1233.8838598781
      QuoteReal: 18508.2578981717
      IndexPipRange: 5 
      MaxPip: 179999 
      MinPip: 150000 
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
    User:
      Id: 1
      BalanceBase: 9892.4959746204
      BalanceQuote: 9850
- S9: IncreaseLiquidity
  Action:
    Id: 2
    TokenId: 1000003
    Asset: quote
    AmountVirtual: 20
  Expect:
    Pool:
      Liquidity: 171.2038916156
      BaseVirtual: 0
      QuoteVirtual: 70
      BaseReal: 44.2048441850
      QuoteReal: 663.0682422913
      IndexPipRange: 4
      MaxPip: 149999 
      MinPip: 120000 
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0
    User:
      Id: 2
      BalanceBase: 9770
      BalanceQuote: 10080
- S10: OpenLimit
  Action:
    Id: 3
    Asset: base
    Side: 0
    Quantity: 100
    Price: 130000
  Expect:
    PendingOrder:
      OrderId: 1
      Price: 130000
      Size : 100
      Side: 0
    User:
      Id: 3
      BalanceBase: 10000
      BalanceQuote: 8700
- S11: AddLiquidity
  Action:
    Id: 4
    IndexPipRange: 4
    Asset: quote
    AmountVirtual: 100
  Expect:
    Pool:
      Liquidity: 415.7802973102
      BaseVirtual: 0
      QuoteVirtual: 170
      BaseReal: 107.3546215923
      QuoteReal: 1610.3085884216
      IndexPipRange: 4
      MaxPip: 149999 
      MinPip: 120000 
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
    User:
      Id: 4
      TokenId: 1000005
      Liquidity: 244.5764056946
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
      BaseVirtual: 0
      QuoteVirtual: 50
      BalanceBase: 10000
      BalanceQuote: 9900
- S12: OpenMarket
  Action:
    Id: 3
    asset: base
    Side: 1
    Quantity: 5
  Expect:
    Pool:
      Liquidity: 415.7802973102
      BaseVirtual: 5
      QuoteVirtual: 98.3381241643
      BaseReal: 112.3546215923
      QuoteReal: 1538.6467125859
      IndexPipRange: 4
      MaxPip: 149999 
      MinPip: 120000 
      FeeGrowthBase: 0
      FeeGrowthQuote: 0
    User:
      Id: 3
      BalanceBase: 9995
      BalanceQuote: 8771.6618758357
- S13: RemoveLiquidity
  Action:
    Id: 2
    TokenId: 1000003
  Expect:
    Pool:
      Liquidity: 244.5772209533
      BaseVirtual: 2.9411764706
      QuoteVirtual: 57.8459553908
      BaseReal: 66.0909538778
      QuoteReal: 905.0863015211
      IndexPipRange: 4
      MaxPip: 149999 
      MinPip: 120000
    User:
      Id: 2
      BalanceBase: 9772.05882352941
      BalanceQuote: 10120.49216877350
- S14: ShiftRange
  Action:
    Id: 1
    TargetIndexPipRange: 4
    TokenId: 1000001
    Asset: quote
    AmountVirtual: 900
  Expect:
    Pool:
      Liquidity: 4049.8475699515
      BaseVirtual: 48.7016588699
      QuoteVirtual: 957.8459553908
      BaseReal: 1094.3712906478
      QuoteReal: 14986.9294635213
      IndexPipRange: 4
      MaxPip: 149999 
      MinPip: 120000 
      FeeGrowthBase: 0
      FeeGrowthQuote: 0 
    User:
      Id: 1
      BalanceBase: 9924.2395176007
      BalanceQuote: 8950
- S15: OpenLimit
  Action:
    Id: 1
    Asset: base
    Side: 1
    Quantity: 100
    Price: 200000
  Expect:
    PendingOrder:
      OrderId: 1
      Price: 200000
      Size : 100
      Side: 1
    User:
      Id: 1
      BalanceBase: 9824.2395176007
      BalanceQuote: 8950
- S16: IncreaseLiquidity
  Action:
    Id: 2
    TokenId: 1000004
    Asset: base
    AmountVirtual: 20
  Expect:
    Pool:
      Liquidity: 6863.4766336867
      BaseVirtual: 120
      QuoteVirtual: 0
      BaseReal: 1617.7369567318
      QuoteReal: 29119.2652211718
      IndexPipRange: 6
      MaxPip: 209999 
      MinPip: 180000 
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0
    User:
      Id: 2
      BalanceBase: 9752.0588235294
      BalanceQuote: 10120.4921687735
- S17: AddLiquidity
  Action:
    Id: 2
    IndexPipRange: 5
    Asset: base
    AmountVirtual: 100
  Expect:
    Pool:
      Liquidity: 5778.8116404621
      BaseVirtual: 130
      QuoteVirtual: 0
      BaseReal: 1492.0827496253
      QuoteReal: 22381.2412443791
      IndexPipRange: 5
      MaxPip: 179999 
      MinPip: 150000 
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
    User:
      Id: 2
      TokenId: 1000006
      Liquidity: 4445.2397234324
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
      BaseVirtual: 100
      QuoteVirtual: 0
      BalanceBase: 9652.0588235294
      BalanceQuote: 10120.4921687735
- S18: OpenMarket
  Action:
    Id: 3
    asset: base
    Side: 0
    Quantity: 475
  Expect:
    Pool:
      Liquidity: 6863.4766336867
      BaseVirtual: 36.9830747587
      QuoteVirtual: 1575.1354086381
      BaseReal: 1534.7200314905
      QuoteReal: 30694.4006298098
      IndexPipRange: 6
      MaxPip: 209999 
      MinPip: 180000 
      FeeGrowthBase: 0
      FeeGrowthQuote: 0
    User:
      Id: 3
      BalanceBase: 10470
      BalanceQuote: 576.7756626348
- S19: RemoveLiquidity
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
      BalanceBase: 9689.0418982881
      BalanceQuote: 11695.6275774116
- S20: DecreaseLiquidity
  Action:
    Id: 1
    TokenId: 1000001
    Liquidity: 3805.2703489981
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
      Id: 1
      BalanceBase: 9824.2395176007
      BalanceQuote: 10505.8564015756
- S21: ShiftRange
  Action:
    Id: 4
    TargetIndexPipRange: 6
    TokenId: 1000005
    Asset: base
    AmountVirtual: 2
  Expect:
    Pool:
      Liquidity: 371.1685238971
      BaseVirtual: 2
      QuoteVirtual: 85.1814198205
      BaseReal: 82.9958050542
      QuoteReal: 1659.9161010844
      IndexPipRange: 6
      MaxPip: 209999 
      MinPip: 180000 
      FeeGrowthBase: 0
      FeeGrowthQuote: 0 
    User:
      Id: 4
      BalanceBase: 9998
      BalanceQuote: 9914.8185801795
- S22: IncreaseLiquidity
  Action:
    Id: 1
    TokenId: 1000002
    Asset: quote
    AmountVirtual: 50
  Expect:
    Pool:
      Liquidity: 5914.0763534225
      BaseVirtual: 0
      QuoteVirtual: 2186.1120406009
      BaseReal: 1393.9650367838
      QuoteReal: 25091.2312656051
      IndexPipRange: 5
      MaxPip: 179999 
      MinPip: 150000 
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0
    User:
      Id: 1
      BalanceBase: 9824.2395176007
      BalanceQuote: 10455.8564015756
- S23: RemoveLiquidity
  Action:
    Id: 2
    TokenId: 1000006
  Expect:
    Pool:
      Liquidity: 1468.8366299901
      BaseVirtual: 0
      QuoteVirtual: 542.9489324464
      BaseReal: 346.2090755336
      QuoteReal: 6231.7287386974
      IndexPipRange: 5
      MaxPip: 179999 
      MinPip: 150000
    User:
      Id: 2
      BalanceBase: 9689.0418982881
      BalanceQuote: 13338.7906855661
- S24: RemoveLiquidity
  Action:
    Id: 1
    TokenId: 1000001
  Expect:
    Pool:
      Liquidity: 1468.8366299901
      BaseVirtual: 0
      QuoteVirtual: 542.9489324464
      BaseReal: 346.2090755336
      QuoteReal: 6231.7287386974
      IndexPipRange: 5
      MaxPip: 179999 
      MinPip: 150000
    User:
      Id: 1
      BalanceBase: 9824.2395176007
      BalanceQuote: 10455.8564015756
- S25: RemoveLiquidity
  Action:
    Id: 1
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
      Id: 1
      BalanceBase: 9824.2395176007
      BalanceQuote: 10998.8053340219
- S26: RemoveLiquidity
  Action:
    Id: 4
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
      Id: 4
      BalanceBase: 10000
      BalanceQuote: 10000`
        )
    })
})