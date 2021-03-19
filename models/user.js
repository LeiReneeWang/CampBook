const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    }
});

//use passportLocalMongoose to add username and password to UserSchema
//and also make sure that unsername are unique
UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', UserSchema);