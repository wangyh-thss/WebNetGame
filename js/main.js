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

    socket.on('run', function(data) {
        playerArray[data.id].player.run(data.direction);
    });

    socket.on('rotate', function(data) {
        playerArray[data.id].player.rotate(data.direction);
    });

    socket.on('stopRun', function(id) {
        playerArray[id].player.stopRun();
    });

    socket.on('stopRotate', function(id) {
        playerArray[id].player.stopRotate();
    });

    document.onkeydown = function(event) {
        var e = event || window.event;
        var keyCode = e.keyCode || e.which;
        switch (keyCode) {
            case 32:
                socket.emit('fire', id);
                player.fire(bulletArray);
                break;
            case 38:
                player.run(true);
                socket.emit('run', {
                    'id': id,
                    'direction': true
                });
                break;
            case 37:
                player.rotate(false);
                socket.emit('rotate', {
                    'direction': false,
                    'id': id
                });
                break;
            case 39:
                player.rotate(true);
                socket.emit('rotate', {
                    'direction': true,
                    'id': id
                });
                break;
            case 40:
                player.run(false);
                socket.emit('run', {
                    'direction': false,
                    'id': id
                });
                break;
        }
    };

    document.onkeyup = function(event) {
        var e = event || window.event;
        var keyCode = e.keyCode || e.which;
        switch (keyCode) {
            case 38:
            case 40:
                player.stopRun();
                socket.emit('stopRun', id);
                break;
            case 37:
            case 39:
                player.stopRotate();
                socket.emit('stopRotate', id);
                break;
        }
    };
};


