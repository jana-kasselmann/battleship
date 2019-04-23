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
var fnChangeGridSize = function (number) {
    gridSize = parseInt(number);
    fnInit();
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
    if (!fnIsPlayer1Ready()) {
        alert("Player 1: Click on the grid to define the position of your ships.");
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


    if (equalNumberOfShips(gridsPlayer1, gridsPlayer2)) {
        alert("You've marked too many cells. You need to mark " + countCellsInGrid(gridsPlayer1[OWN], SHIP) + " cells.");
        return;
    }

    fnSetCellColors(oCanvas[PLAYER1].ctx, gridsPlayer1[ENEMY]);
    fnSetCellColors(oCanvas[PLAYER2].ctx, gridsPlayer2[ENEMY]);
    updateGameState(PLAYER1_TURN);
    alert("It's player 1's turn. Click on a cell to try shooting at your opponent's ships.")
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

function fnIsPlayer1Ready() {
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
    return { x:x, y:y }
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
        alert("Player 1 has won.")
        updateGameState(GAME_END);
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
        alert("Player 2 has won.")
        updateGameState(GAME_END);
        return;
    }
    if (cellStatus === MISSED) {
        updateGameState(PLAYER1_TURN);
    }
}

//check if player 2 has same number of cells marked as ship as player 1
function equalNumberOfShips(gridPlayer1, gridPlayer2) {
    var player1ShipCount = countCellsInGrid(gridPlayer1[OWN], SHIP);
    var player2ShipCount = countCellsInGrid(gridPlayer2[OWN], SHIP);
    var shipNumberComparison = player2ShipCount > player1ShipCount;
    return shipNumberComparison;
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

function updateGameState(newState) {
    gameState = newState;
    fnSetButtonVisibility(gameState);
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

//function to set visibility of all buttons
function fnSetButtonVisibility(state) {
    gridSizeFormVisibility(state);
    zoomSliderVisibility(state);
    shipDefPlayer1ButtonVisibility(state);
    shipDefPlayer2ButtonVisibility(state);
    startGameButtonVisibility(state);
    player1ShipDefTextVisibility(state);
    player2ShipDefTextVisibility(state);
    canvasPlayer1TextVisibility(state);
    canvasPlayer2TextVisibility(state);
    canvasPlayer1Visibility(state);
    canvasPlayer2Visibility(state);
}

//function to set visibility of grid size input field
function gridSizeFormVisibility(state) {
    var form = document.getElementById("gridSizeForm");
    if (state === GRID_CONFIG_PHASE) {
        form.style.display = "inline-block";
    } else {
        form.style.display = "none";
    }
}

//function to set visibility of zoom slider
function zoomSliderVisibility(state) {
    var form = document.getElementById("cellSizeForm");
    if (state !== GRID_CONFIG_PHASE) {
        form.style.display = "inline-block";
    } else {
        form.style.display = "none";
    }
}

//function to set visibility of start button
function shipDefPlayer1ButtonVisibility(state) {
    var button = document.getElementById("shipDefPlayer1");
    if (state === GRID_CONFIG_PHASE) {
        button.style.display = "inline-block";
    } else {
        button.style.display = "none";
    }
}

//function to set visibility of next button
function shipDefPlayer2ButtonVisibility(state) {
    var button = document.getElementById("shipDefPlayer2");
    if (state === SHIP_DEF_PLAYER1_PHASE) {
        button.style.display = "inline-block";
    } else {
        button.style.display = "none";
    }
}

//function to set visibility of start game button
function startGameButtonVisibility(state) {
    var button = document.getElementById("startGameButton");
    if (state === SHIP_DEF_PLAYER2_PHASE) {
        button.style.display = "inline-block";
    } else {
        button.style.display = "none";
    }
}

//function to set visibility of player 1 shipDef text
function player1ShipDefTextVisibility(state) {
    var text = document.getElementById("player1ShipPlacement");
    if (state === SHIP_DEF_PLAYER1_PHASE) {
        text.style.display = "inline-block";
    } else {
        text.style.display = "none";
    }
}

//function to set visibility of player 2 shipDef text
function player2ShipDefTextVisibility(state) {
    var text = document.getElementById("player2ShipPlacement");
    if (state === SHIP_DEF_PLAYER2_PHASE) {
        text.style.display = "inline-block";
    } else {
        text.style.display = "none";
    }
}

//function to set visibility of canvasPlayer1Text
function canvasPlayer1TextVisibility(state) {
    var text = document.getElementById("canvasPlayer1Text");
    switch (state) {
        case PLAYER1_TURN:
            text.style.display = "inline-block";
            break;
        case PLAYER2_TURN:
            text.style.display = "inline-block";
            break;
        default:
            text.style.display = "none";
    }
}

//function to set visibility of canvasPlayer1Text
function canvasPlayer2TextVisibility(state) {
    var text = document.getElementById("canvasPlayer2Text");
    switch (state) {
        case PLAYER1_TURN:
            text.style.display = "inline-block";
            break;
        case PLAYER2_TURN:
            text.style.display = "inline-block";
            break;
        default:
            text.style.display = "none";
    }
}

//function to set visibility of canvas player 1
function canvasPlayer1Visibility(state) {
    var canvas = document.getElementById("canvasPlayer1");
    switch (state) {
        case GRID_CONFIG_PHASE:
            canvas.style.display = "none";
            break;
        case SHIP_DEF_PLAYER2_PHASE:
            canvas.style.display = "none";
            break;
        default:
            canvas.style.display = "inline-block";
    }
}

//function to set visibility of canvas player 2
function canvasPlayer2Visibility(state) {
    var canvas = document.getElementById("canvasPlayer2");
    switch (state) {
        case GRID_CONFIG_PHASE:
            canvas.style.display = "none";
            break;
        case SHIP_DEF_PLAYER1_PHASE:
            canvas.style.display = "none";
            break;
        default:
            canvas.style.display = "inline-block";
    }
}

//--------------------------------------------------------------
function configureGrid() {
    fnSetButtonVisibility(GRID_CONFIG_PHASE);
    updateGameState(GRID_CONFIG_PHASE);
}

fnInit();
configureGrid();

