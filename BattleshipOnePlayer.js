var WATER = "water";
var SHIP = "ship";
var UNEXPLORED = "unexplored";
var SHOT = "shot";
var HIT = "hit";
var MISSED = "missed";
var SHIP_DEF_PHASE = "shipDefPhase";
var CONFIG_PHASE = "configPhase";
var PLAYERS_TURN = "playersTurn";
var COMPS_TURN = "compsTurn";
var GAME_END = "gameEnd";
var OWN = "own";
var ENEMY = "enemy";

var oCanvas = {
    [OWN]: {
        canvas: document.getElementById("canvasShipDef"),
        ctx: documnt.getElementById("canvasShipDef").getContext("2d")
    },
    [ENEMY]: {
        canvas: document.getElementById("canvasAttackTrack"),
        ctx: document.getElementById("canvasAttackTrack").getContext("2d")
    }
}

var gridsPlayer = null;
var gridsComputer = null;
var gameState = null;

//draw initial grids
var gridSize = 10;
var cellSize = 30;

function fnDrawBattleGrounds() {
    fnDrawGrid(oCanvas[OWN]);
    fnDrawGrid(oCanvas[ENEMY]);
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
    updateGameState(SHIP_DEF_PHASE);
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
    fnSetCellColors(oCanvas[OWN].ctx, gridsPlayer[OWN]);
    fnSetCellColors(oCanvas[ENEMY].ctx, gridsPlayer[ENEMY]);
}

//function executed when the player starts the game to set the correct state
function fnStartGame() {
    //check if ships have been defined for player and computer
    if (!fnIsComputerReady()) {
        alert("Define and upload the position of the computer's ships.");
        return;
    }
    if (!fnIsPlayerReady()) {
        alert("Click on the grid to define the position of your ships.");
        return;
    }
    updateGameState(PLAYERS_TURN);
    alert("It's your turn. Click on a cell to try shooting at your opponent's ships.")
}

function fnIsComputerReady() {
    for (var x = 0; x <= (gridSize - 1); x++) {
        for (var y = 0; y <= (gridSize - 1); y++) {
            if (gridsComputer[OWN][x][y] === SHIP) {
                return true;
            }
        }
    }
    return false;
}

function fnIsPlayerReady() {
    for (var x = 0; x <= (gridSize - 1); x++) {
        for (var y = 0; y <= (gridSize - 1); y++) {
            if (gridsPlayer[OWN][x][y] === SHIP) {
                return true;
            }
        }
    }
    return false;
}

//function executed when the player wants to configure the computer's ships
function fnConfiguration() {
    updateGameState(CONFIG_PHASE);
    fnInitializeShipsAndWater();
    alert("Define the computer player's ships, then choose 'Save Ship Config'.")
}

//function for initializing the cell colors
var fnInitializeShipsAndWater = function () {
    gridsPlayer = initializeGrids(WATER, UNEXPLORED);
    gridsComputer = initializeGrids(WATER, UNEXPLORED);
    fnSetCellColors(oCanvas[OWN].ctx, gridsPlayer[OWN]);
    fnSetCellColors(oCanvas[ENEMY].ctx, gridsPlayer[ENEMY]);
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
    return {
        [OWN]: initializeGrid(ownCellStatus),
        [ENEMY]: initializeGrid(enemyCellStatus)
    };
}


function fnColorFromStatus(status) {
    switch (status) {
        case WATER:
            return "#94b4e8";
        case SHIP:
            return "#000000";
        case SHOT:
            return "#ff0010";
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

//function for player's definition of own ships
function fnDefineOwnShips() {
    var canvasElement = event.target;
    var x = event.pageX - canvasElement.offsetLeft;
    var y = event.pageY - canvasElement.offsetTop;
    // console.log("canvas", "x", x, "y", y);
    x = Math.floor(x / cellSize);
    y = Math.floor(y / cellSize);
    // console.log("board", "x", x, "y", y);
    var cellStatus = fnGetCellStatus(gridsPlayer[OWN][x][y]);
    gridsPlayer[OWN][x][y] = cellStatus;
    fnColorCells(oCanvas[OWN].ctx, gridsPlayer[OWN], x, y);
}

//function to define computer player's ships
function fnDefineCompsShips() {
    var canvasElement = event.target;
    var x = event.pageX - canvasElement.offsetLeft;
    var y = event.pageY - canvasElement.offsetTop;
    // console.log("canvas", "x", x, "y", y);
    x = Math.floor(x / cellSize);
    y = Math.floor(y / cellSize);
    // console.log("board", "x", x, "y", y);
    var cellStatus = fnGetCellStatus(gridsComputer[OWN][x][y]);
    gridsComputer[OWN][x][y] = cellStatus;
    fnColorCells(oCanvas[OWN].ctx, gridsComputer[OWN], x, y);
}

//function to mark clicked cell in shipDefPlayer as ship
function fnMarkClickedCellAsShip() {
    switch (gameState) {
        case SHIP_DEF_PHASE:
            fnDefineOwnShips();
            break;
        case CONFIG_PHASE:
            fnDefineCompsShips();
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
    return { x, y }
}

//function during player's turn to shoot at the computer's ships
function fnAttackPlayersTurn(event) {
    if (gameState !== PLAYERS_TURN) {
        return;
    }

    var { x, y } = getGridCoordinates(event);

    if (gridsPlayer[ENEMY][x][y] !== UNEXPLORED) {
        alert("You've already attacked these coordinates.");
        return;
    }

    var cellStatus = fnShootAtEnemy(gridsComputer[OWN][x][y]);
    gridsPlayer[ENEMY][x][y] = cellStatus;
    fnColorCells(oCanvas[ENEMY].ctx, gridsPlayer[ENEMY], x, y);

    if (cellStatus === MISSED) {
        updateGameState(COMPS_TURN);
    }
}

function updateGameState(newState) {
    gameState = newState;
    fnSetButtonVisibility(gameState);
    if (gameState === COMPS_TURN) {
        fnAttackCompsTurn();
    }
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

//computer's turn

/**
 * Returns array of numbers from start with a given length. Increments are by 1 or a given step.
 *
 * Usage: numbers(0, 3) === [0, 1, 2]
 *        numbers(1, 3) === [1, 2, 3]
 *        numbers(1, 3, 2) === [1, 3, 5]
 */
function numbers(start, length, step) {
    if (step === undefined) {
        step = 1;
    }
    var result = [];
    var entry = start;
    for (var i = 0; i < length; i++) {
        result.push(entry);
        entry += step;
    }
    return result;
}

/**
 * Shuffle an array in place.
 */
function shuffle(a) {
    for (var i = a.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function gridCoordinatesToPos(x, y) {
    return x + y * gridSize;
}

function gridPosToCoordinates(pos) {
    var x = pos % gridSize;
    var y = (pos - x) / gridSize;
    return { x, y };
}

function generateAttackPositions() {
    return shuffle(numbers(0, gridSize * gridSize));
}

function gridNeighborsForPos(pos) {
    var neighbors = [];
    var {x, y} = gridPosToCoordinates(pos);
    if (0 < x) {
        neighbors.push(gridCoordinatesToPos(x - 1, y));
    }
    if (x < gridSize - 1) {
        neighbors.push(gridCoordinatesToPos(x + 1, y));
    }
    if (0 < y) {
        neighbors.push(gridCoordinatesToPos(x, y - 1));
    }
    if (y < gridSize - 1) {
        neighbors.push(gridCoordinatesToPos(x, y + 1));
    }
    return neighbors;
}

//TODO
// function nextAttack() {
//     var previousShot;
//     switch (previousShot) {
//         case HIT:
            
//         case default:

//     }
// }

//TODO
//function during computer's turn to shoot at the player's ships
function fnAttackCompsTurn() {

}

//------------------------------------------------------------------------------
//save custom shipDef
var textFile = null,
    makeTextFile = function (text) {
        var data = new Blob([text], { type: 'text/plain' });

        // If we are replacing a previously generated file we need to
        // manually revoke the object URL to avoid memory leaks.
        if (textFile !== null) {
            window.URL.revokeObjectURL(textFile);
        }

        textFile = window.URL.createObjectURL(data);
        fnInitializeShipsAndWater();
        updateGameState(SHIP_DEF_PHASE);
        alert("Click on the grid to position your own ships.")
        return textFile;
    };


var fnCreateFile = function () {
    var link = document.getElementById('downloadlink');
    link.href = makeTextFile(JSON.stringify(gridsComputer));
    link.style.display = 'block';
};

//------------------------------------------------------------------------------
//load custom population
var fnHandleFileSelect = function (evt) {
    var files = evt.target.files; // FileList object

    // Loop through the FileList and render image files as thumbnails.
    for (var i = 0, f; f = files[i]; i++) {

        var reader = new FileReader();

        reader.readAsText(f);
        reader.onloadend = function (e) {
            gridsComputer = JSON.parse(reader.result);
            gridSize = gridsComputer[OWN].length;
            fnDrawBattleGrounds();
            fnSetCellColors(oCanvas[OWN].ctx, gridsPlayer[OWN]);
            document.getElementById("gridSize").value = gridSize;
        }
    }
}

document.getElementById('files').addEventListener('change', fnHandleFileSelect, false);

//------------------------------------------------------------------------------

//function to set visibility of all buttons
function fnSetButtonVisibility(state) {
    fnConfigButtonVisibility(state);
    fnSaveConfigButtonVisibility(state);
    fnStartGameButtonVisibility(state);
    fnChooseFilesButtonVisibility(state);
    fnDownloadLinkVisibility(state);
}

//function to set visibility of configure comps ships button
function fnConfigButtonVisibility(state) {
    var button = document.getElementById("configButton");
    if (state === SHIP_DEF_PHASE) {
        button.style.display = "inline-block";
    } else {
        button.style.display = "none";
    }
}

//function to set visibility of save ship config button
function fnSaveConfigButtonVisibility(state) {
    var button = document.getElementById("create");
    if (state === CONFIG_PHASE) {
        button.style.display = "inline-block";
    } else {
        button.style.display = "none";
    }
}

//function to set visibility of start game button
function fnStartGameButtonVisibility(state) {
    var button = document.getElementById("startGameButton");
    if (state === SHIP_DEF_PHASE) {
        button.style.display = "inline-block";
    } else {
        button.style.display = "none";
    }
}

//function to set visibility of choose files button
function fnChooseFilesButtonVisibility(state) {
    var button = document.getElementById("files");
    if (state === SHIP_DEF_PHASE) {
        button.style.display = "inline-block";
    } else {
        button.style.display = "none";
    }
}

//function to set visibility of download link
function fnDownloadLinkVisibility(state) {
    var link = document.getElementById("downloadlink");
    if (state !== SHIP_DEF_PHASE || CONFIG_PHASE) {
        link.style.display = "none";
    }
}

fnInit();
