var map, painterTimer;

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

    var player, gameStarted = false;

    var loginSocket = io(), roomSocket = null;

    var id;
    var keyRunning = {};

    loginSocket.on('join room', function(data) {
        if(data.err) {
            return;
        }
        var host = window.location.hostname;
        var port = window.location.port || 80;
        $('#roomName').text(data.roomName);
        $('#alert').slideDown();
        $('#inputUsername').attr('disabled', true);
        $('#inputRoomname').attr('disabled', true)
        roomSocket = io(host + ':' + port + '/' + data.roomName);
        roomSocket.on('start', function(data) {
            $('#loginStage').fadeOut(800, function() {
                $('#_canvas').fadeIn(800, function() {
                    gameStarted = true;
                });
            });
        })
        roomSocket.on('init', function(data) {
            if (!map) {
                map = Map.createNew(canvas, context, data.maze);
                painterTimer = setInterval(timerEvent, 25);
                player = creatNewTank(map.player1X, map.player1Y, document.getElementById('player1'), context);
                playerArray.push(player);
                player = creatNewTank(map.player2X, map.player2Y, document.getElementById('player2'), context);
                playerArray.push(player);
                id = data.player - 1;
                player = getYourPlayer(id);
            }
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
    });

    $('#loginBtn').click(function(event) {
        var userName = $('#inputUsername').val();
        var roomName = $('#inputRoomname').val();
        loginSocket.emit('room', {
            'userName': userName,
            'roomName': roomName
        })
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