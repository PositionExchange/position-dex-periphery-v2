import {deployAndCreateRouterHelper, TestLiquidity} from "../../test-liquidity";

describe("LiquidityActionWithFee", async function(){
    let testHelper: TestLiquidity

    beforeEach(async () => {
        testHelper = await deployAndCreateRouterHelper(10_000, true)
    })



    it ("Case-LiquidityActionWithFee", async () => {
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
      BalanceBase: 9900.0000000000
      BalanceQuote: 8196.2342498161
- S2: AddLiquidity
  Action:
    Id: 1
    IndexPipRange: 5
    Asset: base
    AmountVirtual: 100
  Expect:
    Pool:
      Liquidity: 19083.8477662026
      BaseVirtual: 200
      QuoteVirtual: 3607.5315003678
      BaseReal: 4698.1185503290
      QuoteReal: 77518.9560804281
      IndexPipRange: 5 
      MaxPip: 179999 
      MinPip: 150000 
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
    User:
      Id: 1
      TokenId: 1000002
      Liquidity: 9541.9238831013
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
      BaseVirtual: 100
      QuoteVirtual: 1803.7657501839
      BalanceBase: 9800.0000000000
      BalanceQuote: 6392.4684996322
- S3: AddLiquidity
  Action:
    Id: 2
    IndexPipRange: 7
    Asset: base
    AmountVirtual: 100
  Expect:
    Pool:
      Liquidity: 7095.5602949328
      BaseVirtual: 100
      QuoteVirtual: 0
      BaseReal: 1548.3781976025
      QuoteReal: 32515.9421496526
      IndexPipRange: 7 
      MaxPip: 239999 
      MinPip: 210000 
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
    User:
      Id: 2
      TokenId: 1000003
      Liquidity: 7095.5602949328
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
      BaseVirtual: 100
      QuoteVirtual: 0
      BalanceBase: 9900.0000000000
      BalanceQuote: 10000.0000000000
- S4: OpenLimit
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
      BalanceBase: 9900.0000000000
      BalanceQuote: 8080.0000000000
- S5: AddLiquidity
  Action:
    Id: 4
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
      Id: 4
      TokenId: 1000004
      Liquidity: 5719.5638614056
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
      BaseVirtual: 100
      QuoteVirtual: 0
      BalanceBase: 9900.0000000000
      BalanceQuote: 10000.0000000000
- S6: DecreaseLiquidity
  Action:
    Id: 1
    TokenId: 1000001
    Liquidity: 1000.0000000000
  Expect:
    Pool:
      Liquidity: 18083.8477662026
      BaseVirtual: 189.5199331681
      QuoteVirtual: 3418.4956442572
      BaseReal: 4451.9355683703
      QuoteReal: 73456.9368781101
      IndexPipRange: 5 
      MaxPip: 179999 
      MinPip: 150000 
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
    User:
      Id: 1
      BalanceBase: 9810.4800668319
      BalanceQuote: 6581.5043557428
- S7: OpenLimit
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
      BalanceBase: 9900.0000000000
      BalanceQuote: 10000.0000000000
- S8: OpenMarket
  Action:
    Id: 3
    asset: base
    Side: 1
    Quantity: 60
  Expect:
    Pool:
      Liquidity: 18083.8477662026
      BaseVirtual: 249.5199331681
      QuoteVirtual: 2441.6607258724
      BaseReal: 4511.9355683703
      QuoteReal: 72480.1019597252
      IndexPipRange: 5
      MaxPip: 179999
      MinPip: 150000
      FeeGrowthBase: 0
      FeeGrowthQuote: 0
    User:
      Id: 3
      BalanceBase: 9840.0000000000
      BalanceQuote: 10947.5298708333
- S9: IncreaseLiquidity
  Action:
    Id: 1
    TokenId: 1000002
    Asset: base
    AmountVirtual: 30
  Expect:
    Pool:
      Liquidity: 20258.0846141286
      BaseVirtual: 279.5199331681
      QuoteVirtual: 2735.2237324272
      BaseReal: 5054.4095316025
      QuoteReal: 81194.4480690080
      IndexPipRange: 5
      MaxPip: 179999
      MinPip: 150000
      FeeGrowthBase: 0
      FeeGrowthQuote: 0
    User:
      Id: 1
      BalanceBase: 9780.4800668319
      BalanceQuote: 6297.2190163109
- S10: AddLiquidity
  Action:
    Id: 4
    IndexPipRange: 5
    Asset: base
    AmountVirtual: 100
  Expect:
    Pool:
      Liquidity: 27505.5407738820
      BaseVirtual: 379.5199331681
      QuoteVirtual: 3713.7670876098
      BaseReal: 6862.6560757096
      QuoteReal: 110242.2684332840
      IndexPipRange: 5 
      MaxPip: 179999 
      MinPip: 150000 
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0.0009723057149 
    User:
      Id: 4
      TokenId: 1000005
      Liquidity: 7247.4561597534
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0.0009723057149  
      BaseVirtual: 100
      QuoteVirtual: 978.5433551826
      BalanceBase: 9800.0000000000
      BalanceQuote: 9021.4566448174
- S11: OpenMarket
  Action:
    Id: 3
    asset: base
    Side: 0
    Quantity: 470
  Expect:
    Pool:
      Liquidity: 5719.5638614056
      BaseVirtual: 30.8192289656
      QuoteVirtual: 1312.6128405317
      BaseReal: 1278.9333595754
      QuoteReal: 25578.6671915082
      IndexPipRange: 6
      MaxPip: 209999
      MinPip: 180000
      FeeGrowthBase: 0
      FeeGrowthQuote: 0
    User:
      Id: 3
      BalanceBase: 10295.9000000000
      BalanceQuote: 2755.3972955015
- S12: ShiftRange
  Action:
    Id: 1
    TargetIndexPipRange: 6
    TokenId: 1000001
    Asset: base
    AmountVirtual: 72.2090208797
  Expect:
    Pool:
      Liquidity: 19514.1383285354
      BaseVirtual: 105.1497477407
      QuoteVirtual: 4478.4024031604
      BaseReal: 4363.4939824939
      QuoteReal: 87269.8796498783
      IndexPipRange: 6
      MaxPip: 209999 
      MinPip: 180000 
      FeeGrowthBase: 0 
      FeeGrowthQuote: 0 
    User:
      Id: 1
      BalanceBase: 9708.2710459522
      BalanceQuote: 6297.2190163109
- S13: OpenLimit
  Action:
    Id: 1
    Asset: base
    Side: 1
    Quantity: 100
    Price: 220000
  Expect:
    PendingOrder:
      OrderId: 1
      Price: 220000
      Size : 100
      Side: 1
    User:
      Id: 1
      BalanceBase: 9608.2710459522
      BalanceQuote: 6297.2190163109
- S14: IncreaseLiquidity
  Action:
    Id: 1
    TokenId: 1000001
    Asset: base
    AmountVirtual: 10
  Expect:
    Pool:
      Liquidity: 21369.9809480209
      BaseVirtual: 115.1497477407
      QuoteVirtual: 4904.3095022629
      BaseReal: 4778.4730077650
      QuoteReal: 95569.4601553004
      IndexPipRange: 6
      MaxPip: 209999
      MinPip: 180000
      FeeGrowthBase: 0.0002177183276
      FeeGrowthQuote: 0
    User:
      Id: 1
      BalanceBase: 9598.2710459522
      BalanceQuote: 5871.3119172084
- S15: DecreaseLiquidity
  Action:
    Id: 4
    TokenId: 1000004
    Liquidity: 4000.0000000000
  Expect:
    Pool:
      Liquidity: 21369.9809480209
      BaseVirtual: 115.1497477407
      QuoteVirtual: 4904.3095022629
      BaseReal: 3884.0458167651
      QuoteReal: 77680.9163353020
      IndexPipRange: 6 
      MaxPip: 209999 
      MinPip: 180000 
      FeeGrowthBase: 0.0002177183276 
      FeeGrowthQuote: 0 
    User:
      Id: 4
      Liquidity: 1719.5638614056
      BalanceBase: 9822.4244250934
      BalanceQuote: 9939.4377163386
- S16: RemoveLiquidity
  Action:
    Id: 4
    TokenId: 1000005
  Expect:
    Pool:
      Liquidity: 11716.1607310273
      BaseVirtual: 0
      QuoteVirtual: 4330.8267450575
      BaseReal: 2761.5332383966
      QuoteReal: 49707.3221378156
      IndexPipRange: 5
      MaxPip: 179999 
      MinPip: 150000 
    User:
      Id: 4
      TokenId: 1000005
      FeeGrowthBase: 0
      FeeGrowthQuote: 0
      BalanceBase: 9824.2244250934
      BalanceQuote: 12618.4276765198
- S16.1: CancelLimitOrder
  Action:
    Id: 3
    Price: 200000
    OrderId: 0
  Expect:
    User:
      Id: 3
      BalanceBase: 10374.6007042025
      BalanceQuote: 3168.6036339735
- S17: OpenMarket
  Action:
    Id: 4
    asset: base
    Side: 0
    Quantity: 120
  Expect:
    Pool:
      Liquidity: 7095.5602949328
      BaseVirtual: 73.5961959578
      QuoteVirtual: 564.0992177001
      BaseReal: 1521.9743935603
      QuoteReal: 33080.0413673527
      IndexPipRange: 7
      MaxPip: 239999
      MinPip: 210000
      FeeGrowthBase: 0.00006698110551
      FeeGrowthQuote: 0
    User:
      Id: 4
      BalanceBase: 9941.0996935661
      BalanceQuote: 10136.1818021305
- S18: IncreaseLiquidity
  Action:
    Id: 2
    TokenId: 1000003
    Asset: base
    AmountVirtual: 30
  Expect:
    Pool:
      Liquidity: 9987.9218644090
      BaseVirtual: 103.5961959578
      QuoteVirtual: 794.0428487637
      BaseReal: 2142.3764566369
      QuoteReal: 46564.4508277225
      IndexPipRange: 7
      MaxPip: 239999
      MinPip: 210000
      FeeGrowthBase: 0.00006698110551
      FeeGrowthQuote: 0
    User:
      Id: 2
      BalanceBase: 9870.0000000000
      BalanceQuote: 7850.0563689364
- S19: ShiftRange
  Action:
    Id: 1
    TargetIndexPipRange: 7
    TokenId: 1000002
    Asset: base
    AmountVirtual: 562.1190627122
  Expect:
    Pool:
      Liquidity: 64606.8111541170
      BaseVirtual: 670.1113564355
      QuoteVirtual: 5136.2612838569
      BaseReal: 13827.2134535708
      QuoteReal: 300533.8295931150
      IndexPipRange: 7
      MaxPip: 239999 
      MinPip: 210000 
      FeeGrowthBase: 0.00006698110551 
      FeeGrowthQuote: 0 
    User:
      Id: 1
      BalanceBase: 9036.1519832400
      BalanceQuote: 5871.3119172084
- S20: ShiftRange
  Action:
    Id: 2
    TargetIndexPipRange: 6
    TokenId: 1000003
    Asset: quote
    AmountVirtual: 0
  Expect:
    Pool:
      Liquidity: 19705.9225771588
      BaseVirtual: 0.0000000000
      QuoteVirtual: 6698.5179361946
      BaseReal: 4300.1950885133
      QuoteReal: 90303.6668392710
      IndexPipRange: 6
      MaxPip: 209999 
      MinPip: 180000 
      FeeGrowthBase: 0.0003147093106
      FeeGrowthQuote: 0 
    User:
      Id: 2
      BalanceBase: 9974.2651980060
      BalanceQuote: 7850.0563689364
- S21: DecreaseLiquidity
  Action:
    Id: 1
    TokenId: 1000002
    Liquidity: 1000.0000000000
  Expect:
    Pool:
      Liquidity: 54618.8892897080
      BaseVirtual: 556.1430132618
      QuoteVirtual: 4262.7181286688
      BaseReal: 11470.3402792261
      QuoteReal: 249307.3027640120
      IndexPipRange: 7 
      MaxPip: 239999 
      MinPip: 210000 
      FeeGrowthBase: 0.00006698110551
      FeeGrowthQuote: 0 
    User:
      Id: 1
      Liquidity: 53618.8892897080
      BalanceBase: 9046.5911115613
      BalanceQuote: 5950.8122236328
- S22: RemoveLiquidity
  Action:
    Id: 1
    TokenId: 1000001
  Expect:
    Pool:
      Liquidity: 4055.5054905435
      BaseVirtual: 0
      QuoteVirtual: 1378.5640414638
      BaseReal: 884.9859590988
      QuoteReal: 18584.6166424792
      IndexPipRange: 6
      MaxPip: 209999 
      MinPip: 180000 
    User:
      Id: 1
      TokenId: 1000001
      FeeGrowthBase: 0
      FeeGrowthQuote: 0 
      BalanceBase: 9048.1090608992
      BalanceQuote: 11270.7661183636
- S23: RemoveLiquidity
  Action:
    Id: 1
    TokenId: 1000002
  Expect: 
    User:
      Id: 1
      TokenId: 1000002
      FeeGrowthBase: 0
      FeeGrowthQuote: 0 
      BalanceBase: 9602.698964
      BalanceQuote: 15522.0925569966
- S24: RemoveLiquidity
  Action:
    Id: 2
    TokenId: 1000003
  Expect:
    Pool:
      Liquidity: 1719.5638614056
      BaseVirtual: 0
      QuoteVirtual: 584.5211927001
      BaseReal: 375.2404913928
      QuoteReal: 7880.0127951995
      IndexPipRange: 6
      MaxPip: 209999 
      MinPip: 180000 
    User:
      Id: 2
      TokenId: 1000003
      FeeGrowthBase: 0
      FeeGrowthQuote: 0 
      BalanceBase: 9975.0003405858
      BalanceQuote: 8644.0992177001
- S25: RemoveLiquidity
  Action:
    Id: 4
    TokenId: 1000004
  Expect: 
    User:
      Id: 4
      TokenId: 1000004
      FeeGrowthBase: 0
      FeeGrowthQuote: 0 
      BalanceBase: 9941.6408563236
      BalanceQuote: 10720.7029948306
`)
    })
})
