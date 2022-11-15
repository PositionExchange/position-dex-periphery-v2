import {task} from "hardhat/config";
import {readConfig, verifyContract, verifyImplContract, writeConfig} from "./utils-deploy";
import {verify} from "@openzeppelin/hardhat-upgrades/dist/verify-proxy";
import {ForkMatchingEngineAMM} from "../typeChain";
import {BASIS_POINT} from "../test/liquidity/test-liquidity";


task('deploy-forkMatchingEngineAMM-testnet', 'How is your girl friend?', async (taskArgs, hre) => {

    const configData = await readConfig('config-testnet.json');

    const forkMatchingEngineAMM = await hre.ethers.getContractFactory("ForkMatchingEngineAMM")

    const contractArgs : string[] = ["0x33e36E5C0Ed6d2615E678c095A5Be582a1E01844",
        "0xe18dcB644768f7e511a0476ed366Ed8dE523793E",
        "10000",
        "1",
        "1000",
        "10000",
        "30000",
        "100",
        "0xDfbE56f4e2177a498B5C49C7042171795434e7D1",
        "0xe9fA482345737D803b63c12f5e7Be76885D4eb66"
    ];

    // const instance = await forkMatchingEngineAMM.deploy(
    //     forkMatchingEngineAMM,
    //     []
    // );
    //await instance.deployed();


    const hardhatDeployContract = await forkMatchingEngineAMM.deploy();

    await hardhatDeployContract.deployTransaction.wait(5);

    const address = hardhatDeployContract.address
    console.log("forkMatchingEngineAMM deployed address: ",  address);


    await verifyContract(hre,address, [],"contracts/test/ForkMatchingEngineAMM.sol:ForkMatchingEngineAMM");
    configData.template = address
    await writeConfig('config-testnet.json', configData);
    const instance = (await forkMatchingEngineAMM.attach(address)) as unknown as ForkMatchingEngineAMM
    await instance.initialize(
        {
            quoteAsset: "0x33e36E5C0Ed6d2615E678c095A5Be582a1E01844",
            baseAsset: "0xe18dcB644768f7e511a0476ed366Ed8dE523793E",
            basisPoint: BASIS_POINT,
            maxFindingWordsIndex: 1000,
            initialPip: 100000,
            pipRange: 30_000,
            tickSpace: 1,
            owner: "0x0000000000000000000000000000000000000000",
            positionLiquidity: "0xDfbE56f4e2177a498B5C49C7042171795434e7D1",
            spotHouse: "0xe9fA482345737D803b63c12f5e7Be76885D4eb66",
            feeShareAmm: 6000
        })
})