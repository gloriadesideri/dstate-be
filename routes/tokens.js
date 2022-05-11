const passport = require("passport");
const tokenController = require("../controllers/tokenController");
var express = require('express');
var router = express.Router();
router.post("/sell/:tokenId",passport.authenticate("jwt",{session: false}),tokenController.sellToken)
module.exports=router;
