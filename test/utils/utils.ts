import dayjs from "dayjs";
import {ethers} from "hardhat";
import {expect, use} from "chai";
// import {waffle} from "hardhat";
// const {solidity} = waffle
import {IERC20, MockToken} from "../../typechain";
import { BigNumber } from "ethers";
import {SignerWithAddress} from "@nomiclabs/hardhat-ethers/signers";
// @ts-ignore
import {crypto} from "crypto";
import Wallet from "ethereumjs-wallet";
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