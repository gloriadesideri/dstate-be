const Web3 = require('web3')
const fs = require('fs');
const path=require('path')

const Token = require('../models/Token')
const Building = require ('../models/Building')
const ipfsClient = require ('ipfs-http-client');
const ipfs= ipfsClient.create('https://ipfs.infura.io:5001/api/v0')
const walletAPIUrl = 'https://rinkeby.infura.io/v3/2af9187666bc4f2485d90c76f9727138';

const web3 = new Web3(walletAPIUrl);

exports.deployToken = async (req, res, next) => {

    const pathToFile=path.join(__dirname,'../solidity/build/contracts','NewToken.json')
    var data = JSON.parse(fs.readFileSync(pathToFile));
    var myContract = new web3.eth.Contract(data.abi);
    let encodedABI=await myContract.deploy({
        data: data.bytecode,
        arguments: [req.body.initial_amount, req.body.name, req.body.symbol]
    }).encodeABI()
    const nonce = await web3.eth.getTransactionCount( req.user.publicAddress );
    res.send({abi:encodedABI, nonce: nonce})

}
exports.createSetPriceTransaction = async (req,res, next)=>{
    const pathToFile=path.join(__dirname,'../solidity/build/contracts','BuySell.json')
    var data = JSON.parse(fs.readFileSync(pathToFile));
    const pathToTokenFile=path.join(__dirname,'../solidity/build/contracts','NewToken.json')
    var TokenData = JSON.parse(fs.readFileSync(pathToTokenFile));
    var myContract = new web3.eth.Contract(data.abi, "0x392F7bAccBfE1324df91298ae9Ffc153111CED7c");
    var tokenContract = new web3.eth.Contract(TokenData.abi, req.body.tokenAddress);
    const allowance = await tokenContract.methods.allowance(req.user.publicAddress,"0x392F7bAccBfE1324df91298ae9Ffc153111CED7c").call({from: req.user.publicAddress})
    var remaining = BigInt(allowance)

    if(remaining<BigInt(req.body.tokenAmount*Math.pow(10, 18))){
        await this.approveToken(req, res)
    }
    else{
        let encodedABI=await myContract.methods.setPrice(BigInt(req.body.amountOfETH*Math.pow(10, 18)),BigInt(req.body.tokenAmount*Math.pow(10, 18)),req.body.tokenAddress).encodeABI()
        const nonce = await web3.eth.getTransactionCount( req.user.publicAddress );
        res.send({abi:encodedABI, nonce: nonce})
    }
}
exports.getPriceForTokens= async (req,res,next)=>{
    const pathToFile=path.join(__dirname,'../solidity/build/contracts','BuySell.json')
    var data = JSON.parse(fs.readFileSync(pathToFile));
    var myContract = new web3.eth.Contract(data.abi, "0x392F7bAccBfE1324df91298ae9Ffc153111CED7c");
    const res_from_get_price = await myContract.methods.getPriceForTokens(req.body.tokenAddress, BigInt(req.body.tokenAmount*Math.pow(10, 18))).call({from: req.user.publicAddress})
    res.send({price: res_from_get_price})
}
exports.createBuyTokenTransaction = async (req,res,next)=>{
    const pathToFile=path.join(__dirname,'../solidity/build/contracts','BuySell.json')
    var data = JSON.parse(fs.readFileSync(pathToFile));
    var myContract = new web3.eth.Contract(data.abi, "0x392F7bAccBfE1324df91298ae9Ffc153111CED7c");
    var encodedABI= await myContract.methods.buyTokens(req.body.tokenAddress, BigInt(req.body.promisedPrice),BigInt(req.body.tokenAmount*Math.pow(10, 18)) ).encodeABI();
    const nonce = await web3.eth.getTransactionCount( req.user.publicAddress );
    res.send({abi:encodedABI, nonce: nonce})
}
exports.createToken = async (req,res,next)=>{
    let tx = await web3.eth.getTransaction(req.body.transactionHash)
    while(tx.blockNumber == null){
        tx = await web3.eth.getTransaction(req.body.transactionHash)
    }
    let receipt = await web3.eth.getTransactionReceipt(req.body.transactionHash)
    const pathToTokenFile=path.join(__dirname,'../solidity/build/contracts','NewToken.json')
    var TokenData = JSON.parse(fs.readFileSync(pathToTokenFile));
    var myContract = new web3.eth.Contract(TokenData.abi, receipt.contractAddress);
    var rentAddress= await myContract.methods.rent().call({from: req.user.publicAddress})
    let token = await Token.create({
        name: req.body.name,
        symbol: req.body.symbol,
        initial_amount: req.body.initial_amount,
        address:receipt.contractAddress,
        user_id: req.user._id
    })
    let building = await Building.findOneAndUpdate(
        { "_id" : req.body.building_id },
        { "token_id" : token._id  ,"rentContractAddress":rentAddress},
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
    if(!req.files) {
        res.send({
            status: false,
            message: 'No file uploaded'
        });
    }else{
        const filesAdded = await ipfs.add(req.files.document.data)
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
    const nonce = await web3.eth.getTransactionCount( req.user.publicAddress );
    res.send({abi:encodedABI, nonce: nonce})
}

exports.cancelSaleFromContract= async (req,res,next)=>{
    const pathToFile=path.join(__dirname,'../solidity/build/contracts','BuySell.json')
    var data = JSON.parse(fs.readFileSync(pathToFile));
    var myContract = new web3.eth.Contract(data.abi, "0x392F7bAccBfE1324df91298ae9Ffc153111CED7c");
    var encodedABI= await myContract.methods.cancelSale(req.body.tokenAddress, BigInt(req.body.tokenAmount*Math.pow(10, 18)) ).encodeABI();
    const nonce = await web3.eth.getTransactionCount( req.user.publicAddress );
    res.send({abi:encodedABI, nonce: nonce})
}

exports.createPayRentTransaction = async (req,res,next)=>{
    const pathToRentFile=path.join(__dirname,'../solidity/build/contracts','Rent.json')
    var RentData = JSON.parse(fs.readFileSync(pathToRentFile));
    const building = await  Building.findOne({_id: req.body.building_id})
    var RentContract = new web3.eth.Contract(RentData.abi, building.rentContractAddress);

    var rentPrice = await RentContract.methods.getRentAndDepositPrice().call({from: req.user.publicAddress});

    const encodedABI= await RentContract.methods.payRent().encodeABI();
    const nonce = await web3.eth.getTransactionCount( req.user.publicAddress );
    res.send({abi:encodedABI, nonce: nonce, rentPrice: rentPrice})
}

exports.createWithdrawRentTransaction = async (req, res,next)=>{
    const pathToRentFile=path.join(__dirname,'../solidity/build/contracts','Rent.json')
    var RentData = JSON.parse(fs.readFileSync(pathToRentFile));
    const building = await  Building.findOne({_id: req.body.building_id})
    var RentContract = new web3.eth.Contract(RentData.abi, building.rentContractAddress);

    const encodedABI= await RentContract.methods.withdrawRent().encodeABI();
    const nonce = await web3.eth.getTransactionCount( req.user.publicAddress );
    res.send({abi:encodedABI, nonce: nonce})
}

exports.createWithdrawPreviousRentTransaction = async (req, res,next)=>{
    const pathToRentFile=path.join(__dirname,'../solidity/build/contracts','Rent.json')
    var RentData = JSON.parse(fs.readFileSync(pathToRentFile));
    const building = await  Building.findOne({_id: req.body.building_id})
    var RentContract = new web3.eth.Contract(RentData.abi, building.rentContractAddress);

    const encodedABI= await RentContract.methods.withdrawPreviousRent(req.body.missed).encodeABI();
    const nonce = await web3.eth.getTransactionCount( req.user.publicAddress );
    res.send({abi:encodedABI, nonce: nonce})
}

exports.respondToProposal = async (req,res,next)=>{
    const pathToRentFile=path.join(__dirname,'../solidity/build/contracts','Rent.json')
    var RentData = JSON.parse(fs.readFileSync(pathToRentFile));
    const building = await  Building.findOne({_id: req.body.building_id})
    var RentContract = new web3.eth.Contract(RentData.abi, building.rentContractAddress);

    const encodedABI= await RentContract.methods.returnDepositAcceptance(req.body.acceptance).encodeABI();
    const nonce = await web3.eth.getTransactionCount( req.user.publicAddress );
    res.send({abi:encodedABI, nonce: nonce})
}
exports.requestRentFromTenant = async (req,res,next)=>{
    const pathToRentFile=path.join(__dirname,'../solidity/build/contracts','Rent.json')
    var RentData = JSON.parse(fs.readFileSync(pathToRentFile));
    const building = await  Building.findOne({_id: req.body.building_id})
    var RentContract = new web3.eth.Contract(RentData.abi, building.rentContractAddress);

    const encodedABI= await RentContract.methods.requestRent().encodeABI();
    const nonce = await web3.eth.getTransactionCount( req.user.publicAddress );
    res.send({abi:encodedABI, nonce: nonce})
}

exports.submitDepositProposal = async (req,res,next)=>{
    const pathToRentFile=path.join(__dirname,'../solidity/build/contracts','Rent.json')
    var RentData = JSON.parse(fs.readFileSync(pathToRentFile));
    const building = await  Building.findOne({_id: req.body.building_id})
    var RentContract = new web3.eth.Contract(RentData.abi, building.rentContractAddress);

    const encodedABI= await RentContract.methods.returnDepositProposal().encodeABI();
    const nonce = await web3.eth.getTransactionCount( req.user.publicAddress );
    res.send({abi:encodedABI, nonce: nonce})
}
exports.getDepositProposal = async (req,res,next)=>{
    const pathToRentFile=path.join(__dirname,'../solidity/build/contracts','Rent.json')
    var RentData = JSON.parse(fs.readFileSync(pathToRentFile));
    const building = await  Building.findOne({_id: req.body.building_id})
    var RentContract = new web3.eth.Contract(RentData.abi, building.rentContractAddress);

    const proposedPercentage= await RentContract.methods.getDepositProposal().call({from: req.user.publicAddress});
    res.send({percentage: proposedPercentage})
}
