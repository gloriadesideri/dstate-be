var express = require('express');
var userRouter = express.Router();
const userController = require('../controllers/userController');
const middlewares = require("../handlers/middlewares")

const passport=require('passport');

//userRouter.use(passport.authenticate('jwt',{session:false}))

/** GET /api/users */
userRouter.route('/').get(userController.find);

/** GET /api/users/:userId */
/** Authenticated route */
userRouter.route('/:userId').get(passport.authenticate('jwt',{session:false}), userController.get);

/** POST /api/users */
userRouter.route('/').post(userController.create);
userRouter.get("/profile/:userId",passport.authenticate('jwt',{session:false}), middlewares.checkBalance, userController.profile)

module.exports = userRouter;
