const Building = require ('../models/Building')
const Web3 = require('web3')
const path = require("path");
const fs = require("fs");
const walletAPIUrl = 'https://rinkeby.infura.io/v3/2af9187666bc4f2485d90c76f9727138';

const web3 = new Web3(walletAPIUrl);

exports.checkAdminRole = async (req, res, next) => {
    if(req.user.role!="admin"){
        return res.send(401, "Admin role required")
    }
    else{
        next();
    }
}
exports.checkForBuildingApproval = async (req, res ,next)=>{
    const building = await Building.findOne({_id: req.body.building_id})
    if(!building.approved){
        res.send(400, "building needs to be approved")
    }else{
        next()
    }

}

exports.checkTenancy = async (req, res, next)=>{
    const pathToRentFile=path.join(__dirname,'../solidity/build/contracts','Rent.json')
    var RentData = JSON.parse(fs.readFileSync(pathToRentFile));
    const building = await  Building.findOne({_id: req.body.building_id})
    var RentContract = new web3.eth.Contract(RentData.abi, building.rentContractAddress);
    const tenant= await RentContract.methods.getTenant().call({from: req.user.publicAddress})

    if(tenant == req.user.publicAddress){
        next();
    }else{
        return res.send(401, "You are not the tenant")
    }
}

exports.checkCaretaker = async (req, res, next)=>{
    const pathToRentFile=path.join(__dirname,'../solidity/build/contracts','Rent.json')
    var RentData = JSON.parse(fs.readFileSync(pathToRentFile));
    const building = await  Building.findOne({_id: req.body.building_id})
    var RentContract = new web3.eth.Contract(RentData.abi, building.rentContractAddress);
    const caretaker= await RentContract.methods.getCaretaker().call({from: req.user.publicAddress})

    if(caretaker == req.user.publicAddress){
        next();
    }else{
        return res.send(401, "You are not the caretaker")
    }
}
