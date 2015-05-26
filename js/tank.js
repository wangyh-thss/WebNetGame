var Tank = {
    'createNew': function(posX, posY) {
        var tank = {
            'angle': 0,
            'bulletRemain': 5,
            'posX': posX,
            'posY': posY,
            'rotateSpeed': (18 / 360) * Math.PI,
            'rotateTimer': null,
            'runSpeed': 5,
            'runTimer': null,
            'height': 0,
            'width': 0
        };

        console.log(posX, posY);

        tank.run = function(forward) {
            //图正面朝向下方
            var tankObj = this;
            if(!tankObj.tempAngle) {
                tankObj.tempAngle = tankObj.angle;
            }
            function runStep() {
                if (forward) {
                    tankObj.tempX = Math.round(tankObj.posX - tankObj.runSpeed * Math.sin(tankObj.angle));
                    tankObj.tempY = Math.round(tankObj.posY + tankObj.runSpeed * Math.cos(tankObj.angle));
                } else {
                    tankObj.tempX = Math.round(tankObj.posX + tankObj.runSpeed * Math.sin(tankObj.angle) * 0.5);
                    tankObj.tempY = Math.round(tankObj.posY - tankObj.runSpeed * Math.cos(tankObj.angle) * 0.5);
                }
                if (!testCollisionTankMap(tankObj, context)) { //位置合法性检测
                    tankObj.posX = tankObj.tempX;
                    tankObj.posY = tankObj.tempY;
                } else {
                    tankObj.tempX = tankObj.posX;
                    tankObj.tempY = tankObj.posY;
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
            if(!tankObj.tempX || !tankObj.tempY){
                tankObj.tempX = tankObj.posX;
                tankObj.tempY = tankObj.posY;
            }
            function rotateStep() {
                if (clockwise) {
                    tankObj.tempAngle = tankObj.angle + tankObj.rotateSpeed;
                } else {
                    tankObj.tempAngle = tankObj.angle - tankObj.rotateSpeed;
                }
                if (!testCollisionTankMap(tankObj, context)) { //合法性判断
                    if (tankObj.tempAngle > 2 * Math.PI) {
                        tankObj.angle = tankObj.tempAngle - 2 * Math.PI;
                    } else if (tankObj.tempAngle < 0) {
                        tankObj.angle = tankObj.tempAngle + 2 * Math.PI;
                    } else {
                        tankObj.angle = tankObj.tempAngle;
                    }
                } else {
                    tankObj.tempAngle = tankObj.angle;
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
            bulletArray[0].destory();
            delete bulletArray[0];
            bulletArray.shift();
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
            'img': null,
            'tankObj': tank,
        };

        painter.setTankObj = function(tank) {
            this.tankObj = tank;
        };

        painter.setImg = function(img) {
            this.img = img;
            this.tankObj.height = img.height || 0;
            this.tankObj.width = img.width || 0;
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
            this.context.drawImage(this.img, Math.round(-0.5 * this.tankObj.width), Math.round(-0.5 * this.tankObj.height));
            this.context.restore();
        };
        painter.setImg(img);
        return painter;
    }
}


function creatNewTank(posX, posY, imgDom, context) {
    var player = Tank.createNew(posX, posY);
    var painter = TankPainter.createNew(player, imgDom, context);
    var returnObj = {
        'player': player,
        'painter': painter
    };
    return returnObj;
}







