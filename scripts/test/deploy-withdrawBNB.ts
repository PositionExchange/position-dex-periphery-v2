import {task} from "hardhat/config";
import {readConfig, verifyContract, verifyImplContract, writeConfig} from "../utils-deploy";
import {verify} from "@openzeppelin/hardhat-upgrades/dist/verify-proxy";


task('deploy-withdrawBNB-testnet', 'How is your girl friend?', async (taskArgs, hre) => {

    const configData = await readConfig('config-testnet.json');

    const withdrawBNB = await hre.ethers.getContractFactory("WithdrawBNB")


    const hardhatDeployContract = await withdrawBNB.deploy(configData.WBNB);

    await hardhatDeployContract.deployTransaction.wait(5);

    const address = hardhatDeployContract.address
    console.log("withdrawBNB deployed address: ",  address);
    configData.withdrawBNB = address


    await verifyContract(hre,address, [configData.WBNB],"contracts/WithdrawBNB.sol:WithdrawBNB");
    await writeConfig('config-testnet.json', configData);
})
