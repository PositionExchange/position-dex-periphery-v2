import {task} from "hardhat/config";
import {readConfig, verifyImplContract, writeConfig} from "../utils-deploy";
import {verify} from "@openzeppelin/hardhat-upgrades/dist/verify-proxy";
import {HardhatRuntimeEnvironment} from "hardhat/types";


task('deploy-PositionStakingDexManager-testnet', 'How is your girl friend?', async (taskArgs, hre) => {

    let configData = await readConfig('config-testnet.json');
    configData = await stakingDex(configData, hre);
    await writeConfig('config-testnet.json', configData);
})


task('deploy-PositionStakingDexManager-mainnet', 'How is your girl friend?', async (taskArgs, hre) => {

    let configData = await readConfig('config.json');
    configData = await stakingDex(configData, hre);
    await writeConfig('config.json', configData);
})


task('upgrade-PositionStakingDexManager-mainnet', 'How is your girl friend?', async (taskArgs, hre) => {

    const configData = await readConfig('config.json');

    const PositionConcentratedLiquidity = await hre.ethers.getContractFactory("PositionStakingDexManager")

    const upgraded = await hre.upgrades.upgradeProxy(
        configData.positionStakingDexManager,
        PositionConcentratedLiquidity
    );
    await verifyImplContract(hre, upgraded.deployTransaction, "contracts/staking/PositionStakingDexManager.sol:PositionStakingDexManager");
    await writeConfig('config.json', configData);
})


async function stakingDex(configData, hre: HardhatRuntimeEnvironment ) {

    const PositionStakingDexManager = await hre.ethers.getContractFactory("PositionStakingDexManager")

    const contractArgs: any[] = ["0x0000000000000000000000000000000000000000", "0x0000000000000000000000000000000000000000", 1000];

    const instance = await hre.upgrades.deployProxy(
        PositionStakingDexManager,
        contractArgs
    );
    await instance.deployed();

    const address = instance.address
    console.log("PositionStakingDexManager deploy address: ", address);

    const upgraded = await hre.upgrades.upgradeProxy(
        address,
        PositionStakingDexManager
    );
    await verifyImplContract(hre, upgraded.deployTransaction, "contracts/staking/PositionStakingDexManager.sol:PositionStakingDexManager");
    configData.positionStakingDexManager = address

    return configData
}
