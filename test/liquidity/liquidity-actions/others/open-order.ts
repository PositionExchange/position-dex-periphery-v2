import {deployAndCreateRouterHelper, TestLiquidity} from "../../test-liquidity";

describe("OpenOrder", async function(){
    let testHelper: TestLiquidity

    beforeEach(async () => {
        testHelper = await deployAndCreateRouterHelper(10_000, false)
    })


    it ("OpenOrderWithQuote", async () => {
        return testHelper.process(`
- S0: SetCurrentPrice
  Action: 
    Price: 50000
- S1: OpenLimit
  Action:
    Id: 1
    Asset: base
    Side: 0
    Quantity: 20
    Price: 40000
  User:
    Id: 1
    BalanceBase: 1000
    BalanceQuote: 920
- S2: OpenMarket
  Action:
    id: 2
    asset: base
    Side: 1
    Quantity: 10
  User:
    Id: 1
    BalanceBase: 1010
    BalanceQuote: 920
- S3: OpenLimit
  Action:
    Id: 3
    Asset: base
    Side: 1
    Quantity: 20
    Price: 60000
- S4: OpenMarket
  Action:
    id: 4
    asset: quote
    Side: 0
    Quantity: 120
  User:
    Id: 4
    BalanceBase: 1020
    BalanceQuote: 880
`)
    })
    it ("OpenOrderWithQuote-1", async () => {
        return testHelper.process(`
- S0: SetCurrentPrice
  Action: 
    Price: 70000
- S1: OpenLimit
  Action:
    Id: 2
    Asset: base
    Side: 0
    Quantity: 10
    Price: 60000
- S2: OpenMarket
  Action:
    id: 2
    asset: quote
    Side: 1
    Quantity: 4
  User:
    Id: 2
    BalanceBase: 1020
    BalanceQuote: 880 
`)
    })
    it ("OpenOrderWithQuote-No-Liquidity", async () => {
        return testHelper.process(`
- S0: SetCurrentPrice
  Action: 
    Price: 10000
- S1: OpenMarket
  Action:
    id: 2
    asset: quote
    Side: 0
    Quantity: 10
`)
    })
})
