import {task} from "hardhat/config";
import {readConfig, verifyContract, verifyImplContract, writeConfig} from "../utils-deploy";
import {verify} from "@openzeppelin/hardhat-upgrades/dist/verify-proxy";


task('deploy-migration-testnet', 'How is your girl friend?', async (taskArgs, hre) => {

    const configData = await readConfig('config-testnet.json');

    const killerPosition = await hre.ethers.getContractFactory("KillerPosition")


    const hardhatDeployContract = await killerPosition.deploy(configData.pancake, configData.positionConcentratedLiquidity, configData.spotFactory, configData.WBNB);

    await hardhatDeployContract.deployTransaction.wait(5);

    const address = hardhatDeployContract.address
    console.log("migration deployed address: ", address);
    configData.killerPosition = address


    await verifyContract(hre, address, [configData.WBNB], "contracts/migration/KillerPosition.sol:KillerPosition");
    await writeConfig('config-testnet.json', configData);
})
