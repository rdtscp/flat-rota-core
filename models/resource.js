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

// Update rota.
resourceSchema.statics.updateRota = (resource, uname, quantity, cb) => {
    var rota = resource.rota;
    console.log(rota);
    // Get index of this User and remove them.
    var index  = rota.indexOf(uname);
    var isLast = (index == rota.length - 1);
    rota.splice(index, 1);

    // If the index is the last entry; "duplicate" the rota.
    console.log(index)
    if (isLast) {
        var usersFound = [];
        rota.forEach((user) => {
            if (usersFound.indexOf(user) > -1) {
                // We have already found this user.
            } else {
                rota.push(user);
                usersFound.push(user);
            }
        });
    }

    // Re-add the user.
    rota.push(uname);
    console.log(rota);
    cb(null, rota);
}

// Credit to: https://stackoverflow.com/a/30229099
function replicateArray(array, n) {
    // Create an array of size "n" with undefined values
    var arrays = Array.apply(null, new Array(n)); 
  
    // Replace each "undefined" with our array, resulting in an array of n copies of our array
    arrays = arrays.map(function() { return array });
  
    // Flatten our array of arrays
    return [].concat.apply([], arrays);
}


var Resource = mongoose.model('Resource', resourceSchema);

module.exports = Resource;