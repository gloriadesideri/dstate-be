var express = require('express');
var router = express.Router();
const nodemailer = require("nodemailer");

/* GET home page. */
let transporter = nodemailer.createTransport({
  host: "smtp.ethereal.email",
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: "support@dstate.com", // generated ethereal user
    pass: "s3cr3t", // generated ethereal password
  },
});
router.get('/', function(req, res, next) {

  res.render('index', { title: 'Express' });
});

module.exports = router;
