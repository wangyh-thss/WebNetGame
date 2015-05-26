/**
* Returns:
*   0: 无碰撞
*   1: 横向碰撞
*   2: 纵向碰撞
*/
function testCollisisonBulletMap(bullet, map) {
    var x = bullet.posX, y = bullet.posY;
    var node = map.getNode(x, y);
    if ((node.value & Maze.Direction.W) !== Maze.Direction.W) {
        if (x - node.x * map.cellW <= 7 && x - node.x * map.cellW >= 1 && bullet.speedX < 0) {
            return 1;
        }
    }
    if ((node.value & Maze.Direction.E) !== Maze.Direction.E) {
        if ((node.x + 1) * map.cellW - x <= 5 && (node.x + 1) * map.cellW - x >= 0 && bullet.speedX > 0) {
            return 1;
        }
    }
    if ((node.value & Maze.Direction.N) !== Maze.Direction.N) {
        if (y - node.y * map.cellH <= 7 && y - node.y * map.cellH >= 1 && bullet.speedY < 0) {
            return 2;
        }
    }
    if ((node.value & Maze.Direction.S) !== Maze.Direction.S) {
        if ((node.y + 1) * map.cellH - y <= 5 && (node.y + 1) * map.cellH - y >= 0 && bullet.speedY > 0) {
            return 2;
        }
    }
    return 0;
}


/**
* Returns
*   true:  有碰撞
*   false: 无碰撞
*/
function testCollisionBulletTank(bullet, tank) {
    var bulletX = bullet.posX, bulletY = bullet.posY;
    var tankAngle = tank.player.angle, tankX = tank.player.posX, tankY = tank.player.posY;
    var tankW = tank.player.height, tankH = tank.player.width;

    var bulletNewX = bulletX - tankX, bulletNewY = bulletY - tankY;
    var bulletOldAngle = Math.atan2(bulletNewY, bulletNewX);
    var bulletNewAngle = bulletOldAngle - tankAngle;
    var bulletDistance = Math.sqrt(bulletNewX * bulletNewX + bulletNewY * bulletNewY);
    var bulletNewX = Math.round(bulletDistance * Math.cos(bulletNewAngle));
    var bulletNewY = Math.round(bulletDistance * Math.sin(bulletNewAngle));

    if (bulletNewX >= 0 - tankW * 0.5 && bulletNewX <= tankW * 0.5 && bulletNewY >= 0 - tankH * 0.5 && bulletNewY <= tankH * 0.5) {
        return true;
    } else {
        return false;
    }
}

function testCollisionTankMap1(tank, map) {
    function rotatePoint(point, angle, centerPoint) {
        var x = point.x - centerPoint.x;
        var y = point.y - centerPoint.y;
        x = x * Math.cos(angle) - y * Math.sin(angle);
        y = x * Math.sin(angle) + y * Math.cos(angle);
        x = Math.round(x + centerPoint.x);
        y = Math.round(y + centerPoint.y)
        return {'x': x, 'y': y};
    }
    
    var center = {
        'x': tank.tempX,
        'y': tank.tempY
    }
    var point1 = rotatePoint({
        'x': tank.tempX - tank.width * 0.5,
        'y': tank.tempY - tank.height * 0.5
    }, tank.tempAngle, center);
    var point2 = rotatePoint({
        'x': tank.tempX + tank.width * 0.5,
        'y': tank.tempY - tank.height * 0.5
    }, tank.tempAngle, center);
    var point3 = rotatePoint({
        'x': tank.tempX - tank.width * 0.5,
        'y': tank.tempY + tank.height * 0.5
    }, tank.tempAngle, center);
    var point4 = rotatePoint({
        'x': tank.tempX + tank.width * 0.5,
        'y': tank.tempY + tank.height * 0.5
    }, tank.tempAngle, center);

    var left   = Math.min(point1.x, point2.x, point3.x, point4.x);
    var right  = Math.max(point1.x, point2.x, point3.x, point4.x);
    var top    = Math.min(point1.y, point2.y, point3.y, point4.y);
    var bottom = Math.max(point1.y, point2.y, point3.y, point4.y);

    var node = map.getNode(center.x, center.y);
    if ((node.value & Maze.Direction.W) !== Maze.Direction.W) {
        if (left - node.x * map.cellW <= 0 && left - node.x * map.cellW >= -5) {
            return true;
        }
    }
    if ((node.value & Maze.Direction.N) !== Maze.Direction.N) {
        if (top - node.y * map.cellH <= -1 && top - node.y * map.cellH >= -6) {
            return true;
        }
    }
    if ((node.value & Maze.Direction.E) !== Maze.Direction.E) {
        if ((node.x + 1) * map.cellW - right <= 0 && (node.x + 1) * map.cellW - right >= -5) {
            return true;
        }
    }
    if ((node.value & Maze.Direction.S) !== Maze.Direction.S) {
        if ((node.y + 1) * map.cellH - bottom <= -1 && (node.y + 1) * map.cellH - bottom >= -6) {
            return true;
        }
    }

    /*
    var node = map.getNode(left+3, top+3);
    if ((node.value & Maze.Direction.W) !== Maze.Direction.W) {
        if (left - node.x * map.cellW <= 0 && left - node.x * map.cellW >= -3) {
            return true;
        }
    }
    if ((node.value & Maze.Direction.N) !== Maze.Direction.N) {
        if (top - node.y * map.cellH <= -1 && top - node.y * map.cellH >= -3) {
            return true;
        }
    }

    node = map.getNode(left+3, bottom-3);
    if ((node.value & Maze.Direction.W) !== Maze.Direction.W) {
        if (left - node.x * map.cellW <= 0 && left - node.x * map.cellW >= -3) {
            return true;
        }
    }
    if ((node.value & Maze.Direction.S) !== Maze.Direction.S) {
        if ((node.y + 1) * map.cellH - bottom <= -1 && (node.y + 1) * map.cellH - bottom >= -3) {
            return true;
        }
    }

    node = map.getNode(right-3, top+3);
    if ((node.value & Maze.Direction.E) !== Maze.Direction.E) {
        if ((node.x + 1) * map.cellW - right <= 0 && (node.x + 1) * map.cellW - right >= -3) {
            return true;
        }
    }
    if ((node.value & Maze.Direction.N) !== Maze.Direction.N) {
        if (top - node.y * map.cellH <= -1 && top - node.y * map.cellH >= -3) {
            return true;
        }
    }

    node = map.getNode(right-3, bottom-3);
    if ((node.value & Maze.Direction.E) !== Maze.Direction.E) {
        if ((node.x + 1) * map.cellW - right <= 0 && (node.x + 1) * map.cellW - right >= -3) {
            return true;
        }
    }
    if ((node.value & Maze.Direction.S) !== Maze.Direction.S) {
        if ((node.y + 1) * map.cellH - bottom <= -1 && (node.y + 1) * map.cellH - bottom >= -3) {
            return true;
        }
    }
    */
    return false;
}

function testCollisionTankMap(tank, context) {
    function rotatePoint(point, angle, centerPoint) {
        var x = point.x - centerPoint.x;
        var y = point.y - centerPoint.y;
        x = x * Math.cos(angle) - y * Math.sin(angle);
        y = x * Math.sin(angle) + y * Math.cos(angle);
        x = Math.round(x + centerPoint.x);
        y = Math.round(y + centerPoint.y)
        return {'x': x, 'y': y};
    }

    function wallInRect(array) {
        for (var i = 0; i < array.length; i++) {
            if (array[i] == 51) {
                if (array[i+1] == 68 && array[i+2] == 102){
                    return true;
                }
            }
        }
        return false;
    }

    var center = {
        'x': tank.tempX,
        'y': tank.tempY
    }
    var point1 = rotatePoint({
        'x': tank.tempX - tank.width * 0.5,
        'y': tank.tempY - tank.height * 0.5
    }, tank.tempAngle, center);
    var point2 = rotatePoint({
        'x': tank.tempX + tank.width * 0.5,
        'y': tank.tempY - tank.height * 0.5
    }, tank.tempAngle, center);
    var point3 = rotatePoint({
        'x': tank.tempX + tank.width * 0.5,
        'y': tank.tempY + tank.height * 0.5
    }, tank.tempAngle, center);
    var point4 = rotatePoint({
        'x': tank.tempX - tank.width * 0.5,
        'y': tank.tempY + tank.height * 0.5
    }, tank.tempAngle, center);


    context.save();
    context.rotate(tank.tempAngle);
    var imgData = context.getImageData(left, top, tank.width, tank.height);
    if (wallInRect(imgData.data)) {
        var flag = true;
    } else {
        var flag = false;
    }
    context.restore();
    return flag;
}








