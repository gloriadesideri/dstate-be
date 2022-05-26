const Token = require('../models/Token')
const path = require("path");
const fs = require("fs");

exports.sellToken = async (req, res, next) => {
    exports.balanceOfTokens =async (req,res,next) => {
        const pathToTokenFile=path.join(__dirname,'../solidity/build/contracts','NewToken.json')
        var TokenData = JSON.parse(fs.readFileSync(pathToTokenFile));
        var tokenContract = new web3.eth.Contract(TokenData.abi, req.body.tokenAddress);
        const balanceInGwei= await tokenContract.methods.balanceOf(req.user.publicAddress).call({from: req.user.publicAddress})
        const balanceInEth= balanceInGwei/ 10**18;
        res.send({balance: balanceInEth})
    }
}
