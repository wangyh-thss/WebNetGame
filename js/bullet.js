var Bullet = {
    'createNew': function(posX, posY, speedAngle) {
        var bullet = {
            'posX': posX,
            'posY': posY,
            'radius': 3,
            'speedX': Math.round(0 - (5 * Math.sin(speedAngle))),
            'speedY': Math.round(5 * Math.cos(speedAngle)),
            'timer': null
        };

        bullet.run = function() {
            var bulletObj = this;
            function runStep() {
                bulletObj.posX = bulletObj.posX + bulletObj.speedX;
                bulletObj.posY = bulletObj.posY + bulletObj.speedY;
                if (testCollisisonBulletMap(bulletObj, map) === 1) {
                    bulletObj.speedX = 0 - bulletObj.speedX;
                    bulletObj.speedY = bulletObj.speedY;
                } else if (testCollisisonBulletMap(bulletObj, map) === 2) {
                    bulletObj.speedX = bulletObj.speedX;
                    bulletObj.speedY = 0 - bulletObj.speedY;
                }
                for (var i = 0; i < playerArray.length; i++) {
                    if (testCollisionBulletTank(bulletObj, playerArray[i])) {
                        console.log('Game Over');
                        clearInterval(painterTimer);
                        for (var i = 0; i < bulletArray.length; i++) {
                            bulletArray[i].destory();
                        }
                        gameStarted = false;
                        loser = i;
                        drawBoom(playerArray[loser].player.posX, playerArray[loser].player.posY);
                        setTimeout(function() {
                            clearTimeout(boomTimer);
                            $('#gameStage').fadeOut(1000, function() {
                                gameover();
                                if (id === loser) {
                                    $('#lose').show();
                                    $('#win').hide();
                                } else {
                                    $('#lose').hide();
                                    $('#win').show();
                                }
                                $('#alertRestart').hide();
                                $('#restartStage').fadeIn();
                                stage = 3;
                            });

                        }, 2000)
                    }
                }
            }
            this.timer = setInterval(runStep, 25);
        };

        bullet.destory = function() {
            clearInterval(this.timer);
        }

        bullet.posX = Math.round(bullet.posX - 20 * Math.sin(speedAngle));
        bullet.posY = Math.round(bullet.posY + 26 * Math.cos(speedAngle));

        bullet.run();
        return bullet;
    }
}

var BulletsPainter = {
    'createNew': function(bullets, context) {
        var painter = {
            'bullets': bullets,
            'context': context
        };

        painter.draw = function() {
            this.context.fillStyle = 'rgb(0, 0, 0)';
            for (var i = 0; i < this.bullets.length; i++) {
                this.context.beginPath();
                this.context.arc(this.bullets[i].posX, this.bullets[i].posY, this.bullets[i].radius, 0, 2 * Math.PI, true);
                this.context.fill();
            }
            this.context.restore();
        }

        return painter;
    }
}