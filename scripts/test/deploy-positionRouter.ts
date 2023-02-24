import {task} from "hardhat/config";
import {readConfig, verifyImplContract, writeConfig} from "../utils-deploy";
import {verify} from "@openzeppelin/hardhat-upgrades/dist/verify-proxy";
import {HardhatRuntimeEnvironment} from "hardhat/types";


task('router-testnet', 'How is your girl friend?', async (taskArgs, hre) => {

    let configData = await readConfig('config-testnet.json');
    configData = await deployPositionRouter(configData, hre,  configData.spotHouse);
    await writeConfig('config-testnet.json', configData);
})


task('router-mainnet', 'How is your girl friend?', async (taskArgs, hre) => {

    let configData = await readConfig('config.json');
    configData = await deployPositionRouter(configData, hre,  configData.pancakeRouter);
    await writeConfig('config.json', configData);
})

task('upgrade-router-testnet', 'How is your girl friend?', async (taskArgs, hre) => {

    const configData = await readConfig('config-testnet.json');

    const PositionRouter = await hre.ethers.getContractFactory("PositionRouter")

    const upgraded = await hre.upgrades.upgradeProxy(
        configData.positionRouter,
        PositionRouter
    );
    await verifyImplContract(hre,upgraded.deployTransaction, "contracts/PositionRouter.sol:PositionRouter");
    await writeConfig('config-testnet.json', configData);
})


async function deployPositionRouter(configData, hre: HardhatRuntimeEnvironment, pancakeRouter) {


    const PositionRouter = await hre.ethers.getContractFactory("PositionRouter")

    const contractArgs : string[] = [configData.spotFactory, configData.spotHouse, pancakeRouter, configData.WBNB ];

    const instance = await hre.upgrades.deployProxy(
        PositionRouter,
        contractArgs
    );
    await instance.deployed();

    const address = instance.address
    console.log("PositionPositionRouter deployed address: ",  address);


    const upgraded = await hre.upgrades.upgradeProxy(
        address,
        PositionRouter
    );
    await verifyImplContract(hre,upgraded.deployTransaction, "contracts/PositionRouter.sol:PositionRouter");
    configData.positionRouter = address

    return configData



}
