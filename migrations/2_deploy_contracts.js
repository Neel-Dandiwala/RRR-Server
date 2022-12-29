const Reward = artifacts.require("Reward");
const Validation = artifacts.require("Validation");
const Tracking = artifacts.require("Tracking");

module.exports = function(deployer) {
  deployer.deploy(Reward);
  deployer.deploy(Tracking);
};
