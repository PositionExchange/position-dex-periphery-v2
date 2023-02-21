import {task} from "hardhat/config";
import {readConfig, verifyImplContract, writeConfig} from "../utils-deploy";
import {verify} from "@openzeppelin/hardhat-upgrades/dist/verify-proxy";
import {HardhatRuntimeEnvironment} from "hardhat/types";


task('spot-factory-testnet', 'How is your girl friend?', async (taskArgs, hre) => {

    let configData = await readConfig('config-testnet.json');
    configData = await deployFactory(configData, hre);
    await writeConfig('config-testnet.json', configData);
})


task('spot-factory-mainnet', 'How is your girl friend?', async (taskArgs, hre) => {

    let configData = await readConfig('config.json');
    configData = await deployFactory(configData, hre);
    await writeConfig('config.json', configData);
})
task('upgrade-spot-factory-testnet', 'How is your girl friend?', async (taskArgs, hre) => {

    const configData = await readConfig('config-testnet.json');
    //
    // const PositionSpotFactory = await hre.ethers.getContractFactory("PositionSpotFactory")
    //
    // const upgraded = await hre.upgrades.upgradeProxy(
    //     configData.spotFactory,
    //     PositionSpotFactory
    // );
    // await verifyImplContract(hre,upgraded.deployTransaction, "contracts/PositionSpotFactory.sol:PositionSpotFactory");
    //
    await upgradeProxy(configData, hre);
    // await writeConfig('config-testnet.json', configData);
})

task('upgrade-spot-factory-mainnet', 'How is your girl friend?', async (taskArgs, hre) => {

    const configData = await readConfig('config.json');

    await upgradeProxy(configData, hre);
})


async function deployFactory(configData, hre: HardhatRuntimeEnvironment) {

    const PositionSpotFactory = await hre.ethers.getContractFactory("PositionSpotFactory")

    const contractArgs : string[] = [];

    const instance = await hre.upgrades.deployProxy(
        PositionSpotFactory,
        contractArgs
    );
    await instance.deployed();

    const address = instance.address
    console.log("PositionSpotFactory deployed address: ",  address);

    const upgraded = await hre.upgrades.upgradeProxy(
        address,
        PositionSpotFactory
    );
    await verifyImplContract(hre,upgraded.deployTransaction, "contracts/PositionSpotFactory.sol:PositionSpotFactory");
    configData.spotFactory = address
    return configData
}

async function upgradeProxy(configData, hre: HardhatRuntimeEnvironment) {

    const PositionSpotFactory = await hre.ethers.getContractFactory("PositionSpotFactory")

    const upgraded = await hre.upgrades.upgradeProxy(
        configData.spotFactory,
        PositionSpotFactory
    );
    await verifyImplContract(hre,upgraded.deployTransaction, "contracts/PositionSpotFactory.sol:PositionSpotFactory");

}
