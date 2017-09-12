var express     = require('express');
var http        = require('http')
var socketio    = require('socket.io');
var bodyParser  = require('body-parser');

var app         = express();
var server      = http.Server(app);
var websocket   = socketio(server, { origins: '*:*'});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
server.listen(1337, () => console.log('listening on *:1337'));

/***************************************\
            Server Web App
\***************************************/

app.get('/', (req, res) => {
    res.send('Hello World');
});

app.post('/token', (req, res) => {
    res.send({valid: false});
});

/***************************************\
                  API
\***************************************/

// Connect
websocket.on('connection', (socket) => {
    socket.emit('notification', 'Hello world!');
    console.log('A client just joined on', socket.id);
});

websocket.on('authenticate', (data) => {
    console.log('auth')
});