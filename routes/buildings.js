var express = require('express');
var router = express.Router();
const buildingController = require('../controllers/buildingController');
const multer  = require('multer');
//const upload = multer({ dest: os.tmpdir() });
const passport = require('passport');

router.post("/",passport.authenticate("jwt",{session: false}),buildingController.create );
router.post("/document",passport.authenticate("jwt",{session: false}),buildingController.uploadDocument );

module.exports = router;
