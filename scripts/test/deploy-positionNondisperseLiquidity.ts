import {task} from "hardhat/config";
import {verify} from "@openzeppelin/hardhat-upgrades/dist/verify-proxy";
import {readConfig, verifyImplContract, writeConfig} from "../utils-deploy";


task('concentrated-liquidity-testnet', 'How is your girl friend?', async (taskArgs, hre) => {

    const configData = await readConfig('config-testnet.json');

    const PositionConcentratedLiquidity = await hre.ethers.getContractFactory("PositionNondisperseLiquidity")

    const contractArgs : string[] = [];

    const instance = await hre.upgrades.deployProxy(
        PositionConcentratedLiquidity,
        contractArgs
    );
    await instance.deployed();

    const address = instance.address
    console.log("PositionConcentratedLiquidity deploy address: ",  address);

    const upgraded = await hre.upgrades.upgradeProxy(
        address,
        PositionConcentratedLiquidity
    );
    await verifyImplContract(hre,upgraded.deployTransaction, "contracts/PositionNondisperseLiquidity.sol:PositionNondisperseLiquidity");
    configData.positionConcentratedLiquidity = address
    await writeConfig('config-testnet.json', configData);
})


task('upgrade-concentrated-liquidity-testnet', 'How is your girl friend?', async (taskArgs, hre) => {

    const configData = await readConfig('config-testnet.json');

    const PositionConcentratedLiquidity = await hre.ethers.getContractFactory("PositionNondisperseLiquidity")

    const upgraded = await hre.upgrades.upgradeProxy(
        configData.positionConcentratedLiquidity,
        PositionConcentratedLiquidity
    );
    await verifyImplContract(hre,upgraded.deployTransaction, "contracts/PositionNondisperseLiquidity.sol:PositionNondisperseLiquidity");
    await writeConfig('config-testnet.json', configData);
})
