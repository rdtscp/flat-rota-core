var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var userSchema = mongoose.Schema ({
    username: String,
    password: String,
    authToken: String
});

var User = mongoose.model('User', userSchema);

module.exports = User;