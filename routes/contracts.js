var express = require('express');
var router = express.Router();
const contractController = require('../controllers/contractController');

const passport = require('passport');

router.get("/",passport.authenticate("jwt",{session: false}),contractController.interact );

module.exports = router;
