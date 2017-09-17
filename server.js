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
    console.log('token')
    console.log(req.body)
    res.send({valid: false});
});

app.post('/login', (req, res) => {
    console.log('login')
    console.log(req.body)
    res.send({token: 'foobar'})
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