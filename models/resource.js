var mongoose        = require('mongoose');
var Schema          = mongoose.Schema;

var resourceSchema = new Schema ({
    name: String,
    price: Number,
    description: String,
    quantity: Number,
    rota: [String]
});

var Resource = mongoose.model('Resource', resourceSchema);

module.exports = Resource;