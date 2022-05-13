var express = require('express');
var router = express.Router();
const buildingController = require('../controllers/buildingController');
const multer  = require('multer');
//const upload = multer({ dest: os.tmpdir() });
const passport = require('passport');

router.post("/deploy",passport.authenticate("jwt",{session: false}),buildingController.getEncodedABI );
router.post("/document",passport.authenticate("jwt",{session: false}),buildingController.uploadDocument );
router.post("/",passport.authenticate("jwt",{session: false}),buildingController.create );
module.exports = router;
