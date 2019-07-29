const Agent = require('ai-agents').Agent;
const getEmptyHex = require('./getEmptyHex');
const Score = require("./BoardScore.js");//Board cambiado
var pila = [];
class HexAgent extends Agent {

    constructor(value) {
        super(value);
    }
    
    /**
     * return a new move. The move is an array of two integers, representing the
     * row and column number of the hex to play. If the given movement is not valid,
     * the Hex controller will perform a random valid movement for the player
     * Example: [1, 1]
     */
    send() {
        let board = this.perception;
        let size = board.length;
        let available = getEmptyHex(board);
        let agente = this.getID()
        let nTurn = size * size - available.length;
        if (nTurn == 0) { // First move
            return [Math.floor(size / 2), Math.floor(size / 2) - 1];
        } else if (nTurn == 1){
            return [Math.floor(size / 2), Math.floor(size / 2)];
        }
        
        alphaBetaPrunedMiniMax(board,true,6,Number.POSITIVE_INFINITY,Number.NEGATIVE_INFINITY,pila)
        
        let move = returnmov(pila);
        
        
        return [Math.floor (move / board.length), move % board.length];
        
    }
	
	

}

module.exports = HexAgent;

/**
	funcion poda alpha beta

¨*/

function alphaBetaPrunedMiniMax(board, maximizingPlayer, depth, alpha, beta,pilaone){
		if ( goalTest(board) ) {
			
	            return getHeuristicScore(board,'1');
	        }
	    if (getEmptyHex(board).length !== 0) {
	            if (maximizingPlayer) {
	                var bestValue = Number.NEGATIVE_INFINITY;
	                let movimientos = getEmptyHex(board);
	                for (let move of movimientos) {
	                	let updatedBoard = updateBoard(board,[Math.floor (move / board.length), move % board.length],'1');
	                    
	                    valore=alphaBetaPrunedMiniMax(updatedBoard,false, depth-1, alpha,beta,pilaone);
	                    temp=[]
	                    temp=['max',move]
	                    
	                    pilaone.push(temp);
	                    //console.log(pila);
	                    bestValue = Math.max(bestValue, valore);
	                    alpha = Math.max(alpha, bestValue);
	                    if (beta <= alpha) {
	                        break;
	                    }
	                }
	                return bestValue;
	                } else {
	                var bestValue = Number.POSITIVE_INFINITY;
	                let movimientos = getEmptyHex(board);
	                for (let move of movimientos) {
	                    let updatedBoard = updateBoard(board,[Math.floor (move / board.length), move % board.length],'2');
	                    
	                    valore=alphaBetaPrunedMiniMax(updatedBoard,true, depth-1, alpha,beta,pilaone);
	                    temp=[]
	                    temp=['min',move]
	                    
	                    pilaone.push(temp);
	                    //console.log(pila);
	                    bestValue = Math.min(bestValue, valore);
	                    beta = Math.min(beta, bestValue);
	                    if (beta <= alpha) {
	                        break;
	                    }
	                }
	                return bestValue;
	            }
	        } else {
	        	getHeuristicScore(board,'1');
	        }
	        
	       
    }


function getHeuristicScore(board,player){
	return Score(board,player);
}

/**
 * Return an array containing the id of the empty hex in the board
 * id = row * size + col;
 * @param {Matrix} board 
 *//*
function getEmptyHex(board) {
    let result = [];
    let size = board.length;
    for (let k = 0; k < size; k++) {
        for (let j = 0; j < size; j++) {
            if (board[k][j] === 0) {
                result.push(k * size + j);
            }
        }
    }
    return result;
}*/

function punto(){
	pila.add([[0,0] , -1]);
	pila.add([[1,3] , -1]);
	pila.add([[1,4] , -1]);
	for(let item of pila){
		return item[0];
		console.log(item[0]);
	}
}

function updateBoard(tablero, action, agentID) {
        let board = tablero;
        let size = board.length;
        // Check if this is legal move?
        if (action[0] >= 0 && action[0] < size 
            && action[1] >= 0 && action[1] < size
            && board[action[0]][action[1]] === 0 ) {
                board[action[0]][action[1]] = agentID;
            	return board;
        } else {
            // Make a random move for this player if the movement is not valid
            let available = getEmptyHex(board);
            let move = available[Math.round(Math.random() * ( available.length -1 ))];
            action[0] = Math.floor (move / board.length);
            action[1] = move % board.length;
            console.log("move",action)
            console.log("agente",agentID)
            board[action[0]][action[1]] = agentID;
            return board;
        }
    }
 
 function returnmov(pila){
	 //console.log("primera pila:",pila)
	 for (let punti of pila){
		 
		 
		 if (punti[0]==='max'){
			 
			 return punti[1];
			 pila.remove(punti)
			 break
			 
		}
		 
	}
	 //console.log("pila despues:",pila)
	 

}

 function goalTest(tablero) {
        let board = tablero;
        let size = board.length;
        for (let player of ['1', '2']) {
            for (let i = 0; i < size; i++) {
                let hex = -1;
                if (player === "1") {
                    if (board[i][0] === player) {
                        hex = i * size;
                    }
                } else if (player === "2") {
                    if (board[0][i] === player) {
                        hex = i;
                    }
                }
                if (hex >= 0) {
                    let row = Math.floor(hex / size);
                    let col = hex % size;
                    // setVisited(neighbor, player, board);
                    board[row][col] = -1;
                    let status = check(hex, player, board);
                    board[row][col] = player;
                    if (status) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

function check(currentHex, player, board) {
    if (isEndHex(currentHex, player, board.length)) {
        return true;
    }
    let neighbors = getNeighborhood(currentHex, player, board);
    for (let neighbor of neighbors) {
        let size = board.length;
        let row = Math.floor(neighbor / size);
        let col = neighbor % size;
        // setVisited(neighbor, player, board);
        board[row][col] = -1;
        let res = check(neighbor, player, board);
        // resetVisited(neighbor, player, board);
        board[row][col] = player;
        if (res == true) {
            return true;
        }
    }
    return false;
}

/**
 * Return an array of the neighbors of the currentHex that belongs to the same player. The 
 * array contains the id of the hex. id = row * size + col
 * @param {Number} currentHex 
 * @param {Number} player 
 * @param {Matrix} board 
 */
function getNeighborhood(currentHex, player, board) {
    let size = board.length;
    let row = Math.floor(currentHex / size);
    let col = currentHex % size;
    let result = [];
    if (row > 0 && board[row - 1][col] === player) {
        result.push(col + (row - 1) * size);
    }
    if (row > 0 && col + 1 < size && board[row - 1][col + 1] === player) {
        result.push(col + 1 + (row - 1) * size);
    }
    if (col > 0 && board[row][col - 1] === player) {
        result.push(col - 1 + row * size);
    }
    if (col + 1 < size && board[row][col + 1] === player) {
        result.push(col + 1 + row * size);
    }
    if (row + 1 < size && board[row + 1][col] === player) {
        result.push(col + (row + 1) * size);
    }
    if (row + 1 < size && col > 0 && board[row + 1][col - 1] === player) {
        result.push(col - 1 + (row + 1) * size);
    }

    return result;
}

/**
 * Chech if the current hex is a the opposite border of the board
 * @param {Number} currentHex 
 * @param {Number} player 
 * @param {Number} size 
 */
function isEndHex(currentHex, player, size) {
    if (player === "1") {
        if ((currentHex + 1) % size === 0) {
            return true;
        }
    } else if (player === "2") {
        if (Math.floor(currentHex / size) === size - 1) {
            return true;
        }
    }
}

