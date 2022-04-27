const Web3 = require('web3')
const fs = require('fs');
const path=require('path')




exports.interact = async (req, res, next) => {
    const web3 = new Web3('https://rinkeby.infura.io/v3/2af9187666bc4f2485d90c76f9727138')
    const pathToFile=path.join(__dirname,'../solidity/build/contracts','NewToken.json')


    var data = JSON.parse(fs.readFileSync(pathToFile));

    var myContract = new web3.eth.Contract(data.abi, '0x64C9874BbA69b02a23e19073c08F045BA66C2bc7');
    var name=myContract.methods.transfer("0x76F5324446A898727ABe3903c7Bd31fFA3fCA7BB", 10).call({from: '0x7f61F6D8646a78e378DDb0aDC7cb9A7Fb4c243f2'}, function(error, result){
        res.json({result: result})
    });
}
