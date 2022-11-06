import {task} from "hardhat/config";
import {readConfig, verifyContract, verifyImplContract, writeConfig} from "./utils-deploy";
import {verify} from "@openzeppelin/hardhat-upgrades/dist/verify-proxy";


task('spot-factory-testnet', 'How is your girl friend?', async (taskArgs, hre) => {

    const configData = await readConfig('config-testnet.json');

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
    await writeConfig('config-testnet.json', configData);
})
