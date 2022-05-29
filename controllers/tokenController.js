const Token = require('../models/Token')
const path = require("path");
const fs = require("fs");

async function getBalance(userAddress, tokenAddress){
    const pathToTokenFile=path.join(__dirname,'../solidity/build/contracts','NewToken.json')
    var TokenData = JSON.parse(fs.readFileSync(pathToTokenFile));
    var tokenContract = new web3.eth.Contract(TokenData.abi, tokenAddress);
    const balanceInGwei= await tokenContract.methods.balanceOf(userAddress).call({from:userAddress})
    const balanceInEth= balanceInGwei/ 10**18;
}

exports.balanceOfTokens =async (req,res,next) => {
    const balanceInEth= await this.getBalance(req.user.publicAddress, req.body.tokenAddress);
    res.send({balance: balanceInEth})
}
exports.createProposal= async (req,res,next)=>{
    const balanceInEth= await this.getBalance(req.user.publicAddress, req.body.tokenAddress);
    if(balanceInEth == 0){
        res.send(400, "you need to hold tokens to submit a proposal")
    }
    const pathToTokenFile=path.join(__dirname,'../solidity/build/contracts','NewToken.json')
    var TokenData = JSON.parse(fs.readFileSync(pathToTokenFile));
    var tokenContract = new web3.eth.Contract(TokenData.abi, tokenAddress);
    const encodedABI = await tokenContract.methods.createProposal(req.body.title, req.body.description, req.body.proposalType, req.body.uint0,
        req.body.uint1,req.body.uint2,req.body.address0).encodeABI();
    const nonce = await web3.eth.getTransactionCount( req.user.publicAddress );
    res.send({abi:encodedABI, nonce: nonce})

}

exports.getProposals = async (req,res,next)=>{
    const pathToTokenFile=path.join(__dirname,'../solidity/build/contracts','NewToken.json')
    var TokenData = JSON.parse(fs.readFileSync(pathToTokenFile));
    var tokenContract = new web3.eth.Contract(TokenData.abi, tokenAddress);
    let proposals=[]
    if(req.body.proposalId){
        let proposal = await tokenContract.methods.proposals(req.body.proposalId).call({from: req.user.publicAddress})
        proposals.push(proposal)
    }else if (req.body.proposalNumber && req.body.previousId){
        for( let i =0; i<req.body.proposalNumber; i++){
            let proposal = await tokenContract.methods.proposals(req.body.previousId +i).call({from: req.user.publicAddress})
            if(!(proposal.address= "0x0000000000000000000000000000000000000000")){
                proposals.push(proposal)
            }
        }
    }else{
        res.send(400)
    }
    res.send({proposals:proposals})
}
exports.submitVote= async (req,res,next)=>{
    const balanceInEth= await this.getBalance(req.user.publicAddress, req.body.tokenAddress);
    const pathToTokenFile=path.join(__dirname,'../solidity/build/contracts','NewToken.json')
    var TokenData = JSON.parse(fs.readFileSync(pathToTokenFile));
    var tokenContract = new web3.eth.Contract(TokenData.abi, tokenAddress);
    if(balanceInEth == 0){
        res.send(400, "you need to hold tokens to submit a vote")
    }
    var encodedABI=await tokenContract.methods.vote(req.body.proposalId).encodeABI()
    const nonce = await web3.eth.getTransactionCount( req.user.publicAddress );
    res.send({abi:encodedABI, nonce: nonce})
}
