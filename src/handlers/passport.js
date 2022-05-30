const passport = require('passport');
const User = require('../models/User');
const JWTStrategy=require('passport-jwt').Strategy
const ExtractJWT=require('passport-jwt').ExtractJwt
const path=require('path')
const fs=require('fs')
const {ObjectID} = require("mongodb");


const options={
    jwtFromRequest:ExtractJWT.fromAuthHeaderAsBearerToken(),
    secretOrKey:"E1J6vwm0KkRvOkbeMlex-5hN36OwP_UTv5dZZVpyoN8",
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
