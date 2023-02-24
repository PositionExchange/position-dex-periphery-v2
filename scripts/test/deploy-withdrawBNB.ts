import {task} from "hardhat/config";
import {readConfig, verifyContract, verifyImplContract, writeConfig} from "../utils-deploy";
import {verify} from "@openzeppelin/hardhat-upgrades/dist/verify-proxy";


task('deploy-withdrawBNB-testnet', 'How is your girl friend?', async (taskArgs, hre) => {

    let configData = await readConfig('config-testnet.json');
    configData = await  deployWithdrawBNB(configData, hre);
    await writeConfig('config-testnet.json', configData);
})



task('deploy-transistorBNB-mainnet', 'How is your girl friend?', async (taskArgs, hre) => {

    let configData = await readConfig('config.json');
    configData = await  deployWithdrawBNB(configData, hre);
    await writeConfig('config.json', configData);
})


async function deployWithdrawBNB(configData,hre) {


    const withdrawBNB = await hre.ethers.getContractFactory("TransistorBNB")


    const hardhatDeployContract = await withdrawBNB.deploy(configData.WBNB);

    await hardhatDeployContract.deployTransaction.wait(5);

    const address = hardhatDeployContract.address
    console.log("withdrawBNB deployed address: ",  address);
    configData.withdrawBNB = address


    await verifyContract(hre,address, [configData.WBNB],"contracts/TransistorBNB.sol:TransistorBNB");

    return configData

}
