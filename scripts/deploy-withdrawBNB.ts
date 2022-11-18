import {task} from "hardhat/config";
import {readConfig, verifyContract, verifyImplContract, writeConfig} from "./utils-deploy";
import {verify} from "@openzeppelin/hardhat-upgrades/dist/verify-proxy";
import {WithdrawBNB} from "../typeChain";


task('deploy-withdrawBNB-testnet', 'How is your girl friend?', async (taskArgs, hre) => {

    const configData = await readConfig('config-testnet.json');

    const withdrawBNB = await hre.ethers.getContractFactory("WithdrawBNB")


    const hardhatDeployContract = await withdrawBNB.deploy("0x480CB7cCEacfA9267D905f48CA2af7C11dF02697");

    await hardhatDeployContract.deployTransaction.wait(5);

    const address = hardhatDeployContract.address
    console.log("withdrawBNB deployed address: ",  address);


    await verifyContract(hre,address, ["0x480CB7cCEacfA9267D905f48CA2af7C11dF02697"],"contracts/WithdrawBNB.sol:WithdrawBNB");
    await writeConfig('config-testnet.json', configData);
})