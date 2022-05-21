var express = require('express');
var router = express.Router();
const buildingController = require('../controllers/buildingController');
const multer  = require('multer');
//const upload = multer({ dest: os.tmpdir() });
const passport = require('passport');
const middlewares = require("../handlers/middlewares")

router.post("/deploy",passport.authenticate("jwt",{session: false}),middlewares.checkForBuildingApproval, buildingController.getEncodedABI );
router.post("/document",passport.authenticate("jwt",{session: false}),buildingController.uploadDocument );
router.post("/",passport.authenticate("jwt",{session: false}),buildingController.create );
router.post("/createToken",passport.authenticate("jwt",{session: false}),middlewares.checkForBuildingApproval, buildingController.createToken );
router.get("/unapproved", passport.authenticate("jwt",{session: false}), middlewares.checkAdminRole, buildingController.fetchUnapproved)
router.post("/approve", passport.authenticate("jwt",{session: false}), middlewares.checkAdminRole, buildingController.approveBuilding)
router.get("/", passport.authenticate("jwt",{session: false}), middlewares.checkAdminRole, buildingController.fetchBuildings)
router.get("/approved",passport.authenticate("jwt",{session: false}), buildingController.fetchApproved)
module.exports = router;
