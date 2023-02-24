import {task} from "hardhat/config";
import {verify} from "@openzeppelin/hardhat-upgrades/dist/verify-proxy";
import {readConfig, verifyContract, writeConfig} from "../utils-deploy";


task('deploy-token-factory', 'How is your girl friend?', async (taskArgs, hre) => {

    const configData = await readConfig('config-testnet.json');

    const factoryMockToken = await hre.ethers.getContractFactory("FactoryMockToken")


    const hardhatDeployContract = await factoryMockToken.deploy();

    await hardhatDeployContract.deployTransaction.wait(5);

    const address = hardhatDeployContract.address
    console.log("factoryMockToken deployed address: ",  address);


    configData.factoryMockToken = address;

    await verifyContract(hre,address ,[],"contracts/test/FactoryMockToken.sol:FactoryMockToken");
    await writeConfig('config-testnet.json', configData);
})



task('deploy-token-template', 'How is your girl friend?', async (taskArgs, hre) => {

    const configData = await readConfig('config-testnet.json');

    const mockToken = await hre.ethers.getContractFactory("MockToken")


    const hardhatDeployContract = await mockToken.deploy();

    await hardhatDeployContract.deployTransaction.wait(5);

    const address = hardhatDeployContract.address
    console.log("mockToken deployed address: ",  address);


    configData.mockToken = address;

    await verifyContract(hre,address ,[],"contracts/test/MockToken.sol:MockToken");
    await writeConfig('config-testnet.json', configData);
})



task('deploy-tokenp', 'How is your girl friend?', async (taskArgs, hre) => {

    const configData = await readConfig('config-testnet.json');

    const factoryMockToken = await hre.ethers.getContractFactory("FactoryMockToken")


    const hardhatDeployContract = await factoryMockToken.deploy();

    await hardhatDeployContract.deployTransaction.wait(5);

    const address = hardhatDeployContract.address
    console.log("factoryMockToken deployed address: ",  address);


    configData.factoryMockToken = address;

    await verifyContract(hre,address ,[],"contracts/test/FactoryMockToken.sol:FactoryMockToken");
    await writeConfig('config-testnet.json', configData);
})


task('deploy-token-9', 'How is your girl friend?', async (taskArgs, hre) => {


    const token9 = await hre.ethers.getContractFactory("Token9")


    const hardhatDeployContract = await token9.deploy();

    await hardhatDeployContract.deployTransaction.wait(5);

    const address = hardhatDeployContract.address
    console.log("token9 deployed address: ",  address);



    await verifyContract(hre,address ,[],"contracts/test/Token9.sol:Token9");
})

