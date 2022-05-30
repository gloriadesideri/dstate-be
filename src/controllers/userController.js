const User = require('../models/User');
const Web3 = require('web3')
const walletAPIUrl = 'https://rinkeby.infura.io/v3/2af9187666bc4f2485d90c76f9727138';

const web3 = new Web3(walletAPIUrl);
exports.find = async (req, res, next) => {
    // If a query string ?publicAddress=... is given, then filter results
    const whereClause =
        req.query && req.query.publicAddress
            ? {
                publicAddress: req.query.publicAddress
            }
            : undefined;


     User.find(whereClause).exec()
        .then((doc) => {
            res.json({users: doc})
        })
        .catch(next=>{
            console.log("error")
        });
};

exports.get = async (req, res, next) => {
    // AccessToken payload is in req.user.payload, especially its `id` field
    // UserId is the param in /users/:userId
    // We only allow user accessing herself, i.e. require payload.id==userId
    if (req.user._id !== +req.params.userId) {
        return res
            .status(401)
            .send({ error: 'You can can only access yourself' });
    }
    return User.findOne({_id:req.params.userId}).exec()
        .then((doc) => res.json({user:doc}))
        .catch(next);
};
exports.create = async (req, res, next) =>{
    User.create(req.body)
        .then((doc) => res.json({user:doc}))
        .catch(next);
}
exports.balanceInETH= async (req,res,next)=>{
    console.log("balance in eth")
    var balanceInGwei =await  web3.eth.getBalance(req.user.publicAddress);
    console.log(balanceInGwei)
    var balanceInEth = balanceInGwei/ 10**18
    res.send({balance:balanceInEth})
}
