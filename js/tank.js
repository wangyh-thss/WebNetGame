var Tank = {
    'createNew': function() {
        var tank = {
            'angle': 0,
            'bulletRemain': 5,
            'posX': 200,
            'posY': 200,
            'rotateSpeed': (18 / 360) * Math.PI,
            'rotateTimer': null,
            'runSpeed': 5,
            'runTimer': null
        };

        tank.run = function(forward) {
            //图正面朝向下方
            var tankObj = this;
            function runStep() {
                if (forward) {
                    var tempX = Math.round(tankObj.posX - tankObj.runSpeed * Math.sin(tankObj.angle));
                    var tempY = Math.round(tankObj.posY + tankObj.runSpeed * Math.cos(tankObj.angle));
                } else {
                    var tempX = Math.round(tankObj.posX + tankObj.runSpeed * Math.sin(tankObj.angle));
                    var tempY = Math.round(tankObj.posY - tankObj.runSpeed * Math.cos(tankObj.angle));
                }
                if (true) { //位置合法性检测
                    tankObj.posX = tempX;
                    tankObj.posY = tempY;
                }
            }

            if (!this.runTimer) {
                this.runTimer = setInterval(runStep, 50);
            }
        };

        tank.stopRun = function() {
            if (this.runTimer) {
                clearInterval(this.runTimer);
            }
            this.runTimer = null;
        }

        tank.rotate = function(clockwise) {
            var tankObj = this;
            function rotateStep() {
                if (clockwise) {
                    var tempAngle = tankObj.angle + tankObj.rotateSpeed;
                } else {
                    var tempAngle = tankObj.angle - tankObj.rotateSpeed;
                }
                if (true) { //合法性判断
                    if (tempAngle > 2 * Math.PI) {
                        tankObj.angle = tempAngle - 2 * Math.PI;
                    } else if (tempAngle < 0) {
                        tankObj.angle = tempAngle + 2 * Math.PI;
                    } else {
                        tankObj.angle = tempAngle;
                    }
                }
            }

            if (!this.rotateTimer) {
                this.rotateTimer = setInterval(rotateStep, 50);
            }
        };

        tank.stopRotate = function() {
            if (this.rotateTimer) {
                clearInterval(this.rotateTimer);
            }
            this.rotateTimer = null;
        }

        tank.fire = function(bulletArray) {
            if (this.bulletRemain > 0) {
                //new Bullet
                this.bulletRemain -= 1;
                bulletArray.push(Bullet.createNew(this.posX, this.posY, this.angle))
                var tankObj = this;
                setTimeout(function() {
                    tankObj.reload(bulletArray);
                }, 10000);
            }
        };

        tank.reload = function(bulletArray) {
            console.log('reload');
            bulletArray.pop();
            this.bulletRemain++;
        };

        tank.init = function() {
            //set random position
        };

        return tank;
    }
}

var TankPainter = {
    'createNew': function(tank, img, context) {
        var painter = {
            'context': context,
            'height': img.height || 0,
            'img': img,
            'tankObj': tank,
            'width': img.width || 0
        };

        painter.setTankObj = function(tank) {
            this.tankObj = tank;
        };

        painter.setImg = function(img) {
            this.img = img;
        };

        painter.setContext = function(context) {
            this.context = context;
        };

        painter.draw = function() {
            this.context.save();
            var transX = Math.round(this.tankObj.posX);
            var transY = Math.round(this.tankObj.posY);
            this.context.translate(transX, transY);
            this.context.rotate(this.tankObj.angle);
            this.context.drawImage(this.img, Math.round(-0.5 * this.width), Math.round(-0.5 * this.height));
            this.context.restore();
        };

        return painter;
    }
}










