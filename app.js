/**
 * Created by tarma on 15年5月27日.
 */
var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var Maze = require('./Maze.js');

server.listen(3000);

app.get('/', function (req, res) {
    res.sendfile(__dirname + '/index.html');
});

app.use(express.static(__dirname));

var player_ready = {};
var maze = {};
var score = {};
var free_user = [];
var free_name;
var player = {};

io.on('connection', function (socket) {
    socket.on('room', function(data) {
        if (data.roomName === '') {
            if (free_user.length > 0) {
                var roomName;
                do {
                    roomName = RandomString(10);
                } while (roomName in player);
                onNewNameSpace(roomName);
                score[roomName].push({
                    'name': free_name,
                    'score': 0
                });
                score[roomName].push({
                    'name': data.userName || RandomString(5),
                    'score': 0
                });
                socket.emit('join room', {roomName: roomName});
                free_user[0].emit('join room', {roomName: roomName});
                free_user.splice(0, 1);
            } else {
                free_user.push(socket);
                free_name = data.userName || RandomString(5);
                socket.emit('waitRandomRoom');
            }
        } else {
            if (!player[data.roomName] || player[data.roomName].length == 0) {
                onNewNameSpace(data.roomName);
            }
            score[data.roomName].push({
                'name': data.userName || RandomString(5),
                'score': 0
            });
            if (player[data.roomName].length < 2) {
                socket.emit('join room', {roomName: data.roomName});
            } else {
                socket.emit('join room', {err: 'room full'});
            }
        }
    });

    socket.on('disconnect', function() {
        for (var i = 0; i < free_user.length; i++) {
            if (free_user[i] == socket) {
                free_user.splice(i, 1);
            }
        }
    })
});

function onNewNameSpace(namespace) {
    player_ready[namespace] = 0;
    player[namespace] = [];
    score[namespace] = [];
    maze[namespace] = createNewMaze();
    io.of('/' + namespace).on('connection', function(socket) {
        for (var i = 0; i < player[namespace].length; i++) {
            if (player[namespace][i] == socket) {
                return;
            }
        }
        if (player[namespace].length < 2) {
            player[namespace].push(socket);
            player_ready[namespace]++;
            socket.emit('init', {
                maze: maze[namespace],
                player: player[namespace].length
            });
            console.log('connect:' + player[namespace].length);
        } else {
            return;
        }

        if (player[namespace].length == 2) {
            io.of('/' + namespace).emit('start', {
                'maze': maze[namespace],
                'score': score[namespace]
            });
        }

        socket.on('fire', function(id) {
            socket.broadcast.emit('fire', id);
        });

        socket.on('run', function(data) {
            socket.broadcast.emit('run', data);
        });

        socket.on('rotate', function(data) {
            socket.broadcast.emit('rotate', data);
        });

        socket.on('stopRun', function(data) {
            socket.broadcast.emit('stopRun', data);
        });

        socket.on('stopRotate', function(data) {
            socket.broadcast.emit('stopRotate', data);
        });

        socket.on('check', function(data){
            socket.broadcast.emit('check', data);
        });

        socket.on('disconnect', function() {
            for (var i = 0; i < player[namespace].length; i++) {
                if (player[namespace][i] == socket) {
                    player[namespace].splice(i, 1);
                    break;
                }
            }
            console.log('disconnect:' + player[namespace].length);
            if (player[namespace].length == 1) {
                socket.broadcast.emit('stop');
                player[namespace][0].disconnect();
            }
        });

        socket.on('gameover', function(id) {
            if (maze[namespace]) {
                maze[namespace] = undefined;
            }
            if (player_ready[namespace] > 0) {
                player_ready[namespace]--;
            }
            if(player_ready[namespace] === 0){
                maze[namespace] = createNewMaze();
                score[namespace][1 - id].score++;
                io.of('/' + namespace).emit('init', {
                    maze: maze[namespace]
                })
            }
        });

        socket.on('restart', function() {
            player_ready[namespace]++;
            if (player_ready[namespace] === 2){
                io.of('/' + namespace).emit('start', {
                    maze: maze[namespace],
                    score: score[namespace]
                });
            }
        });
    });
}

function createNewMaze() {
    var maze = new Maze({
        width: 5,
        height: 5,
        perfect: true,
        braid: false,
        checkOver: false,

        onInit: function() {
            this.checkOver = false;
            this.checkCount = {};
            // this.traceInfo = {};
            this.foundEndNode = false;
        },
        getNeighbor: function() {
            // if (this.currentDirCount < 6 && this.neighbors[this.currentDir]) {
            //     return this.neighbors[this.currentDir];
            // }
            var list = this.neighbors.list;
            var n = list[list.length * Math.random() >> 0];
            return n;
        },

        isValid: function(nearNode, node, dir) {
            if (!nearNode || nearNode.value === null) {
                return false;
            }
            if (nearNode.value === 0) {
                return true;
            }
            if (this.perfect || this.braid) {
                return false;
            }
            var c = nearNode.x,
                r = nearNode.y;
            // 用于生成一种非Perfect迷宫
            this.checkCount[c + "-" + r] = this.checkCount[c + "-" + r] || 0;
            var count = ++this.checkCount[c + "-" + r];
            return Math.random() < 0.3 && count < 3;
        },
        beforeBacktrace: function() {
            // if (!this.braid || Math.random() < 0.5) {
            if (!this.braid) {
                return;
            }
            var n = [];
            var node = this.currentNode;
            var c = node.x;
            var r = node.y;
            var nearNode, dir, op;

            var first = null;
            var currentDir = this.currentDir;
            var updateNear = function() {
                op = Maze.Direction.opposite[dir];
                if (nearNode && nearNode.value !== null && (nearNode.value & op) !== op) {
                    n.push([nearNode, dir]);
                    if (dir == currentDir) {
                        first = [nearNode, dir];
                    }
                }
            };

            dir = Maze.Direction.N;
            nearNode = r > 0 ? this.grid[r - 1][c] : null;
            updateNear();

            if (!first) {
                dir = Maze.Direction.E;
                nearNode = this.grid[r][c + 1];
                updateNear();
            }

            if (!first) {
                dir = Maze.Direction.S;
                nearNode = r < this.height - 1 ? this.grid[r + 1][c] : null;
                updateNear();
            }

            if (!first) {
                dir = Maze.Direction.W;
                nearNode = this.grid[r][c - 1];
                updateNear();
            }

            n = first || n[n.length * Math.random() >> 0];
            this.moveTo(n[0], n[1]);
        },
        updateCurrent: function() {
            if (this.braid) {
                return;
            }
            // 每步有 10% 的概率 进行回溯
            if (Math.random() <= 0.10) {
                this.backtrace();
            }
        },

        getTraceIndex: function() {
            var len = this.trace.length;

            if (this.braid) {
                return len - 1;
            }

            // 按一定的概率随机选择回溯策略
            var r = Math.random();
            var idx = 0;
            if (r < 0.5) {
                idx = len - 1;
            } else if (r < 0.7) {
                idx = len >> 1;
            } else if (r < 0.8) {
                idx = len * Math.random() >> 0;
            }
            return idx;
        },

        afterGenrate: function() {
            if (this.braid && this.getRoadCount(this.startNode)<2) {
                this.currentDirCount = 1000;
                this.setCurrent(this.startNode);
                this.nextStep();
            }
        },

        isOver: function() {
            if (!this.checkOver) {
                return false;
            }
            if (this.currentNode == this.endNode) {
                this.foundEndNode = true;
            }
            // 当探索到迷宫终点, 且探索了至少一半的区域时,终止迷宫的生成
            if (this.foundEndNode && this.stepCount >= this.size / 2) {
                return true;
            }
            return false;
        }
    });

    maze.init();
    maze.startNode = maze.getRandomNode();
    do {
        maze.endNode = maze.getRandomNode();
    } while (maze.startNode == maze.endNode);
    maze.generate();

    return maze;
}

function RandomString(length) {
    // http://www.outofmemory.cn
    var str = '';
    for ( ; str.length < length; str += Math.random().toString(36).substr(2) );
    return str.substr(0, length);
}