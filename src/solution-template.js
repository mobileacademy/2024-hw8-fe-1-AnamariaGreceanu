/*
*
* "board" is a matrix that holds data about the
* game board, in a form of BoardSquare objects
*
* openedSquares holds the position of the opened squares
*
* flaggedSquares holds the position of the flagged squares
*
 */

let board = [];
let openedSquares = [];
let flaggedSquares = [];
let bombCount = 0;
let squaresLeft = 0;


/*
*
* the probability of a bomb in each square
*
 */
let bombProbability = 3;
let maxProbability = 15;


function minesweeperGameBootstrapper(rowCount, colCount) {
    let easy = {
        'rowCount': 9,
        'colCount': 9,
    };
    // TODO you can declare here the medium and expert difficulties
    let medium = {
        'rowCount': 16,
        'colCount': 16,
    };
    let expert = {
        'rowCount': 16,
        'colCount': 30,
    }

    if (rowCount == null && colCount == null) {
        // TODO have a default difficulty
        generateBoard(easy)
    } else {
        generateBoard({ 'rowCount': rowCount, 'colCount': colCount });
    }
    renderBoard();

}

function generateBoard(boardMetadata) {
    board=[]
    squaresLeft = boardMetadata.colCount * boardMetadata.rowCount;

    /*
    *
    * "generate" an empty matrix
    *
     */
    for (let i = 0; i < boardMetadata.rowCount; i++) {
        board[i] = new Array(boardMetadata.colCount);
    }

    /*
    *
    * TODO fill the matrix with "BoardSquare" objects, that are in a pre-initialized state
    *
    */
    for (let i = 0; i < boardMetadata.rowCount; i++) {
        for (let j = 0; j < boardMetadata.colCount; j++){
            board[i][j]=new BoardSquare(false,0)
        }
    }
    

    /*
    *
    * "place" bombs according to the probabilities declared at the top of the file
    * those could be read from a config file or env variable, but for the
    * simplicity of the solution, I will not do that
    *
    */
    bombCount = 0
    for (let i = 0; i < boardMetadata.rowCount; i++) {
        for (let j = 0; j < boardMetadata.colCount; j++) {
            // TODO place the bomb, you can use the following formula: Math.random() * maxProbability < bombProbability
            if (Math.random() * maxProbability < bombProbability) {
                board[i][j].hasBomb = true
                bombCount++
                squaresLeft--
            }
        }
    }

    /*
    *
    * TODO set the state of the board, with all the squares closed
    * and no flagged squares
    *
     */
    openedSquares = []
    flaggedSquares = []


    //BELOW THERE ARE SHOWCASED TWO WAYS OF COUNTING THE VICINITY BOMBS

    /*
    *
    * TODO count the bombs around each square
    *
    */
    for (let i = 0; i < boardMetadata.rowCount; i++) {
        for (let j = 0; j < boardMetadata.colCount; j++) {
            if (!board[i][j].hasBomb) {
                board[i][j].bombsAround=countNumBombsAround(i,j,boardMetadata)
            }
        }
    }

    /*
    *
    * print the board to the console to see the result
    *
    */
    console.log(board);
}

/*
*
* simple object to keep the data for each square
* of the board
*
*/
class BoardSquare {
    constructor(hasBomb, bombsAround) {
        this.hasBomb = hasBomb;
        this.bombsAround = bombsAround;
    }
}

class Pair {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}


/*
* call the function that "handles the game"
* called at the end of the file, because if called at the start,
* all the global variables will appear as undefined / out of scope
*
 */
minesweeperGameBootstrapper(9, 9);

// TODO create the other required functions such as 'discovering' a tile, and so on (also make sure to handle the win/loss cases)

function updateDifficulty() {
    const difficulty = document.getElementById('difficulty').value;

    switch (difficulty) {
        case 'easy':
            minesweeperGameBootstrapper(9, 9);
            break;
        case 'medium':
            minesweeperGameBootstrapper(16, 16);
            break;
        case 'expert':
            minesweeperGameBootstrapper(16, 30);
            break;
    }
}
function updateBombProbability() {
    const bombInput = document.getElementById('bombProbability');
    bombProbability = parseFloat(bombInput.value);
    updateDifficulty();
}

function updateMaxProbability() {
    const maxInput = document.getElementById('maxProbability');
    maxProbability = parseFloat(maxInput.value);
    updateDifficulty();
}

function countNumBombsAround(x, y, boardMetadata) {
    let numBombsAround = 0
    for (let i = -1; i <= 1; i++){
        for (let j = -1; j <= 1; j++){
            let newX = x + i
            let newY = y + j
            if (newX >= 0 && newX < boardMetadata.rowCount && newY >= 0 && newY < boardMetadata.colCount) {
                if (board[newX][newY].hasBomb) {
                    numBombsAround++
                }
            }
        }
    }
    return numBombsAround
}

function openAdjacentSquares(x, y) {
    for (let i = -1; i <= 1; i++){
        for (let j = -1; j <= 1; j++){
            if (i == 0 && j == 0) continue
            let newX = x + i
            let newY = y + j
            if (newX >= 0 && newX <board.length && newY >= 0 && newY < board[0].length) {
                discoverTile(newX, newY)
            }
        }
    }
}

function discoverTile(x, y) {
    let position = new Pair(x, y)

    let markedSquares = [...openedSquares, ...flaggedSquares];
    if (markedSquares.some(square => square.x == position.x && square.y == position.y)) {
        return;
    }

    openedSquares.push(position)
    updateSquare(x, y)
    
    if (board[x][y].hasBomb) {
        let statemenet = document.getElementById("conclusion")
        statemenet.innerText="Game over. You hit a bomb"
        revealSquares()
    } else {
        squaresLeft--
        if (board[x][y].bombsAround == 0) {
            openAdjacentSquares(x,y)
        }
        if (squaresLeft == 0) {
            let statemenet = document.getElementById("conclusion")
            statemenet.innerText="You won"
            revealSquares()
        }
    }
}

function flagSquare(x, y) {
    let position = new Pair(x, y)
    if (!openedSquares.some(square => square.x == position.x && square.y == position.y)) {
        if (!flaggedSquares.some(square => square.x == position.x && square.y == position.y)) {
            flaggedSquares.push(position)
        } else {
            flaggedSquares = flaggedSquares.filter(square => square.x !== position.x || square.y !== position.y);
        }
        updateSquare(x,y)
    }
}

function updateSquare(x, y) {
    const gameBoard = document.getElementById('game-board')
    const index = x * board[0].length + y
    const square = gameBoard.children[index]
    
    if (board[x][y].hasBomb && (openedSquares.some(sq => sq.x === x && sq.y === y))) {
        square.classList.add('bomb');
        square.innerText = 'B';
    } else if (openedSquares.some(sq => sq.x === x && sq.y === y)) {
        square.classList.add('opened');
        if (board[x][y].bombsAround > 0) {
            square.innerText = board[x][y].bombsAround;
        }
    } else if (flaggedSquares.some(sq => sq.x === x && sq.y === y)) {
        square.classList.add('flagged');
        square.innerText = 'F';
    } else {
        square.classList.remove('opened', 'flagged', 'bomb');
        square.innerText = '';
    }
}

function revealSquare(x,y){
    const gameBoard = document.getElementById('game-board');
    const index = x * board[0].length + y;
    const square = gameBoard.children[index];

    if (board[x][y].hasBomb) {
        square.classList.add('bomb');
        square.innerText = 'B';  
    } 
    else {
        square.classList.add('opened');
        if (board[x][y].bombsAround > 0) {
            square.innerText = board[x][y].bombsAround;
        } else {
            square.innerText = '';
        }
    }
}

function revealSquares() {
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[i].length; j++) {
            revealSquare(i, j); 
        }
    }
}

function renderBoard() {
    const gameBoard = document.getElementById('game-board');
    gameBoard.innerHTML = ''; 
    gameBoard.style.gridTemplateColumns = `repeat(${board[0].length}, 30px)`;
    
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[i].length; j++) {
            const square = document.createElement('div');
            square.className = 'square';
            square.addEventListener('click', () => discoverTile(i, j));
            square.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                flagSquare(i, j);
            });
            gameBoard.appendChild(square);
        }
    }
}
