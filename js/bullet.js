var Bullet = {
    'createNew': function(posX, posY, speedAngle) {
        var bullet = {
            'posX': posX,
            'posY': posY,
            'radius': 3,
            'speedX': Math.round(0 - (10 * Math.sin(speedAngle))),
            'speedY': Math.round(10 * Math.cos(speedAngle))
        };

        bullet.run = function() {
            var bulletObj = this;
            function runStep() {
                var tempX = bulletObj.posX + bulletObj.speedX;
                var tempY = bulletObj.posY + bulletObj.speedY;
                if (true) {
                    bulletObj.posX = tempX;
                    bulletObj.posY = tempY;
                }
            }
            setInterval(runStep, 40);
        };

        bullet.posX = Math.round(bullet.posX - 80 * Math.sin(speedAngle));
        bullet.posY = Math.round(bullet.posY + 80 * Math.cos(speedAngle));

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