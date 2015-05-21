window.onload = function() {

    function creatNewTank(imgDom, context) {
        var player = Tank.createNew();
        var painter = TankPainter.createNew(player, imgDom, context);
        var returnObj = {
            'player': player,
            'painter': painter
        };
        return returnObj;
    }

    function refreshCanvas() {
        context.clearRect(0, 0, 500, 500);
        for (var i = 0; i < playerArray.length; i++) {
            playerArray[i].painter.draw();
        }
        bulletsPainter.draw();
    }

    function getYourPlayer() { //to be modified
        return playerArray[0].player;
    }

    var context = document.getElementById('_canvas').getContext('2d');
    var playerArray = new Array();
    var player1 = creatNewTank(document.getElementById('player1'), context);
    playerArray.push(player1);

    var bulletArray = new Array();
    var bulletsPainter = BulletsPainter.createNew(bulletArray, context);

    var painterTimer = setInterval(refreshCanvas, 40);

    var player = getYourPlayer();

    document.onkeydown = function(event) {
        var e = event || window.event;
        var keyCode = e.keyCode || e.which;
        switch (keyCode) {
            case 32:
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
    }

    document.onkeyup = function() {
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
    }
}


