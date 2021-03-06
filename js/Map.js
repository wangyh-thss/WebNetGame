var Maze = function(options) {
    for (var p in options) {
        this[p] = options[p];
    }
};


Maze.prototype = {
    constructor: Maze,

    width: 0,
    height: 0,
    grid: null,

    currentDir: 0,
    currentDirCount: 0,

    currentNode: null,
    startNode: null,
    endNode: null,

    // 是否每走一步, 都尝试回溯.
    alwaysBacktrace: false,

    init: function() {
        this.trace = [];

        this.size = this.width * this.height;
        this.initGrid();
        this.onInit();
    },

    initGrid: function() {
        var grid = this.grid = [];
        for (var r = 0; r < this.height; r++) {
            var row = [];
            grid.push(row);
            for (var c = 0; c < this.width; c++) {
                var node = {
                    x: c,
                    y: r,
                    value: 0,
                };
                row.push(node);
            }
        }

    },

    onInit: function() {},

    random: function(min, max) {
        return ((max - min + 1) * Math.random() + min) >> 0;
    },
    getNode: function(c, r) {
        return this.grid[r][c];
    },
    getRandomNode: function() {
        var r = this.random(0, this.height - 1);
        var c = this.random(0, this.width - 1);
        return this.grid[r][c];
    },
    setMark: function(node, value) {
        return node.value |= value;
    },
    removeMark: function(node, value) {
        return node.value &= ~value;
    },
    isMarked: function(node, value) {
        return (node.value & value) === value;
    },

    setStart: function(c, r) {
        var node = this.grid[r][c];
        this.startNode = node;
    },
    setEnd: function(c, r) {
        var node = this.grid[r][c];
        this.endNode = node;
    },

    getRoadCount: function(node){
        var count=0;
        this.isMarked(node, Maze.Direction.N) && count++ ;
        this.isMarked(node, Maze.Direction.E) && count++ ;
        this.isMarked(node, Maze.Direction.S) && count++ ;
        this.isMarked(node, Maze.Direction.W) && count++ ;
        return count;
    },

    setCurrent: function(node) {
        this.currentNode = node;

        this.neighbors = this.getValidNeighbors(node);

        if (this.neighbors && node.value === 0) {
            this.trace.push(node);
            this.onTrace(node);
        }
    },
    onTrace: function(node) {

    },
    moveTo: function(node, dir) {
        this.beforeMove(node);
        if (this.currentDir == dir) {
            this.currentDirCount++;
        } else {
            this.currentDir = dir;
            this.currentDirCount = 1;
        }
        this.currentNode.value |= dir;
        this.setCurrent(node);
        node.value |= Maze.Direction.opposite[dir];
        this.afterMove(node);
    },
    beforeMove: function(node) {

    },
    afterMove: function(node) {

    },

    generate: function() {
        this.beforeGenrate();
        this.setCurrent(this.startNode);
        this.stepCount = 0;
        while (this.nextStep()) {
            this.stepCount++;
            if (this.isOver() === true) {
                break;
            }
            // console.log(step);
        }
        console.log("Step Count : " + this.stepCount);
        this.afterGenrate();
    },
    beforeGenrate: function() {},
    afterGenrate: function() {},

    // 生成迷宫时的提前终止条件
    isOver: function() {},

    nextStep: function() {
        if (!this.neighbors) {
            this.beforeBacktrace();
            return this.backtrace();
        }
        var n = this.getNeighbor();
        this.moveTo(n[0], n[1]);
        this.updateCurrent();
        return true;
    },
    beforeBacktrace: function() {},
    backtrace: function() {
        var len = this.trace.length;
        while (len > 0) {
            var idx = this.getTraceIndex();
            var node = this.trace[idx];
            var nm = this.getValidNeighbors(node);
            if (nm) {
                this.currentNode = node;
                this.neighbors = nm;
                return true;
            } else {
                this.trace.splice(idx, 1);
                len--;
            }
        }
        return false;
    },

    setRoom: function(x, y, width, height) {
        var grid = this.grid;
        var ex = x + width;
        var ey = y + height;

        for (var r = y; r < ey; r++) {
            var row = grid[r];
            if (!row) {
                continue;
            }
            for (var c = x; c < ex; c++) {
                var node = row[c];
                if (node) {
                    node.value = Maze.Direction.ALL;
                }
            }
        }
    },
    setBlock: function(x, y, width, height) {
        var grid = this.grid;
        var ex = x + width;
        var ey = y + height;
        for (var r = y; r < ey; r++) {
            var row = grid[r];
            if (!row) {
                continue;
            }
            for (var c = x; c < ex; c++) {
                var node = row[c]
                if (node) {
                    node.value = null;
                }
            }
        }
    },
    /***************************************
      通过重写以下几个方法, 可以实现不同的迷宫效果
    **************************************/

    getValidNeighbors: function(node) {
        var nList = [];
        var nMap = {};

        var c = node.x;
        var r = node.y;
        var dir, nearNode;

        dir = Maze.Direction.N;
        nearNode = r > 0 ? this.grid[r - 1][c] : null;
        this.isValid(nearNode, node, dir) && nList.push((nMap[dir] = [nearNode, dir]));

        dir = Maze.Direction.E;
        nearNode = this.grid[r][c + 1];
        this.isValid(nearNode, node, dir) && nList.push((nMap[dir] = [nearNode, dir]));

        dir = Maze.Direction.S;
        nearNode = r < this.height - 1 ? this.grid[r + 1][c] : null;
        this.isValid(nearNode, node, dir) && nList.push((nMap[dir] = [nearNode, dir]));

        dir = Maze.Direction.W;
        nearNode = this.grid[r][c - 1];
        this.isValid(nearNode, node, dir) && nList.push((nMap[dir] = [nearNode, dir]));

        this.updateValidNeighbors(nList, nMap);

        if (nList.length > 0) {
            nMap.list = nList;
            return nMap;
        }
        return null;
    },

    updateValidNeighbors: function(nList, nMap) {

    },

    isValid: function(nearNode, node, dir) {
        return nearNode && nearNode.value === 0;
    },

    updateCurrent: function() {
        if (this.alwaysBacktrace) {
            this.backtrace();
        }
    },

    getNeighbor: function() {
        var list = this.neighbors.list;
        var n = list[list.length * Math.random() >> 0];
        return n;
    },

    getTraceIndex: function() {
        var idx = this.trace.length - 1;
        return idx;
    },

};


Maze.Direction = {
    N: 1,
    S: 2,
    E: 4,
    W: 8,
    ALL: 1 | 2 | 4 | 8,

    opposite: {
        1: 2,
        2: 1,
        4: 8,
        8: 4
    },
    stepX: {
        1: 0,
        2: 0,
        4: 1,
        8: -1
    },
    stepY: {
        1: -1,
        2: 1,
        4: 0,
        8: 0
    },
};

var Map = {
    'context': null,
    'canvas': null,
    'maze': null,
    'cellW': 0,
    'cellH': 0,
    'player1X': 0,
    'player1Y': 0,
    'player2X': 0,
    'player2Y': 0,
    'createNew': function(canvas, context, m) {
        this.context = context;
        this.canvas = canvas;
        var maze = new Maze({
            width: m.width,
            height: m.height,
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

        this.maze = maze;
        var map = this;

        function createPerfectMaze() {
            createMaze(true, false);
        }

        function createBraidMaze() {
            createMaze(false, true);
        }

        function createMaze(perfect, braid) {
            maze.perfect = perfect || false;
            maze.braid = braid || false;

            //maze.init();

            //maze.startNode = maze.getRandomNode();
            maze.startNode = m.startNode;
            map.player1X = Math.round(maze.startNode.x * map.cellW + map.cellW * 0.5);
            map.player1Y = Math.round(maze.startNode.y * map.cellH + map.cellH * 0.5);
            //do {
            //    maze.endNode = maze.getRandomNode();
            //} while (maze.startNode == maze.endNode);
            maze.endNode = m.endNode;
            map.player2X = Math.round(maze.endNode.x * map.cellW + map.cellW * 0.5);
            map.player2Y = Math.round(maze.endNode.y * map.cellH + map.cellH * 0.5);

            // maze.setBlock(15, 15, 6, 5);
            // maze.setRoom(5, 5, 6, 5);
            //maze.generate();
            maze.grid = m.grid;
        }

        function sizeInit() {
            var canvasWidth = canvas.width,
                canvasHeight = canvas.height;

            var cellSize = canvasWidth / maze.width;
            cellSize = Math.min(cellSize, canvasHeight / maze.height) >> 0;

            map.cellW = cellSize;
            map.cellH = cellSize;
        }

        function start() {
            sizeInit();
            createPerfectMaze();
        }

        start();

        return this;
    },

    'renderMaze': function() {

        // var grid = JSON.parse(JSON.stringify(maze.grid));
        var grid = this.maze.grid;
        var wallWidth = 2;

        var canvasWidth = this.canvas.width;
        var canvasHeight = this.canvas.height;

        this.context.fillStyle = "#f9f8ee";
        this.context.fillRect(0, 0, canvasWidth, canvasHeight);
        this.context.fillStyle = "#776e65";
        this.context.strokeStyle = "#776e65";
        this.context.font = "12px Arial";
        this.context.lineWidth = wallWidth;

        var cellY = 0;
        var mazeHeight = 0;
        for (var r = 0; r < grid.length; r++) {
            var row = grid[r];

            // cellH=cellSize-5+(Math.random()*20>>0);

            for (var c = 0; c < row.length; c++) {
                var node = row[c];
                var cx = c * this.cellW;
                var cy = cellY;
                if (!node.value) {
                    this.context.fillRect(cx, cy, this.cellW, this.cellH);
                    continue;
                }
                /*
                if (node == this.maze.startNode) {
                    this.context.fillStyle = "#f3bbaa";
                    this.context.fillRect(cx, cy, cellW, cellH);
                    this.context.fillStyle = "#334466";
                    this.context.fillText("S", cx + cellW * 1 / 3, cy + cellH - 2);
                } else if (node == this.maze.endNode) {
                    this.player2X = Math.round(cx + cellW * 0.5);
                    this.player2Y = Math.round(cy + cellH * 0.5);
                    this.context.fillStyle = "#f3bbaa";
                    this.context.fillRect(cx, cy, cellW, cellH);
                    this.context.fillStyle = "#334466";
                    this.context.fillText("E", cx + cellW * 1 / 3, cy + cellH - 2);
                } else {
                     //var text = maze.traceInfo[node.x + "-" + node.y];
                     //context.fillText(text, cx + cellW * 1 / 3, cy + cellH - 2);
                }
                */
                var left = (node.value & Maze.Direction.W) !== Maze.Direction.W;
                var top = (node.value & Maze.Direction.N) !== Maze.Direction.N;
                if (left && top) {
                    this.context.fillRect(cx, cy, wallWidth, this.cellH);
                    this.context.fillRect(cx, cy, this.cellW, wallWidth);
                } else if (left) {
                    this.context.fillRect(cx, cy, wallWidth, this.cellH);
                } else if (top) {
                    this.context.fillRect(cx, cy, this.cellW, wallWidth);
                } else {
                    var w = false;
                    if (r > 0) {
                        w = (grid[r - 1][c].value & Maze.Direction.W) !== Maze.Direction.W;
                    }
                    if (w && c > 0) {
                        w = (grid[r][c - 1].value & Maze.Direction.N) !== Maze.Direction.N;
                    }
                    var ltc = w ? 1 : 0;
                    if (ltc) {
                        this.context.fillRect(cx, cy, wallWidth, wallWidth);
                    }
                }
            }
            cellY += this.cellH;
            mazeHeight += this.cellH;
        }

        this.context.fillRect(0, mazeHeight-2, this.cellW * this.maze.width, wallWidth);
        this.context.fillRect(this.cellW * this.maze.width - 2, 0, wallWidth, mazeHeight + wallWidth);
    },

    'getNode': function(posX, posY) {
        var c = Math.floor(posX / this.cellW);
        var r = Math.floor(posY / this.cellH);
        return this.maze.getNode(c, r);
    },

    'getRightdownCorner': function(x, y) {
        var right = (x + 1) * this.cellW;
        var down = (y + 1) * this.cellH;
        return({
            'x': right,
            'y': down
        });
    }
}




