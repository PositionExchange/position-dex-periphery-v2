import {deployAndCreateRouterHelper, TestLiquidity} from "../../test-liquidity";

describe("ShiftRangeCase30-35", async function(){
    let testHelper: TestLiquidity

    beforeEach(async () => {
        testHelper = await deployAndCreateRouterHelper(10_000, false)
    })

    it ("Case #32", async () => {
        return testHelper.process(`
- S0: SetCurrentPrice
  Action:
    Price: 165000
- S1: AddLiquidity
  Action:
    Id: 1
    IndexPipRange: 7
    Asset: base
    AmountVirtual: 100
  Expect:
    Pool:
      Liquidity: 7095.5602949328
      BaseVirtual: 100
      QuoteVirtual: 0
      BaseReal: 1548.3781976025\t
      QuoteReal: 32515.9421496526
      IndexPipRange: 7
      MaxPip: 239999 
      MinPip: 210000 
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
    User:
      Id: 1
      TokenId: 1000001
      Liquidity: 7095.5602949328
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
      BaseVirtual: 100
      QuoteVirtual: 0
      BalanceBase: 9900
      BalanceQuote: 10000
- S2: AddLiquidity
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
      TokenId: 1000002
      Liquidity: 5719.5638614056
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
      BaseVirtual: 100
      QuoteVirtual: 0
      BalanceBase: 9900
      BalanceQuote: 10000
- S3: ShiftRange
  Action:
    Id: 1
    TargetIndexPipRange: 6
    TokenId: 1000001
    Asset: base
    AmountVirtual: 0
  Expect:
    Pool:
      Liquidity: 11439.1277228112
      BaseVirtual: 200
      QuoteVirtual: 0
      BaseReal: 2696.2282612196
      QuoteReal: 48532.1087019529
      IndexPipRange: 6
      MaxPip: 209999 
      MinPip: 180000 
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
    User:
      Id: 1
      BalanceBase: 9900
      BalanceQuote: 10000
- S4: Expect
  Pool:
      Liquidity: 0
      BaseVirtual: 0
      QuoteVirtual: 0
      BaseReal: 0
      QuoteReal: 0
      IndexPipRange: 7
      MaxPip: 239999 
      MinPip: 210000 
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
- S5: RemoveLiquidity
  Action:
    Id: 1
    TokenId: 1000001
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
    User:
      Id: 1
      TokenId: 1000001
      Liquidity: 0
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
      BalanceBase: 10000
      BalanceQuote: 10000
- S6: ShiftRange
  Action:
    Id: 2
    TargetIndexPipRange: 7
    TokenId: 1000002
    Asset: base
    AmountVirtual: 0
  Expect:
    Pool:
      Liquidity: 7095.5602949328
      BaseVirtual: 100
      QuoteVirtual: 0
      BaseReal: 1548.3781976025
      QuoteReal: 32515.9421496527
      IndexPipRange: 7
      MaxPip: 239999 
      MinPip: 210000 
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
    User:
      Id: 2
      BalanceBase: 9900
      BalanceQuote: 10000
- S7: Expect
  Pool:
      Liquidity: 0
      BaseVirtual: 0
      QuoteVirtual: 0
      BaseReal: 0
      QuoteReal: 0
      IndexPipRange: 6
      MaxPip: 209999 
      MinPip: 180000 
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0       
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
      IndexPipRange: 7
      MaxPip: 239999 
      MinPip: 210000 
    User:
      Id: 2
      TokenId: 1000002
      Liquidity: 0
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
      BalanceBase: 10000
      BalanceQuote: 10000`
        )
    })
    it ("Case #34", async () => {
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
    Quantity: 120
    Price: 150000
  Expect:
    PendingOrder:
      OrderId: 1
      Price: 150000
      Size : 120
      Side: 0
    User:
      Id: 2
      BalanceBase: 10000
      BalanceQuote: 8150
- S4: AddLiquidity
  Action:
    Id: 1
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
      Id: 1
      TokenId: 1000003
      Liquidity: 5719.5638614056
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
      BaseVirtual: 100
      QuoteVirtual: 0
      BalanceBase: 9800
      BalanceQuote: 8196.2342498161
- S5: DecreaseLiquidity
  Action:
    Id: 1
    TokenId: 1000001
    Liquidity: 1000
  Expect:
    Pool:
      Liquidity: 8541.9238831013
      BaseVirtual: 89.5199331681
      QuoteVirtual: 1614.7298940733
      BaseReal: 2102.8762932058
      QuoteReal: 34697.4588378961
      IndexPipRange: 5 
      MaxPip: 179999 
      MinPip: 150000 
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
    User:
      Id: 1
      BalanceBase: 9810.4800668319
      BalanceQuote: 8385.2701059267
- S6: OpenLimit
  Action:
    Id: 3
    Asset: base
    Side: 0
    Quantity: 100
    Price: 120000
  Expect:
    PendingOrder:
      OrderId: 1
      Price: 120000
      Size : 100
      Side: 0
    User:
      Id: 3
      BalanceBase: 10000
      BalanceQuote: 8800
- S7: OpenMarket
  Action:
    Id: 3
    asset: base
    Side: 1
    Quantity: 110
  Expect:
    Pool:
      Liquidity: 8541.9238831013
      BaseVirtual: 192.1589028838
      QuoteVirtual: 0
      BaseReal: 2205.5152629215
      QuoteReal: 33082.7289438227
      IndexPipRange: 5
      MaxPip: 179999
      MinPip: 150000
      FeeGrowthBase: 0
      FeeGrowthQuote: 0
    User:
      Id: 3
      BalanceBase: 9890
      BalanceQuote: 10525.14534833790
- S7.1: CancelLimitOrder
  Action:
    Id: 2
    Price: 150000
    OrderId: 0
- S8: IncreaseLiquidity
  Action:
    Id: 2
    TokenId: 1000002
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
      BalanceBase: 10007.3610302843
      BalanceQuote: 9819.5845457354
- S9: AddLiquidity
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
      TokenId: 1000004
      Liquidity: 244.5764056946
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
      BaseVirtual: 0
      QuoteVirtual: 50
      BalanceBase: 10000
      BalanceQuote: 9900
- S10: AddLiquidity
  Action:
    Id: 5
    IndexPipRange: 5
    Asset: base
    AmountVirtual: 100
  Expect:
    Pool:
      Liquidity: 12987.1636065337
      BaseVirtual: 292.1589028838
      QuoteVirtual: 0
      BaseReal: 3353.2712241717
      QuoteReal: 50299.0683625759
      IndexPipRange: 5
      MaxPip: 179999 
      MinPip: 150000 
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
    User:
      Id: 5
      TokenId: 1000005
      Liquidity: 4445.2397234324
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
      BaseVirtual: 100
      QuoteVirtual: 0
      BalanceBase: 9900
      BalanceQuote: 10000
- S11: OpenMarket
  Action:
    Id: 4
    asset: base
    Side: 1
    Quantity: 10
  Expect:
    Pool:
      Liquidity: 415.7802973102
      BaseVirtual: 10
      QuoteVirtual: 32.7826866490
      BaseReal: 117.3546215923
      QuoteReal: 1473.0912750706
      IndexPipRange: 4
      MaxPip: 149999 
      MinPip: 120000 
      FeeGrowthBase: 0
      FeeGrowthQuote: 0
    User:
      Id: 4
      BalanceBase: 9990
      BalanceQuote: 10037.2173133510
- S12: RemoveLiquidity
  Action:
    Id: 4
    TokenId: 1000004
  Expect:
    Pool:
      Liquidity: 171.2038916156
      BaseVirtual: 4.1176666667
      QuoteVirtual: 13.4988176059
      BaseReal: 48.3225589227
      QuoteReal: 606.5678451543
      IndexPipRange: 4
      MaxPip: 149999 
      MinPip: 120000 
    User:
      Id: 4
      TokenId: 1000004
      Liquidity: 0
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
      BalanceBase: 9995.8823333333
      BalanceQuote: 10056.5011823941
- S13: ShiftRange
  Action:
    Id: 1
    TargetIndexPipRange: 4
    TokenId: 1000001
    Asset: quote
    AmountVirtual: 629.9485100048
  Expect:
    Pool:
      Liquidity: 8160.8112679040
      BaseVirtual: 196.2765695505
      QuoteVirtual: 643.4473276107
      BaseReal: 2303.3960922734
      QuoteReal: 28913.3281716763
      IndexPipRange: 4
      MaxPip: 149999 
      MinPip: 120000 
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
    User:
      Id: 1
      BalanceBase: 9810.4800668319
      BalanceQuote: 7755.3215959219
- S14: Expect
  Pool:
      Liquidity: 4445.2397234324
      BaseVirtual: 100
      QuoteVirtual: 0
      BaseReal: 1147.7559612502\t
      QuoteReal: 17216.3394187532
      IndexPipRange: 5
      MaxPip: 179999 
      MinPip: 150000 
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
- S15: IncreaseLiquidity
  Action:
    Id: 5
    TokenId: 1000005
    Asset: base
    AmountVirtual: 20
  Expect:
    Pool:
      Liquidity: 5334.2876681188
      BaseVirtual: 120
      QuoteVirtual: 0
      BaseReal: 1377.3071535003
      QuoteReal: 20659.6073025038
      IndexPipRange: 5
      MaxPip: 179999 
      MinPip: 150000 
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0
    User:
      Id: 5
      BalanceBase: 9880
      BalanceQuote: 10000
- S16: DecreaseLiquidity
  Action:
    Id: 1
    TokenId: 1000003
    Liquidity: 1700
  Expect:
    Pool:
      Liquidity: 4019.5638614056
      BaseVirtual: 70.2774539949
      QuoteVirtual: 0
      BaseReal: 947.4202879374
      QuoteReal: 17053.5651828737
      IndexPipRange: 6
      MaxPip: 209999 
      MinPip: 180000 
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0
    User:
      Id: 1
      BalanceBase: 9840.2026128371
      BalanceQuote: 7755.3215959219
- S17: RemoveLiquidity
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
      IndexPipRange: 6
      MaxPip: 209999 
      MinPip: 180000 
    User:
      Id: 1
      TokenId: 1000003
      Liquidity: 0
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
      BalanceBase: 9910.4800668319
      BalanceQuote: 7755.3215959219
- S18: DecreaseLiquidity
  Action:
    Id: 2
    TokenId: 1000002
    Liquidity: 100
  Expect:
    Pool:
      Liquidity: 8060.8112679040
      BaseVirtual: 193.8714588381
      QuoteVirtual: 635.5627285267
      BaseReal: 2275.1710051264\t
      QuoteReal: 28559.0333935898
      IndexPipRange: 4
      MaxPip: 149999 
      MinPip: 120000 
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0
    User:
      Id: 2
      BalanceBase: 10009.7661409967
      BalanceQuote: 9827.4691448194
- S19: RemoveLiquidity
  Action:
    Id: 1
    TokenId: 1000001
  Expect:
    Pool:
      Liquidity: 71.2038916156
      BaseVirtual: 1.7125559543
      QuoteVirtual: 5.6142185219
      BaseReal: 20.0973604606
      QuoteReal: 252.2716697884
      IndexPipRange: 4
      MaxPip: 149999 
      MinPip: 120000 
    User:
      Id: 1
      TokenId: 1000001
      Liquidity: 0
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
      BalanceBase: 10102.6389697157
      BalanceQuote: 8385.2701059267
- S20: RemoveLiquidity
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
      BalanceBase: 10011.47867734310
      BalanceQuote: 9833.08329906146
- S21: RemoveLiquidity
  Action:
    Id: 5
    TokenId: 1000005
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
      Id: 5
      TokenId: 1000005
      Liquidity: 0
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
      BalanceBase: 10000
      BalanceQuote: 10000
`)
    })
    it ("Case #35", async () => {
        return testHelper.process(`
- S0: SetCurrentPrice
  Action:
    Price: 165000
- S1: AddLiquidity
  Action:
    Id: 1
    IndexPipRange: 6
    Asset: base
    AmountVirtual: 30
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
      Id: 1
      TokenId: 1000001
      Liquidity: 1715.8691584217
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
      BaseVirtual: 30
      QuoteVirtual: 0
      BalanceBase: 9970
      BalanceQuote: 10000
- S2: AddLiquidity
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
    Side: 1
    Quantity: 120
    Price: 179999
  Expect:
    PendingOrder:
      OrderId: 1
      Price: 179999
      Size : 120
      Side: 1
    User:
      Id: 2
      BalanceBase: 9880
      BalanceQuote: 9950
- S4: AddLiquidity
  Action:
    Id: 1
    IndexPipRange: 5
    Asset: base
    AmountVirtual: 25
  Expect:
    Pool:
      Liquidity: 2385.4809707753
      BaseVirtual: 25
      QuoteVirtual: 450.9414375460
      BaseReal: 587.2648187911
      QuoteReal: 9689.8695100535
      IndexPipRange: 5
      MaxPip: 179999 
      MinPip: 150000 
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
    User:
      Id: 1
      TokenId: 1000003
      Liquidity: 2385.4809707753
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
      BaseVirtual: 25
      QuoteVirtual: 450.9414375460
      BalanceBase: 9945
      BalanceQuote: 9549.0585624540
- S5: DecreaseLiquidity
  Action:
    Id: 1
    TokenId: 1000001
    Liquidity: 1000
  Expect:
    Pool:
      Liquidity: 715.8691584217
      BaseVirtual: 12.5161494087
      QuoteVirtual: 0
      BaseReal: 168.7319787874
      QuoteReal: 3037.1756181737
      IndexPipRange: 6
      MaxPip: 209999 
      MinPip: 180000 
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
    User:
      Id: 1
      BalanceBase: 9962.4838505913
      BalanceQuote: 9549.0585624540
- S6: OpenLimit
  Action:
    Id: 3
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
      Id: 3
      BalanceBase: 9900
      BalanceQuote: 10000
- S7: OpenMarket
  Action:
    Id: 3
    asset: base
    Side: 0
    Quantity: 50
  Expect:
    Pool:
      Liquidity: 2385.4809707753
      BaseVirtual: 0
      QuoteVirtual: 881.7824392508
      BaseReal: 562.2648187911
      QuoteReal: 10120.7105117583
      IndexPipRange: 5
      MaxPip: 179999
      MinPip: 150000
      FeeGrowthBase: 0
      FeeGrowthQuote: 0
    User:
      Id: 3
      BalanceBase: 9950
      BalanceQuote: 9119.16149829519
- S8: IncreaseLiquidity
  Action:
    Id: 1
    TokenId: 1000001
    Asset: base
    AmountVirtual: 20
  Expect:
    Pool:
      Liquidity: 1859.7819307028
      BaseVirtual: 32.5161494087
      QuoteVirtual: 0
      BaseReal: 438.3548049094
      QuoteReal: 7890.3864883690
      IndexPipRange: 6
      MaxPip: 209999 
      MinPip: 180000 
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0
    User:
      Id: 1
      BalanceBase: 9942.4838505913
      BalanceQuote: 9549.0585624540
- S9: AddLiquidity
  Action:
    Id: 4
    IndexPipRange: 7
    Asset: base
    AmountVirtual: 30
  Expect:
    Pool:
      Liquidity: 2128.6680884798
      BaseVirtual: 30
      QuoteVirtual: 0
      BaseReal: 464.5134592808
      QuoteReal: 9754.7826448958
      IndexPipRange: 7
      MaxPip: 239999 
      MinPip: 210000 
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
    User:
      Id: 4
      TokenId: 1000004
      Liquidity: 2128.6680884798
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
      BaseVirtual: 30
      QuoteVirtual: 0
      BalanceBase: 9970
      BalanceQuote: 10000
- S10: AddLiquidity
  Action:
    Id: 4
    IndexPipRange: 6
    Asset: base
    AmountVirtual: 30
  Expect:
    Pool:
      Liquidity: 3575.6510891245
      BaseVirtual: 62.5161494087
      QuoteVirtual: 0
      BaseReal: 842.7890440923
      QuoteReal: 15170.2027936619
      IndexPipRange: 6
      MaxPip: 209999 
      MinPip: 180000 
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
    User:
      Id: 4
      TokenId: 1000005
      Liquidity: 1715.8691584217
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
      BaseVirtual: 30
      QuoteVirtual: 0
      BalanceBase: 9940
      BalanceQuote: 10000
- S11: OpenLimit
  Action:
    Id: 4
    Asset: base
    Side: 1
    Quantity: 100
    Price: 210000
  Expect:
    PendingOrder:
      OrderId: 1
      Price: 210000
      Size : 100
      Side: 1
    User:
      Id: 4
      BalanceBase: 9840
      BalanceQuote: 10000
- S12: OpenMarket
  Action:
    Id: 3
    asset: base
    Side: 0
    Quantity: 370
  Expect:
    Pool:
      Liquidity: 2128.6680884798
      BaseVirtual: 17.5161494087
      QuoteVirtual: 269.4010453036
      BaseReal: 452.0296086895
      QuoteReal: 10024.1836901994
      IndexPipRange: 7
      MaxPip: 239999 
      MinPip: 210000 
      FeeGrowthBase: 0
      FeeGrowthQuote: 0
    User:
      Id: 3
      BalanceBase: 10320
      BalanceQuote: 1824.3199855876
- S13: RemoveLiquidity
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
      IndexPipRange: 7
      MaxPip: 239999 
      MinPip: 210000
    User:
      Id: 4
      TokenId: 1000004
      Liquidity: 0
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
      BalanceBase: 9857.51614940874
      BalanceQuote: 10269.40104530360
- S14: ShiftRange
  Action:
    Id: 2
    TargetIndexPipRange: 7
    TokenId: 1000002
    Asset: base
    AmountVirtual: 3.2509431040
  Expect:
    Pool:
      Liquidity: 395.0742073181
      BaseVirtual: 3.2509431040
      QuoteVirtual: 50
      BaseReal: 83.8952959852
      QuoteReal: 1860.4574601600
      IndexPipRange: 7
      MaxPip: 239999 
      MinPip: 210000
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
    User:
      Id: 2
      BalanceBase: 9876.2332207100
      BalanceQuote: 9950
- S15: Expect
  Pool:
      Liquidity: 0
      BaseVirtual: 0
      QuoteVirtual: 0
      BaseReal: 0
      QuoteReal: 0
      IndexPipRange: 4
      MaxPip: 149999 
      MinPip: 120000 
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0      
- S16: IncreaseLiquidity
  Action:
    Id: 4
    TokenId: 1000005
    Asset: quote
    AmountVirtual: 10
  Expect:
    Pool:
      Liquidity: 3605.0694213061
      BaseVirtual: 0
      QuoteVirtual: 1225.4499674040
      BaseReal: 786.6925163514
      QuoteReal: 16520.4641741269
      IndexPipRange: 6
      MaxPip: 209999 
      MinPip: 180000
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0
    User:
      Id: 4
      BalanceBase: 9857.5161494087
      BalanceQuote: 10259.4010453036
- S17: DecreaseLiquidity
  Action:
    Id: 1
    TokenId: 1000003
    Liquidity: 2385.4809707753
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
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0      
    User:
      Id: 1
      BalanceBase: 9942.4838505913
      BalanceQuote: 10430.8410017048
- S18: RemoveLiquidity
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
      TokenId: 1000003
      Liquidity: 0
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
      BalanceBase: 9942.4838505913
      BalanceQuote: 10430.8410017048
- S19: DecreaseLiquidity
  Action:
    Id: 2
    TokenId: 1000002
    Liquidity: 100
  Expect:
    Pool:
      Liquidity: 295.0742073181
      BaseVirtual: 2.4280741230
      QuoteVirtual: 37.3441497638
      BaseReal: 62.6599699550
      QuoteReal: 1389.5440404283
      IndexPipRange: 7
      MaxPip: 239999 
      MinPip: 210000 
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0
    User:
      Id: 2
      BalanceBase: 9877.5719258770
      BalanceQuote: 9962.6558502362
- S20: RemoveLiquidity
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
      IndexPipRange: 6
      MaxPip: 209999 
      MinPip: 180000 
    User:
      Id: 1
      TokenId: 1000001
      Liquidity: 0
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
      BalanceBase: 9942.4838505913
      BalanceQuote: 11063.0256949839
- S21: RemoveLiquidity
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
      IndexPipRange: 7
      MaxPip: 239999 
      MinPip: 210000 
    User:
      Id: 2
      TokenId: 1000002
      Liquidity: 0
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
      BalanceBase: 9880
      BalanceQuote: 10000
- S22: RemoveLiquidity
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
      TokenId: 1000005
      Liquidity: 0
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
      BalanceBase: 9857.51614940874
      BalanceQuote: 10852.66631942850`
        )
    })
    it ("Case #36", async () => {
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
      BalanceBase: 10100
      BalanceQuote: 10000
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
      TokenId: 1000004
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
      BalanceBase: 10095
      BalanceQuote: 9928.3381241643
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
    AmountVirtual: 1524.3200942025
  Expect:
    Pool:
      Liquidity: 6689.5217285654
      BaseVirtual: 80.4452018502
      QuoteVirtual: 1582.1660495933
      BaseReal: 1807.6780425577
      QuoteReal: 24755.3490740159
      IndexPipRange: 4
      MaxPip: 149999 
      MinPip: 120000 
      FeeGrowthBase: 0
      FeeGrowthQuote: 0 
    User:
      Id: 2
      BalanceBase: 9892.4959746204
      BalanceQuote: 8325.6799057975
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
      Id: 3
      BalanceBase: 9792.4959746204
      BalanceQuote: 8325.6799057975
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
    AmountVirtual: 130
  Expect:
    Pool:
      Liquidity: 5778.8116404621
      BaseVirtual: 130.0000000000
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
      TokenId: 1000005
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
    Quantity: 500
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
      BalanceBase: 10595.0000000000
      BalanceQuote: 1413.3624034417
- S19: RemoveLiquidity
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
      IndexPipRange: 6
      MaxPip: 209999 
      MinPip: 180000
    User:
      Id: 1
      BalanceBase: 9829.4790493791
      BalanceQuote: 9900.8153144356
- S20: DecreaseLiquidity
  Action:
    Id: 1
    TokenId: 1000001
    Liquidity: 1000
  Expect:
    Pool:
      Liquidity: 6444.9445076121
      BaseVirtual: 0
      QuoteVirtual: 2635.1368629059
      BaseReal: 63.1497774072
      QuoteReal: 947.2403461304
      IndexPipRange: 4 
      MaxPip: 149999 
      MinPip: 120000 
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
    User:
      Id: 1
      BalanceBase: 9829.4790493791
      BalanceQuote: 12535.9521773414
- S21: ShiftRange
  Action:
    Id: 4
    TargetIndexPipRange: 6
    TokenId: 1000005
    Asset: base
    AmountVirtual: 2.3479298704
  Expect:
    Pool:
      Liquidity: 435.7388321059
      BaseVirtual: 2.3479298704
      QuoteVirtual: 100.0000000000
      BaseReal: 97.4341649025
      QuoteReal: 1948.6832980505
      IndexPipRange: 6
      MaxPip: 209999 
      MinPip: 120000 
      FeeGrowthBase: 0
      FeeGrowthQuote: 0 
    User:
      Id: 4
      BalanceBase: 9997.6520701296
      BalanceQuote: 9900.0000000000
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
      BalanceBase: 9829.4790493791
      BalanceQuote: 12485.9521773414
- S23: RemoveLiquidity
  Action:
    Id: 2
    TokenId: 1000005
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
      BalanceBase: 9652.0588235294
      BalanceQuote: 11763.6552769281
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
      BalanceBase: 9829.4790493791
      BalanceQuote: 12485.9521773414
- S25: RemoveLiquidity
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
      BalanceBase: 9652.05882352941
      BalanceQuote: 12306.60420937440
- S26: RemoveLiquidity
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
      IndexPipRange: 6
      MaxPip: 209999 
      MinPip: 180000
    User:
      Id: 4
      BalanceBase: 10000.0000000000
      BalanceQuote: 10000.0000000000
        `)
    })
})
