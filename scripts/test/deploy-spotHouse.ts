import {task} from "hardhat/config";
import {readConfig, verifyImplContract, writeConfig} from "../utils-deploy";
import {verify} from "@openzeppelin/hardhat-upgrades/dist/verify-proxy";


task('spot-house-testnet', 'How is your girl friend?', async (taskArgs, hre) => {

    const configData = await readConfig('config-testnet.json');

    const SpotHouse = await hre.ethers.getContractFactory("SpotHouse")

    const contractArgs : string[] = [];

    const instance = await hre.upgrades.deployProxy(
        SpotHouse,
        contractArgs
    );
    await instance.deployed();

    const address = instance.address
    console.log("SpotHouse deployed address: ", address);


    const upgraded = await hre.upgrades.upgradeProxy(
        address,
        SpotHouse
    );
    await verifyImplContract(hre,upgraded.deployTransaction, "contracts/SpotHouse.sol:SpotHouse");
    configData.spotHouse = address
    await writeConfig('config-testnet.json', configData);
})


task('upgrade-spot-house-testnet', 'How is your girl friend?', async (taskArgs, hre) => {

    const configData = await readConfig('config-testnet.json');

    const SpotHouse = await hre.ethers.getContractFactory("SpotHouse")

    const upgraded = await hre.upgrades.upgradeProxy(
        configData.spotHouse,
        SpotHouse
    );
    await verifyImplContract(hre,upgraded.deployTransaction, "contracts/SpotHouse.sol:SpotHouse");
    await writeConfig('config-testnet.json', configData);
})