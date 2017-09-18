var mongoose        = require('mongoose');
var Schema          = mongoose.Schema;

var resourceSchema = mongoose.Schema ({
    name: String,
    price: String,
    description: String,
    quantity: String,
    rota: [String]
});

resourceSchema.statics.generateRota = (creator, cb) => {
    // Get all users.
    Users.findAll({username: {'$ne':creator }}).exec((err, users) => {
    });
}

var Resource = mongoose.model('Resource', resourceSchema);

module.exports = Resource;