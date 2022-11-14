import {task} from "hardhat/config";
import {readConfig, verifyContract, verifyImplContract, writeConfig} from "./utils-deploy";
import {verify} from "@openzeppelin/hardhat-upgrades/dist/verify-proxy";


task('forkMatchingEngineAMM-testnet', 'How is your girl friend?', async (taskArgs, hre) => {

    const configData = await readConfig('config-testnet.json');

    const ForkMatchingEngineAMM = await hre.ethers.getContractFactory("ForkMatchingEngineAMM")

    const contractArgs : string[] = [];

    const instance = await hre.upgrades.deployProxy(
        ForkMatchingEngineAMM,
        contractArgs
    );
    await instance.deployed();

    const address = instance.address
    console.log("SpotHouse deployed address: ",  address);


    const upgraded = await hre.upgrades.upgradeProxy(
        address,
        ForkMatchingEngineAMM
    );
    await verifyImplContract(hre,upgraded.deployTransaction, "contracts/test/ForkMatchingEngineAMM.sol:ForkMatchingEngineAMM");
    configData.spotHouse = address
    await writeConfig('config-testnet.json', configData);
})
