/***************************************\
              Server Setup
\***************************************/

var express     = require('express');
var bodyParser  = require('body-parser');

var app         = express();

var server      = require('http').Server(app);
var io          = require('socket.io')(server);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

/***************************************\
                  API
\***************************************/

app.post('/token', (req, res) => {
    res.send({valid: false});
});

app.post('/user', (req, res) => {

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