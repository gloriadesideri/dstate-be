const Web3 = require('web3')
const fs = require('fs');
const path=require('path')

const Token = require('../models/Token')
const Building = require ('../models/Building')
const ipfsClient = require ('ipfs-http-client');
const { transformAuthInfo } = require('passport');
const ipfs= ipfsClient.create('https://ipfs.infura.io:5001/api/v0')
const walletAPIUrl = 'https://rinkeby.infura.io/v3/2af9187666bc4f2485d90c76f9727138';

const web3 = new Web3(walletAPIUrl);

exports.getEncodedABI = async (req, res, next) => {

    const pathToFile=path.join(__dirname,'../solidity/build/contracts','NewToken.json')


    var data = JSON.parse(fs.readFileSync(pathToFile));
    var myContract = new web3.eth.Contract(data.abi);
    let encodedABI=await myContract.deploy({
        data: data.bytecode,
        arguments: [req.body.initial_amount, req.body.name, req.body.symbol]
    }).encodeABI()
    console.log(encodedABI)
    res.send({abi:encodedABI})

}
exports.create = async (req,res,next)=>{
    console.log(req.body)
    let tx = await web3.eth.getTransaction(req.body.transactionHash)
    while(tx.blockNumber == null){
        tx = await web3.eth.getTransaction(req.body.transactionHash)
    }
    let receipt = await web3.eth.getTransactionReceipt(req.body.transactionHash)
    
    console.log(receipt.contractAddress)
    
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
