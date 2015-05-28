var map;

window.onload = function() {

    function refreshCanvas() {
        context.clearRect(0, 0, 500, 500);
        map.renderMaze();
        for (var i = 0; i < playerArray.length; i++) {
            playerArray[i].painter.draw();
        }
        bulletsPainter.draw();
    }


    function timerEvent() {
        refreshCanvas();
    }

    function getYourPlayer(id) { //to be modified
        return playerArray[id].player;
    }

    var canvas = document.getElementById('_canvas');
    context = canvas.getContext('2d');

    playerArray = new Array();

    var bulletArray = new Array();
    var bulletsPainter = BulletsPainter.createNew(bulletArray, context);

    var painterTimer = setInterval(timerEvent, 25);

    var player;

    var socket = io();
    socket.on('fire', function(id) {
        playerArray[id].player.fire(bulletArray);
    });

    var id;
    var keyRunning = {};

    socket.on('init', function(data) {
        if (!map) {
            map = Map.createNew(canvas, context, data.maze);
            player = creatNewTank(map.player1X, map.player1Y, document.getElementById('player1'), context);
            playerArray.push(player);
            player = creatNewTank(map.player2X, map.player2Y, document.getElementById('player2'), context);
            playerArray.push(player);
            id = data.player - 1;
            player = getYourPlayer(id);
        }
    });

    socket.on('pos', function(data) {
        playerArray[data.id].player.posX = data.posX;
        playerArray[data.id].player.posY = data.posY;
        playerArray[data.id].player.angle = data.angle;
    });

    socket.on('loginResponse', function(data) {

    });

    $('#loginBtn').click(function(event) {
        var user = $('#inputUsername').val();
        var room = $('#inputRoomname').val();
        socket.emit('login', {
            'user': user,
            'room': room
        })
    })

    document.onkeydown = function(event) {
        var e = event || window.event;
        var keyCode = e.keyCode || e.which;
        if (keyRunning[keyCode] || keyRunning[keyCode] == true) {
            return;
        }
        keyRunning[keyCode] = true;
        switch (keyCode) {
            case 32:
                socket.emit('fire', id);
                player.fire(bulletArray);
                break;
            case 38:
                player.run(true);
                socket.emit('pos', {
                    'posX': player.posX,
                    'posY': player.posY,
                    'angle': player.angle,
                    'id': id
                });
                break;
            case 37:
                player.rotate(false);
                socket.emit('pos', {
                    'posX': player.posX,
                    'posY': player.posY,
                    'angle': player.angle,
                    'id': id
                });
                break;
            case 39:
                player.rotate(true);
                socket.emit('pos', {
                    'posX': player.posX,
                    'posY': player.posY,
                    'angle': player.angle,
                    'id': id
                });
                break;
            case 40:
                player.run(false);
                socket.emit('pos', {
                    'posX': player.posX,
                    'posY': player.posY,
                    'angle': player.angle,
                    'id': id
                });
                break;
        }
    };

    document.onkeyup = function(event) {
        var e = event || window.event;
        var keyCode = e.keyCode || e.which;
        keyRunning[keyCode] = false;
        switch (keyCode) {
            case 38:
            case 40:
                player.stopRun();
                socket.emit('pos', {
                    'posX': player.posX,
                    'posY': player.posY,
                    'angle': player.angle,
                    'id': id
                });
                break;
            case 37:
            case 39:
                player.stopRotate();
                socket.emit('pos', {
                    'posX': player.posX,
                    'posY': player.posY,
                    'angle': player.angle,
                    'id': id
                });
                break;
        }
    };
};