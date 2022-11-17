import {deployAndCreateRouterHelper, TestLiquidity} from "../../test-liquidity";

describe("ShiftRangeCase20-25", async function(){
    let testHelper: TestLiquidity

    beforeEach(async () => {
        testHelper = await deployAndCreateRouterHelper(10_000, false)
    })

    it ("Case #24", async () => {
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
    TargetIndexPipRange: 4
    TokenId: 1000001
    Asset: quote
    AmountVirtual: 0
  Expect:
    Pool:
      Liquidity: 4411.6001443079
      BaseVirtual: 0
      QuoteVirtual: 1803.7657501839
      BaseReal: 1139.0740561886
      QuoteReal: 17085.9969354227
      IndexPipRange: 4
      MaxPip: 149999 
      MinPip: 120000 
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
    User:
      Id: 1
      BalanceBase: 10000
      BalanceQuote: 8196.2342498161
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
- S5: ShiftRange
  Action:
    Id: 2
    TargetIndexPipRange: 6
    TokenId: 1000002
    Asset: base
    AmountVirtual: 0
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
      BalanceBase: 9950
      BalanceQuote: 10000
- S6: Expect
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
- S7: RemoveLiquidity
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
    it ("Case #25", async () => {
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
    IndexPipRange: 4
    Asset: quote
    AmountVirtual: 50
  Expect:
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
    User:
      Id: 1
      TokenId: 1000004
      Liquidity: 122.2886104767
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
      BaseVirtual: 0
      QuoteVirtual: 50
      BalanceBase: 9900
      BalanceQuote: 8146.2342498161
- S5: OpenMarket
  Action:
    Id: 3
    asset: base
    Side: 1
    Quantity: 230
  Expect:
    Pool:
      Liquidity: 122.2886104767
      BaseVirtual: 0.6902449916\t
      QuoteVirtual: 39.8678878731
      BaseReal: 32.2651336952\t
      QuoteReal: 463.4880609383
      IndexPipRange: 4
      MaxPip: 149999
      MinPip: 120000
      FeeGrowthBase: 0
      FeeGrowthQuote: 0
    User:
      Id: 3
      BalanceBase: 9770
      BalanceQuote: 13617.66361249460
- S6: Expect
  Pool:
      Liquidity: 19083.8477662026
      BaseVirtual: 429.3097550084
      QuoteVirtual: 0
      BaseReal: 4927.4283053374\t
      QuoteReal: 73911.4245800603
      IndexPipRange: 5
      MaxPip: 179999
      MinPip: 150000
      FeeGrowthBase: 0
      FeeGrowthQuote: 0
- S7: ShiftRange
  Action:
    Id: 1
    TargetIndexPipRange: 3
    TokenId: 1000001
    Asset: quote
    AmountVirtual: 20
  Expect:
    Pool:
      Liquidity: 43.0953510540
      BaseVirtual: 0
      QuoteVirtual: 20
      BaseReal: 12.4406081019\t
      QuoteReal: 149.2860531621
      IndexPipRange: 3
      MaxPip: 119999 
      MinPip: 90000 
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
    User:
      Id: 1
      BalanceBase: 10114.6548775042\t
      BalanceQuote: 8126.2342498161
- S8: Expect
  Pool:
      Liquidity: 9541.9238831013
      BaseVirtual: 214.6548775042
      QuoteVirtual: 0
      BaseReal: 2463.7141526687\t
      QuoteReal: 36955.7122900301
      IndexPipRange: 5
      MaxPip: 179999 
      MinPip: 150000 
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0       
- S9: ShiftRange
  Action:
    Id: 2
    TargetIndexPipRange: 4
    TokenId: 1000002
    Asset: quote
    AmountVirtual: 6199.1297956857
  Expect:
    Pool:
      Liquidity: 19137.1652272536
      BaseVirtual: 108.0176837437\t
      QuoteVirtual: 6238.9976835588
      BaseReal: 5049.2289690603\t
      QuoteReal: 72532.0826564460
      IndexPipRange: 4
      MaxPip: 149999 
      MinPip: 120000 
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
    User:
      Id: 2
      BalanceBase: 9900
      BalanceQuote: 1997.1044541304
- S10: Expect
  Pool:
      Liquidity: 4770.9619415507
      BaseVirtual: 107.3274387521
      QuoteVirtual: 0
      BaseReal: 1231.8570763343\t
      QuoteReal: 18477.8561450151
      IndexPipRange: 5
      MaxPip: 179999 
      MinPip: 150000 
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
- S11: ShiftRange
  Action:
    Id: 2
    TargetIndexPipRange: 6
    TokenId: 1000003
    Asset: base
    AmountVirtual: 0
  Expect:
    Pool:
      Liquidity: 6138.6614002370
      BaseVirtual: 107.3274388
      QuoteVirtual: 0
      BaseReal: 1446.8963678386\t
      QuoteReal: 26044.1346210943
      IndexPipRange: 6
      MaxPip: 209999 
      MinPip: 180000 
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
    User:
      Id: 2
      BalanceBase: 9900
      BalanceQuote: 1997.1044541304
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
      IndexPipRange: 3
      MaxPip: 119999 
      MinPip: 90000 
    User:
      Id: 1
      TokenId: 1000001
      Liquidity: 0
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
      BalanceBase: 10114.6548775042\t
      BalanceQuote: 8146.2342498161
- S14: RemoveLiquidity
  Action:
    Id: 2
    TokenId: 1000002
  Expect:
    Pool:
      Liquidity: 122.2886104767
      BaseVirtual: 0.6902449916\t\t\t\t\t
      QuoteVirtual: 39.8678878731
      BaseReal: 32.2651336952\t
      QuoteReal: 463.4880609383
      IndexPipRange: 4
      MaxPip: 149999 
      MinPip: 120000 
    User:
      Id: 2
      TokenId: 1000002
      Liquidity: 0
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
      BalanceBase: 10007.3274387521\t
      BalanceQuote: 8196.2342498161
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
      IndexPipRange: 6
      MaxPip: 209999 
      MinPip: 180000 
    User:
      Id: 2
      TokenId: 1000003
      Liquidity: 0
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
      BalanceBase: 10114.6548775042\t
      BalanceQuote: 8196.2342498161 
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
      IndexPipRange: 4
      MaxPip: 149999 
      MinPip: 120000 
    User:
      Id: 1
      TokenId: 1000004
      Liquidity: 0
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
      BalanceBase: 10115.3451224958
      BalanceQuote: 8186.1021376892
`)
    })
})
