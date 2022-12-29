var Reward = artifacts.require("../contracts/Reward.sol");
var Tracking = artifacts.require("../contracts/Tracking.sol");

module.exports = function(deployer) {
  // deployment steps
  deployer.deploy(Reward);
  deployer.deploy(Tracking);
};