var SHIP_DEF_PLAYER = "shipDefPlayer";
var ATTACK_TRACK_COMPUTER = "attackTrackComputer";
var SHIP_DEF_COMPUTER = "shipDefComputer";
var ATTACK_TRACK_PLAYER = "attackTrackPlayer";
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

var oCanvas = {
    shipDef: { 
        canvas: document.getElementById("canvasShipDef"), 
        ctx: document.getElementById("canvasShipDef").getContext("2d") 
    },
    attackTrack: { 
        canvas: document.getElementById("canvasAttackTrack"), 
        ctx: document.getElementById("canvasAttackTrack").getContext("2d") 
    }
}

var gameState = null;

//draw initial grids
var gridSize = 10;
var cellSize = 30;

function fnDrawBattleGrounds() {
    fnDrawGrid(oCanvas.shipDef);
    fnDrawGrid(oCanvas.attackTrack);
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
    fnSetCellColors(oCanvas.shipDef.ctx, gridsPlayer, SHIP_DEF_PLAYER);
    fnSetCellColors(oCanvas.attackTrack.ctx, gridsPlayer, ATTACK_TRACK_COMPUTER);
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
            if (gridsComputer[x][y][SHIP_DEF_COMPUTER] === SHIP) {
                return true;
            }
        }
    }
    return false;
}

function fnIsPlayerReady() {
    for (var x = 0; x <= (gridSize - 1); x++) {
        for (var y = 0; y <= (gridSize - 1); y++) {
            if (gridsPlayer[x][y][SHIP_DEF_PLAYER] === SHIP) {
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
var gridsPlayer = [];
var gridsComputer = [];
var fnInitializeShipsAndWater = function () {
    gridsPlayer = [];
    gridsComputer = [];
    for (var x = 0; x <= (gridSize - 1); x++) {
        gridsPlayer[x] = [];
        gridsComputer[x] = [];
        for (var y = 0; y <= (gridSize - 1); y++) {
            gridsPlayer[x][y] = {
                [SHIP_DEF_PLAYER]: WATER,
                [ATTACK_TRACK_COMPUTER]: UNEXPLORED
            };
            gridsComputer[x][y] = {
                [SHIP_DEF_COMPUTER]: WATER,
                [ATTACK_TRACK_PLAYER]: UNEXPLORED
            };
        }
    }
    fnSetCellColors(oCanvas.shipDef.ctx, gridsPlayer, SHIP_DEF_PLAYER);
    fnSetCellColors(oCanvas.attackTrack.ctx, gridsPlayer, ATTACK_TRACK_COMPUTER);
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

//function to color the cells
function fnColorCells(ctx, aShipsAndWater, x, y, gridUser) {
    var color = fnColorFromStatus(aShipsAndWater[x][y][gridUser]);
    var xStartRectangle, yStartRectangle;
    xStartRectangle = (x * cellSize) + 1;
    yStartRectangle = (y * cellSize) + 1;
    ctx.fillStyle = color;
    ctx.fillRect(xStartRectangle, yStartRectangle, cellSize - ctx.lineWidth, cellSize - ctx.lineWidth);
}

//function to decide how to color the cells
function fnSetCellColors(ctx, aShipsAndWater, gridUser) {
    for (var x = 0; x <= (gridSize - 1); x++) {
        for (var y = 0; y <= (gridSize - 1); y++) {
            fnColorCells(ctx, aShipsAndWater, x, y, gridUser);
        }
    }
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
    var cellStatus = fnGetCellStatus(gridsPlayer[x][y].shipDefPlayer);
    gridsPlayer[x][y].shipDefPlayer = cellStatus;
    fnColorCells(oCanvas.shipDef.ctx, gridsPlayer, x, y, SHIP_DEF_PLAYER);
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
    var cellStatus = fnGetCellStatus(gridsComputer[x][y].shipDefComputer);
    gridsComputer[x][y].shipDefComputer = cellStatus;
    fnColorCells(oCanvas.shipDef.ctx, gridsComputer, x, y, SHIP_DEF_COMPUTER);
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

    // TODO refactor to st like gridsPlayer[OWN][x][y] gridsPlayer[ENEMY][x][y]
    if (gridsPlayer[x][y][ATTACK_TRACK_COMPUTER] !== UNEXPLORED) {
        alert("You've already attacked these coordinates.");
        return;
    } 


    var cellStatus = fnShootAtComputer(gridsComputer[x][y][SHIP_DEF_COMPUTER]);
    gridsPlayer[x][y][ATTACK_TRACK_COMPUTER] = cellStatus;
    fnColorCells(oCanvas.attackTrack.ctx, gridsPlayer, x, y, ATTACK_TRACK_COMPUTER);

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

function fnShootAtComputer(aShipsAndWater) {
    switch (aShipsAndWater) {
        case WATER:
            return MISSED;
        case SHIP:
            return HIT;
        default:
            console.error("Could not shoot at computer.");
            return;
    }
}

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
            gridSize = gridsComputer.length;
            fnDrawBattleGrounds();
            fnSetCellColors(oCanvas.shipDef.ctx, gridsPlayer, SHIP_DEF_PLAYER);
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
