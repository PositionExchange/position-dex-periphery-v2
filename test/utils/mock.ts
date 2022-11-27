import { ethers } from "hardhat";
export async function deployMockToken(name: string): Promise<any> {
  const mockToken = await ethers.getContractFactory("MockToken02");
  const instance = await mockToken.deploy(name, name);
  await instance.deployed();
  return instance;
}

export async function deployMockReflexToken(name: string): Promise<any> {
  const mockReflexToken = await ethers.getContractFactory("MockReflexToken");
  const instance = await mockReflexToken.deploy(name, name);
  await instance.deployed();
  return instance;
}

export async function deployMockWrappedBNB(): Promise<any> {
  const mockWBNB = await ethers.getContractFactory("MockWBNB");
  const instance = await mockWBNB.deploy();
  await instance.deployed();
  return instance;
}
