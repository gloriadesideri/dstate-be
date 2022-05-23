const Web3 = require('web3')
const fs = require('fs');
const path=require('path')

const Token = require('../models/Token')
const Building = require ('../models/Building')
const ipfsClient = require ('ipfs-http-client');
const { transformAuthInfo } = require('passport');
const {approveToken} = require("./buildingController");
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
    res.send({abi:encodedABI})

}
exports.createSetPriceTransaction = async (req,res, next)=>{
    const pathToFile=path.join(__dirname,'../solidity/build/contracts','BuySell.json')
    var data = JSON.parse(fs.readFileSync(pathToFile));
    const pathToTokenFile=path.join(__dirname,'../solidity/build/contracts','NewToken.json')
    var TokenData = JSON.parse(fs.readFileSync(pathToTokenFile));
    var myContract = new web3.eth.Contract(data.abi, "0x392F7bAccBfE1324df91298ae9Ffc153111CED7c");
    var tokenContract = new web3.eth.Contract(TokenData.abi, req.body.tokenAddress);
    console.log(process.env.BUY_SEELL_ADDRESS)
    const allowance = await tokenContract.methods.allowance(req.user.publicAddress,"0x392F7bAccBfE1324df91298ae9Ffc153111CED7c").call({from: req.user.publicAddress})
    var remaining = BigInt(allowance)

    if(remaining<BigInt(req.body.tokenAmount*Math.pow(10, 18))){
        await this.approveToken(req, res)
    }
    else{
        let encodedABI=await myContract.methods.setPrice(BigInt(req.body.amountOfETH*Math.pow(10, 18)),BigInt(req.body.tokenAmount*Math.pow(10, 18)),req.body.tokenAddress).encodeABI()
        res.send({abi:encodedABI})
    }
}
exports.getPriceForTokens= async (req,res,next)=>{
    const pathToFile=path.join(__dirname,'../solidity/build/contracts','BuySell.json')
    var data = JSON.parse(fs.readFileSync(pathToFile));
    var myContract = new web3.eth.Contract(data.abi, process.env.BUY_SEELL_ADDRESS);
    const res_from_get_price = await myContract.methods.getPriceForTokens(BigInt(req.body.tokenAmount*Math.pow(10, 18)),req.body.tokenAddress).call({from: req.user.publicAddress})
    console.log(res_from_get_price);
    res.send({price: res_from_get_price})
}
exports.createBuyTokenTransaction = async (req,res,next)=>{
    const pathToFile=path.join(__dirname,'../solidity/build/contracts','BuySell.json')
    var data = JSON.parse(fs.readFileSync(pathToFile));
    var myContract = new web3.eth.Contract(data.abi, process.env.BUY_SEELL_ADDRESS);
    var encodedABI= await myContract.methods.buyTokens(req.body.tokenAddress, BigInt(req.body.promisedPrice*Math.pow(10, 18)),BigInt(req.body.tokenAmount*Math.pow(10, 18)) ).encodeABI();
    res.send({abi:encodedABI})
}
exports.createToken = async (req,res,next)=>{
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
    let building = await Building.findOneAndUpdate(
        { "_id" : req.body.building_id },
        { "token_id" : token._id  }
    )
    return res.send({building: building, token: token})

}
exports.create= async (req, res)=>{
    let building = await Building.create({
        name: req.body.building_name,
        address:req.body.building_address,
        user_id: req.user.id
    })
    return res.send({building: building});
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
exports.fetchUnapproved = async (req, res)=>{
    const buildings = await Building.find({"approved": false});
    res.send(200, {buildings})
}
exports.fetchApproved = async (req, res)=>{
    const buildings = await Building.find({"approved": true});
    res.send(200, {buildings})
}
exports.approveBuilding = async (req, res)=>{
    const building = await Building.findOne({id:req.body.building_id});
    building.approved= true;
    await building.save();
    res.send(200, "building approved")
}

exports.fetchBuildings = async (req,res)=>{
    let buildings;
    if(req.params.building_id){
        let building = await Building.findOne({id:req.params.building_id}).populate("token_id", "-__v").select("-__v");
        buildings.push(building)
    }else{
        buildings = await Building.find({user_id:req.user._id}).populate("token_id", "-__v").select("-__v");
    }
    res.send(200, {buildings})
}
exports.approveToken = async (req,res)=>{
    const pathToTokenFile=path.join(__dirname,'../solidity/build/contracts','NewToken.json')
    var TokenData = JSON.parse(fs.readFileSync(pathToTokenFile));
    const building = await Building.findOne({_id:req.body.building_id}).populate("token_id", "-__v").select("-__v");
    var myContract = new web3.eth.Contract(TokenData.abi, building.token_id.address);
    var encodedABI= await myContract.methods.approve("0x392F7bAccBfE1324df91298ae9Ffc153111CED7c", BigInt(Math.pow(10,60))).encodeABI();
    console.log(encodedABI)
    res.send({abi:encodedABI})
}



