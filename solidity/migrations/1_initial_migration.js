const NewToken = artifacts.require("./NewToken.sol");
const BuySell = artifacts.require("./BuySell.sol")

module.exports = function (deployer) {
  deployer.deploy(NewToken, 500, "TestCoin", "TC");
  deployer.deploy(BuySell)
};
