var map, painterTimer, gameStarted = false, boomTimer, loser, id = null, stage = 1;
var gameover = null, score;

window.onload = function() {

    $('#inputUsername').attr('disabled', false);
    $('#inputRoomname').attr('disabled', false);
    $('#loginBtn').attr('disabled', false);

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

    bulletArray = new Array();
    var bulletsPainter = BulletsPainter.createNew(bulletArray, context);

    var player;

    var loginSocket = io(), roomSocket = null;

    var keyRunning = {};

    loginSocket.on('waitRandomRoom', function() {
        $('#alertRandomRoom').slideDown();
        $('#inputUsername').attr('disabled', true);
        $('#inputRoomname').attr('disabled', true);
        $('#loginBtn').attr('disabled', true);
    });

    loginSocket.on('join room', function(data) {
        if(data.err) {
            $('#alertFull').slideDown();
            setTimeout(function() {
                $('#alertFull').slideUp();
            }, 3000);
            return;
        }
        var host = window.location.hostname;
        var port = window.location.port || 80;
        $('#roomName').text(data.roomName);
        $('#alert').slideDown();
        $('#inputUsername').attr('disabled', true);
        $('#inputRoomname').attr('disabled', true);
        $('#loginBtn').attr('disabled', true);
        roomSocket = io.connect(host + ':' + port + '/' + data.roomName, {'force new connection':true});
        roomSocket.on('start', function(data) {
            window.score = data.score;
            if (window.stage === 1){
                $('#loginStage').fadeOut(800, function() {
                    $('#gameStage').fadeIn(800, function() {
                        window.gameStarted = true;
                    });
                });
            } else if (window.stage === 3) {
                $('#restartStage').fadeOut(800, function() {
                    $('#gameStage').fadeIn(800, function() {
                        window.gameStarted = true;
                    });
                });
            }
            window.stage = 2;
            painterTimer = setInterval(timerEvent, 25);
        });
        roomSocket.on('init', function(data) {
            map = Map.createNew(canvas, context, data.maze);
            if (id === null) {
                id = data.player - 1;
            }
            player = creatNewTank(map.player1X, map.player1Y, document.getElementById('player1'), context);
            playerArray.push(player);
            player = creatNewTank(map.player2X, map.player2Y, document.getElementById('player2'), context);
            playerArray.push(player);
            player = getYourPlayer(id);
        });

        roomSocket.on('run', function(data) {
            playerArray[data.id].player.run(data.direction);
        });

        roomSocket.on('rotate', function(data) {
            playerArray[data.id].player.rotate(data.direction);
        });

        roomSocket.on('stopRun', function(id) {
            playerArray[id].player.stopRun();
        });

        roomSocket.on('stopRotate', function(id) {
            playerArray[id].player.stopRotate();
        });

        roomSocket.on('fire', function(id) {
            playerArray[id].player.fire(bulletArray);
        });

        roomSocket.on('check', function(data) {
            var id = data.id;
            playerArray[id].player.posX = data.posX;
            playerArray[id].player.posY = data.posY;
            playerArray[id].player.angle = data.angle;
        });

        roomSocket.on('stop', function() {
            gameover();
            //roomSocket.emit('disconnect');
            //roomSocket.disconnect();
            //roomSocket.leave(data.namespace);
            window.stage = 1;
            $('#gameStage').hide();
            $('#restartStage').hide();
            $('#alert').hide();
            $('#alertRandomRoom').hide();
            $('#inputUsername').attr('disabled', false);
            $('#inputRoomname').attr('disabled', false);
            $('#loginBtn').attr('disabled', false);
            $('#loginStage').fadeIn(500, function() {
                $('#alertDisconnct').slideDown();
                setTimeout(function() {
                    $('#alertDisconnct').slideUp();
                }, 3000);
            });
            window.id = null;
            window.gameStarted = false;
            clearInterval(painterTimer);
        });

        gameover = function() {
            map = undefined;
            for (var i = 0; i < playerArray.length; i++) {
                playerArray[i].player.stop();
            }
            playerArray.splice(0, playerArray.length);
            for (var i = 0; i < bulletArray.length; i++) {
                bulletArray[i].destory();
            }
            bulletArray.splice(0, bulletArray.length);
            roomSocket.emit('gameover', window.loser);
        };
    });

    $('#loginBtn').click(function(event) {
        var userName = $('#inputUsername').val();
        var roomName = $('#inputRoomname').val();
        loginSocket.emit('room', {
            'userName': userName,
            'roomName': roomName
        });
    });

    $('#restart').click(function(event) {
        if(roomSocket) {
            $('#alertRestart').slideDown();
            roomSocket.emit('restart', id);
        }
        $('#restart').attr('disabled', true);
    })

    document.onkeydown = function(event) {
        var e = event || window.event;
        var keyCode = e.keyCode || e.which;
        if (!gameStarted) {
            return;
        }
        if (keyRunning[keyCode] || keyRunning[keyCode] == true) {
            return;
        }
        keyRunning[keyCode] = true;
        roomSocket.emit('check', {
            'id': id,
            'posX': player.posX,
            'posY': player.posY,
            'angle': player.angle
        });
        switch (keyCode) {
            case 32:
                roomSocket.emit('fire', id);
                player.fire(bulletArray);
                break;
            case 38:
                player.run(true);
                roomSocket.emit('run', {
                    'id': id,
                    'direction': true
                });
                break;
            case 37:
                player.rotate(false);
                roomSocket.emit('rotate', {
                    'direction': false,
                    'id': id
                });
                break;
            case 39:
                player.rotate(true);
                roomSocket.emit('rotate', {
                    'direction': true,
                    'id': id
                });
                break;
            case 40:
                player.run(false);
                roomSocket.emit('run', {
                    'direction': false,
                    'id': id
                });
                break;
        }
    };

    document.onkeyup = function(event) {
        var e = event || window.event;
        var keyCode = e.keyCode || e.which;
        if (!gameStarted) {
            return;
        }
        keyRunning[keyCode] = false;
        roomSocket.emit('check', {
            'id': id,
            'posX': player.posX,
            'posY': player.posY,
            'angle': player.angle
        });
        switch (keyCode) {
            case 38:
            case 40:
                player.stopRun();
                roomSocket.emit('stopRun', id);
                break;
            case 37:
            case 39:
                player.stopRotate();
                roomSocket.emit('stopRotate', id);
                break;
        }
    };
}; 