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
    Price: 160000
  Expect:
    PendingOrder:
      OrderId: 1
      Price: 160000
      Size : 120
      Side: 0
    User:
      Id: 2
      BalanceBase: 10000
      BalanceQuote: 8030
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
    Quantity: 222.6389697157
  Expect:
    Pool:
      Liquidity: 8541.9238831013
      BaseVirtual: 192.1589028838
      QuoteVirtual: 0
      BaseReal: 2205.5152629215\t
      QuoteReal: 33082.7289438227
      IndexPipRange: 5
      MaxPip: 179999
      MinPip: 150000
      FeeGrowthBase: 0
      FeeGrowthQuote: 0
    User:
      Id: 3
      BalanceBase: 9777.36103028431
      BalanceQuote: 12334.72989407330
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
      BalanceBase: 10000
      BalanceQuote: 8010
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
      BaseVirtual: 4.1176666667\t
      QuoteVirtual: 13.4988176059
      BaseReal: 48.3225589227\t
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
      BaseVirtual: 196.2765695505\t
      QuoteVirtual: 643.4473276107
      BaseReal: 2303.3960922734\t
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
      BaseReal: 1377.3071535003\t
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
      BalanceBase: 10002.4051107124\t
      BalanceQuote: 8017.8845990840
- S19: RemoveLiquidity
  Action:
    Id: 1
    TokenId: 1000001
  Expect:
    Pool:
      Liquidity: 71.2038916156
      BaseVirtual: 1.7125559543\t
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
      BalanceBase: 10102.6389697157\t
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
      BalanceBase: 10004.11764313720
      BalanceQuote: 8023.49874047007
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
})
