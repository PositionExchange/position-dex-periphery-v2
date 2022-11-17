import {task} from "hardhat/config";
import {readConfig, verifyContract, verifyImplContract, writeConfig} from "./utils-deploy";
import {verify} from "@openzeppelin/hardhat-upgrades/dist/verify-proxy";


task('deploy-PositionStakingDexManager-testnet', 'How is your girl friend?', async (taskArgs, hre) => {

    const configData = await readConfig('config-testnet.json');

    const PositionStakingDexManager = await hre.ethers.getContractFactory("PositionStakingDexManager")

    const contractArgs : string[] = [configData.tokenEarn, configData.positionConcentratedLiquidity, 1000];

    const instance = await hre.upgrades.deployProxy(
        PositionStakingDexManager,
        contractArgs
    );
    await instance.deployed();

    const address = instance.address
    console.log("PositionStakingDexManager deploy address: ",  address);

    const upgraded = await hre.upgrades.upgradeProxy(
        address,
        PositionStakingDexManager
    );
    await verifyImplContract(hre,upgraded.deployTransaction, "contracts/staking/PositionStakingDexManager.sol:PositionStakingDexManager");
    configData.PositionStakingDexManager = address
    await writeConfig('config-testnet.json', configData);
})

task('upgrade-PositionStakingDexManager-testnet', 'How is your girl friend?', async (taskArgs, hre) => {

    const configData = await readConfig('config-testnet.json');

    const PositionConcentratedLiquidity = await hre.ethers.getContractFactory("PositionStakingDexManager")

    const upgraded = await hre.upgrades.upgradeProxy(
        configData.PositionStakingDexManager,
        PositionConcentratedLiquidity
    );
    await verifyImplContract(hre,upgraded.deployTransaction, "contracts/staking/PositionStakingDexManager.sol:PositionStakingDexManager");
    await writeConfig('config-testnet.json', configData);
})
