import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import {
  MockToken
} from "../../typechain";
import { string } from "hardhat/internal/core/params/argumentTypes";
import { BytesLike } from "@ethersproject/bytes";
import internal from "stream";

export interface OpenLimitOrderParams {
  user: SignerWithAddress;
  contract: SpotHouse;
  side: any;
  quantity: string | number;
  pip: string | number;
  pairManager: PairManager;
}

export interface OpenMarketOrderParams {
  user: SignerWithAddress;
  contract: SpotHouse;
  side: any;
  quantity: string | number;
  pairManager: PairManager;
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
  pairManager: PairManager;
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
