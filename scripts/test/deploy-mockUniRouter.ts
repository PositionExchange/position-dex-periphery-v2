import {task} from "hardhat/config";
import {readConfig, verifyContract, verifyImplContract, writeConfig} from "../utils-deploy";
import {verify} from "@openzeppelin/hardhat-upgrades/dist/verify-proxy";


task('deploy-mockUniRouter-testnet', 'How is your girl friend?', async (taskArgs, hre) => {

    const configData = await readConfig('config-testnet.json');

    const mockUniRouter = await hre.ethers.getContractFactory("MockUniRouter")


    const hardhatDeployContract = await mockUniRouter.deploy();

    await hardhatDeployContract.deployTransaction.wait(5);

    const address = hardhatDeployContract.address
    console.log("mockUniRouter deployed address: ",  address);
    configData.mockUniRouter = address


    await verifyContract(hre,address, [],"contracts/test/MockUniRouter.sol:MockUniRouter");
    await writeConfig('config-testnet.json', configData);
})
