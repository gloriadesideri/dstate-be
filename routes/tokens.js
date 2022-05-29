const passport = require("passport");
const tokenController = require("../controllers/tokenController");
var express = require('express');
var router = express.Router();
const middlewares = require("../handlers/middlewares")
// route to get the balance of a given token address
router.get("/balanceOf",passport.authenticate("jwt",{session: false}), tokenController.balanceOfTokens );
//create a proposal to vote for
router.post("/createProposal",passport.authenticate("jwt",{session: false}),tokenController.createProposal);
router.get("/checkForProposals",passport.authenticate("jwt",{session: false}),tokenController.getProposals);
router.post("/submitVote",passport.authenticate("jwt",{session: false}),tokenController.submitVote)
module.exports=router;
