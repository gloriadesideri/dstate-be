const User = require('../models/User');
const ethSigUtil = require('eth-sig-util');
const ethJsUtil = require('ethereumjs-util');
const jwt = require('jsonwebtoken');



exports.login = async (req, res, next) => {
    const {signature, publicAddress} = req.body;
    if (!signature || !publicAddress)
        return res
            .status(400)
            .send({error: 'Request should have signature and publicAddress'});

    return (
        User.findOne({publicAddress: publicAddress}).exec()
            ////////////////////////////////////////////////////
            // Step 1: Get the user with the given publicAddress
            ////////////////////////////////////////////////////
            .then((doc) => {
                if (!doc) {
                    res.status(401).send({
                        error: `User with publicAddress ${publicAddress} is not found in database`,
                    });

                    return null;
                }

                return doc;
            })
            ////////////////////////////////////////////////////
            // Step 2: Verify digital signature
            ////////////////////////////////////////////////////
            .then((user) => {

                const msg = `I am signing my one-time nonce: ${user.nonce}`;

                // We now are in possession of msg, publicAddress and signature. We
                // will use a helper from eth-sig-util to extract the address from the signature
                const msgBufferHex = ethJsUtil.bufferToHex(Buffer.from(msg, 'utf8'));
                const address = ethSigUtil.recoverPersonalSignature({
                    data: msgBufferHex,
                    sig: signature,
                });

                // The signature verification is successful if the address found with
                // sigUtil.recoverPersonalSignature matches the initial publicAddress
                if (address.toLowerCase() === publicAddress.toLowerCase()) {
                    return user;
                } else {
                    res.status(401).send({
                        error: 'Signature verification failed',
                    });

                    return null;
                }
            })
            ////////////////////////////////////////////////////
            // Step 3: Generate a new nonce for the user
            ////////////////////////////////////////////////////
            .then((user) => {

                user.nonce = Math.floor(Math.random() * 10000);
                return user.save();
            })
            ////////////////////////////////////////////////////
            // Step 4: Create JWT
            ////////////////////////////////////////////////////
            .then((user) => {
                let accessToken=jwt.sign(
                    {
                        id: user._id, publicAddress,
                    },
                    "B4CDD8977BD7984DDACA26B235965",
                )
                return accessToken;
            })
            .then((accessToken) => res.json({accessToken}))
            .catch(next)
    );


};
