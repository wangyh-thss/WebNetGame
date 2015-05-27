/**
 * Created by tarma on 15年5月27日.
 */
var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

server.listen(3000);

app.get('/', function (req, res) {
    res.sendfile(__dirname + '/index.html');
});

app.use(express.static(__dirname));

io.on('connection', function (socket) {
    socket.on('fire', function(player) {
        io.emit('fire', player);
    });
});