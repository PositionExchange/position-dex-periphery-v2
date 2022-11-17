import {deployAndCreateRouterHelper, TestLiquidity} from "../../test-liquidity";

describe("ShiftRangeCase26-30", async function(){
    let testHelper: TestLiquidity

    beforeEach(async () => {
        testHelper = await deployAndCreateRouterHelper(10_000, false)
    })

    it ("Case #26", async () => {
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
- S3: ShiftRange
  Action:
    Id: 1
    TargetIndexPipRange: 6
    TokenId: 1000001
  Expect:
    Pool:
      Liquidity: 5719.5638614056
      BaseVirtual: 100
      QuoteVirtual: 0
      BaseReal: 1348.1141306098
      QuoteReal: 24266.0543509763
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
      Liquidity: 4770.9619415507
      BaseVirtual: 50
      QuoteVirtual: 901.8828750919
      BaseReal: 1174.5296375822
      QuoteReal: 19379.7390201070
      IndexPipRange: 5
      MaxPip: 179999 
      MinPip: 150000 
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0      
- S5: OpenMarket
  Action:
    Id: 3
    asset: base
    Side: 0
    Quantity: 85.9561899259
  Expect:
    Pool:
      Liquidity: 5719.5638614056
      BaseVirtual: 64.0438100741
      QuoteVirtual: 664.9465220178
      BaseReal: 1312.1579406839
      QuoteReal: 24931.0008729942
      IndexPipRange: 6
      MaxPip: 209999
      MinPip: 180000
      FeeGrowthBase: 0
      FeeGrowthQuote: 0
    User:
      Id: 3
      BalanceBase: 10085.9561899259
      BalanceQuote: 8473.3714745726
- S6: ShiftRange
  Action:
    Id: 2
    TargetIndexPipRange: 6
    TokenId: 1000002
  Expect:
    Pool:
      Liquidity: 20888.9370550765
      BaseVirtual: 233.9001976064
      QuoteVirtual: 2428.5114005194
      BaseReal: 3480.0928835824
      QuoteReal: 66121.7647880667
      IndexPipRange: 6
      MaxPip: 209999 
      MinPip: 180000 
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
    User:
      Id: 2
      BalanceBase: 9780.1436124677
      BalanceQuote: 9098.1171249081
- S7: Expect
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
- S8: RemoveLiquidity
  Action:
    Id: 1
    TokenId: 1000001
  Expect:
    Pool:
      Liquidity: 15169.3731936709
      BaseVirtual: 169.8563875323
      QuoteVirtual: 1763.5648785016
      BaseReal: 2527.2146476630
      QuoteReal: 48017.0783055979
      IndexPipRange: 6
      MaxPip: 209999 
      MinPip: 180000 
    User:
      Id: 1
      TokenId: 1000001
      Liquidity: 0
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
      BalanceBase: 9964.0438100741
      BalanceQuote: 10664.9465220178
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
      IndexPipRange: 6
      MaxPip: 209999 
      MinPip: 180000 
    User:
      Id: 2
      TokenId: 1000002
      Liquidity: 0
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
      BalanceBase: 9950
      BalanceQuote: 10861.6820034096
`)
    })
    it ("Case #27", async () => {
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
      BaseReal: 31.5748887036
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
- S2: AddLiquidity
  Action:
    Id: 2
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
      Id: 2
      TokenId: 1000002
      Liquidity: 2859.7819307028
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
      BaseVirtual: 50
      QuoteVirtual: 0
      BalanceBase: 9950
      BalanceQuote: 10000
- S3: AddLiquidity
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
      TokenId: 1000003
      Liquidity: 9541.9238831013
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
      BaseVirtual: 100
      QuoteVirtual: 1803.7657501839
      BalanceBase: 9900
      BalanceQuote: 8146.2342498161
- S4: OpenLimit
  Action:
    Id: 2
    Asset: base
    Side: 0
    Quantity: 10
    Price: 160000
  Expect:
    PendingOrder:
      OrderId: 1
      Price: 160000
      Size : 10
      Side: 0
    User:
      Id: 2
      BalanceBase: 9950
      BalanceQuote: 9840
- S5: OpenLimit
  Action:
    Id: 3
    Asset: base
    Side: 1
    Quantity: 10
    Price: 170000
  Expect:
    PendingOrder:
      OrderId: 1
      Price: 170000
      Size : 10
      Side: 1
    User:
      Id: 3
      BalanceBase: 9990
      BalanceQuote: 10000
- S6: OpenMarket
  Action:
    Id: 3
    asset: base
    Side: 1
    Quantity: 30
  Expect:
    Pool:
      Liquidity: 9541.9238831013
      BaseVirtual: 130
      QuoteVirtual: 1315.0077131963
      BaseReal: 2379.0592751645
      QuoteReal: 38270.7200032265
      IndexPipRange: 5
      MaxPip: 179999
      MinPip: 150000
      FeeGrowthBase: 0
      FeeGrowthQuote: 0
    User:
      Id: 3
      BalanceBase: 9960
      BalanceQuote: 10488.7580369876
- S7: ShiftRange
  Action:
    Id: 1
    TargetIndexPipRange: 5
    TokenId: 1000001
  Expect:
    Pool:
      Liquidity: 9904.7325490637
      BaseVirtual: 134.9429367864
      QuoteVirtual: 1365.0077131963
      BaseReal: 2469.5172721515
      QuoteReal: 39725.8719243587
      IndexPipRange: 5
      MaxPip: 179999 
      MinPip: 150000 
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
    User:
      Id: 1
      BalanceBase: 9895.0570632136
      BalanceQuote: 8146.2342498161
- S8: Expect
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
- S9: OpenMarket
  Action:
    Id: 3
    asset: base
    Side: 0
    Quantity: 45
  Expect:
    Pool:
      Liquidity: 9904.7325490637
      BaseVirtual: 89.9429367864
      QuoteVirtual: 2102.3356164163
      BaseReal: 2424.5172721515
      QuoteReal: 40463.1998275787
      IndexPipRange: 5
      MaxPip: 179999
      MinPip: 150000
      FeeGrowthBase: 0
      FeeGrowthQuote: 0
    User:
      Id: 3
      BalanceBase: 10005
      BalanceQuote: 9751.4301337676
- S10: ShiftRange
  Action:
    Id: 2
    TargetIndexPipRange: 5
    TokenId: 1000002
  Expect:
    Pool:
      Liquidity: 15410.8528198430
      BaseVirtual: 139.9429367864
      QuoteVirtual: 3271.0408486061
      BaseReal: 3772.3258710126
      QuoteReal: 62957.0171707116
      IndexPipRange: 5
      MaxPip: 179999 
      MinPip: 150000 
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
    User:
      Id: 2
      BalanceBase: 9950
      BalanceQuote: 8671.2947678102
- S11: Expect
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
- S12: RemoveLiquidity
  Action:
    Id: 1
    TokenId: 1000001
  Expect:
    Pool:
      Liquidity: 15048.0441538805
      BaseVirtual: 136.6483423341
      QuoteVirtual: 3194.0326531178
      BaseReal: 3683.5162163597
      QuoteReal: 61474.8570540911
      IndexPipRange: 5
      MaxPip: 179999 
      MinPip: 150000 
    User:
      Id: 1
      TokenId: 1000001
      Liquidity: 0
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
      BalanceBase: 9898.3516576659
      BalanceQuote: 8223.2424453044
- S13: RemoveLiquidity
  Action:
    Id: 2
    TokenId: 1000002
  Expect:
    Pool:
      Liquidity: 9541.9238831013
      BaseVirtual: 86.6483423341
      QuoteVirtual: 2025.3274209281
      BaseReal: 2335.7076174986
      QuoteReal: 38981.0397109582
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
      BalanceQuote: 9840
- S14: RemoveLiquidity
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
      BalanceBase: 9985
      BalanceQuote: 10248.5698662324
`)
    })
})
