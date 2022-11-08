import dayjs from "dayjs";
import {ethers} from "hardhat";
import {expect, use} from "chai";
// import {waffle} from "hardhat";
// const {solidity} = waffle
import {IERC20} from "../../typechain";
import {BigNumber} from "ethers";
import {SignerWithAddress} from "@nomiclabs/hardhat-ethers/signers";
// @ts-ignore
import {crypto} from "crypto";
import Wallet from "ethereumjs-wallet";
import {
    CancelLimitOrderParameters,
    ExpectMarketOrderParams,
    OpenLimitOrderParams,
    OpenMarketOrderParams
} from "./interfaces";
import {log} from "util";
import {getAddress, keccak256, solidityPack} from "ethers/lib/utils";

// use(solidity);

export interface ExpectErc20Detail {
    user: string;
    changedAmount: number;
    balanceBefore?: BigNumber;
    balanceAfter?: BigNumber;
}

export const SIDE = {
    BUY: 0,
    SELL: 1
};

export const ASSET = {
    QUOTE: 0,
    BASE: 1
};

export const now = () => dayjs().unix();

export async function deployContract<T>(
    artifactName: string,
    deployer?: SignerWithAddress,
    ...args: any[]
): Promise<T> {
    const [signer1] = await ethers.getSigners();
    deployer = deployer || signer1;
    const Contract = await ethers.getContractFactory(artifactName);
    const ins = await Contract.deploy(...args);
    await ins.connect(deployer).deployed();
    return ins as unknown as T;
}

export async function expectEvent(
    contract: any,
    call: any,
    eventName: string,
    args: any[]
): Promise<any> {
    await expect(call)
        .to.emit(contract, eventName)
        .withArgs(...args);
}

export async function expectRevert(call: any, message: string) {
    await expect(call).to.revertedWith(message);
}

export function toWeiWithRound(value: number | string) {
  return ethers.utils.parseEther((value as number).toFixed(12).toString());
}



export function toWei(value: number | string | BigNumber) {
    return ethers.utils.parseEther(value.toString());
}

export function fromWei(value: BigNumber): Number {
    return Number(toEther(value.toString()));
}

export function toEther(value: number | string) {
    return ethers.utils.formatEther(value);
}

export async function expectEqual(call: Promise<any>, result: any) {
    console.log(result);
    expect(await call).to.equal(result);
}

/// Check balance of list address
/// Expect with After Balance sub Before Balance
export async function expectERC20Balance(
    token: IERC20,
    users: string[],
    expectAmounts: number[],
    executeFn: Function
) {
    const balanceBefore = await Promise.all(
        users.map(async (address) => {
            return await token.balanceOf(address);
        })
    );
    await executeFn.call(undefined);
    // callback execute

    const balanceAfter = await Promise.all(
        users.map(async (address) => {
            return await token.balanceOf(address);
        })
    );

    expectAmounts.forEach((amount, index) => {
        expect(
            balanceAfter[index].sub(balanceBefore[index]),
            `expect balance not 
        correct at index ${index} with expect amount ${expectAmounts[index]}`
        ).to.be.equal(toWeiWithRound(amount));
    });
}


export async function expectMultiERC20Balance(
    tokenBase: IERC20,
    expectAmountsBase: number[],
    tokenQuote: IERC20,
    expectAmountsQuote: number[],
    users: string[],
    executeFn: Function
) {
    const balanceBeforeTokenBase = await Promise.all(
        users.map(async (address) => {
            return await tokenBase.balanceOf(address);
        })
    );

    const balanceBeforeTokenQuote = await Promise.all(
        users.map(async (address) => {
            return await tokenQuote.balanceOf(address);
        })
    );
    await executeFn.call(undefined);
    // callback execute

    const balanceAfterTokenBase = await Promise.all(
        users.map(async (address) => {
            return await tokenBase.balanceOf(address);
        })
    );

    const balanceAfterTokenQuote = await Promise.all(
        users.map(async (address) => {
            return await tokenQuote.balanceOf(address);
        })
    );

    expectAmountsBase.forEach((amount, index) => {
        expect(
            balanceAfterTokenBase[index].sub(balanceBeforeTokenBase[index]),
            `expect balance not 
        correct at index ${index} with expect amount ${expectAmountsBase[index]}`
        ).to.be.equal(toWei(amount));
    });


    expectAmountsQuote.forEach((amount, index) => {
        expect(
            balanceAfterTokenQuote[index].sub(balanceBeforeTokenQuote[index]),
            `expect balance not 
        correct at index ${index} with expect amount ${expectAmountsQuote[index]}`
        ).to.be.equal(toWei(amount));
    });

}

export async function expectBalanceOfToken(
    token: IERC20,
    address: string,
    expectedAmount: BigNumber
) {
    const tokenBalance = await token.balanceOf(address);
    await expect(tokenBalance).eq(expectedAmount);
}

export async function setDataForExpectedMap(
    expectedMap: Map<IERC20, ExpectErc20Detail[]>,
    token: IERC20,
    users: string[],
    changedAmounts: number[]
): Promise<any> {
    const expectedDetails: ExpectErc20Detail[] = [];
    users.forEach((user, index) => {
        expectedDetails.push({
            user: user,
            changedAmount: changedAmounts[index]
        });
    });
    expectedMap.set(token, expectedDetails);
    return expectedMap;
}
export async function approveAndMintToken(
  quoteAsset: any,
  baseAsset: any,
  contract: any,
  users: SignerWithAddress[]
) {

  const quoteSymbol = await quoteAsset.symbol();
  const baseSymbol = await baseAsset.symbol();
  console.log(quoteSymbol)

  users.forEach((user) => {


    if ( quoteSymbol != "WBNB"){
      quoteAsset.mint(user.address, toWei(1000));
    }
    quoteAsset
      .connect(user)
      .approve(contract.address, ethers.constants.MaxUint256);

    if ( baseSymbol != "WBNB"){
      baseAsset.mint(user.address, toWei(1000));
    }
    baseAsset
      .connect(user)
      .approve(contract.address, ethers.constants.MaxUint256);
  });
}


export async function approve(
    quoteAsset: any,
    baseAsset: any,
    contract: any,
    users: SignerWithAddress[]
) {

    const quoteSymbol = await quoteAsset.symbol();
    const baseSymbol = await baseAsset.symbol();

    users.forEach((user) => {

        quoteAsset
            .connect(user)
            .approve(contract.address, ethers.constants.MaxUint256);

        baseAsset
            .connect(user)
            .approve(contract.address, ethers.constants.MaxUint256);
    });
}

export async function approveAndMintToken2(
  quoteAsset: any,
  baseAsset: any,
  contract: any,
  users: SignerWithAddress[]
) {

  const quoteSymbol = await quoteAsset.symbol();
  const baseSymbol = await baseAsset.symbol();

  users.forEach((user) => {


    if ( quoteSymbol != "WBNB"){
      quoteAsset.mint(user.address, toWei(10000));
    }
    quoteAsset
      .connect(user)
      .approve(contract.address, ethers.constants.MaxUint256);

    if ( baseSymbol != "WBNB"){
      baseAsset.mint(user.address, toWei(10000));
    }
    baseAsset
      .connect(user)
      .approve(contract.address, ethers.constants.MaxUint256);
  });
}


async function getOrderIdByTx(tx: any) {
  const receipt = await tx.wait();
  const a =
    ((receipt?.events || [])[2]?.args || []).orderId ||
    ((receipt?.events || [])[3]?.args || []).orderId ||
    ((receipt?.events || [])[4]?.args || []).orderId ||
    ((receipt?.events || [])[5]?.args || []).orderId;


    return a;
}

// export async function openMarketOrderWithPairManager(
//   deployer: SignerWithAddress,
//   spotHouse: SpotHouse,
//   _pairManager: PairManager,
//   side: any,
//   quantity: number | string
// ) {
//   // _pairManager.open
//   await _pairManager.connect(deployer).setCounterParty(deployer.address);
//   await _pairManager
//     .connect(deployer)
//     .openMarketPosition(toWei(quantity), side == SIDE.BUY);
//
//   await _pairManager.connect(deployer).setCounterParty(spotHouse.address);
//
//   // mock transfer asset for spot funding
// }


export async function openMarketOrderQuoteAndExpect(
  {
    user,
    contract,
    side,
    quantity,
    pairManager,
    quoteAsset,
    baseAsset
  }: OpenMarketOrderParams,
  {quoteExpected, baseExpected}: ExpectMarketOrderParams,
  executeFn: Function,
  useBaseReflexToken: boolean = false,
  useQuoteReflexToken: boolean = false
) {
  const quoteBalanceUserBefore = await quoteAsset.balanceOf(user.address);
  const quoteBalanceFundingBefore = await quoteAsset.balanceOf(
    pairManager.address
  );

  const baseBalanceUserBefore = await baseAsset.balanceOf(user.address);
  const baseBalanceFundingBefore = await baseAsset.balanceOf(
    pairManager.address
  );

  await executeFn.call(undefined);

  const quoteBalanceUserAfter = await quoteAsset.balanceOf(user.address);


  const baseBalanceUserAfter = await baseAsset.balanceOf(user.address);

  const quoteBalanceFundingAfter = await quoteAsset.balanceOf(
    pairManager.address
  );
  const baseBalanceFundingAfter = await baseAsset.balanceOf(
    pairManager.address
  );

  if (side == SIDE.BUY) {
    // user balance expect
    // transfer quote to funding
    // receive base to account
    expect(quoteBalanceUserBefore.sub(quoteBalanceUserAfter)).to.equal(
      toWei(quoteExpected)
    );


    console.log((Math.round(Number(Number(baseBalanceUserAfter.sub(baseBalanceUserBefore).toString())/1000000))*1000000).toString());
    Math.round(Number())

    const a = (baseBalanceUserAfter.sub(baseBalanceUserBefore)).toString()
    const b = a.slice(0, a.length - 6);

    expect( (Number(b) * 1000000).toString()).to.equal(
      useBaseReflexToken
        ? toWeiWithRound((baseExpected as number) * 0.99)
        : toWeiWithRound(baseExpected)
    );

    // funding balance expect
    expect((quoteBalanceFundingAfter.sub(quoteBalanceFundingBefore))).to.equal(
      useQuoteReflexToken
        ? toWei((quoteExpected as number) * 0.99)
        : toWei(quoteExpected)
    );


    const c = (baseBalanceFundingBefore.sub(baseBalanceFundingAfter)).toString()
    const d = c.slice(0, c.length - 6);
    expect((Number(d)* 1000000).toString()).to.equal(
      toWeiWithRound(baseExpected)
    );
  } else {
    // SELL

    // user balance expect
    expect(quoteBalanceUserAfter.sub(quoteBalanceUserBefore)).to.equal(
      useQuoteReflexToken
        ? toWei((quoteExpected as number) * 0.99).toString()
        : toWei(quoteExpected).toString()
    );

    expect(baseBalanceUserBefore.sub(baseBalanceUserAfter)).to.equal(
      toWei(quantity)
    );

    // funding balance expect
    expect(quoteBalanceFundingBefore.sub(quoteBalanceFundingAfter)).to.equal(
      toWei(quoteExpected)
    );
    expect(baseBalanceFundingAfter.sub(baseBalanceFundingBefore)).to.equal(
      toWei(baseExpected)
    );
  }
}

export async function openMarketOrderAndExpect(
    {
        user,
        contract,
        side,
        quantity,
        pairManager,
        quoteAsset,
        baseAsset
    }: OpenMarketOrderParams,
    {quoteExpected, baseExpected}: ExpectMarketOrderParams,
    executeFn: Function,
    useBaseReflexToken: boolean = false
) {
    const quoteBalanceUserBefore = await quoteAsset.balanceOf(user.address);
    const quoteBalanceFundingBefore = await quoteAsset.balanceOf(
        pairManager.address
    );

    const baseBalanceUserBefore = await baseAsset.balanceOf(user.address);
    const baseBalanceFundingBefore = await baseAsset.balanceOf(
        pairManager.address
    );

    await executeFn.call(undefined);

    const quoteBalanceUserAfter = await quoteAsset.balanceOf(user.address);


    const baseBalanceUserAfter = await baseAsset.balanceOf(user.address);

    const quoteBalanceFundingAfter = await quoteAsset.balanceOf(
        pairManager.address
    );
    const baseBalanceFundingAfter = await baseAsset.balanceOf(
        pairManager.address
    );

    if (side == SIDE.BUY) {
        // user balance expect
        // transfer quote to funding
        // receive base to account
        expect(quoteBalanceUserBefore.sub(quoteBalanceUserAfter)).to.equal(
          toWeiWithRound(quoteExpected)
        );

        expect(baseBalanceUserAfter.sub(baseBalanceUserBefore)).to.equal(
            useBaseReflexToken
                ? toWei((baseExpected as number) * 0.99)
                : toWei(baseExpected)
        );

        // funding balance expect
        expect(quoteBalanceFundingAfter.sub(quoteBalanceFundingBefore)).to.equal(
          toWeiWithRound(quoteExpected)
        );
        expect(baseBalanceFundingBefore.sub(baseBalanceFundingAfter)).to.equal(
          toWeiWithRound(baseExpected)
        );
    } else {
        // SELL

        // user balance expect
        // expect(quoteBalanceUserAfter.sub(quoteBalanceUserBefore)).to.equal(
        //   useBaseReflexToken
        //     ? toWei((quoteExpected as number) * 0.99).toString()
        //     : toWei(quoteExpected).toString()
        // );
      expect(quoteBalanceUserAfter.sub(quoteBalanceUserBefore)).to.equal(
        toWeiWithRound(quoteExpected)
      );

        expect(baseBalanceUserBefore.sub(baseBalanceUserAfter)).to.equal(
          toWeiWithRound(quantity)
        );

        // funding balance expect
        expect(quoteBalanceFundingBefore.sub(quoteBalanceFundingAfter)).to.equal(
          toWeiWithRound(quoteExpected)
        );
        expect(baseBalanceFundingAfter.sub(baseBalanceFundingBefore)).to.equal(
          toWeiWithRound(baseExpected)
        );
    }
}


export async function openLimitOrderAndExpect(
  { user, contract, side, quantity, pip, pairManager }: OpenLimitOrderParams,
  expectedSizeLimitOrder: number = 0,
  notFilledSamePip: boolean = true,
  isBNB: boolean = false,
  fee : number = 0
): Promise<string> {


  let tx: any;
  if (!isBNB) {
    tx = await contract
      .connect(user)
      .openLimitOrder(pairManager.address, side, toWei(quantity), pip);


  } else {
    const valueBNB = (quantity as number) * (pip as number) /1000;

    tx = await contract
      .connect(user)
      .openLimitOrder(pairManager.address, side, toWei(quantity), pip, { value: toWei(valueBNB) });
  }


  if (notFilledSamePip) {
    console.log(
      "GAS USED OPEN LIMIT ORDER",
      (await tx.wait()).gasUsed.toString()
    );

    console.log("GAS USED LIMIT", (await tx.wait()).gasUsed.toString());


    const orderId = await getOrderIdByTx(tx);
    const { isFilled, isBuy, size, partialFilled } =
      await pairManager.getPendingOrderDetail(
        pip,
        BigNumber.from(orderId.toString())
      );


    if (fee == 0) {
      expect(size).to.equal(
        expectedSizeLimitOrder == 0
          ? toWei(quantity)
          : toWei(expectedSizeLimitOrder)
      );
    }else {
      expect(size).to.equal(
        expectedSizeLimitOrder == 0
          ? toWei(  (quantity as number ) )
          : toWei(expectedSizeLimitOrder)
      );
    }

    if (side == SIDE.BUY) {
      expect(isBuy).to.equal(true);
    } else {
      expect(isBuy).to.equal(false);
    }
    expect(isFilled).to.equal(false);
    expect(partialFilled).to.equal(0);
    return orderId.toString();
  } else {
    // TODO open Market Order
  }
  return "";
}


export async function openLimitOrderQuoteAndExpect(
  { user, contract, side, quantity, pip, pairManager }: OpenLimitOrderParams,
  quoteAmount : number,
  expectedSizeLimitOrder: number = 0,
  notFilledSamePip: boolean = true,
  isBNB: boolean = false,
  fee : number = 0
): Promise<string> {


  let tx: any;
  if (!isBNB) {
    tx = await contract
      .connect(user)
      .openLimitOrderWithQuote(pairManager.address, side, toWei(quoteAmount), pip);


  } else {
    const valueBNB = (quoteAmount as number) * (pip as number) /1000;

    tx = await contract
      .connect(user)
      .openLimitOrderWithQuote(pairManager.address, side, toWei(quoteAmount), pip, { value: toWei(valueBNB) });
  }


  if (notFilledSamePip) {
    console.log(
      "GAS USED OPEN LIMIT ORDER",
      (await tx.wait()).gasUsed.toString()
    );

    console.log("GAS USED LIMIT", (await tx.wait()).gasUsed.toString());


    const orderId = await getOrderIdByTx(tx);
    const { isFilled, isBuy, size, partialFilled } =
      await pairManager.getPendingOrderDetail(
        pip,
        BigNumber.from(orderId.toString())
      );


    if (fee == 0) {
      expect(size).to.equal(
        expectedSizeLimitOrder == 0
          ? toWei(quantity)
          : toWei(expectedSizeLimitOrder)
      );
    }else {
      expect(size).to.equal(
        expectedSizeLimitOrder == 0
          ? toWei(  (quantity as number ) * (1- fee))
          : toWei(expectedSizeLimitOrder)
      );
    }

    if (side == SIDE.BUY) {
      expect(isBuy).to.equal(true);
    } else {
      expect(isBuy).to.equal(false);
    }
    expect(isFilled).to.equal(false);
    expect(partialFilled).to.equal(0);
    return orderId.toString();
  } else {
    // TODO open Market Order
  }
  return "";
}


export async function cancelLimitOrderAndExpect(
    {
        user,
        contract,
        side,
        orderIdx,
        pip,
        pairManager,
        isPartialFilled,
        quoteAsset,
        baseAsset,
    }: CancelLimitOrderParameters,
    quoteExpected: number | string = 0,
    baseExpected: number | string= 0,
    decimal : boolean = false
) {
    const limitOrder = await contract.limitOrders(
        pairManager.address,
        user.address,
        orderIdx
    );

  const pendingOrder = await pairManager.getPendingOrderDetail(
    pip,
    limitOrder.orderId
  );

  const quoteBalanceUserBefore = await quoteAsset.balanceOf(user.address);
  const baseBalanceUserBefore = await baseAsset.balanceOf(user.address);

  const quoteBalanceFundingBefore = await quoteAsset.balanceOf(
    pairManager.address
  );
  const baseBalanceFundingBefore = await baseAsset.balanceOf(
    pairManager.address
  );

  const tx = await contract
    .connect(user)
    .cancelLimitOrder(pairManager.address, orderIdx, pip);

  console.log(
    "GAS USED CANCELED LIMIT ORDER",
    (await tx.wait()).gasUsed.toString()
  );
  if (side == SIDE.BUY) {
    const quoteBalanceUserAfter = await quoteAsset.balanceOf(user.address);
    if (isPartialFilled) {
      if(decimal){
        expect(quoteBalanceUserAfter.sub(quoteBalanceUserBefore)).to.equal(
          quoteExpected
        );
      }else {
        expect(quoteBalanceUserAfter.sub(quoteBalanceUserBefore)).to.equal(
          toWeiWithRound(quoteExpected)
        );
      }


      const baseBalanceFundingAfter = await baseAsset.balanceOf(
        pairManager.address
      );

      if (decimal){
        expect(baseBalanceFundingBefore.sub(baseBalanceFundingAfter)).to.equal(
          baseExpected
        );
      }else
      expect(baseBalanceFundingBefore.sub(baseBalanceFundingAfter)).to.equal(
        toWei(baseExpected)
      );
    } else {
      const quoteBalanceUserAfter = await quoteAsset.balanceOf(user.address);
      expect(quoteBalanceUserAfter.sub(quoteBalanceUserBefore)).to.equal(
       toWei(quoteExpected)
      );

      const quoteBalanceFundingAfter = await quoteAsset.balanceOf(
        pairManager.address
      );
      expect(quoteBalanceFundingBefore.sub(quoteBalanceFundingAfter)).to.equal(
       toWei(quoteExpected)
      );
    }
  } else {
    const baseBalanceUserAfter = await baseAsset.balanceOf(user.address);
    if (isPartialFilled) {
      if (decimal) {
        expect(baseBalanceUserAfter.sub(baseBalanceUserBefore)).to.equal(
          baseExpected
        );
      }else{
        expect(baseBalanceUserAfter.sub(baseBalanceUserBefore)).to.equal(
          toWeiWithRound(baseExpected)
        );

      }


      const quoteBalanceFundingAfter = await quoteAsset.balanceOf(
        pairManager.address
      );
      if (decimal) {
        expect(quoteBalanceFundingBefore.sub(quoteBalanceFundingAfter)).to.equal(
          quoteExpected
        );
      }else
      expect(quoteBalanceFundingBefore.sub(quoteBalanceFundingAfter)).to.equal(
        toWei(quoteExpected)
      );
    } else {
      expect(baseBalanceUserAfter.sub(baseBalanceUserBefore)).to.equal(
        toWei(baseExpected)
      );

      const baseBalanceFundingAfter = await baseAsset.balanceOf(
        pairManager.address
      );
      expect(baseBalanceFundingBefore.sub(baseBalanceFundingAfter)).to.equal(
        toWei(baseExpected)
      );
    }
  }

  const limitOrderData = await contract.limitOrders(
    pairManager.address,
    user.address,
    orderIdx
  );

  expect(limitOrderData.pip).to.equal(0);
  expect(limitOrderData.orderId).to.equal(0);
  expect(limitOrderData.baseAmount).to.equal(0);
  expect(limitOrderData.quoteAmount).to.equal(0);
}



export function generateRandomAddress(): string {
  return Wallet.generate().getAddressString();
}

export async function getAccount(): Promise<SignerWithAddress[]> {
  return ethers.getSigners();
}

export function getCreate2Address(
  factoryAddress: string,
  [baseAsset ,quoteAsset ]: any,
  bytecode: string
): string {
  const create2Inputs = [
    "0xff",
    factoryAddress,
    keccak256(solidityPack(["address", "address", "address"], [baseAsset, quoteAsset, factoryAddress])),
    keccak256(bytecode)
  ];
  const sanitizedInputs = `0x${create2Inputs.map(i => i.slice(2)).join("")}`;
  return getAddress(`0x${keccak256(sanitizedInputs).slice(-40)}`);
}




export async function expectBalanceAddress(
    address: string,
    baseAsset: IERC20,
    baseExpect: number | string,
    quoteAsset: IERC20,
    quoteExpect: number | string,
) {


    // const a =(await quoteAsset.balanceOf(address)).toString()
    // const b = a.slice(0, a.length - 6);
    expect(toWeiWithRound(quoteExpect)).to.equal((await quoteAsset.balanceOf(address)))

  const c =(await baseAsset.balanceOf(address)).toString()
  // console.log("c: ", c);
  // const d = c.slice(0, c.length - 6);
  // console.log((Number(d)* 1000000).toString());
    expect(toWeiWithRound(baseExpect)).to.equal(await baseAsset.balanceOf(address))
}


export async function expectBalanceWithSliceAddress(
  address: string,
  baseAsset: IERC20,
  baseExpect: number | string,
  quoteAsset: IERC20,
  quoteExpect: number | string,
) {


  const a =(await quoteAsset.balanceOf(address)).toString()
  const b = a.slice(0, a.length - 6);
  expect(toWeiWithRound(quoteExpect)).to.equal((Number(b) * 1000000).toString())

  const c =(await baseAsset.balanceOf(address)).toString()
  const d = c.slice(0, c.length - 6);
  expect(toWeiWithRound(baseExpect)).to.equal((Number(d) * 1000000).toString())
}




export function CalcRefundFee(amount : number, fee : number) : number {

  return (amount * fee) /(1- fee);
}


Object.defineProperty(Object.prototype, "getProp", {
    value: function(prop) {
        var key, self = this;
        for (key in self) {
            if (key.toLowerCase() == prop.toLowerCase()) {
                return self[key];
            }
        }
    },
    //this keeps jquery happy
    enumerable: false
});


