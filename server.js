/***************************************\
              Server Setup
\***************************************/

var app         = require('express')();
var bodyParser  = require('body-parser');

app.use(bodyParser.json());

var server      = require('http').Server(app);
var io          = require('socket.io')(server);


/***************************************\
                  API
\***************************************/

app.post('/token', (req, res) => {
    res.send({valid: true});
});

app.post('/user', (req, res) => {
    console.log(req.body)
    res.send({valid: true})
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