const Token = require('../models/Token')
const path = require("path");
const fs = require("fs");
const Web3 = require('web3')
const User = require("../models/User");
const walletAPIUrl = 'https://rinkeby.infura.io/v3/2af9187666bc4f2485d90c76f9727138';

const web3 = new Web3(walletAPIUrl);
async function getBalance(userAddress, tokenAddress){
    const pathToTokenFile=path.join(__dirname,'../solidity/build/contracts','NewToken.json')
    var TokenData = JSON.parse(fs.readFileSync(pathToTokenFile));
    var tokenContract = new web3.eth.Contract(TokenData.abi, tokenAddress);
    const balanceInGwei= await tokenContract.methods.balanceOf(userAddress).call({from:userAddress})
    const balanceInEth= balanceInGwei/ 10**18;
    return balanceInEth
}

exports.balanceOfTokens =async (req,res,next) => {
    const balanceInEth= await getBalance(req.user.publicAddress, req.query.tokenAddress);
    res.send({balance: balanceInEth})
}
exports.createProposal= async (req,res,next)=>{
    const balanceInEth= await getBalance(req.user.publicAddress, req.body.tokenAddress);
    if(balanceInEth == 0){
        res.send(400, "you need to hold tokens to submit a proposal")
    }
    const pathToTokenFile=path.join(__dirname,'../solidity/build/contracts','NewToken.json')
    var TokenData = JSON.parse(fs.readFileSync(pathToTokenFile));
    var tokenContract = new web3.eth.Contract(TokenData.abi, req.body.tokenAddress);
    const encodedABI = await tokenContract.methods.createProposal(req.body.title, req.body.description, req.body.proposalType, req.body.uint0,
        req.body.uint1,req.body.uint2,req.body.address0).encodeABI();
    const nonce = await web3.eth.getTransactionCount( req.user.publicAddress );
    res.send({abi:encodedABI, nonce: nonce})

}

exports.getProposals = async (req,res,next)=>{
    const pathToTokenFile=path.join(__dirname,'../solidity/build/contracts','NewToken.json')
    var TokenData = JSON.parse(fs.readFileSync(pathToTokenFile));
    var tokenContract = new web3.eth.Contract(TokenData.abi, req.body.tokenAddress);
    let proposals=[]
    if (req.body.proposalNumber!=null && req.body.previousId!=null){
        for( let i =0; i<req.body.proposalNumber; i++){
            let proposal = await tokenContract.methods.proposals(req.body.previousId +i).call({from: req.user.publicAddress})
            if((proposal.title!='')){
                proposals.push(proposal)
            }
        }
        res.send({proposals:proposals})
        return
    }else if (req.body.proposalId!=null){
        let proposal = await tokenContract.methods.proposals(req.body.proposalId).call({from: req.user.publicAddress})
        let votesN = await tokenContract.methods.votes(req.body.proposalId).call({from: req.user.publicAddress})
        let votingResult = await tokenContract.methods.votingResult(req.body.proposalId).call({from: req.user.publicAddress})
        proposal.votesN= votesN
        proposal.votingResult= votingResult
        console.log(proposal)
        proposals.push(proposal)
        res.send({proposals:proposals})
        return
    }else{
        res.send(400)
        return
    }

}
exports.submitVote= async (req,res,next)=>{
    const balanceInEth= await getBalance(req.user.publicAddress, req.body.tokenAddress);
    const pathToTokenFile=path.join(__dirname,'../solidity/build/contracts','NewToken.json')
    var TokenData = JSON.parse(fs.readFileSync(pathToTokenFile));
    var tokenContract = new web3.eth.Contract(TokenData.abi, req.body.tokenAddress);
    if(balanceInEth == 0){
        res.send(400, "you need to hold tokens to submit a vote")
    }
    var encodedABI=await tokenContract.methods.vote(req.body.proposalId).encodeABI()
    const nonce = await web3.eth.getTransactionCount( req.user.publicAddress );
    res.send({abi:encodedABI, nonce: nonce})
}
exports.addToken= async (req, res, next)=>{
    const token = await Token.findOne({"_id":req.body.tokenId});
    let user = await  User.findOneAndUpdate(
        {"_id": req.user._id},
        {$push: { "token_ids": token._id } }
    )
    res.send({user: user})
}
