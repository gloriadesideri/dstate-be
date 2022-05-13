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
