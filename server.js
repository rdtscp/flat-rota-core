/***************************************\
              Server Setup
\***************************************/

var app         = require('express')();
var bodyParser  = require('body-parser');
var mongoose    = require('mongoose');

var server      = require('http').Server(app);
var io          = require('socket.io')(server);

app.use(bodyParser.json());
mongoose.connect('mongodb://localhost:27017/flatrota', {useMongoClient: true});

/* Import Models */
const User      = require('./models/user.js');
const Resource  = require('./models/resource.js');


/***************************************\
                  API
\***************************************/

app.post('/token', (req, res) => {
    console.log('token')
    console.log(req.body)
    res.send({valid: false});
});

app.post('/login', (req, res) => {
    console.log('Login')
    console.log(req.body)
    res.send({token: 'foobar'})
});

app.post('/register', (req, res) => {
    console.log('Register')
    console.log(req.body);
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