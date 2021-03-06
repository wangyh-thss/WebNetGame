var Bullet = {
    'createNew': function(posX, posY, speedAngle) {
        var bullet = {
            'posX': posX,
            'posY': posY,
            'radius': 3,
            'speedX': Math.round(0 - (8 * Math.sin(speedAngle))),
            'speedY': Math.round(8 * Math.cos(speedAngle)),
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
                        for (var j = 0; j < bulletArray.length; j++) {
                            bulletArray[j].destory();
                        }
                        window.gameStarted = false;
                        window.loser = i;
                        window.score[1 - window.loser].score++;
                        for (var playerCount = 0; playerCount < window.score.length; playerCount++) {
                            $('#player' + (playerCount+1) + 'Name').text(score[playerCount].name);
                            $('#player' + (playerCount+1) + 'Score').text(score[playerCount].score);
                            $('#gameplayer' + (playerCount+1) + 'Score').text(score[playerCount].score);
                        }
                        drawBoom(playerArray[window.loser].player.posX, playerArray[window.loser].player.posY);
                        setTimeout(function() {
                            clearTimeout(boomTimer);
                            $('#gameStage').fadeOut(1000, function() {
                                gameover();
                                if (window.id === window.loser) {
                                    $('#lose').show();
                                    $('#win').hide();
                                } else {
                                    $('#lose').hide();
                                    $('#win').show();
                                }
                                $('#restart').attr('disabled', false);
                                $('#alertRestart').hide();
                                $('#restartStage').fadeIn();
                                window.stage = 3;
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