import {task} from "hardhat/config";
import {readConfig, verifyContract, verifyImplContract, writeConfig} from "./utils-deploy";
import {verify} from "@openzeppelin/hardhat-upgrades/dist/verify-proxy";
import {ForkMatchingEngineAMM} from "../typeChain";


task('deploy-tokenTreasury-testnet', 'How is your girl friend?', async (taskArgs, hre) => {

    const configData = await readConfig('config-testnet.json');

    const mockTokenTreasury = await hre.ethers.getContractFactory("MockTokenTreasury")

    const contractArgs : string[] = [configData.mockRewardToken];



    const hardhatDeployContract = await mockTokenTreasury.deploy(...contractArgs);

    await hardhatDeployContract.deployTransaction.wait(5);

    const address = hardhatDeployContract.address
    console.log("MockTokenTreasury deployed address: ",  address);


    await verifyContract(hre,address, contractArgs,"contracts/test/staking/MockTokenTreasury.sol:MockTokenTreasury");
    configData.mockTokenTreasury = address
    await writeConfig('config-testnet.json', configData);
})


task('deploy-tokenReward-testnet', 'How is your girl friend?', async (taskArgs, hre) => {

    const configData = await readConfig('config-testnet.json');

    const mockRewardToken = await hre.ethers.getContractFactory("MockTokenReward")

    const contractArgs : string[] = [];



    const hardhatDeployContract = await mockRewardToken.deploy();

    await hardhatDeployContract.deployTransaction.wait(5);

    const address = hardhatDeployContract.address
    console.log("MockTokenReward deployed address: ",  address);


    await verifyContract(hre,address, [],"contracts/test/staking/MockTokenReward.sol:MockTokenReward");
    configData.mockRewardToken = address
    await writeConfig('config-testnet.json', configData);
})