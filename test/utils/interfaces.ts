import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import {
  MockToken, SpotHouse,ForkMatchingEngineAMM
} from "../../typechain";
import {boolean, string} from "hardhat/internal/core/params/argumentTypes";
import { BytesLike } from "@ethersproject/bytes";
import internal from "stream";

export interface OpenLimitOrderParams {
  user: SignerWithAddress;
  contract: SpotHouse;
  side: any;
  quantity: string | number;
  pip: string | number;
  pairManager: ForkMatchingEngineAMM;
}

export interface OpenMarketOrderParams {
  user: SignerWithAddress;
  contract: SpotHouse;
  side: any;
  quantity: string | number;
  pairManager: ForkMatchingEngineAMM;
  baseAsset: any;
  quoteAsset: any;
}

export interface ExpectMarketOrderParams {
  quoteExpected: number | string;
  baseExpected: number | string;
}

export interface CancelLimitOrderParameters {
  user: SignerWithAddress;
  contract: SpotHouse;
  side: any;
  orderIdx: number;
  pip: number;
  ForkMatchingEngineAMM: ForkMatchingEngineAMM;
  isPartialFilled: boolean;
  quoteAsset: MockToken;
  baseAsset: MockToken;
}


export interface AddLiquidityParams {
  poolId: any;
  baseAmount: number;
  quoteAmount: number;
}

export interface ExpectOrderAddLiquidity {
  pip: number,
  amount: number,
  hasLiquidity: boolean
}

export interface LimitOrder {
  isBuy: boolean,
  pip: number,
  quantity: number
}
