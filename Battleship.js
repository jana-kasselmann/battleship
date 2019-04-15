var SHIP_DEF_PLAYER = "shipDefPlayer";
var ATTACK_TRACK_COMPUTER = "attackTrackComputer";
var SHIP_DEF_COMPUTER = "shipDefComputer";
var ATTACK_TRACK_PLAYER = "attackTrackPlayer"

var oCanvas = {
    shipDef: { canvas: document.getElementById("canvasShipDef"), ctx: document.getElementById("canvasShipDef").getContext("2d") },
    attackTrack: { canvas: document.getElementById("canvasAttackTrack"), ctx: document.getElementById("canvasAttackTrack").getContext("2d") }
}

var gameState = "shipDefPhase";

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
    fnSetCellColors(oCanvas.shipDef.ctx, aShipsAndWaterPlayer, SHIP_DEF_PLAYER);
    fnSetCellColors(oCanvas.attackTrack.ctx, aShipsAndWaterPlayer, ATTACK_TRACK_COMPUTER);
}

//function executed when the player starts the game to set the correct state
function fnStartGame() {
    //TODO: check if ships have been defined for player and computer
    gameState = "playersTurn";
    alert("It's your turn. Click on a cell to try shooting at your opponent's ships.")
}

//function executed when the player wants to configure the computer's ships
function fnConfiguration() {
    gameState = "configPhase";
    fnInitializeShipsAndWater();
    alert("Define the computer player's ships, then choose 'Save Ship Config'.")
}

//function for initializing the cell colors
var aShipsAndWaterPlayer = [];
var aShipsAndWaterComputer = [];
var fnInitializeShipsAndWater = function () {
    aShipsAndWaterPlayer = [];
    aShipsAndWaterComputer = [];
    for (var x = 0; x <= (gridSize - 1); x++) {
        aShipsAndWaterPlayer[x] = [];
        aShipsAndWaterComputer[x] = [];
        for (var y = 0; y <= (gridSize - 1); y++) {
            aShipsAndWaterPlayer[x][y] = {
                [SHIP_DEF_PLAYER]: "water",
                [ATTACK_TRACK_COMPUTER]: "unexplored"
            };
            aShipsAndWaterComputer[x][y] = {
                [SHIP_DEF_COMPUTER]: "water",
                [ATTACK_TRACK_PLAYER]: "unexplored"
            };
        }
    }
    fnSetCellColors(oCanvas.shipDef.ctx, aShipsAndWaterPlayer, SHIP_DEF_PLAYER);
    fnSetCellColors(oCanvas.attackTrack.ctx, aShipsAndWaterPlayer, ATTACK_TRACK_COMPUTER);
}


function fnColorFromStatus(status) {
    switch (status) {
        case "water":
            return "#94b4e8";
        case "ship":
            return "#000000";
        case "shot":
            return "#ff0010";
        case "unexplored":
            return "#ffffff";
        case "hit":
            return "#000000";
        case "missed":
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
        case "water":
            return "ship";
        case "ship":
            return "water";
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
    var cellStatus = fnGetCellStatus(aShipsAndWaterPlayer[x][y].shipDefPlayer);
    aShipsAndWaterPlayer[x][y].shipDefPlayer = cellStatus;
    fnColorCells(document.getElementById("canvasShipDef").getContext("2d"), aShipsAndWaterPlayer, x, y, SHIP_DEF_PLAYER);
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
    var cellStatus = fnGetCellStatus(aShipsAndWaterComputer[x][y].shipDefComputer);
    aShipsAndWaterComputer[x][y].shipDefComputer = cellStatus;
    fnColorCells(document.getElementById("canvasShipDef").getContext("2d"), aShipsAndWaterComputer, x, y, SHIP_DEF_COMPUTER);
}

//function to mark clicked cell in shipDefPlayer as ship
function fnMarkClickedCellAsShip() {
    switch (gameState) {
        case "shipDefPhase":
            fnDefineOwnShips();
            break;
        case "configPhase":
            fnDefineCompsShips();
            break;
        default:
            alert("You can't change the position of your ships during the game.");
            return;
    }
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
        gameState = "shipDefPhase";
        alert("Click on the grid to position your own ships.")
        return textFile;
    };


var fnCreateFile = function () {
    var link = document.getElementById('downloadlink');
    link.href = makeTextFile(JSON.stringify(aShipsAndWaterComputer));
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
            aShipsAndWaterComputer = JSON.parse(reader.result);
            gridSize = aShipsAndWaterComputer.length;
            document.getElementById("gridSize").value = gridSize;
        }
    }
}

document.getElementById('files').addEventListener('change', fnHandleFileSelect, false);

//------------------------------------------------------------------------------
fnInit();
