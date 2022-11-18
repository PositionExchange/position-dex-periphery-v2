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
- S3: AddLiquidity
  Action:
    Id: 2
    IndexPipRange: 5
    Asset: base
    AmountVirtual: 50
  Expect:
    Pool:
      Liquidity: 19083.8477662026
      BaseVirtual: 200
      QuoteVirtual: 3607.5315003678
      BaseReal: 4698.1185503290\t
      QuoteReal: 77518.9560804281
      IndexPipRange: 5
      MaxPip: 179999 
      MinPip: 150000 
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
    User:
      Id: 2
      TokenId: 1000003
      Liquidity: 4770.9619415507
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
      BaseVirtual: 50
      QuoteVirtual: 901.8828750919
      BalanceBase: 9900
      BalanceQuote: 8196.23424981612
- S4: AddLiquidity
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
      BaseReal: 674.0570653049\t
      QuoteReal: 12133.0271754882
      IndexPipRange: 6
      MaxPip: 209999 
      MinPip: 180000 
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
    User:
      Id: 1
      TokenId: 1000004
      Liquidity: 2859.7819307028
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
      BaseVirtual: 50
      QuoteVirtual: 0
      BalanceBase: 9850
      BalanceQuote: 8196.2342498161
- S5: OpenMarket
  Action:
    Id: 3
    asset: base
    Side: 0
    Quantity: 230
  Expect:
    Pool:
      Liquidity: 2859.7819307028
      BaseVirtual: 20
      QuoteVirtual: 565.1530506731
      BaseReal: 644.0570653049\t
      QuoteReal: 12698.1802261614
      IndexPipRange: 6
      MaxPip: 209999 
      MinPip: 180000 
      FeeGrowthBase: 0
      FeeGrowthQuote: 0
    User:
      Id: 3
      BalanceBase: 10230
      BalanceQuote: 5988.11893568843
- S6: Expect
  Pool:
      Liquidity: 19083.8477662026
      BaseVirtual: 0
      QuoteVirtual: 7054.2595140062
      BaseReal: 4498.1185503290\t
      QuoteReal: 80965.6840940665
      IndexPipRange: 5
      MaxPip: 179999
      MinPip: 150000
      FeeGrowthBase: 0
      FeeGrowthQuote: 0
- S7: ShiftRange
  Action:
    Id: 1
    TargetIndexPipRange: 4
    TokenId: 1000001
    Asset: quote
    AmountVirtual: 0
  Expect:
    Pool:
      Liquidity: 8626.5559390964
      BaseVirtual: 0
      QuoteVirtual: 3527.1297570031
      BaseReal: 2227.3745904108\t
      QuoteReal: 33410.3961187030
      IndexPipRange: 4
      MaxPip: 149999 
      MinPip: 120000 
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
    User:
      Id: 1
      BalanceBase: 9850
      BalanceQuote: 8196.2342498161
- S8: Expect
  Pool:
      Liquidity: 9541.9238831013
      BaseVirtual: 3527.1297570031
      QuoteVirtual: 0
      BaseReal: 2249.0592751645\t
      QuoteReal: 40482.8420470332
      IndexPipRange: 5
      MaxPip: 179999 
      MinPip: 150000 
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0       
- S9: ShiftRange
  Action:
    Id: 2
    TargetIndexPipRange: 6
    TokenId: 1000002
    Asset: base
    AmountVirtual: 62.41016929
  Expect:
    Pool:
      Liquidity: 11783.7556527833
      BaseVirtual: 82.4101692949\t
      QuoteVirtual: 2328.7179291747
      BaseReal: 2653.8425893671\t
      QuoteReal: 52322.9591087450
      IndexPipRange: 6
      MaxPip: 209999 
      MinPip: 180000 
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
    User:
      Id: 2
      BalanceBase: 9837.5898307051\t
      BalanceQuote: 8196.2342498161
- S10: Expect
  Pool:
      Liquidity: 4770.9619415507
      BaseVirtual: 0
      QuoteVirtual: 1763.5648785016\t\t
      BaseReal: 1124.5296375822
      QuoteReal: 20241.4210235166
      IndexPipRange: 5
      MaxPip: 179999 
      MinPip: 150000 
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
- S11: ShiftRange
  Action:
    Id: 2
    TargetIndexPipRange: 7
    TokenId: 1000003
    Asset: base
    AmountVirtual: 20
  Expect:
    Pool:
      Liquidity: 1419.1120589866
      BaseVirtual: 20
      QuoteVirtual: 0
      BaseReal: 309.6756395205\t
      QuoteReal: 6503.1884299305
      IndexPipRange: 7
      MaxPip: 239999 
      MinPip: 210000 
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
    User:
      Id: 2
      BalanceBase: 9817.5898307051\t
      BalanceQuote: 9959.7991283177
- S12: Expect
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
- S13: RemoveLiquidity
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
      BalanceBase: 9850
      BalanceQuote: 11723.3640068192
- S14: RemoveLiquidity
  Action:
    Id: 2
    TokenId: 1000002
  Expect:
    Pool:
      Liquidity: 2859.7819307028
      BaseVirtual: 20
      QuoteVirtual: 565.1530506731
      BaseReal: 644.0570653049
      QuoteReal: 12698.1802261614
      IndexPipRange: 6
      MaxPip: 209999 
      MinPip: 180000 
    User:
      Id: 2
      TokenId: 1000002
      Liquidity: 0
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
      BalanceBase: 9880
      BalanceQuote: 11723.3640068192
- S15: RemoveLiquidity
  Action:
    Id: 2
    TokenId: 1000003
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
      TokenId: 1000003
      Liquidity: 0
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
      BalanceBase: 9900
      BalanceQuote: 11723.3640068192
- S16: RemoveLiquidity
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
      TokenId: 1000004
      Liquidity: 0
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
      BalanceBase: 9870
      BalanceQuote: 12288.5170574924
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
    Asset: base
    AmountVirtual: 4.942936786
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
    Asset: quote
    AmountVirtual: 1168.7052321898
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
      BalanceBase: 9985.005477
      BalanceQuote: 10248.478329
`)
    })
    it ("Case #28", async () => {
        return testHelper.process(`
- S0: SetCurrentPrice
  Action:
    Price: 165000
- S1: AddLiquidity
  Action:
    Id: 1
    IndexPipRange: 3
    Asset: quote
    AmountVirtual: 50
  Expect:
    Pool:
      Liquidity: 107.7383776351
      BaseVirtual: 0
      QuoteVirtual: 50
      BaseReal: 31.1015202548
      QuoteReal: 373.2151329053
      IndexPipRange: 3
      MaxPip: 119999 
      MinPip: 90000 
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
    User:
      Id: 1
      TokenId: 1000001
      Liquidity: 107.7383776351
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
      BaseVirtual: 0
      QuoteVirtual: 50
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
- S3: ShiftRange
  Action:
    Id: 1
    TargetIndexPipRange: 5
    TokenId: 1000001
    Asset: base
    AmountVirtual: 2.771978567
  Expect:
    Pool:
      Liquidity: 264.5000849508
      BaseVirtual: 2.771978567
      QuoteVirtual: 50
      BaseReal: 65.1154196415
      QuoteReal: 1074.4044240851
      IndexPipRange: 5
      MaxPip: 179999 
      MinPip: 150000 
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
    User:
      Id: 1
      BalanceBase: 9997.2280214327
      BalanceQuote: 9950
- S4: Expect
  Pool:
      Liquidity: 0
      BaseVirtual: 0
      QuoteVirtual: 0
      BaseReal: 0
      QuoteReal: 0
      IndexPipRange: 3
      MaxPip: 119999 
      MinPip: 90000 
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0      
- S5: OpenMarket
  Action:
    Id: 3
    asset: base
    Side: 1
    Quantity: 5
  Expect:
    Pool:
      Liquidity: 122.2886104767
      BaseVirtual: 1.8217913692
      QuoteVirtual: 24.1639845134
      BaseReal: 33.3966800728
      QuoteReal: 447.7841575786
      IndexPipRange: 4
      MaxPip: 149999
      MinPip: 120000
      FeeGrowthBase: 0
      FeeGrowthQuote: 0
    User:
      Id: 3
      BalanceBase: 9995
      BalanceQuote: 10075.8360154866
- S6: ShiftRange
  Action:
    Id: 1
    TargetIndexPipRange: 4
    TokenId: 1000001
    Asset: quote
    AmountVirtual: 78.9224461925
  Expect:
    Pool:
      Liquidity: 521.6977507588
      BaseVirtual: 7.7719785673
      QuoteVirtual: 103.0864307059
      BaseReal: 142.4742076050
      QuoteReal: 1910.3004517232
      IndexPipRange: 4
      MaxPip: 149999 
      MinPip: 120000 
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
    User:
      Id: 1
      BalanceBase: 9997.2280214327
      BalanceQuote: 9871.0775538075
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
      Liquidity: 122.2886104767
      BaseVirtual: 1.8217913692
      QuoteVirtual: 24.1639845134
      BaseReal: 33.3966800728
      QuoteReal: 447.7841575786
      IndexPipRange: 4
      MaxPip: 149999 
      MinPip: 120000 
    User:
      Id: 1
      TokenId: 1000001
      Liquidity: 0
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
      BalanceBase: 10003.1782086308
      BalanceQuote: 9950
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
      TokenId: 1000002
      Liquidity: 0
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
      BalanceBase: 10001.8217913692
      BalanceQuote: 9974.1639845134
`)
    })
    it ("Case #29", async () => {
        return testHelper.process(`
- S0: SetCurrentPrice
  Action:
    Price: 165000
- S1: AddLiquidity
  Action:
    Id: 1
    IndexPipRange: 6
    Asset: base
    AmountVirtual: 40
  Expect:
    Pool:
      Liquidity: 2287.8255445622
      BaseVirtual: 40
      QuoteVirtual: 0
      BaseReal: 539.2456522439\t
      QuoteReal: 9706.4217403906
      IndexPipRange: 6
      MaxPip: 209999 
      MinPip: 180000 
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
    User:
      Id: 1
      TokenId: 1000001
      Liquidity: 2287.8255445622
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
      BaseVirtual: 40
      QuoteVirtual: 0
      BalanceBase: 9960
      BalanceQuote: 10000
- S2: AddLiquidity
  Action:
    Id: 2
    IndexPipRange: 7
    Asset: base
    AmountVirtual: 60
  Expect:
    Pool:
      Liquidity: 4257.3361769597
      BaseVirtual: 60
      QuoteVirtual: 0
      BaseReal: 929.0269185615\t
      QuoteReal: 19509.5652897916
      IndexPipRange: 7
      MaxPip: 239999 
      MinPip: 210000 
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
    User:
      Id: 2
      TokenId: 1000002
      Liquidity: 4257.3361769597
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
      BaseVirtual: 60
      QuoteVirtual: 0
      BalanceBase: 9940
      BalanceQuote: 10000
- S3: ShiftRange
  Action:
    Id: 1
    TargetIndexPipRange: 5
    TokenId: 1000001
    Asset: quote
    AmountVirtual: 721.5063000736
  Expect:
    Pool:
      Liquidity: 3816.7695532405
      BaseVirtual: 40
      QuoteVirtual: 721.5063000736
      BaseReal: 939.6237100658\t
      QuoteReal: 15503.7912160856
      IndexPipRange: 5
      MaxPip: 179999 
      MinPip: 150000 
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
    User:
      Id: 1
      BalanceBase: 9960
      BalanceQuote: 9278.4936999265
- S4: Expect
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
- S5: ShiftRange
  Action:
    Id: 2
    TargetIndexPipRange: 5
    TokenId: 1000002
    Asset: quote
    AmountVirtual: 1082.2594501103
  Expect:
    Pool:
      Liquidity: 9541.9238831013
      BaseVirtual: 100
      QuoteVirtual: 1803.7657501839
      BaseReal: 2349.0592751645\t
      QuoteReal: 38759.4780402140
      IndexPipRange: 5
      MaxPip: 179999 
      MinPip: 150000 
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
    User:
      Id: 2
      BalanceBase: 9940
      BalanceQuote: 8917.7405498897
- S6: Expect
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
- S7: AddLiquidity
  Action:
    Id: 2
    IndexPipRange: 7
    Asset: base
    AmountVirtual: 50
  Expect:
    Pool:
      Liquidity: 3547.7801474664
      BaseVirtual: 50
      QuoteVirtual: 0
      BaseReal: 774.1890988013\t
      QuoteReal: 16257.9710748263
      IndexPipRange: 7
      MaxPip: 239999 
      MinPip: 210000 
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
    User:
      Id: 2
      TokenId: 1000003
      Liquidity: 3547.7801474664
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
      BaseVirtual: 50
      QuoteVirtual: 0
      BalanceBase: 9890
      BalanceQuote: 8917.7405498897
- S8: OpenMarket
  Action:
    Id: 3
    asset: base
    Side: 0
    Quantity: 120
  Expect:
    Pool:
      Liquidity: 3547.7801474664
      BaseVirtual: 30
      QuoteVirtual: 431.1377902616
      BaseReal: 754.1890988013\t
      QuoteReal: 16689.1088650879
      IndexPipRange: 7
      MaxPip: 239999
      MinPip: 210000
      FeeGrowthBase: 0
      FeeGrowthQuote: 0
    User:
      Id: 3
      BalanceBase: 10120
      BalanceQuote: 7845.4982029192
- S9: Expect
  Pool:
      Liquidity: 9541.9238831013
      BaseVirtual: 0
      QuoteVirtual: 3527.1297570031
      BaseReal: 2249.0592751645\t
      QuoteReal: 40482.8420470332\t
      IndexPipRange: 5
      MaxPip: 179999
      MinPip: 150000
      FeeGrowthBase: 0
      FeeGrowthQuote: 0    
- S10: Expect
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
- S11: RemoveLiquidity
  Action:
    Id: 2
    TokenId: 1000002
  Expect:
    Pool:
      Liquidity: 3816.7695532405
      BaseVirtual: 0
      QuoteVirtual: 1410.8519028012
      BaseReal: 899.6237100658\t
      QuoteReal: 16193.1368188133
      IndexPipRange: 5
      MaxPip: 179999 
      MinPip: 150000 
    User:
      Id: 2
      TokenId: 1000002
      Liquidity: 0
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
      BalanceBase: 9890
      BalanceQuote: 11034.0184040915
- S12: ShiftRange
  Action:
    Id: 1
    TargetIndexPipRange: 7
    TokenId: 1000001
    Asset: base
    AmountVirtual: 98.1717632740
  Expect:
    Pool:
      Liquidity: 15157.5079069762
      BaseVirtual: 128.1717632740\t
      QuoteVirtual: 1841.9896930628
      BaseReal: 3222.1915545130\t
      QuoteReal: 71302.4170236727
      IndexPipRange: 7
      MaxPip: 239999 
      MinPip: 210000 
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
    User:
      Id: 1
      BalanceBase: 9861.8282367260
      BalanceQuote: 9278.4936999265
- S13: Expect
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
- S14: RemoveLiquidity
  Action:
    Id: 1
    TokenId: 1000001
  Expect:
    Pool:
      Liquidity: 3547.7801474664
      BaseVirtual: 30
      QuoteVirtual: 431.1377902616
      BaseReal: 754.1890988013\t
      QuoteReal: 16689.1088650879
      IndexPipRange: 7
      MaxPip: 239999 
      MinPip: 210000 
    User:
      Id: 1
      TokenId: 1000001
      Liquidity: 0
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
      BalanceBase: 9960
      BalanceQuote: 10689.3456027277
- S15: RemoveLiquidity
  Action:
    Id: 2
    TokenId: 1000003
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
      TokenId: 1000003
      Liquidity: 0
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
      BalanceBase: 9920
      BalanceQuote: 11465.1561943531
`)
    })
    it ("Case #30", async () => {
        return testHelper.process(`
- S0: SetCurrentPrice
  Action:
    Price: 165000
- S1: AddLiquidity
  Action:
    Id: 1
    IndexPipRange: 3
    Asset: quote
    AmountVirtual: 50
  Expect:
    Pool:
      Liquidity: 107.7383776351
      BaseVirtual: 0
      QuoteVirtual: 50
      BaseReal: 31.1015202548
      QuoteReal: 373.2151329053
      IndexPipRange: 3
      MaxPip: 119999 
      MinPip: 90000 
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
    User:
      Id: 1
      TokenId: 1000001
      Liquidity: 107.7383776351
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
      BaseVirtual: 0
      QuoteVirtual: 50
      BalanceBase: 10000
      BalanceQuote: 9950
- S2: OpenLimit
  Action:
    Id: 1
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
      Id: 1
      BalanceBase: 9990
      BalanceQuote: 9950
- S3: OpenLimit
  Action:
    Id: 1
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
      Id: 1
      BalanceBase: 9990
      BalanceQuote: 9790      
- S4: OpenMarket
  Action:
    Id: 2
    asset: base
    Side: 0
    Quantity: 5
  Expect:
    User:
      Id: 2
      BalanceBase: 10005
      BalanceQuote: 9915
- S5: ShiftRange
  Action:
    Id: 1
    TargetIndexPipRange: 4
    TokenId: 1000001
    Asset: quote
    AmountVirtual: 0
  Expect:
    Pool:
      Liquidity: 122.2886104767\t
      BaseVirtual: 0
      QuoteVirtual: 50
      BaseReal: 31.5748887036\t
      QuoteReal: 473.6201730652
      IndexPipRange: 4
      MaxPip: 149999 
      MinPip: 120000 
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
    User:
      Id: 1
      BalanceBase: 9990
      BalanceQuote: 9790
- S6: Expect
  Pool:
      Liquidity: 0
      BaseVirtual: 0
      QuoteVirtual: 0
      BaseReal: 0
      QuoteReal: 0
      IndexPipRange: 3
      MaxPip: 119999 
      MinPip: 90000 
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
- S7: AddLiquidity
  Action:
    Id: 2
    IndexPipRange: 4
    Asset: quote
    AmountVirtual: 35
  Expect:
    Pool:
      Liquidity: 207.8906378103
      BaseVirtual: 0
      QuoteVirtual: 85
      BaseReal: 53.6773107961\t
      QuoteReal: 805.1542942108
      IndexPipRange: 4
      MaxPip: 149999 
      MinPip: 120000 
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
    User:
      Id: 2
      TokenId: 1000002
      Liquidity: 85.6020273337\t
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
      BaseVirtual: 0
      QuoteVirtual: 35
      BalanceBase: 10005
      BalanceQuote: 9880
- S8: OpenMarket
  Action:
    Id: 2
    asset: base
    Side: 1
    Quantity: 5
  Expect:
    User:
      Id: 2
      BalanceBase: 10000
      BalanceQuote: 9960
- S9: ShiftRange
  Action:
    Id: 2
    TargetIndexPipRange: 3
    TokenId: 1000002
    Asset: quote
    AmountVirtual: 0
  Expect:
    Pool:
      Liquidity: 75.4168643446
      BaseVirtual: 0
      QuoteVirtual: 35
      BaseReal: 21.7710641783\t
      QuoteReal: 261.2505930337
      IndexPipRange: 3
      MaxPip: 119999 
      MinPip: 90000 
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
    User:
      Id: 2
      BalanceBase: 10000
      BalanceQuote: 9960
- S10: Expect
  Pool:
      Liquidity: 122.2886104767
      BaseVirtual: 0
      QuoteVirtual: 50
      BaseReal: 31.5748887036\t
      QuoteReal: 473.6201730652
      IndexPipRange: 4
      MaxPip: 149999 
      MinPip: 120000 
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
- S11: RemoveLiquidity
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
      BalanceBase: 9990
      BalanceQuote: 9840
- S12: RemoveLiquidity
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
      IndexPipRange: 3
      MaxPip: 119999 
      MinPip: 90000 
    User:
      Id: 2
      TokenId: 1000002
      Liquidity: 0
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
      BalanceBase: 10000
      BalanceQuote: 9995
`)
    })
})
