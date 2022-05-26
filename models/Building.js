const mongoose = require('mongoose');
const mongodbErrorHandler = require('mongoose-mongodb-errors');

const buildingSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: true,
        unique: true,
        lowercase: true
    },
    address: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        //validate: [validator.isEmail, 'Invalid email']
    },
    user_id:{
        type:mongoose.Schema.ObjectId,
        ref:'User'
    },
    token_id: {
        type:mongoose.Schema.ObjectId,
        ref:'Token'
    },
    approved:{
        type: Boolean,
        //TODO: SET TO FALSE IN PROD
        default: true
    },
    rentContractAddress:{
        type:String
    }


    //isVerified: { type: Boolean, default: false },


});

buildingSchema.plugin(mongodbErrorHandler);

// userSchema.virtual('gravatar').get(function() {
// 	const hash = md5(this.email);
// 	return `https://gravatar.com/avatar/${hash}?s=300`;
// })

module.exports = mongoose.model('Building', buildingSchema);
