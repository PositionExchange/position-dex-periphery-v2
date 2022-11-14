import {task} from "hardhat/config";
import {readConfig, verifyContract, verifyImplContract, writeConfig} from "./utils-deploy";
import {verify} from "@openzeppelin/hardhat-upgrades/dist/verify-proxy";


task('deploy-forkMatchingEngineAMM-testnet', 'How is your girl friend?', async (taskArgs, hre) => {

    const configData = await readConfig('config-testnet.json');

    const ForkMatchingEngineAMM = await hre.ethers.getContractFactory("ForkMatchingEngineAMM")

    const contractArgs : string[] = ["0x33e36E5C0Ed6d2615E678c095A5Be582a1E01844",
                                     "0xe18dcB644768f7e511a0476ed366Ed8dE523793E",
                                     "0xe18dcB644768f7e511a0476ed366Ed8dE523793E",
                                     "10000",
                                     "1",
                                     "1000",
                                     "10000",
                                     "30000",
                                     "100",
                                     "0xDfbE56f4e2177a498B5C49C7042171795434e7D1",
                                     "0xDfbE56f4e2177a498B5C49C7042171795434e7D1"
                                     ];

    const instance = await hre.upgrades.deployProxy(
        ForkMatchingEngineAMM,
        contractArgs
    );
    await instance.deployed();

    const address = instance.address
    console.log("forkMatchingEngineAMM deployed address: ",  address);


    const upgraded = await hre.upgrades.upgradeProxy(
        address,
        ForkMatchingEngineAMM
    );
    await verifyImplContract(hre,upgraded.deployTransaction, "contracts/test/ForkMatchingEngineAMM.sol:ForkMatchingEngineAMM");
    configData.spotHouse = address
    await writeConfig('config-testnet.json', configData);
})