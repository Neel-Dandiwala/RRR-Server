module.exports = {
  networks: {
    development: {
      host: "localhost",
      port: 9545,
      network_id: "*", // Match any network id
      gas: 5000000
    }
  },
  contracts_directory: './contracts/',
  contracts_build_directory: './build/contracts/',
  compilers: {
    solc: {
      version: "^0.8.16", 
      settings: {
        optimizer: {
          enabled: true, // Default: false
          runs: 200      // Default: 200
        },
      }
    }
  }
};
