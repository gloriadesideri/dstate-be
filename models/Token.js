const mongoose = require('mongoose');
const mongodbErrorHandler = require('mongoose-mongodb-errors');

const tokenSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: true,
    },
    address: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        //validate: [validator.isEmail, 'Invalid email']
    },
    user_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    symbol:{
        type: String,
        required: true,
    },
    initial_amount:{
        type: Number,
        required: true,

    }


    //isVerified: { type: Boolean, default: false },


});

tokenSchema.plugin(mongodbErrorHandler);

// userSchema.virtual('gravatar').get(function() {
// 	const hash = md5(this.email);
// 	return `https://gravatar.com/avatar/${hash}?s=300`;
// })

module.exports = mongoose.model('Token', tokenSchema);
