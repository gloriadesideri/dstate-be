const Migrations = artifacts.require("./NewToken.sol");

module.exports = function (deployer) {
  deployer.deploy(Migrations, 500, "TestCoin", "TC");
};
