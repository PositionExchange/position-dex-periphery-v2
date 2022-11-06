import { TransactionResponse } from "@ethersproject/abstract-provider";
const fs = require('fs');

export async function verifyContract(
    hre : any,
    address : string,
    args : undefined | any[],
    contract : string | undefined
) {
    const verifyObj = { address } as any;
    if (args) {
        verifyObj.constructorArguments = args;
    }
    if (contract) {
        verifyObj.contract = contract;
    }
    return hre
        .run("verify:verify", verifyObj)
        .then(() => console.log("Contract address verified:", address))
        .catch((err : any) => {
            console.log(`Verify Error`, err);
        });
}


export async function verifyImplContract(
    hre : any,
    deployTransaction: TransactionResponse,
    contract = undefined
) {
    const { data } = deployTransaction;
    const decodedData = hre.ethers.utils.defaultAbiCoder.decode(
        ["address", "address"],
        hre.ethers.utils.hexDataSlice(data, 4)
    );
    const implContractAddress = decodedData[1];
    console.log("implContractAddress: ", implContractAddress);
    console.log("Upgraded to impl contract", implContractAddress);
    try {
        await verifyContract(hre, implContractAddress, undefined, contract);
    } catch (err) {

        console.error(`-- verify contract error`, err);
    }
}



export  async function readConfig(path : string)  {
    let config = fs.readFileSync(path);
    return JSON.parse(config);
}

export async  function writeConfig(path : string, config : any) {
    let data = JSON.stringify(config);
    fs.writeFileSync(path, data);
}

