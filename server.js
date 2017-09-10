var express = require('express');
var http = require('http')
var socketio = require('socket.io');

var app = express();
var server = http.Server(app);
var websocket = socketio(server, { origins: '*:*'});

server.listen(3000, () => console.log('listening on *:3000'));

/***************************************\
            Server Web App
\***************************************/

app.get('/', (req, res) => {
    res.send('Hello World');
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