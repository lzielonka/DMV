var vehicleInformation = artifacts.require("./VehicleInformation.sol");

module.exports = function(deployer) {
  deployer.deploy(vehicleInformation, {from : '0x7cabe53f112edde5307837aca22beef50cfe9ee6'});
};
