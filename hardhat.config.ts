import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "hardhat-contract-sizer";
import "@nomicfoundation/hardhat-chai-matchers";
import '@openzeppelin/hardhat-upgrades';
import "hardhat-log-remover";
import "./scripts/deploy";
import {PRIV_MAINNET_ACCOUNT} from "./env";

const config: HardhatUserConfig = {
  networks: {
    hardhat: {
      allowUnlimitedContractSize: true,
    },

    bsc_mainnet: {
      url: "https://bsc-dataseed4.ninicoin.io/",
      chainId: 56,
      accounts: [PRIV_MAINNET_ACCOUNT],
    },
    bsc_mainnet_test: {
      url: "https://bsc-dataseed2.binance.org/",
      chainId: 56,
      accounts: [],
    },
    bsc_testnet: {
      url: "https://data-seed-prebsc-1-s3.binance.org:8545/",
      chainId: 97,
      accounts: []
    },
  },
  solidity: {
    compilers: [
      {
        version: "0.8.9",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
      {
        version: "0.8.0",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
      {
        version: "0.8.2",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
      {
        version: "0.4.18",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    ],
  },
  gasReporter: {
    enabled: true,
    currency: "BNB",
    gasPrice : 20
  },
  etherscan: {
    apiKey: "QYSUHDISIYH6T1X6GFGAGXS333WRVPJIR2",
  },
  typechain: {
    outDir: "typeChain",
    target: "ethers-v5",
  },
  mocha: {
    timeout: 100000,
  },
};

export default config;
