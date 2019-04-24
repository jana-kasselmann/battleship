var WATER = "water";
var SHIP = "ship";
var UNEXPLORED = "unexplored";
var HIT = "hit";
var MISSED = "missed";
var GRID_CONFIG_PHASE = "gridConfigPhase";
var SHIP_DEF_PLAYER1_PHASE = "shipDefPlayer1Phase";
var SHIP_DEF_PLAYER2_PHASE = "shipDefPlayer2Phase";
var PLAYER1_TURN = "player1Turn";
var PLAYER2_TURN = "player2Turn";
var GAME_END = "gameEnd";
var OWN = "own";
var ENEMY = "enemy";
var PLAYER1 = "player1";
var PLAYER2 = "player2";

var oCanvas = {};
oCanvas[PLAYER1] = {
    canvas: document.getElementById("canvasPlayer1"),
    ctx: document.getElementById("canvasPlayer1").getContext("2d")
};
oCanvas[PLAYER2] = {
    canvas: document.getElementById("canvasPlayer2"),
    ctx: document.getElementById("canvasPlayer2").getContext("2d")
};

var gridsPlayer1 = null;
var gridsPlayer2 = null;
var gameState = null;
var numberOfShips = 20;

//draw initial grids
var gridSize = 10;
var cellSize = 30;

function fnDrawBattleGrounds() {
    fnDrawGrid(oCanvas[PLAYER1]);
    fnDrawGrid(oCanvas[PLAYER2]);
}

function fnDrawGrid(oTargetCanvas) {
    oTargetCanvas.canvas.width = gridSize * cellSize;
    oTargetCanvas.canvas.height = gridSize * cellSize;

    oTargetCanvas.ctx.strokeStyle = "black";
    oTargetCanvas.ctx.lineWidth = 2;

    var x = 0;
    var y = 0;
    var xTo = 0;
    var yTo = (gridSize * cellSize);

    for (var i = 0; i <= gridSize; i++) {
        oTargetCanvas.ctx.beginPath();
        oTargetCanvas.ctx.moveTo(x, y);
        oTargetCanvas.ctx.lineTo(xTo, yTo);
        oTargetCanvas.ctx.stroke();
        x = x + cellSize;
        xTo = xTo + cellSize;
    }

    x = 0;
    y = 0;
    xTo = (gridSize * cellSize);
    yTo = 0;

    for (i = 0; i <= gridSize; i++) {
        oTargetCanvas.ctx.beginPath();
        oTargetCanvas.ctx.moveTo(x, y);
        oTargetCanvas.ctx.lineTo(xTo, yTo);
        oTargetCanvas.ctx.stroke();
        y = y + cellSize;
        yTo = yTo + cellSize;
    }
}

var fnInit = function () {
    fnDrawBattleGrounds();
    fnInitializeShipsAndWater();
}

//function to update the grid size based on user input
var changeGridSize = function (number) {
    if (parseInt(number) < 3 || parseInt(number) > 50) {
        alert("The grid size must be a number between 3 and 50.");
        document.getElementById("gridSize").value = gridSize;
        return;
    }
    gridSize = parseInt(number);
    fnInit();
}

//function to update the number of ships based on user input
var changeNumberOfShips = function (number) {
    if (parseInt(number) < 1 || parseInt(number) > gridSize * gridSize) {
        alert("The number of ships must be between 1 and " + gridSize * gridSize + ".");
        document.getElementById("numberOfShips").value = numberOfShips;
        return;
    }
    numberOfShips = parseInt(number);
}

//function to zoom the canvas size based on user input
var fnChangeCellSize = function (number) {
    cellSize = parseInt(number);
    fnDrawBattleGrounds();
    switch (gameState) {
        case SHIP_DEF_PLAYER1_PHASE:
            fnSetCellColors(oCanvas[PLAYER1].ctx, gridsPlayer1[OWN]);
            fnSetCellColors(oCanvas[PLAYER2].ctx, gridsPlayer2[OWN]);
            break;
        case SHIP_DEF_PLAYER2_PHASE:
            fnSetCellColors(oCanvas[PLAYER1].ctx, gridsPlayer1[OWN]);
            fnSetCellColors(oCanvas[PLAYER2].ctx, gridsPlayer2[OWN]);
            break;
        case PLAYER1_TURN:
            fnSetCellColors(oCanvas[PLAYER1].ctx, gridsPlayer1[ENEMY]);
            fnSetCellColors(oCanvas[PLAYER2].ctx, gridsPlayer2[ENEMY]);
            break;
        case PLAYER2_TURN:
            fnSetCellColors(oCanvas[PLAYER1].ctx, gridsPlayer1[ENEMY]);
            fnSetCellColors(oCanvas[PLAYER2].ctx, gridsPlayer2[ENEMY]);
            break;
        case GAME_END:
            fnSetCellColors(oCanvas[PLAYER1].ctx, gridsPlayer1[ENEMY]);
            fnSetCellColors(oCanvas[PLAYER2].ctx, gridsPlayer2[ENEMY]);
            break;
    }
}

//function to check if player 1 has configured ships
function checkPlayer1Readiness() {
    if (!player1IsReady()) {
        alert("Player 1: Click on the grid to define the position of your ships.");
        return;
    }

    if (!correctNumberOfShips(SHIP_DEF_PLAYER1_PHASE, gridsPlayer1, gridsPlayer2)) {
        alert("You've marked " + countCellsInGrid(gridsPlayer1[OWN], SHIP) + " cells as ships. You need to mark " + numberOfShips + " cells.");
        return;
    }
    updateGameState(SHIP_DEF_PLAYER2_PHASE);
}

//function executed when the player starts the game to set the correct state
function fnStartGame() {
    //check if ships have been defined for player and computer
    if (!fnIsPlayer2Ready()) {
        alert("Player 2: Click on the grid to define the position of your ships.");
        return;
    }

    if (!correctNumberOfShips(SHIP_DEF_PLAYER2_PHASE, gridsPlayer1, gridsPlayer2)) {
        alert("You've marked " + countCellsInGrid(gridsPlayer2[OWN], SHIP) + " cells as ships. You need to mark " + numberOfShips + " cells.");
        return;
    }

    fnSetCellColors(oCanvas[PLAYER1].ctx, gridsPlayer1[ENEMY]);
    fnSetCellColors(oCanvas[PLAYER2].ctx, gridsPlayer2[ENEMY]);
    updateGameState(PLAYER1_TURN);
    setTimeout(function () {
        alert("It's player 1's turn. Click on a cell to try shooting at your opponent's ships.");
    }, 0);
}

function fnIsPlayer2Ready() {
    for (var x = 0; x <= (gridSize - 1); x++) {
        for (var y = 0; y <= (gridSize - 1); y++) {
            if (gridsPlayer2[OWN][x][y] === SHIP) {
                return true;
            }
        }
    }
    return false;
}

function player1IsReady() {
    for (var x = 0; x <= (gridSize - 1); x++) {
        for (var y = 0; y <= (gridSize - 1); y++) {
            if (gridsPlayer1[OWN][x][y] === SHIP) {
                return true;
            }
        }
    }
    return false;
}

//function for initializing the cell colors
var fnInitializeShipsAndWater = function () {
    gridsPlayer1 = initializeGrids(WATER, UNEXPLORED);
    gridsPlayer2 = initializeGrids(WATER, UNEXPLORED);
    fnSetCellColors(oCanvas[PLAYER1].ctx, gridsPlayer1[OWN]);
    fnSetCellColors(oCanvas[PLAYER2].ctx, gridsPlayer2[OWN]);
}

function initializeGrid(cellStatus) {
    var grid = [];
    for (var x = 0; x <= (gridSize - 1); x++) {
        grid[x] = [];
        for (var y = 0; y <= (gridSize - 1); y++) {
            grid[x][y] = cellStatus;
        };
    }
    return grid;
}

function initializeGrids(ownCellStatus, enemyCellStatus) {
    var grids = {};
    grids[OWN] = initializeGrid(ownCellStatus);
    grids[ENEMY] = initializeGrid(enemyCellStatus);
    return grids;
}


function fnColorFromStatus(status) {
    switch (status) {
        case WATER:
            return "#94b4e8";
        case SHIP:
            return "#000000";
        case UNEXPLORED:
            return "#ffffff";
        case HIT:
            return "#000000";
        case MISSED:
            return "#94b4e8";
        default:
            console.error("Could not color cell.");
            return "#fc0202";
    }
}

//function to decide how to color the cells
function fnSetCellColors(ctx, grid) {
    for (var x = 0; x <= (gridSize - 1); x++) {
        for (var y = 0; y <= (gridSize - 1); y++) {
            fnColorCells(ctx, grid, x, y);
        }
    }
}

//function to color the cells
function fnColorCells(ctx, grid, x, y) {
    var color = fnColorFromStatus(grid[x][y]);
    var xStartRectangle, yStartRectangle;
    xStartRectangle = (x * cellSize) + 1;
    yStartRectangle = (y * cellSize) + 1;
    ctx.fillStyle = color;
    ctx.fillRect(xStartRectangle, yStartRectangle, cellSize - ctx.lineWidth, cellSize - ctx.lineWidth);
}

//function to define the cell status for marking the clicked cell
function fnGetCellStatus(status) {
    switch (status) {
        case WATER:
            return SHIP;
        case SHIP:
            return WATER;
        default:
            console.error("Could not mark clicked cell.");
            return;
    };
}

//function for player 1's definition of own ships
function fnDefinePlayer1Ships() {
    var canvasElement = event.target;
    var x = event.pageX - canvasElement.offsetLeft;
    var y = event.pageY - canvasElement.offsetTop;
    // console.log("canvas", "x", x, "y", y);
    x = Math.floor(x / cellSize);
    y = Math.floor(y / cellSize);
    // console.log("board", "x", x, "y", y);
    var cellStatus = fnGetCellStatus(gridsPlayer1[OWN][x][y]);
    gridsPlayer1[OWN][x][y] = cellStatus;
    fnColorCells(oCanvas[PLAYER1].ctx, gridsPlayer1[OWN], x, y);
    updateGameState(SHIP_DEF_PLAYER1_PHASE);
}

//function to define player 2's ships
function fnDefinePlayer2Ships() {
    var canvasElement = event.target;
    var x = event.pageX - canvasElement.offsetLeft;
    var y = event.pageY - canvasElement.offsetTop;
    // console.log("canvas", "x", x, "y", y);
    x = Math.floor(x / cellSize);
    y = Math.floor(y / cellSize);
    // console.log("board", "x", x, "y", y);
    var cellStatus = fnGetCellStatus(gridsPlayer2[OWN][x][y]);
    gridsPlayer2[OWN][x][y] = cellStatus;
    fnColorCells(oCanvas[PLAYER2].ctx, gridsPlayer2[OWN], x, y);
    updateGameState(SHIP_DEF_PLAYER2_PHASE);
}

//function to mark clicked cell in shipDefPlayer as ship
function fnEventFromGameState(event) {
    switch (gameState) {
        case SHIP_DEF_PLAYER1_PHASE:
            fnDefinePlayer1Ships();
            break;
        case SHIP_DEF_PLAYER2_PHASE:
            fnDefinePlayer2Ships();
            break;
        case PLAYER1_TURN:
            fnAttackPlayer1Turn(event);
            break;
        case PLAYER2_TURN:
            fnAttackPlayer2Turn(event);
            break;
        case GAME_END:
            return;
        default:
            alert("You can't change the position of your ships during the game.");
            return;
    }
}


function getGridCoordinates(event) {
    var canvasElement = event.target;
    var x = event.pageX - canvasElement.offsetLeft;
    var y = event.pageY - canvasElement.offsetTop;
    // console.log("canvas", "x", x, "y", y);
    x = Math.floor(x / cellSize);
    y = Math.floor(y / cellSize);
    // console.log("board", "x", x, "y", y);
    return { x: x, y: y }
}

//function during player's turn to shoot at the computer's ships
function fnAttackPlayer1Turn(event) {
    if (gameState !== PLAYER1_TURN) {
        return;
    }

    var coordinates = getGridCoordinates(event);
    var x = coordinates.x;
    var y = coordinates.y;

    if (event.currentTarget.id !== "canvasPlayer1") {
        return;
    }

    if (gridsPlayer1[ENEMY][x][y] !== UNEXPLORED) {
        alert("You've already attacked these coordinates.");
        return;
    }

    var cellStatus = fnShootAtEnemy(gridsPlayer2[OWN][x][y]);
    gridsPlayer1[ENEMY][x][y] = cellStatus;
    fnColorCells(oCanvas[PLAYER1].ctx, gridsPlayer1[ENEMY], x, y);

    if (gameIsOver(gridsPlayer1, gridsPlayer2)) {
        triggerConfetti();
        updateGameState(GAME_END, PLAYER1);
        return;
    }

    if (cellStatus === MISSED) {
        updateGameState(PLAYER2_TURN);
    }
}

function fnAttackPlayer2Turn(event) {
    if (gameState !== PLAYER2_TURN) {
        return;
    }

    var coordinates = getGridCoordinates(event);
    var x = coordinates.x;
    var y = coordinates.y;

    if (event.currentTarget.id !== "canvasPlayer2") {
        return;
    }

    if (gridsPlayer2[ENEMY][x][y] !== UNEXPLORED) {
        alert("You've already attacked these coordinates.");
        return;
    }

    var cellStatus = fnShootAtEnemy(gridsPlayer1[OWN][x][y]);
    gridsPlayer2[ENEMY][x][y] = cellStatus;
    fnColorCells(oCanvas[PLAYER2].ctx, gridsPlayer2[ENEMY], x, y);

    if (gameIsOver(gridsPlayer2, gridsPlayer1)) {
        triggerConfetti();
        updateGameState(GAME_END, PLAYER2);
        return;
    }
    if (cellStatus === MISSED) {
        updateGameState(PLAYER1_TURN);
    }
}

//check if player 2 has same number of cells marked as ship as player 1
function correctNumberOfShips(phase, gridPlayer1, gridPlayer2) {
    var player1ShipCount = countCellsInGrid(gridPlayer1[OWN], SHIP);
    var player2ShipCount = countCellsInGrid(gridPlayer2[OWN], SHIP);
    switch (phase) {
        case SHIP_DEF_PLAYER1_PHASE:
            return player1ShipCount === numberOfShips;
        case SHIP_DEF_PLAYER2_PHASE:
            return player2ShipCount === numberOfShips;
    }
}

//count cells with certain status in grid
function countCellsInGrid(grid, cellStatus) {
    var count = 0;
    for (var x = 0; x <= (gridSize - 1); x++) {
        for (var y = 0; y <= (gridSize - 1); y++) {
            if (grid[x][y] === cellStatus) {
                count++;
            }
        }
    }
    return count;
}

//check if game is over by comparison of number of ships and shots
function gameIsOver(gridCurrentPlayer, gridOpponent) {
    var hitCount = countCellsInGrid(gridCurrentPlayer[ENEMY], HIT);
    var shipCount = countCellsInGrid(gridOpponent[OWN], SHIP);
    return hitCount === shipCount;
}

function updateGameState(newState, winner) {
    gameState = newState;
    fnSetButtonVisibility(gameState, winner);
}

function fnShootAtEnemy(grid) {
    switch (grid) {
        case WATER:
            return MISSED;
        case SHIP:
            return HIT;
        default:
            console.error("Could not shoot at computer.");
            return;
    }
}
//function to start a new game
function newGame() {
    updateGameState(GRID_CONFIG_PHASE);
    fnInit();
    configureGrid();
}

function randomInt(min, max) {
    return Math.random() * (max - min) + min;
}

function triggerConfetti() {
    var end = Date.now() + (15 * 1000);

    var interval = setInterval(function () {
        if (Date.now() > end) {
            return clearInterval(interval);
        }

        confetti({
            startVelocity: 30,
            spread: 360,
            ticks: 60,
            origin: {
                x: Math.random(),
                // since they fall down, start a bit higher than random
                y: Math.random() - 0.2
            }
        });
    }, 200);
}

//function to set visibility of all buttons
function fnSetButtonVisibility(state, winner) {
    changeVisibility("gridSizeForm", state === GRID_CONFIG_PHASE);
    changeVisibility("numberOfShipsForm", state === GRID_CONFIG_PHASE);
    changeVisibility("cellSizeForm", state !== GRID_CONFIG_PHASE);
    changeVisibility("shipDefPlayer1", state === GRID_CONFIG_PHASE);
    changeVisibility("shipDefPlayer2", state === SHIP_DEF_PLAYER1_PHASE);
    changeVisibility("startGameButton", state === SHIP_DEF_PLAYER2_PHASE);
    changeVisibility("player1ShipPlacement", state === SHIP_DEF_PLAYER1_PHASE);
    changeVisibility("player2ShipPlacement", state === SHIP_DEF_PLAYER2_PHASE);
    changeVisibility("canvasPlayer1Text", 
        state === PLAYER1_TURN || state === PLAYER2_TURN || state === GAME_END
    );
    changeVisibility("canvasPlayer2Text", 
        state === PLAYER1_TURN || state === PLAYER2_TURN || state === GAME_END
    );
    changeVisibility("player1Winner",
        state === GAME_END && winner === PLAYER1
    );
    changeVisibility("player2Winner",
        state === GAME_END && winner === PLAYER2
    );
    changeVisibility("newGameButton", state === GAME_END);
    changeVisibility("canvasPlayer1", state !== GRID_CONFIG_PHASE && state !== SHIP_DEF_PLAYER2_PHASE);
    changeVisibility("canvasPlayer2", state !== GRID_CONFIG_PHASE && state !== SHIP_DEF_PLAYER1_PHASE);
}

function changeVisibility(elementId, isVisible) {
    var element = document.getElementById(elementId);
    element.style.display = isVisible ? "flex" : "none";
}

//--------------------------------------------------------------
function configureGrid() {
    fnSetButtonVisibility(GRID_CONFIG_PHASE);
    updateGameState(GRID_CONFIG_PHASE);
}

fnInit();
configureGrid();

