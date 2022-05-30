const Token = require('../models/Token')
const path = require("path");
const fs = require("fs");
const Web3 = require('web3')
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
    if(req.body.proposalId){
        let proposal = await tokenContract.methods.proposals(req.body.proposalId).call({from: req.user.publicAddress})
        proposals.push(proposal)
    }else if (req.body.proposalNumber && req.body.previousId){
        for( let i =0; i<req.body.proposalNumber; i++){
            let proposal = await tokenContract.methods.proposals(req.body.previousId +i).call({from: req.user.publicAddress})
            if(!(proposal.title)){
                proposals.push(proposal)
            }
        }
    }else{
        res.send(400)
    }
    res.send({proposals:proposals})
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
