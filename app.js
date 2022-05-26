var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
const session = require('express-session');
const passport = require('passport');
const cors = require('cors')
const mongoose = require('mongoose');
require("./handlers/passport")
const expFileUpload = require("express-fileupload");


var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var authRouter = require('./routes/auth');
var buildingRouter = require('./routes/buildings')
var tokenRouter = require('./routes/tokens')

var app = express();

app.use(session( { secret:"62C158BD4EFF834E4D98ACD68DDBA"} ));
app.use(cors());
app.use(passport.initialize());
app.use(passport.session())
//app.use(expressValidator());

const uri = `mongodb+srv://DState-admin:3LwG9LWa2sUCEDZP@cluster0.cbsn2.mongodb.net/dstate?retryWrites=true&w=majority`;
// Mongoose
const conn = mongoose.createConnection(uri);

mongoose.connect(uri, {
    serverSelectionTimeoutMS: 5000
}).catch(err => console.log(err.reason));
mongoose.Promise = global.Promise;
mongoose.connection.on('error', (err) => {
    console.log('We have an error with the database: ' + err);
})

//app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(expFileUpload());

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/auth', authRouter);
app.use('/building', buildingRouter);
app.use('/token', tokenRouter);
module.exports = app;
