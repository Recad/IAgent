
const Problem = require('ai-agents').Problem;
const getEmptyHex = require('./getEmptyHex');

class HexGame extends Problem {

    constructor(args) {
        super(args);
        this.env = args;
        this.nTurn = 0;
    }

    /**
     * Check if the given solution solves the problem. You must override
     * @param {Object} solution 
     */
    goalTest(data) {
        let board = data.world;
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

    /**
     * The transition model. Tells how to change the state (data) based on the given actions. You must override
     * @param {} data 
     * @param {*} action 
     * @param {*} agentID 
     */
    update(data, action, agentID) {
        let board = data.world;
        let size = board.length;
        
        // As first move, the center is forgiven.
        let checkRule0 = true;
        if (this.nTurn == 0) {
            if (action[0] === Math.floor(size / 2) 
                && action[1] === Math.floor(size / 2)) {
                    checkRule0 = false; 
            }
        }
        // Check if this is legal move?
        if (action[0] >= 0 && action[0] < size 
            && action[1] >= 0 && action[1] < size
            && board[action[0]][action[1]] === 0 && checkRule0) {
                board[action[0]][action[1]] = agentID;
        } else {
            // Make a random move for this player if the movement is not valid
            let available = getEmptyHex(board);
            let move = available[Math.round(Math.random() * ( available.length -1 ))];
            action[0] = Math.floor (move / board.length);
            action[1] = move % board.length;
            board[action[0]][action[1]] = agentID;
        }
        this.nTurn++;
    }

    /**
     * Gives the world representation for the agent at the current stage
     * @param {*} agentID 
     * @returns and object with the information to be sent to the agent
     */
    perceptionForAgent(data, agentID) {
        return data.world;
    }

    /**
 * Solve the given problem
 * @param {*} world 
 * @param {*} callbacks 
 */
    solve(world, callbacks) {
        this.controller.setup({ world: world, problem: this });
        this.controller.start(callbacks, false);
    }

    /**
 * Returns an interable function that allow to execute the simulation step by step
 * @param {*} world 
 * @param {*} callbacks 
 */
    interactiveSolve(world, callbacks) {
        this.controller.setup({ world: world, problem: this });
        return this.controller.start(callbacks, true);
    }
}

module.exports = HexGame;

/**
 * Chech if there exist a path from the currentHex to the target side of the board
 * @param {Number} currentHex 
 * @param {Number} player 
 * @param {Matrix} board 
 */
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

    // Check the six neighbours of the current hex
    pushIfAny(result, board, player, row - 1, col);
    pushIfAny(result, board, player, row - 1, col + 1);
    pushIfAny(result, board, player, row, col + 1);
    pushIfAny(result, board, player, row, col - 1);
    pushIfAny(result, board, player, row + 1, col);
    pushIfAny(result, board, player, row + 1, col - 1);

    return result;
}

function pushIfAny(result, board, player, row, col) {
    let size = board.length;
    if (row >= 0 && row < size && col >= 0 && col < size) {
        if (board[row][col] === player) {
            result.push(col + row * size);
        }
    }
}

/**
 * Chech if the current hex is at the opposite border of the board
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


