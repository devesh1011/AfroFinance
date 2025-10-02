require("@nomicfoundation/hardhat-toolbox");
const { vars } = require("hardhat/config");

module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.8.17",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
          viaIR: true,
        },
      },
      {
        version: "0.8.19",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
          viaIR: true,
        },
      },
      {
        version: "0.8.20",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
          viaIR: true,
        },
      },
      {
        version: "0.8.22",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
          viaIR: true,
        },
      },
    ],
    importAliases: {
      "@": "./contracts/AfroFinance",
    },
  },
  networks: {
    "hedera-testnet": {
      url: "https://testnet.hashio.io/api",
      accounts: [vars.get("PRIVATE_KEY")],
      chainId: 296,
    },
  },
};
