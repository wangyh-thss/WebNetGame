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

    function getYourPlayer() { //to be modified
        return playerArray[0].player;
    }

    var canvas = document.getElementById('_canvas');
    context = canvas.getContext('2d');

    map = Map.createNew(canvas, context);

    playerArray = new Array();
    var player1 = creatNewTank(map.player1X, map.player1Y, document.getElementById('player1'), context);
    playerArray.push(player1);

    var bulletArray = new Array();
    var bulletsPainter = BulletsPainter.createNew(bulletArray, context);

    var painterTimer = setInterval(timerEvent, 25);

    var player = getYourPlayer();

    var socket = io();
    socket.on('fire', function() {
        player.fire(bulletArray);
    });

    document.onkeydown = function(event) {
        var e = event || window.event;
        var keyCode = e.keyCode || e.which;
        switch (keyCode) {
            case 32:
                socket.emit('fire', player);
                player.fire(bulletArray);
                break;
            case 38:
                player.run(true);
                break;
            case 37:
                player.rotate(false);
                break;
            case 39:
                player.rotate(true);
                break;
            case 40:
                player.run(false);
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
                break;
            case 37:
            case 39:
                player.stopRotate();
                break;
        }
    };
};


