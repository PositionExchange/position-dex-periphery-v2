import {task} from "hardhat/config";
import {readConfig, verifyContract, verifyImplContract, writeConfig} from "../utils-deploy";
import {verify} from "@openzeppelin/hardhat-upgrades/dist/verify-proxy";
import {HardhatRuntimeEnvironment} from "hardhat/types";


task('deploy-migration-testnet', 'How is your girl friend?', async (taskArgs, hre) => {

    let configData = await readConfig('config-testnet.json');
    configData = await deployMigration(configData, hre, configData.mockUniRouter);
    await writeConfig('config-testnet.json', configData);
})


task('deploy-migration-mainnet', 'How is your girl friend?', async (taskArgs, hre) => {

    let configData = await readConfig('config.json');
    configData = await deployMigration(configData, hre, configData.pancakeRouter);
    await writeConfig('config.json', configData);
})


async function deployMigration(configData, hre: HardhatRuntimeEnvironment, pancakeRouter) {


    const killerPosition = await hre.ethers.getContractFactory("KillerPosition")


    const hardhatDeployContract = await killerPosition.deploy(pancakeRouter, configData.positionConcentratedLiquidity, configData.spotFactory, configData.WBNB);

    await hardhatDeployContract.deployTransaction.wait(5);

    const address = hardhatDeployContract.address
    console.log("migration deployed address: ", address);
    configData.killerPosition = address

    await verifyContract(hre, address, [pancakeRouter, configData.positionConcentratedLiquidity, configData.spotFactory, configData.WBNB], "contracts/migration/KillerPosition.sol:KillerPosition");

    return configData;
}
