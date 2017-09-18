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
// RETURNS:  True/False if that authToken is still valid.
app.post('/token', (req, res) => {
    var authToken = req.body.authToken;
    User.findOne({
        authToken: authToken
    }).exec((err, user) => {
        if (err) console.log(err);
        else if (user) {
            console.log('authToken was valid.')
            res.send({ valid: true });
        }
        else {
            console.log('authToken was invalid.')
            res.send({ valid: false });
        }
    })
});

// RECEIVES: Username and Password of a specific User.
// RETURNS:  Error/Warning message, authToken of User account.
app.post('/login', (req, res) => {
    uname = req.body.username;
    pword = req.body.password;
    console.log('Login request: ' + uname);
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
    console.log('Register request: ' + uname);
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
                                    console.log('Created user: ' + user.username + '. Sending token: ' + authToken);
                                    res.send({
                                        err: false,
                                        warning: false,
                                        msg: 'Succesfully created account.',
                                        authToken: authToken
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