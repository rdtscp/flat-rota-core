/***************************************\
              Server Setup
\***************************************/

var app         = require('express')();
var bodyParser  = require('body-parser');
var mongoose    = require('mongoose');
var socketio    = require('socket.io');

var server      = require('http').Server(app);
var io          = socketio(server);

app.use(bodyParser.json());
mongoose.Promise = require('bluebird');
mongoose.connect('mongodb://localhost:27017/flatrota', {useMongoClient: true});

/* Import Models */
const User      = require('./models/user.js');
const Resource  = require('./models/resource.js');

/***************************************\
           Socket/Notif Handler
\***************************************/

var notifQ = [];

io.on('connection', (socket) => {
    socket.on('login', (data) => {
        User.findOne({
            authToken: data
        }).exec((err, user) => {
            if (err) console.log(err);
            else if (user) {
                console.log(user.username + ' has logged in.');
                socket.join(user.username);
                console.log(notifQ);
                for (var i=0; i < notifQ.length; i++) {
                    if (notifQ[i].name == user.username) {
                        console.log('sending notification : ' + user.username + ': It is your turn to buy: ' + notifQ[i].quantity + ' of ' + notifQ[i].resource);
                        io.to(user.username).emit('inc_notif', notifQ[i]);
                    }
                }
            }
        });
    });
    socket.on('received_notif', (data) => {
        console.log('notification received: ' + data.name + ': It is your turn to buy: ' + data.quantity + ' of ' + data.resource);
        // Remove this notification from the Queue.
        var removeIndex = notifQ.indexOf(data);
        notifQ.splice(removeIndex, 1);
    })
});


/***************************************\
                  API
\***************************************/

// RECEIVES: authToken of a User.
// RETURNS:  True/False if that authToken is still valid.
app.post('/token', (req, res) => {
    var authToken = req.body.authToken;
    User.findOne({
        authToken: authToken
    }).exec((err, user) => {
        if (err) console.log(err);
        else if (user) {
            res.send({ valid: true });
        }
        else {
            res.send({ valid: false });
        }
    })
});

// RECEIVES: Username and Password of a specific User.
// RETURNS:  Error/Warning message, authToken of User account.
app.post('/login', (req, res) => {
    uname = req.body.username;
    pword = req.body.password;
    console.log(uname + ': login')
    // Find the requested User.
    User.findOne({
        username: uname
    }).exec((err, user) => {
        if (err) console.log(err);
        else if (!user) {
            console.log('invalid uname or pword')
            res.send({
                err: false,
                warning: true,
                msg: 'Invalid Username or Password'
            });
        }
        else {
            // Check submitted password.
            User.checkPassword(pword, user.password, (err, match) => {
                if (err) console.log(err);
                else if (match) {
                    console.log('sending ' + user.username + ' their token')
                    res.send({
                        err: false,
                        warning: false,
                        authToken: user.authToken
                    });
                } else {
                    res.send({
                        err: false,
                        warning: true,
                        msg: 'Invalid Username or Password'
                    });
                }
            });
        }
    });
});

// RECEIVES: Username and Password to create a User under.
// RETURNS:  Error/Warning message, authToken of created account.
app.post('/register', (req, res) => {
    uname = req.body.username;
    pword = req.body.password;
    if (uname == undefined || pword == undefined) {
        res.send({
            err: false,
            warning: true,
            msg: 'Invalid username or password'
        });
    }
    // Check User does not exist.
    User.findOne({
        username: uname
    }).exec((err, user) => {
        if (err) console.log(err);
        else if (user) {
            res.send({
                err: false,
                warning: true,
                msg: 'User already exists with that Username'
            });
        }
        else {
            // Get hash of Users password.
            User.hashPassword(pword, (err, hash) => {
                if (err) console.log(err);
                else {
                    // Generate them an auth authToken.
                    User.generateToken((err, authToken) => {
                        if (err) console.log(err);
                        else {
                            // Create the new User.
                            var user = new User({
                                username: uname,
                                password: hash,
                                authToken: authToken
                            });
                            // Save the new user.
                            user.save((err) => {
                                if (err) console.log(err);
                                else {
                                    res.send({
                                        err: false,
                                        warning: false,
                                        msg: 'Succesfully created account.',
                                        authToken: authToken
                                    });
                                }
                            });
                            // Register this User for all resources.
                            Resource.find().exec((err, resources) => {
                                resources.forEach((resource) => {
                                    resource.rota.push(user.username);
                                    resource.save((err) => {
                                        if (err) console.log(err);
                                    })
                                });
                            });
                        }
                    });
                }
            });
        }
    });
});

app.post('/resource/all', (req, res) => {
    Resource.find().exec((err, resources) => {
        res.send(resources);
    })
});

// RECEIVES: Name, Price,Description, Quantity params.
// RETURNS:  New Resource item in JSON.
app.post('/resource/new', (req, res) => {
    name        = req.body.name;
    price       = req.body.price;
    desc        = req.body.desc;
    quantity    = req.body.quantity;
    User.find({}, {username: 1, _id: 0}).exec((err, users) => {
        console.log(users);
        var rota = users.map(u => u.name);
        console.log(users);
        var newResource = new Resource({
            name: name,
            price: price,
            description: desc,
            quantity: quantity,
            rota: rota
        });
        newResource.save((err) => {
            if (err) console.log(err);
            else {
                console.log('Created new item:');
                console.log(newResource)
                res.send({done: true})
            }
        }); 
    });
});

// RECEIVES: authToken, resourceID, quantity params.
// RETURNS:  If the topup was succesful.
app.post('/resource/topup', (req, res) => {
    var authToken  = req.body.authToken;
    var resourceID = req.body.id;
    var quantity   = req.body.quantity;
    // Check we have all params.
    if (authToken == undefined || resourceID == undefined || quantity == undefined) {
        res.send({
            err: false,
            warning: true,
            msg: 'authToken, resourceID, or quantity was undefined.'
        });
    } else {
        User.findOne({
            authToken: authToken
        }).exec((err, user) => {
            console.log(user)
            if (err) console.log(err);
            else if (user) {
                var uname = user.username;
                console.log('Topup request.')
                console.log(uname)
                Resource.findById(resourceID).exec((err, resource) => {
                    if (err) console.log(err);
                    else if (resource) {
                        Resource.updateRota(resource, uname, quantity, (err, updtdResource) => {
                            if (err) res.send({err: true, warning: false, msg: err});
                            else {
                                res.send({
                                    err: false,
                                    warning: false,
                                    msg: 'You have successfully topped up ' + quantity + ' of ' + updtdResource.name
                                });
                            }
                        });
                    }
                });
            }
        });
    }
});

app.post('/resource/runout', (req, res) => {
    var resourceID = req.body.id;
    Resource.findById(resourceID).exec((err, resource) => {
        if (err) console.log(err);
        else if (resource) {
            console.log('Run out of resource:');
            console.log(resource);
            console
            notifQ.push({name: resource.rota[0], quantity: resource.quantity, resource: resource.name});
            res.send({done: true})
        }
    });
});


//*************************************\\
server.listen(1337, () => { console.log('Server Started on Port 1337...'); })