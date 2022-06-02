const passport = require('passport');
const User = require('../models/User');
const JWTStrategy=require('passport-jwt').Strategy
const ExtractJWT=require('passport-jwt').ExtractJwt
const path=require('path')
const fs=require('fs')
const {ObjectID} = require("mongodb");
require('dotenv').config()


const options={
    jwtFromRequest:ExtractJWT.fromAuthHeaderAsBearerToken(),
    secretOrKey:process.env.PASSPORT_SECRET,
}
const strategy=new JWTStrategy(options, async (payload,done)=>{
    await User.findOne({_id:payload.id}).then((user)=>{
        if(user){
            return done (null,user)
        }
        else{
            return done(null,false)
        }
    }).catch(err=>done(err,null))
})

passport.use(User.createStrategy());
passport.use(strategy)

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
