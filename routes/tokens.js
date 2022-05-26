const passport = require("passport");
const tokenController = require("../controllers/tokenController");
var express = require('express');
var router = express.Router();
const middlewares = require("../handlers/middlewares")
// route to get the balance of a given token address
router.get("/balanceOf",passport.authenticate("jwt",{session: false}), tokenController.balanceOfTokens );

module.exports=router;
