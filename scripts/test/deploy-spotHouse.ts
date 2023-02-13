import {task} from "hardhat/config";
import {readConfig, verifyContract, verifyImplContract, writeConfig} from "../utils-deploy";
import {verify} from "@openzeppelin/hardhat-upgrades/dist/verify-proxy";
import {HardhatRuntimeEnvironment} from "hardhat/types";


task('spot-house-testnet', 'How is your girl friend?', async (taskArgs, hre) => {

    let configData = await readConfig('config-testnet.json');
    configData = await deploySpotHouse(configData, hre);
    await writeConfig('config-testnet.json', configData);
})



task('spot-house-mainnet', 'How is your girl friend?', async (taskArgs, hre) => {

    let configData = await readConfig('config.json');
    configData = await deploySpotHouse(configData, hre);
    await writeConfig('config.json', configData);
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





task('deploy-house-implement', 'How is your girl friend?', async (taskArgs, hre) => {

    const configData = await readConfig('config-testnet.json');
    //
    // const spotHouse = await hre.ethers.getContractFactory("SpotHouse")
    //
    //
    // const hardhatDeployContract = await spotHouse.deploy();
    //
    // await hardhatDeployContract.deployTransaction.wait(5);
    //
    // const address = hardhatDeployContract.address
    // console.log("spotHouse deployed address: ",  address);
    // configData.houseImplement = address
    //
    //
    // await verifyContract(hre,address, [],"contracts/SpotHouse.sol:SpotHouse");


    await upgradeSpotHouse(configData, hre);
    // await writeConfig('config-testnet.json', configData);
})




async function deploySpotHouse(configData, hre: HardhatRuntimeEnvironment) {


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

    return configData;

}

async  function upgradeSpotHouse(configData, hre: HardhatRuntimeEnvironment) {


    const spotHouse = await hre.ethers.getContractFactory("SpotHouse")


    const hardhatDeployContract = await spotHouse.deploy();

    await hardhatDeployContract.deployTransaction.wait(5);

    const address = hardhatDeployContract.address
    console.log("spotHouse deployed address: ",  address);
    configData.houseImplement = address


    await verifyContract(hre,address, [],"contracts/SpotHouse.sol:SpotHouse");

}
