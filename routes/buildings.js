var express = require('express');
var router = express.Router();
const buildingController = require('../controllers/buildingController');
const multer  = require('multer');
//const upload = multer({ dest: os.tmpdir() });
const passport = require('passport');
const middlewares = require("../handlers/middlewares")

router.post("/deploy",passport.authenticate("jwt",{session: false}),middlewares.checkForBuildingApproval, buildingController.deployToken );
router.post("/document",passport.authenticate("jwt",{session: false}),buildingController.uploadDocument );
router.post("/",passport.authenticate("jwt",{session: false}),buildingController.create );
router.post("/createToken",passport.authenticate("jwt",{session: false}),middlewares.checkForBuildingApproval, buildingController.createToken );
router.get("/unapproved", passport.authenticate("jwt",{session: false}), middlewares.checkAdminRole, buildingController.fetchUnapproved)
router.post("/approve", passport.authenticate("jwt",{session: false}), middlewares.checkAdminRole, buildingController.approveBuilding)
router.get("/", passport.authenticate("jwt",{session: false}), middlewares.checkAdminRole, buildingController.fetchBuildings)
router.get("/approved",passport.authenticate("jwt",{session: false}), buildingController.fetchApproved)

router.post("/createSetPriceTransaction", passport.authenticate("jwt",{session: false}), middlewares.checkForBuildingApproval, buildingController.createSetPriceTransaction)
router.post("/getPriceForTokens", passport.authenticate("jwt",{session: false}), middlewares.checkForBuildingApproval, buildingController.getPriceForTokens)
router.post("/createBuyTokenTransaction", passport.authenticate("jwt",{session: false}), middlewares.checkForBuildingApproval, buildingController.createBuyTokenTransaction)
router.post("/approveToken", passport.authenticate("jwt",{session: false}), middlewares.checkForBuildingApproval, buildingController.approveToken)

// sale cancel route
router.post("/cancelSale",passport.authenticate("jwt",{session: false}), middlewares.checkForBuildingApproval, buildingController.cancelSaleFromContract)

// request rent (can only be called from a caretaker)
router.post("/requestRent",passport.authenticate("jwt",{session: false}), middlewares.checkForBuildingApproval,middlewares.checkCaretaker, buildingController.requestRentFromTenant)
// route to pay rent
router.post("/rent", passport.authenticate("jwt",{session: false}), middlewares.checkForBuildingApproval, middlewares.checkTenancy, buildingController.createPayRentTransaction);
// route to withdraw rent
router.post("/withdrawRent", passport.authenticate("jwt",{session: false}), middlewares.checkForBuildingApproval, buildingController.createWithdrawRentTransaction);

// make a deposit proposal (can only be called from a caretaker)
router.post("/submitDepositProposal",passport.authenticate("jwt",{session: false}), middlewares.checkForBuildingApproval,middlewares.checkCaretaker, buildingController.submitDepositProposal)
// get deposit proposal
router.post("/getDepositProposal",passport.authenticate("jwt",{session: false}), middlewares.checkForBuildingApproval,middlewares.checkTenancy, buildingController.getDepositProposal)

// accept/decline deposit proposal
router.post("/respondToProposal", passport.authenticate("jwt",{session: false}), middlewares.checkForBuildingApproval, buildingController.respondToProposal);



module.exports = router;
