import { ethers } from "hardhat";
import { MockToken } from "../../typechain";

export async function deployMockToken(name: string): Promise<MockToken> {
    const mockToken = await ethers.getContractFactory("MockToken")
    const instance = await mockToken.deploy(name, name)
    await instance.deployed()
    return instance;
}

export async function deployPairManager(name: string): Promise<MockToken> {
    const mockToken = await ethers.getContractFactory("MockToken")
    const instance = await mockToken.deploy(name, name)
    await instance.deployed()
    return instance;
}


