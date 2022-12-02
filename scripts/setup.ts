import {task} from "hardhat/config";
import {readConfig} from "./utils-deploy";
import {
    PositionNondisperseLiquidity,
    PositionSpotFactory,
    PositionStakingDexManager,
    SpotHouse,
    WithdrawBNB
} from "../typeChain";


task ("setup-testnet", async (taskArgs, hre)=>{

    const configData = await readConfig('config-testnet.json');

    const spotHouse = await hre.ethers.getContractFactory("SpotHouse");
    const positionConcentratedLiquidity = await hre.ethers.getContractFactory("PositionNondisperseLiquidity");
    const positionSpotFactory = await hre.ethers.getContractFactory("PositionSpotFactory")
    const withdrawBNB = await hre.ethers.getContractFactory("WithdrawBNB")
    const positionStakingDexManager = await hre.ethers.getContractFactory("PositionStakingDexManager")


    const instanceSpotHouse =  (await  spotHouse.attach(configData.spotHouse)) as  unknown as SpotHouse;
    const instancePositionNondisperseLiquidity =  (await  positionConcentratedLiquidity.attach(configData.positionConcentratedLiquidity)) as  unknown as PositionNondisperseLiquidity;
    const instanceSpotFactory =  (await  positionSpotFactory.attach(configData.spotFactory)) as  unknown as PositionSpotFactory;
    const instanceWithdrawBNB =  (await  positionSpotFactory.attach(configData.withdrawBNB)) as  unknown as WithdrawBNB;
    const instancePositionStakingDexManager =  (await  positionStakingDexManager.attach(configData.PositionStakingDexManager)) as  unknown as PositionStakingDexManager;


    let tx;
    if (configData.spotFactory){
        tx = await instanceSpotFactory.setSpotHouse(configData.spotHouse);
        await tx.wait(5);
        tx = await instanceSpotFactory.setPositionLiquidity(configData.positionConcentratedLiquidity);
        await tx.wait(5);
        tx = await  instanceSpotFactory.setFeeShareAmm(6000);
        await tx.wait(5);
    }


    if (configData.positionConcentratedLiquidity) {
        tx = await instancePositionNondisperseLiquidity.setFactory(configData.spotFactory)
        await  tx.wait(5);

        tx = await instancePositionNondisperseLiquidity.setWithdrawBNB(configData.withdrawBNB)
        await  tx.wait(5);

        tx = await instancePositionNondisperseLiquidity.setBNB(configData.withdrawBNB)
        await  tx.wait(5);
    }

    if (configData.PositionStakingDexManager) {
        tx = await  instancePositionStakingDexManager.updatePositionLiquidityPool(configData.positionConcentratedLiquidity);
        await  tx.wait(5);
    }

    if(configData.spotHouse){
        tx = await instanceSpotHouse.setFactory(configData.spotFactory);
        await tx.wait(5);
        tx = await instanceSpotHouse.setWithdrawBNB(configData.withdrawBNB);
        await tx.wait(5);
    }



})