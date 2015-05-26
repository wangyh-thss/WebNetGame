/**
 * Returns:
 *   0: 无碰撞
 *   1: 横向碰撞
 *   2: 纵向碰撞
 */
function testCollisisonBulletMap(bullet, map) {
    var x = bullet.posX,
        y = bullet.posY;
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
    var bulletX = bullet.posX,
        bulletY = bullet.posY;
    var tankAngle = tank.player.angle,
        tankX = tank.player.posX,
        tankY = tank.player.posY;
    var tankW = tank.player.height,
        tankH = tank.player.width;

    var bulletNewX = bulletX - tankX,
        bulletNewY = bulletY - tankY;
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
        return {
            'x': x,
            'y': y
        };
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

    var left = Math.min(point1.x, point2.x, point3.x, point4.x);
    var right = Math.max(point1.x, point2.x, point3.x, point4.x);
    var top = Math.min(point1.y, point2.y, point3.y, point4.y);
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
        return {
            'x': x,
            'y': y
        };
    }

    var line = function(x1, y1, x2, y2) { /*起点坐标x1,y1,终点坐标x2,y2*/
        var dx, dy, h, x, y, t, ret = [];
        if (x1 > x2) {
            x1 = [x2, x2 = x1][0], y1 = [y2, y2 = y1][0];
        }
        dx = x2 - x1, dy = y2 - y1, x = x1, y = y1;
        if (!dx) {
            t = (y1 > y2) ? -1 : 1;
            while (y != y2) {
                ret.push([x, y]);
                y += t;
            }
            return ret.slice(0);
        }
        if (!dy) {
            while (x != x2) {
                ret.push([x, y]);
                x++;
            }
            return ret.slice(0);
        }
        if (dy > 0) {
            if (dy <= dx) {
                h = 2 * dy - dx, ret.push([x, y]);
                while (x != x2) {
                    if (h < 0) {
                        h += 2 * dy;
                    } else {
                        y++, h += 2 * (dy - dx);
                    }
                    x++, ret.push([x, y]);
                }
            } else {
                h = 2 * dx - dy, ret.push([x, y]);
                while (y != y2) {
                    if (h < 0) {
                        h += 2 * dx;
                    } else {
                        ++x, h += 2 * (dx - dy);
                    }
                    y++, ret.push([x, y]);
                }
            }
        } else {
            t = -dy;
            if (t <= dx) {
                h = 2 * dy + dx, ret.push([x, y]);
                while (x != x2) {
                    if (h < 0) {
                        h += 2 * (dy + dx), y--;
                    } else {
                        h += 2 * dy;
                    }
                    x++, ret.push([x, y]);
                }
            } else {
                dy = -dy, dx = -dx, y = y2, x = x2, ret.push([x, y]), h = 2 * dx + dy;
                while (y != y1) {
                    if (h < 0) {
                        h += 2 * (dx + dy), x--;
                    } else {
                        h += 2 * dx;
                    }
                    y++, ret.push([x, y]);
                }
            }
        }
        return ret.slice(0);
    };

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

    var l = line(point1.x, point1.y, point2.x, point2.y);
    for (var i = 0; i < l.length; i++) {
        var imgData = context.getImageData(l[i][0], l[i][1], 1, 1).data;
        if (imgData[0] == 51 && imgData[1] == 68 && imgData[2] == 102) {
            return true;
        }
    }

    l = line(point2.x, point2.y, point3.x, point3.y);
    for (var i = 0; i < l.length; i++) {
        var imgData = context.getImageData(l[i][0], l[i][1], 1, 1).data;
        if (imgData[0] == 51 && imgData[1] == 68 && imgData[2] == 102) {
            return true;
        }
    }

    l = line(point3.x, point3.y, point4.x, point4.y);
    for (var i = 0; i < l.length; i++) {
        var imgData = context.getImageData(l[i][0], l[i][1], 1, 1).data;
        if (imgData[0] == 51 && imgData[1] == 68 && imgData[2] == 102) {
            return true;
        }
    }

    l = line(point4.x, point4.y, point1.x, point1.y);
    for (var i = 0; i < l.length; i++) {
        var imgData = context.getImageData(l[i][0], l[i][1], 1, 1).data;
        if (imgData[0] == 51 && imgData[1] == 68 && imgData[2] == 102) {
            return true;
        }
    }
    return false;
}