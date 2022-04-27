const mongoose = require('mongoose');
const mongodbErrorHandler = require('mongoose-mongodb-errors');
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new mongoose.Schema({
    userName: {
        type: String,
        trim: true,
        required: true,
        unique: true,
        lowercase: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        //validate: [validator.isEmail, 'Invalid email']
    },
    name: {
        type:String
    },
    nonce: {
        allowNull: false,
        type: Number,
        default:() => Math.floor(Math.random() * 1000000)
    },
    publicAddress: {
        allowNull: false,
        type: String,
        unique: true,
    },


    //isVerified: { type: Boolean, default: false },


});

userSchema.plugin(passportLocalMongoose, { usernameField: 'publicAddress'});
userSchema.plugin(mongodbErrorHandler);

// userSchema.virtual('gravatar').get(function() {
// 	const hash = md5(this.email);
// 	return `https://gravatar.com/avatar/${hash}?s=300`;
// })

module.exports = mongoose.model('User', userSchema);
