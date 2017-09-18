/***************************************\
              Server Setup
\***************************************/

var app         = require('express')();
var bodyParser  = require('body-parser');
var mongoose    = require('mongoose');

var server      = require('http').Server(app);
var io          = require('socket.io')(server);

app.use(bodyParser.json());
mongoose.Promise = require('bluebird');
mongoose.connect('mongodb://localhost:27017/flatrota', {useMongoClient: true});

/* Import Models */
const User      = require('./models/user.js');
const Resource  = require('./models/resource.js');


/***************************************\
                  API
\***************************************/

// RECEIVES: authToken of a User.
// RETURNS:  True/False if that token is still valid.
app.post('/token', (req, res) => {
    var token = req.body.token;
    User.findOne({
        token: token
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
// RETURNS:  Error/Warning message, token of User account.
app.post('/login', (req, res) => {
    uname = req.body.username;
    pword = req.body.password;
    // Find the requested User.
    User.findOne({
        username: uname
    }).exec((err, user) => {
        if (err) console.log(err);
        else if (!user) {
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
                    res.send({
                        err: false,
                        warning: false,
                        token: user.token
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
// RETURNS:  Error/Warning message, token of created account.
app.post('/register', (req, res) => {
    uname = req.body.username;
    pword = req.body.password;
    // Check User does not exist.
    User.exists(uname, (err, user) => {
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
                    // Generate them an auth token.
                    User.generateToken((err, token) => {
                        if (err) console.log(err);
                        else {
                            // Create the new User.
                            var user = new User({
                                username: uname,
                                password: hash,
                                token: token
                            });
                            // Save the new user.
                            user.save((err) => {
                                if (err) console.log(err);
                                else {
                                    res.send({
                                        err: false,
                                        warning: false,
                                        msg: 'Succesfully created account.',
                                        token: token
                                    });
                                }
                            });
                        }
                    });
                }
            });
        }
    });
});

/***************************************\
                 Socket
\***************************************/

io.on('connection', (socket) => {
    socket.on('my other event', (data) => {
        console.log(data);
    });
});


//*************************************\\
app.listen(1337, () => { console.log('Server Started on Port 1337...'); })