const Web3 = require('web3')
const fs = require('fs');
const path=require('path')

const Token = require('../models/Token')
const Building = require ('../models/Building')
const ipfsClient = require ('ipfs-http-client');
const { transformAuthInfo } = require('passport');
const ipfs= ipfsClient.create('https://ipfs.infura.io:5001/api/v0')
const HDWalletProvider = require('truffle-hdwallet-provider');

exports.create = async (req, res, next) => {
    console.log("create called")
    //const web3 = new Web3("https://rinkeby.infura.io/v3/2af9187666bc4f2485d90c76f9727138")
    const pathToFile=path.join(__dirname,'../solidity/build/contracts','NewToken.json')

    const walletMnemonic = '0xc3dcbd4d54705249a43f70cad5519cdd1b48b3d1aadfb03eb7d5035cb7a96a01'; //CHANGE!
    const walletAPIUrl = 'https://rinkeby.infura.io/v3/2af9187666bc4f2485d90c76f9727138';
    
    const provider = new HDWalletProvider(
        walletMnemonic,
        walletAPIUrl
    );
    //web3.eth.setProvider(provider);
    
    const web3 = new Web3(provider);
    




    var data = JSON.parse(fs.readFileSync(pathToFile));

    var myContract = new web3.eth.Contract(data.abi);
    await myContract.deploy({
        data: data.bytecode,
        arguments: [req.body.initial_amount, req.body.name, req.body.symbol]
    }).send({
        from: '0x7f61F6D8646a78e378DDb0aDC7cb9A7Fb4c243f2',
        gas: 1500000,
        gasPrice: web3.utils.toWei('0.00000003', 'ether')
    }, function(error, transactionHash){
        console.log(error)
        console.log(transactionHash)
    })
        .on('error', function(error){console.log(error);
            return res.status(500)
        })
        .on('transactionHash', function(transactionHash){
            console.log("transaction")
            console.log(transactionHash) })
        .on('receipt', function(receipt){
            console.log("recepit")
            console.log(receipt.contractAddress) // contains the new contract address
        })
        .on('confirmation', async function(confirmationNumber, receipt){
            console.log("confermation")
            console.log(receipt)
            let token = await Token.create({
                name: req.body.name,
                symbol: req.body.symbol,
                initial_amount: req.body.initial_amount,
                address:receipt.contractAddress,
                user_id: req.user._id
            })
            let building = await Building.create({
                name: req.body.building_name,
                address:req.body.building_address,
                token_id: token.id,
                user_id: req.user.id


            })
            return res.send({building: building, token: token})
        })
        .then(function(newContractInstance){
            console.log(newContractInstance.options.address) // instance with the new contract address
        });
        console.log("done")
        return res.status(200)

}
exports.uploadDocument = async (req, res) =>{
    console.log( req.files);
    if(!req.files) {
        res.send({
            status: false,
            message: 'No file uploaded'
        });
    }else{
        const filesAdded = await ipfs.add(req.files.document.data)
        console.log(filesAdded)
        return res.send(filesAdded)
    }
}
