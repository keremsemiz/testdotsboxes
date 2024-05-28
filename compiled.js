/**
A class for representing the current board for JSON
@class Board
@param  {gameState} state Current state of the game.
@return {void} Nothing
*/
function Board(state) {
    try {
        var i;

        // Optional parameter default to 10
        if (state.size === undefined) {this.size = 10; } else {this.size = state.size; }

        this.type = "Game board";

        this.valid_moves = [];
        if (state.valid_moves !== undefined) {
            for (i = 0; i < state.valid_moves.length; i += 1) {
                this.valid_moves[i] = state.valid_moves[i];
            }
        }

        this.connections = [];
        if (state.connections !== undefined) {
            for (i = 0; i < state.connections.length; i += 1) {
                this.connections[i] = state.connections[i];
            }
        }
    } catch (err) {
        logError("Error Board::constructor " + err);
        return;
    }
}/**
A class for representing a Dot on the board
@class Dot
@param  {number} ID The ID number of the created Dot
@return {void} Nothing
*/
function Dot(ID) {
    try {
        // Optional parameter default to 0
        if (ID === undefined) {this.ID = 0; } else {this.ID = ID; }

        /**
        Initlization code for the dot class.
        @param {void} Nothing.
        @return {void} Nothing.
        */
        this.init = function () {
            try {
                this.x = 0;
                this.y = 0;
                this.connects = [];
            } catch (err) {
                logError("Error Dot::init " + err);
                return;
            }
        };

        /**
        Returns a human readable string of the dot.
        @param {void} Nothing.
        @return {string} Returns a human readable string of the dot.
        */
        this.toString = function () {
            return "(Dot #" + this.ID + ")";
        };

        this.init();
    } catch (err) {
        logError("Error Dot::constructor " + err);
        return;
    }
}/**
A class for representing the game easyBotState
@class easyBotState
@param  {number} size The height and width of game easyBotState
@return {void} Nothing
*/
function easyBotState(size) {
    try {
        // Optional parameter default to 10
        if (size === undefined) { this.size = 4; } else { this.size = size; }

        /**
        Initlization code for the Bot_State class.
        @param {void} Nothing.
        @return {void} Nothing.
        */
        this.init = function () {
            try {
                //logDebug("Init " + this);
                // Local variables
                var i, x, y, top, left, bottom, right, temp;

                // Some common math conversions
                this.range = this.size - 1;
                this.squared = this.size * this.size;

                // The valid and made moves
                this.valid_moves = [];
                this.connections = [];

                // The Dots, Lines and squares of the board
                this.lines = [];
                this.dots = [];
                this.squares = [];

                this.score_sides = [1, 2, -5, 10];
                this.turn = 0;

                // Create the dots        
                for (i = 0; i < this.squared; i += 1) {
                    this.dots.push(new Dot(i + 1));
                }

                // Create the lines
                for (i = 0; i < this.squared; i += 1) {
                    x = i % this.size;
                    y = Math.floor(i / this.size);

                    if (x !== this.range) {
                        temp = new Line(this.dots[i], this.dots[i + 1]);
                        this.lines.push(temp);
                        this.valid_moves.push(temp);
                    }
                    if (y !== this.range) {
                        temp = new Line(this.dots[i], this.dots[i + this.size]);
                        this.lines.push(temp);
                        this.valid_moves.push(temp);
                    }
                }

                // Create the squares        
                for (i = 0; i < this.squared; i += 1) {
                    x = i % this.size;
                    y = Math.floor(i / this.size);

                    if (x !== this.range && y !== this.range) {
                        top = this.find_connection(i, i + 1);
                        left = this.find_connection(i, i + this.size);
                        bottom = this.find_connection(i + this.size, i + this.size + 1);
                        right = this.find_connection(i + 1, i + this.size + 1);

                        this.squares.push(new Square(top, left, bottom, right));
                    }
                }
            } catch (err) {
                logError("Error easyBotState::init " + err);
                return;
            }
        };

        /**
        Update the state by what was passed in.
        @param  {Object} board The data to update from.
        @return {void} Nothing.
        */
        this.update = function (board) {
            try {
                this.turn += 1;

                // Local variables
                var i, j, tmpArray, findRef;

                this.valid_moves.length = 0;
                for (i = 0; i < board.valid_moves.length; i += 1) {
                    tmpArray = board.valid_moves[i];
                    findRef = this.find_connection(tmpArray[0] - 1, tmpArray[1] - 1);
                    if (findRef !== undefined) {
                        this.valid_moves.push(findRef);
                    }
                }

                this.connections.length = 0;
                for (i = 0; i < board.connections.length; i += 1) {
                    tmpArray = board.connections[i];
                    findRef = this.find_connection(tmpArray[0] - 1, tmpArray[1] - 1);
                    if (findRef !== undefined) {
                        this.connections.push(findRef);
                    }
                }

                // Clear squares sides
                for (i = 0; i < this.squares.length; i += 1) {
                    this.squares[i].sides = 0;
                }

                // Count new sides
                for (i = 0; i < this.connections.length; i += 1) {
                    for (j = 0;  j < this.connections[i].connects.length; j += 1) {
                        this.connections[i].connects[j].sides += 1;
                    }
                }
            } catch (err) {
                logError("Error easyBotState::update " + err);
                return;
            }
        };

        /**
        Reset code for the bot class.
        @param  {void} Nothing.
        @return {void} Nothing.
        */
        this.reset = function () {
            try {
                var i;
                this.turn = 0;
                this.connections.length = 0;

                // Reset valid moves
                for (i = 0; i < this.lines.length; i += 1) {
                    this.valid_moves.push(this.lines[i]);
                }

                // Clear squares sides
                for (i = 0; i < this.squares.length; i += 1) {
                    this.squares[i].sides = 0;
                }

            } catch (err) {
                logError("Error easyBotState::reset " + err);
                return;
            }
        };

        /**
        Score all the moves in the connections array
        @param {void} Nothing.
        @return {void} Nothing.
        */
        this.score_moves = function () {
            try {
                var i, j, score;

                // Go through every connection
                for (i = 0; i < this.valid_moves.length; i += 1) {
                    score = 0;

                    // Go through each square
                    for (j = 0;  j < this.valid_moves[i].connects.length; j += 1) {
                        score += this.score_sides[this.valid_moves[i].connects[j].sides];
                    }

                    // Add some "fuzz" to the score to help tie breakers
                    score += Math.random() * 0.1;

                    // Record score
                    this.valid_moves[i].score = score;
                }
            } catch (err) {
                logError("Error easyBotState::score_moves " + err);
                return;
            }
        };

        /**
        Returns the best score of the lot
        @param {void} Nothing.
        @return {Array} An 2 element array with the best move.
        */
        this.best_move = function () {
            try {
                var i, best = 0, highest = -9999;
                // Go through every connection
                for (i = 0; i < this.valid_moves.length; i += 1) {
                    // Save the highest score
                    if (this.valid_moves[i].score >= highest) {
                        highest = this.valid_moves[i].score;
                        best = i;
                    }
                }

                // Return a the valid move number
                return best;
            } catch (err) {
                // Return first list
                logError("Error easyBotState::best_move " + err);
                return 0;
            }
        };

        /**
        Find the connection based off of the two passed ID's
        @param  {number} alpha_ID The the first dot ID in the connection.
        @param  {number} beta_ID The the second dot ID in the connection.
        @return {object} Returns the connection if found and undefined otherwise.
        */
        this.find_connection = function (alpha_ID, beta_ID) {
            try {
                var i, j, alpha, beta;
                // Find the dot by index
                alpha = this.dots[alpha_ID];
                beta = this.dots[beta_ID];

                // Find a common connection between both dots
                for (i = 0; i < alpha.connects.length; i += 1) {
                    for (j = 0; j < beta.connects.length; j += 1) {
                        if (alpha.connects[i] === beta.connects[j]) {
                            // Found return the connection
                            return alpha.connects[i];
                        }
                    }
                }
                // Not found return undefined
                return undefined;
            } catch (err) {
                logError("Error easyBotState::find_conection " + err);
                return undefined;
            }
        };

        /**
        Returns a human readable string of the Bot_State.
        @param {void} Nothing.
        @return {string} Returns a human readable string of the Bot_State.
        */
        this.toString = function () {
            return "(Board Size = " + this.size + ", Square = " + this.squared + ")";
        };

        this.init();
    } catch (err) {
        logError("Error Bot_State::constructor " + err);
        return undefined;
    }
}

/**
A class for easy bot
@class easyBot
@param    {number} size The height and width of game board
@return    {void} Nothing
*/
function easyAI() {
    try {
        this.size = 4;
        /**
        Initlization code for the bot class.
        @param {void} Nothing.
        @return {void} Nothing.
        */
        this.init = function () {
            try {
                this.state = new easyBotState(this.size);
            } catch (err) {
                logError("Error easyAI::init " + err);
                return;
            }
        };

        /**
        Reset code for the bot class.
        @param {void} Nothing.
        @return {void} Nothing.
        */
        this.reset = function () {
            try {
                //logDebug("Reset" + this);
                this.state.reset();
            } catch (err) {
                logError("Error easyAI::reset " + err);
                return;
            }
        };

        /**
        Called by the game logic when it's the bots turn to make a move
        @param {object} board The board reference .
        @return {Array} Returns an array of.
        */
        this.move = function (board) {
            try {
                var best_move, mistake;

                // Reset init is size changes
                if (this.size !== logic.size) {
                    this.size = logic.size;
                    this.init();
                }

                // Update our state to match the board
                this.state.update(board);
                this.state.score_moves();

                // Find the best move
                best_move = this.state.best_move();

                // Randomly make a mistake (ie. pick a random best)
                mistake = Math.floor((Math.random() * 10));
                if (mistake === 0) {
                    //logDebug("Easy mistake move!");
                    best_move = Math.floor(board.valid_moves.length * Math.random());
                }
                return board.valid_moves[best_move];
            } catch (err) {
                logError("Error easyAI::move " + err);
                return undefined;
            }
        };

        /**
        Returns a human readable string of the board.
        @param {void} Nothing.
        @return {string} Returns a human readable string of the board.
        */
        this.toString = function () {
            return "Easy AI";
        };
    } catch (err) {
        logError("Error easyAI::constructor " + err);
        return undefined;
    }
}// Constant variables
var EXPERT_DOUBLES_ARRAY = [1, 2, -3, 25];
var EXPERT_SINGLES_ARRAY = [2, 1, -3, 25];
var EXPERT_EXTEND = 0.5;
var EXPERT_ENDS = 2;
var EXPERT_EDGE = 0.1;
var EXPERT_CYCLE = 1.5;
var EXPERT_QUAD = 1.5;
var EXPERT_DOUBLE_CROSS = 1;
var EXPERT_CHAINS = 5;
var EXPERT_MIDDLE = 7;

/** 
A class for representing a dot on the board 
@class expertDot 
@param  {number} ID The ID number of the created dot 
@return {void} Nothing 
*/
function expertDot(ID) {
    try {
        // Optional parameter default to 0 
        if (ID === undefined) {this.ID = 0;} else {this.ID = ID;} 

        /** 
        Initlization code for the dot class. 
        @param {void} Nothing. 
        @return {void} Nothing. 
        */
        this.init = function () {
            try { 
                this.connects = []; 
            } catch (err) { 
                logError("Error expertDot::init " + err); 
                return; 
            } 
        }; 

        /** 
        Returns a human readable string of the dot. 
        @param {void} Nothing. 
        @return {string} Returns a human readable string of the dot. 
        */
        this.toString = function () {
            return "(expertDot #" + this.ID + ")"; 
        }; 
        this.init();

    } catch (err) { 
        logError("Error expertDot::constructor " + err); 
        return; 
    } 
} 
  
/** 
A class for representing a connection on the board 
@class expertLine 
@param  {expertDot} alpha The the first dot object in the line 
@param  {expertDot} beta The the second dot object in the line 
@return {void} Nothing 
*/
function expertLine(alpha, beta) {
    try {
        // Optional parameter default to 0 
        if (alpha === undefined) { this.alpha = new expertDot(); } else { this.alpha = alpha; } 
        if (beta === undefined) { this.beta = new expertDot(); } else { this.beta = beta; } 

        /** 
        Initlization code for the line class. 
        @param {void} Nothing. 
        @return {void} Nothing. 
        */
        this.init = function () {
            try { 
                this.connects = []; 

                // Record this connections in each of the dots 
                this.alpha.connects.push(this); 
                this.beta.connects.push(this); 

                // The score of this connection 
                this.score = 0; 
                this.chain_link = undefined; 
                this.connected = false; 
                this.tested = false; 
            } catch (err) { 
                logError("Error expertLine::init " + err); 
                return; 
            } 
        }; 

        /** 
        Returns a human readable string of the connection. 
        @param {void} Nothing. 
        @return {string} Returns a human readable string of the connection. 
        */
        this.toString = function () {
            return "(expertLine alpha = " + this.alpha.ID + ", beta = " + this.beta.ID + ")"; 
        }; 

        this.init();
    } catch (err) { 
        logError("Error expertLine::constructor " + err); 
        return; 
    } 
} 
  
/** 
A class for representing a square on the board 
@class expertSquare 
@param  {expertLine} top The the top connection object in the square 
@param  {expertLine} left The the left connection object in the square 
@param  {expertLine} bottom The the bottom connection object in the square 
@param  {expertLine} right The the right connection object in the square 
@return {void} Nothing 
*/
function expertSquare(top, left, bottom, right) {
    try {
        // Optional parameter default to 0 
        if (top === undefined) { this.top = new expertLine(); } else { this.top = top; } 
        if (left === undefined) { this.left = new expertLine(); } else { this.left = left; } 
        if (bottom === undefined) { this.bottom = new expertLine(); } else { this.bottom = bottom; } 
        if (right === undefined) { this.right = new expertLine(); } else { this.right = right; } 
      
        /** 
        Initlization code for the square class. 
        @param {void} Nothing. 
        @return {void} Nothing. 
        */
        this.init = function () {
            try { 
                // Record this square in each of the lines 
                this.top.connects.push(this); 
                this.left.connects.push(this); 
                this.bottom.connects.push(this); 
                this.right.connects.push(this); 
      
                // Store edge bonus 
                this.edge_bonus = 0; 
      
                // Number of sides 
                this.sides = 0; 
            } catch (err) { 
                logError("Error expertSquare::init " + err); 
                return; 
            } 
        }; 
      
        /** 
        Returns a human readable string of the square. 
        @param {void} Nothing. 
        @return {string} Returns a human readable string of the square. 
        */
        this.toString = function () {
            return "(expertSquare top " + this.top + " left " + this.left + " bottom " + this.bottom + " right " + this.right + ")"; 
        }; 
      
        this.init();
    } catch (err) {
        logError("Error expertSquare::constructor " + err); 
        return; 
    } 
} 
  
/** 
A class for representing a chain on the board 
@class expertChain 
@param  {Array} chain_list The list of the lines in the chain. 
@return {void} Nothing 
*/
function expertChain(chain_list) {
    try {
        // Optional parameter default to 0 
        if (chain_list === undefined) { this.list = []; } else { this.list = chain_list; } 
      
        /** 
        Initlization code for the chain class. 
        @param {void} Nothing. 
        @return {void} Nothing. 
        */
        this.init = function () {
            try { 
                // Make the chain length - 1 then number of lines in the chain 
                this.size = this.list.length - 1; 
                this.double_crosses = []; 
                this.middle = []; 
                this.ends = []; 
                this.get_ends(); 
                this.get_middle(); 
      
                // If a open chain score by size 
                if (this.ends.length > 1 || this.size === 1) { 
                    this.score = this.size; 
                // If an closed chain score cycle minus the size of the loop 
                } else if (this.ends.length === 0 && this.size === 3) { 
                    this.score = EXPERT_QUAD + (this.size * 0.01); 
                    //logDebug("Quad found " +this.toString()); 
                } else { 
                    this.score = EXPERT_CYCLE + (this.size * 0.01); 
                } 
            } catch (err) { 
                logError("Error expertChain::init " + err); 
                return; 
            } 
        }; 
      
        /** 
        Count the number of ends in the chain and return them 
        @param {void} Nothing. 
        @return {void} Nothing. 
        */
        this.get_ends = function () {
            try { 
                var i, j, opened; 
                // Look at every line in the chain 
                for (i = 0; i < this.list.length; i += 1) { 
                    opened = false; 
                    // Check if the line is open (has less then 2 sides) 
                    for (j = 0; j < this.list[i].connects.length; j += 1) { 
                        if (this.list[i].connects[j].sides < 2) { 
                            opened = true; 
                        } 
                    } 
                    // Add to end list if open or on edge 
                    if (this.list[i].connects.length === 1 || opened) { 
                        this.ends.push(this.list[i]); 
                    } 
                } 
                return; 
            } catch (err) {
                logError("Error expertChain::init " + err); 
                return; 
            } 
        }; 
      
        /** 
        Get the middle of a 3 size given quad 
        @param {void} Nothing. 
        @return {void} Nothing. 
        */
        this.get_middle = function () {
            try { 
                var i, j, is_middle; 
                // Check if quad offer 
                if (this.ends.length === 0 && this.list.length === 3) { 
                    for (i = 0; i < this.list.length; i += 1) { 
                        is_middle = true; 
                        // If either side has 3 side then is not the middle 
                        for (j = 0; j < this.list[i].connects.length; j += 1) { 
                            if (this.list[i].connects[j].sides === 3) { 
                                is_middle = false; 
                            } 
                        } 
                        // We found the middle so record it 
                        if (is_middle) { 
                            this.middle.push(this.list[i]); 
                        } 
                    } 
                } 
                return; 
            } catch (err) { 
                logError("Error expertChain::init " + err); 
                return; 
            } 
        }; 
      
        /** 
        Returns a human readable string of the chain. 
        @param {void} Nothing. 
        @return {string} Returns a human readable string of the chain. 
        */
        this.toString = function () {
            return "(expertChain length (" + this.size + ") score (" + this.score + ") )"; 
        }; 
      
        this.init();
    } catch (err) {
        logError("Error expertChain::constructor " + err); 
        return; 
    } 
} 

/**
A class for representing the game expertBotState
@class expertBotState
@param    {number} size The height and width of game board
@return    {void} Nothing
*/
function expertBotState(size) {
    try {
        // Optional parameter default to 10
        if (size === undefined) { this.size = 10; } else { this.size = size; }
        /**
        Initlization code for the expertBotState class.
        @param {void} Nothing.
        @return {void} Nothing.
        */
        this.init = function () {
            try {
                // Local variables
                var i = 0, x = 0, y = 0, top, left, bottom, right, temp, ref;

                // Some common math conversions
                this.range = this.size - 1;
                this.squared = this.size * this.size;

                // The valid and made moves
                this.valid_moves = [];
                this.connections = [];
                this.history = [];

                // The dots, lines and squares of the board
                this.lines = [];
                this.dots = [];
                this.squares = [];
                this.chains = [];
                this.past_crosses = [];

                // Array matchs the number of side a square has
                this.score_sides = EXPERT_DOUBLES_ARRAY;

                // Game flags
                this.started = true;
                this.winning = false;
                this.end_parity = false;
                this.double_offer = false;
                this.chain_move = false;
                this.end_game = false;
                this.last_end_game = false;

                // Game stats
                this.turn = 0;
                this.total_score = 0;
                this.my_score = 0;
                this.enemy_score = 0;

                // Even wins for counting the chain rule
                this.evens_win = !(this.size & 1);
                this.evens_chains = true;
                this.long_chains = 0;

                // Number of exchanges before 3 or bigger chains with two ends
                this.exchanges = 0;

                // Create the dots
                for (i = 0; i < this.squared; i += 1) {
                    this.dots.push(new expertDot(i + 1));
                }

                // Create the lines
                for (i = 0; i < this.squared; i += 1) {
                    x = i % this.size;
                    y = Math.floor(i / this.size);

                    // Test for out of bounds x range
                    if (x !== this.range) {
                        temp = new expertLine(this.dots[i], this.dots[i + 1]);
                        this.lines.push(temp);
                        this.valid_moves.push(temp);
                    }

                    // Test for out of bounds y range
                    if (y !== this.range) {
                        temp = new expertLine(this.dots[i], this.dots[i + this.size]);
                        this.lines.push(temp);
                        this.valid_moves.push(temp);
                    }
                }

                // Create the squares
                for (i = 0; i < this.squared; i += 1) {
                    x = i % this.size;
                    y = Math.floor(i / this.size);

                    // Test for out of bounds
                    if (x !== this.range && y !== this.range) {
                        top = this.find_connection(i, i + 1);
                        left = this.find_connection(i, i + this.size);
                        bottom = this.find_connection(i + this.size, i + this.size + 1);
                        right = this.find_connection(i + 1, i + this.size + 1);

                        // Add an edge bonus of to the edge of the board
                        ref = new expertSquare(top, left, bottom, right);
                        if (x === 0 || x === (this.range - 1) || y === 0 || y === (this.range - 1)) {
                            ref.edge_bonus = EXPERT_EDGE;
                        }
                        this.squares.push(ref);
                    }
                }
            } catch (err) {
                logError("Error expertState::init " + err);
                return;
            }
        };

        /**
        Reset code for the bot class.
        @param {void} Nothing.
        @return {void} Nothing.
        */
        this.reset = function () {
            try {
                var i;
                this.turn = 0;
                this.connections.length = 0;
                this.valid_moves.length = 0;
                this.past_crosses.length = 0;

                // Reset valid moves
                for (i = 0; i < this.lines.length; i += 1) {
                    this.valid_moves.push(this.lines[i]);
                }

                // Reset the chains
                this.chains.length = 0;
                this.long_chains = 0;

                // Game flags
                this.winning = false;
                this.end_parity = false;
                this.double_offer = false;
                this.chain_move = false;
                this.end_game = false;
                this.last_end_game = false;

                // Reset score
                this.total_score = 0;
                this.my_score = 0;
                this.enemy_score = 0;

                this.count_sides();
                return;
            } catch (err) {
                logError("Error expertState::reset " + err);
                return;
            }
        };

        /**
        Update the state by what was passed in.
        @param {Object} board The data to update from.
        @return {void} Nothing.
        */
        this.update = function (board) {
            try {
                // Local variables
                var i, tmpArray, findRef;

                // Get the turn count
                this.turn = board.connections.length;
                if (this.turn === 0) { this.started = true; }
                if (this.turn === 1) { this.started = false; }

                // Sync the current valid moves to the board
                this.valid_moves.length = 0;
                for (i = 0; i < board.valid_moves.length; i += 1) {
                    tmpArray = board.valid_moves[i];
                    findRef = this.find_connection(tmpArray[0] - 1, tmpArray[1] - 1);
                    if (findRef !== undefined) {
                        // Reset the line and add it to our state
                        findRef.connected = false;
                        findRef.chain_link = undefined;
                        this.valid_moves.push(findRef);
                    }
                }
                //logDebug("This Valid Moves " + this.valid_moves);
                
                // Sync the current connections to the board
                this.connections.length = 0;
                for (i = 0; i < board.connections.length; i += 1) {
                    tmpArray = board.connections[i];
                    findRef = this.find_connection(tmpArray[0] - 1, tmpArray[1] - 1);
                    if (findRef !== undefined) {
                        // Reset the line and add it to our state
                        findRef.connected = true;
                        findRef.chain_link = undefined;
                        this.connections.push(findRef);
                    }
                }
                //logDebug("This Connections " + this.connections);

                // Reset the chains
                this.chains.length = 0;
                this.long_chains = 0;

                // Correct the square count of sides
                this.count_sides();

                // Calculate score knowing my score and total score
                this.total_score = this.count_squares();
                this.enemy_score = this.total_score - this.my_score;

                return;
            } catch (err) {
                logError("Error expertState::update " + err);
                return;
            }
        };

        /**
        Count the number of sides for each square
        @param {void} Nothing.
        @return {void} Nothing.
        */
        this.count_sides = function () {
            try {
                var i, j;

                // Clear squares sides
                for (i = 0; i < this.squares.length; i += 1) {
                    this.squares[i].sides = 0;
                }

                // Count new sides
                for (i = 0; i < this.connections.length; i += 1) {
                    for (j = 0;  j < this.connections[i].connects.length; j += 1) {
                        this.connections[i].connects[j].sides += 1;
                    }
                }
            } catch (err) {
                logError("Error expertState::count_sides " + err);
                return;
            }
        };

        /**
        Count the number of full squares
        @param {void} Nothing.
        @return {void} Returns the total number of full squares.
        */
        this.count_squares = function () {
            try {
                var i, count = 0;
                // Add one for each full square
                for (i = 0; i < this.squares.length; i += 1) {
                    if (this.squares[i].sides === 4) {
                        count += 1;
                    }
                }
                return count;
            } catch (err) {
                logError("Error expertState::count_sides " + err);
                return 0;
            }
        };

        /**
        Counts all the open loop chains over the length of 3
        @param {void} Nothing.
        @return {void} Nothing.
        */
        this.count_chains = function () {
            try {
                var i;
                // Sort the chains array by score
                this.chains.sort(function (a, b) {
                    return a.score - b.score;
                });
                // If a chain 3 or bigger with two ends and a quad then count chain as long
                for (i = 0; i < this.chains.length; i += 1) {
                    //logDebug("expertChain #" + i + " size " + this.chains[i].list + " ends " + this.chains[i].ends);
                    if (this.chains[i].size >= 3 && this.chains[i].ends.length >= 2) {
                        this.long_chains += 1;
                    } else if (this.chains[i].ends.length === 0 && this.chains[i].size === 3) {
                        this.long_chains += 1;
                    }
                }
                // Find out how many exchanges until the long chains
                this.exchanges = this.chains.length - this.long_chains;
                // Detremine who is winning
                this.winning = Boolean(this.exchanges & 1);
            } catch (err) {
                logError("Error expertState::count_chains " + err);
                return;
            }
        };

        /**
        If every square has to or more sides we are in end game
        @param {void} Nothing.
        @return {Number} The number of safe moves left.
        */
        this.check_end_game = function () {
            try {
                var i, j, point, count = 0;
                this.end_game = true;
                // Look at every line
                for (i = 0; i < this.lines.length; i += 1) {
                    point = false;
                    // If making this line makes a point record it
                    for (j = 0; j < this.lines[i].connects.length; j += 1) {
                        if (this.lines[i].connects[j].sides >= 2) {
                            point = true;
                        }
                    }
                    // If we have a point then count it
                    if (!point) {
                        this.end_game = false;
                        count += 1;
                    }
                }
                return count;
            } catch (err) {
                logError("Error expertState::check_end_game " + err);
                return 0;
            }
        };

        /**
        Apply a line for internal moves.
        @param {line} move the line passed in to be moved.
        @return {void} Nothing.
        */
        this.add_score = function (move) {
            try {
                var i, test_line;
                test_line = this.valid_moves[move];
                // Check how many points this move gives me
                for (i = 0;  i < test_line.connects.length; i += 1) {
                    if (test_line.connects[i].sides === 3) {
                        this.my_score += 1;
                    }
                }
                return;
            } catch (err) {
                logError("Error expertState::apply_line " + err);
                return;
            }
        };

        /**
        Apply a line for internal moves.
        @param {line} move the line passed in to be moved.
        @return {void} Nothing.
        */
        this.apply_line = function (move) {
            try {
                var i;
                // Put the line in memory
                move.connected = true;
                for (i = 0;  i < move.connects.length; i += 1) {
                    move.connects[i].sides += 1;
                }
                return;
            } catch (err) {
                logError("Error expertState::apply_line " + err);
                return;
            }
        };

        /**
        Remove a line for internal moves.
        @param {line}  move the line passed in to be moved.
        @return {void} Nothing.
        */
        this.undo_line = function (move) {
            try {
                var i;
                // Take the line out of memory
                move.connected = false;
                for (i = 0;  i < move.connects.length; i += 1) {
                    move.connects[i].sides -= 1;
                }
                return;
            } catch (err) {
                logError("Error expertState::undo_line " + err);
                return;
            }
        };

        /*
        Looks ahead to see more many chains are left
        @param {line} start_line The line to start exploring from.
        @param {int} count The current count of moves left.
        @return {int} The number of found moves.
        */
        this.look_ahead = function (start_line, count) {
            try {
                var i, test_side, max_count = count;

                // Internally add the line to this state
                this.apply_line(start_line);

                // Go through the connected square and see if the chain continues
                for (i = 0;  i < this.squares.length; i += 1) {
                    if (this.squares[i].sides === 3) {
                        // Find which line is not connected
                        if (!this.squares[i].top.connected) { test_side = this.squares[i].top; }
                        if (!this.squares[i].left.connected) { test_side = this.squares[i].left; }
                        if (!this.squares[i].bottom.connected) { test_side = this.squares[i].bottom; }
                        if (!this.squares[i].right.connected) { test_side = this.squares[i].right; }
                        // Look ahead in to the next line
                        max_count = this.look_ahead(test_side, max_count + 1);
                        break;
                    }
                }
                // Internally undo the line to this state
                this.undo_line(start_line);
                return max_count;
            } catch (err) {
                logError("Error expertState::look_ahead " + err);
                return 0;
            }
        };

        /*
        Check all the chains currently 
        @param {expertLine} start_line the line to start exploring from.
        @return {void} Nothing.
        */
        this.traverse_chain = function (start_line) {
            try {
                var i, j, found, test_square, test_side;

                // Internally add the line to this state
                this.apply_line(start_line);

                if (this.history.length < 100) {
                    // Go through the connected square and see if the chain continues
                    for (i = 0;  i < start_line.connects.length; i += 1) {
                        test_square = start_line.connects[i];
                        if (test_square.sides === 3) {
                            // Find which line is not connected
                            test_side = undefined;
                            if (!test_square.top.connected) { test_side = test_square.top; }
                            if (!test_square.left.connected) { test_side = test_square.left; }
                            if (!test_square.bottom.connected) { test_side = test_square.bottom; }
                            if (!test_square.right.connected) { test_side = test_square.right; }

                            if (test_side !== undefined) {
                                // Look to see if connection is already in the history
                                found = false;
                                for (j = 0; j < this.history.length; j += 1) {
                                    if (this.history[j] === test_side) {
                                        found = true;
                                    }
                                }
                                // Save this line and traverse farther
                                if (!found) {
                                    this.history.push(test_side);
                                    this.traverse_chain(test_side);
                                }
                            }
                        }
                    }
                }
                // Internally undo the line to this state
                this.undo_line(start_line);
                return;
            } catch (err) {
                logError("Error expertState::traverse_chain " + err);
                return;
            }
        };

        /**
        Find all of the chains on the board
        @param {void} Nothing.
        @return {void} Nothing.
        */
        this.find_chain = function () {
            try {
                var i, j, found, new_chain;

                // Go through every connection and look for a chain
                for (i = 0; i < this.valid_moves.length; i += 1) {
                    found = false;

                    // Look for any potential chains for the enemy
                    for (j = 0;  j < this.valid_moves[i].connects.length; j += 1) {
                        if (this.valid_moves[i].connects[j].sides === 2 || this.valid_moves[i].connects[j].sides === 3) {
                            found = true;
                        }
                    }
                    // If a potential chain has been found and we have explored it yet
                    if (found && this.valid_moves[i].chain_link === undefined) {
                        // Clear history an add this line
                        this.history = [];
                        this.history.push(this.valid_moves[i]);

                        // Traverse the chain
                        this.traverse_chain(this.valid_moves[i]);

                        // Add the chain to the chain list
                        new_chain = new expertChain(this.history);
                        this.chains.push(new_chain);

                        // Record the chains length for every line in the chain 
                        for (j = 0;  j < this.history.length; j += 1) {
                            this.history[j].chain_link = new_chain;
                        }
                    }
                }
            } catch (err) {
                logError("Error expertState::find_chain " + err);
                return;
            }
        };

        /**
        If we're winning extend long chains if we are losing extend short chains
        @param {void} Nothing.
        @return {void} Nothing.
        */
        this.extend_chains = function () {
            try {
                var i;
                // If winning promote single array if losing use doubles.
                if (this.winning) {
                    this.score_sides = EXPERT_SINGLES_ARRAY;
                } else {
                    this.score_sides = EXPERT_DOUBLES_ARRAY;
                }

                // Take off the tested flag
                for (i = 0; i < this.lines.length; i += 1) {
                    this.lines[i].tested = false;
                }

                for (i = 0; i < this.chains.length; i += 1) {
                    if (!this.winning) {
                        // If we are winning the extend the long chains and stop short chains
                        if (this.chains[i].size >= 3) {
                            this.extend_chain(this.chains[i], EXPERT_EXTEND);
                        } else {
                            this.extend_chain(this.chains[i], -EXPERT_EXTEND);
                        }
                    } else {
                        // If we are winning the extend the short chains and stop long chains
                        if (this.chains[i].size < 3) {
                            this.extend_chain(this.chains[i], -EXPERT_EXTEND);
                        } else {
                            this.extend_chain(this.chains[i], EXPERT_EXTEND);
                        }
                    }
                }
            } catch (err) {
                logError("Error expertState::extend_chains " + err);
                return;
            }
        };

        /**
        Change the score of the ends to encourage chain growth
        @param {expertChain} test_chain The chain to extend.
        @return {void} Nothing.
        */
        this.extend_chain = function (test_chain, score_amount) {
            try {
                var i, j, opened, safe_moves;
                // Count the number of edges in this list
                for (i = 0; i < test_chain.list.length; i += 1) {
                    // Check for open sides
                    opened = false;
                    for (j = 0; j < test_chain.list[i].connects.length; j += 1) {
                        if (test_chain.list[i].connects[j].sides < 2) {
                            opened = true;
                        }
                    }
                    // Change the value of the ends of chains to promote or stop growth
                    if (test_chain.list[i].connects.length !== 1 || opened) {
                        safe_moves = this.get_moves(test_chain.list[i], 3);
                        for (j = 0; j < safe_moves.length; j += 1) {
                            if (!safe_moves[j].tested) {
                                safe_moves[j].score += score_amount;
                            }
                            safe_moves[j].tested = true;
                        }
                    }
                }
            } catch (err) {
                logError("Error expertState::extend_chain " + err);
                return;
            }
        };

        /**
        Examines the surrounding moves and returns all the safe move the bot can make
        @param {expertChain} new_chain The chain to extend.
        @param {Number} max The highest safe value.
        @return {void} Nothing.
        */
        this.get_moves = function (new_line, max) {
            try {
                var i, j, safe, test_moves, safe_moves;
                // Grab all of the moves surrounding passed in move
                test_moves = [];
                for (i = 0; i < new_line.connects.length; i += 1) {
                    test_moves.push(new_line.connects[i].top);
                    test_moves.push(new_line.connects[i].left);
                    test_moves.push(new_line.connects[i].bottom);
                    test_moves.push(new_line.connects[i].right);
                }
                // Test if the move is under the max sides and not the passed side.
                safe_moves = [];
                for (i = 0; i < test_moves.length; i += 1) {
                    safe = true;
                    for (j = 0; j < test_moves[i].connects.length; j += 1) {
                        if (test_moves[i].connects[j].sides >= max) {
                            safe = false;
                        }
                    }
                    if (safe && new_line !== test_moves[i] && !test_moves[i].connected) {
                        safe_moves.push(test_moves[i]);
                        //logDebug("Adding " + test_moves[i] + " to safe moves");
                    }
                }
                return safe_moves;
            } catch (err) {
                logError("Error expertState::get_moves " + err);
                return [];
            }
        };

        /**
        Score all the moves in the connections array
        @param {void} Nothing.
        @return {void} Nothing.
        */
        this.score_moves = function () {
            try {
                var i, j, score, use_chain;

                // Go through every connection
                for (i = 0; i < this.valid_moves.length; i += 1) {
                    score = 0;
                    use_chain = true;

                    // Go through each square
                    for (j = 0;  j < this.valid_moves[i].connects.length; j += 1) {
                        if (this.valid_moves[i].connects[j].sides === 3) { use_chain = false; }
                        score += this.score_sides[this.valid_moves[i].connects[j].sides];
                        score += this.valid_moves[i].connects[j].edge_bonus;
                    }
                    // Add some "fuzz" to the score to help tie breakers
                    score += Math.random() * 0.001;

                    // Record score
                    this.valid_moves[i].score = score;
                }
            } catch (err) {
                logError("Error expertState::score_moves " + err);
                return;
            }
        };

        /**
        Score all the chains in the connections array
        @param {void} Nothing.
        @return {void} Nothing.
        */
        this.score_chains = function () {
            try {
                var i, j, started;
                started = false;
                if (this.chains.length === 0) {
                    return;
                }
                // Check if we started anywhere
                for (i = 0; i < this.valid_moves.length; i += 1) {
                    this.valid_moves[i].score = 0;
                    for (j = 0;  j < this.valid_moves[i].connects.length; j += 1) {
                        // If a chain has started the score it and set flag
                        if (this.valid_moves[i].connects[j].sides === 3) {
                            this.valid_moves[i].score = EXPERT_CHAINS;
                            this.valid_moves[i].score += Math.random() * 0.001;
                            started = true;
                        }
                    }
                }
                // If not started then start the smallest chain or cycle
                if (!started) {
                    for (i = 0; i < this.chains[0].list.length; i += 1) {
                        this.chains[0].list[i].score = EXPERT_CHAINS;
                        this.chains[0].list[i].score += Math.random() * 0.001;
                    }
                    // Start chains on a double cross location to prevent being double crossed
                    for (i = 0; i < this.chains[0].double_crosses.length; i += 1) {
                        this.chains[0].double_crosses[i].score += EXPERT_DOUBLE_CROSS;
                    }
                // If started pick the best started location
                } else {
                    // Lower the chance we'll pick a double cross if there are to choices
                    for (i = 0; i < this.past_crosses.length; i += 1) {
                        this.past_crosses[i].score -= EXPERT_DOUBLE_CROSS;
                    }
                }
            } catch (err) {
                logError("Error expertState::score_chains " + err);
                return;
            }
        };

        /**
        Score a sorted list of scores
        @param {void} Nothing.
        @return {void} Nothing.
        */
        this.show_scores = function () {
            try {
                var i, new_list = [];
                // Go through every connection
                for (i = 0; i < this.valid_moves.length; i += 1) {
                    new_list.push(this.valid_moves[i]);
                }
                // Sort by score
                new_list.sort(function (a, b) {
                    return b.score - a.score;
                });
                // Show this list
                for (i = 0; i < new_list.length; i += 1) {
                    logDebug("Move " + new_list[i] + " score " + new_list[i].score);
                }
                return;
            } catch (err) {
                logError("Error expertState::best_move " + err);
                return;
            }
        };

        /**
        Returns the best score of the lot
        @param {void} Nothing.
        @return {int} The index valid of the best move
        */
        this.best_move = function () {
            try {
                var i, best = 0, highest = -9999;
                // Go through every connection
                for (i = 0; i < this.valid_moves.length; i += 1) {
                    // Save the highest score
                    if (this.valid_moves[i].score > highest) {
                        highest = this.valid_moves[i].score;
                        best = i;
                    }
                }
                // Return the valid move number
                return best;
            } catch (err) {
                // Return first valid move
                logError("Error expertState::best_move " + err);
                return 0;
            }
        };

        /**
        Look for double crosses and add them to the list
        @param {void} Nothing.
        @return {void} Nothing.
        */
        this.find_double_cross = function () {
            try {
                var i, j, k, n, found, test_moves, test_chain;
                for (i = 0; i < this.chains.length; i += 1) {
                    test_chain = this.chains[i];
                    // If the chain isn't a single
                    if (test_chain.list.length >= 1) {
                        for (j = 0; j < test_chain.ends.length; j += 1) {
                            // Look at the end of the chain for double crosses
                            test_moves = this.get_moves(test_chain.ends[j], 3);
                            for (k = 0; k < test_moves.length; k += 1) {
                                test_chain.double_crosses.push(test_moves[k]);
                                found = false;
                                // Check if double crosss is already on the master list
                                for (n = 0; n < this.past_crosses.length; n += 1) {
                                    if (this.past_crosses[n] === test_moves[k]) {
                                        found = true;
                                    }
                                }
                                // If it isn't add double cross to the master list
                                if (!found) {
                                    this.past_crosses.push(test_moves[k]);
                                }
                            }
                            // If the chain is a double then ignore the second double cross
                            if (test_chain.size === 2) {break; }
                        }
                    }
                }
                return;
            } catch (err) {
                logError("Error expertState::find_double_cross " + err);
                return;
            }
        };

        this.double_cross = function (old_best) {
            try {
                var i, new_line, new_best, test_line, test_moves, moves_left;
                new_best = old_best;

                // If there is only two moves left then just return old best
                if (this.valid_moves.length <= 2) {return old_best; }

                if (!this.chain_move) {
                    // If a chain of more then 2 is starting then set the chain move flag
                    if (this.valid_moves[old_best].chain_link !== undefined) {
                        if (this.valid_moves[old_best].chain_link.size === 1) {
                            this.double_offer = true;
                            this.chain_move = true;
                        } else if (this.valid_moves[old_best].chain_link.size > 1) {
                            this.chain_move = true;
                            this.double_offer = false;
                        }
                    }
                }

                if (this.chain_move && this.end_game) {
                    // Count how many moves are left in this chain
                    moves_left = this.look_ahead(this.valid_moves[old_best], 1);
                    test_line = this.valid_moves[old_best];

                    // If there are only two move left try a double cross
                    if (moves_left === 2 && test_line.connects.length === 2) {
                        // Collect all the surrounding lines in test_moves array
                        test_moves = this.get_moves(test_line, 3);

                        // Search thought all moves for both squares
                        for (i = 0; i < test_moves.length; i += 1) {
                            // Look for the other available move to double cross the enemy
                            if (!test_moves[i].connected && test_moves[i] !== test_line) {
                                new_line = test_moves[i];
                                break;
                            }
                        }
                        // Search for new move in the list
                        for (i = 0; i < this.valid_moves.length; i += 1) {
                            // If the new move was found update the valid move index and return
                            if (this.valid_moves[i] === new_line) {
                                new_best = i;
                                break;
                            }
                        }
                        this.double_offer = false;
                        this.chain_move = false;
                    }
                }
                return new_best;
            } catch (err) {
                // Return first valid move
                logError("Error expertState::double_cross " + err);
                return old_best;
            }
        };


        /**
        Find the connection based off of the two passed ID's
        @param    {number} alpha_ID The the first dot ID in the connection.
        @param    {number} beta_ID The the second dot ID in the connection.
        @return {object} Returns the connection if found and undefined otherwise.
        */
        this.find_connection = function (alpha_ID, beta_ID) {
            try {
                // Find the dot by index
                var i, j, alpha = this.dots[alpha_ID], beta = this.dots[beta_ID];

                // Find a common connection between both dots
                for (i = 0; i < alpha.connects.length; i += 1) {
                    for (j = 0; j < beta.connects.length; j += 1) {
                        if (alpha.connects[i] === beta.connects[j]) {
                            // Found return the connection
                            return alpha.connects[i];
                        }
                    }
                }
                // Not found return undefined
                return undefined;
            } catch (err) {
                logError("Error expertState::find_conection " + err);
                return undefined;
            }
        };

        /**
        Returns a human readable string of the expertState.
        @param {void} Nothing.
        @return {string} Returns a human readable string of the expertState.
        */
        this.toString = function () {
            return "(Board Size = " + this.size + ", Turn = " + this.turn + ", My Score = " + this.my_score + ", Enemy Score = " + this.enemy_score + ")";
        };

        this.init();
    } catch (err) { 
        logError("Error expertState::constructor " + err); 
        return; 
    } 
}

/**
A class for my bot
@class expertAI
@param    {void} Nothing
@return    {void} Nothing
*/
function expertAI() {
    try {
        /**
        Initlization code for the bot class.
        @param {void} Nothing.
        @return {void} Nothing.
        */
        this.init = function () {
            try {
                //logDebug("Init" + this);
                this.state = new expertBotState(this.size);
            } catch (err) {
                logError("Error expertAI::init " + err);
                return;
            }
        };

        /**
        Reset code for the bot class.
        @param {void} Nothing.
        @return {void} Nothing.
        */
        this.reset = function () {
            try {
                //logDebug("Reset" + this);
                this.state.reset();
            } catch (err) {
                logError("Error expertAI::reset " + err);
                return;
            }
        };

        /**
        Called by the game logic when it's the bots turn to make a move
        @param {object} board The board reference .
        @return {Array} Returns an array of.
        */
        this.move = function (board) {
            try {
                var turn_start, best;
                turn_start = getTick();                

                // Reset if the valid moves are more then before
                if (board.valid_moves.length > this.state.valid_moves.length) {
                    //logDebug("Started "+this.state.started+" Last game score me: " + this.state.my_score + " enemy " + (this.state.squares.length - this.state.my_score));
                    this.reset();
                }

                // Reset init is size changes
                if (this.size !== logic.size) {
                    this.size = logic.size;
                    this.init();
                }

                //logDebug("---------------------- "+this.toString()+" Turn #" + (this.state.turn+1) + " ----------------------");

                // Update our state to match the board
                this.state.update(board);

                // Score the size of the chain to prefer smaller chains and cycles first
                this.state.find_chain();
                this.state.count_chains();

                // Check if we are in the end game
                this.state.check_end_game();

                // Extend long chains if winning and short chains if losing
                if (!this.state.end_game) {
                    this.state.score_moves();
                    this.state.extend_chains();
                } else {
                    this.state.find_double_cross();
                    this.state.score_chains();
                    //this.state.show_scores();
                }

                // Find the best move
                best = this.state.best_move();

                // Check if there is a double cross
                best = this.state.double_cross(best);

                // Check if this move adds to my score
                this.state.add_score(best);

                //logDebug("Turn took " + (getTick() - turn_start) + " milliseconds.");
                //logDebug("Bot state: " + this.state.toString());

                // Return the best move back to the engine
                return board.valid_moves[best];
            } catch (err) {
                logError("Error expertAI::move " + err);
                return undefined;
            }
        };

        /**
        Returns a human readable string of the board.
        @param {void} Nothing.
        @return {string} Returns a human readable string of the board.
        */
        this.toString = function () {
            return "(Expert AI)";
        };
        
    } catch (err) { 
        logError("Error expertAI::constructor " + err); 
        return; 
    } 
}/**
A class for representing the current game logic
@class gameLogic
@param    {number} size The height and width of game board
@return    {void} Nothing
*/
function gameLogic(size) {
    try {
        // Optional parameter default to 10
        if (size === undefined) {this.size = 10; } else {this.size = size; }

        /**
        Initlization code for the board class.
        @param {void} Nothing.
        @return {void} Nothing.
        */
        this.init = function () {
            try {
                this.state = new gameState(this.size);
                this.match = 0;
                this.alpha_score = 0;
                this.beta_score = 0;
                this.alpha_games = 0;
                this.beta_games = 0;
                this.turn = 0;
                this.historyTurn = -1;
                this.history = [];
                this.alpha_turn = true;
                this.alpha_ready = false;
                this.beta_ready = false;
                this.user_size = this.size;
                this.thinking = false;
            } catch (err) { 
                logError("Error gameLogic::reset " + err); 
                return; 
            } 
        };

        /**
        Reset the game logic
        @param    {void} Nothing.
        @return {void} Nothing.
        */
        this.reset = function () {
            try {
                this.state.reset();
                this.match = 0;
                this.matches = 0;
                this.alpha_score = 0;
                this.beta_score = 0;
                this.alpha_games = 0;
                this.beta_games = 0;
                this.turn = 0;
                this.alpha_turn = true;
                this.clear_history();
            } catch (err) { 
                logError("Error gameLogic::reset " + err); 
                return; 
            } 
        };

        /**
        Have a rematch
        @param    {void} Nothing.
        @return {void} Nothing.
        */
        this.rematch = function () {
            try {
                this.state.reset();
                this.alpha_score = 0;
                this.beta_score = 0;
                this.turn = 0;
                this.alpha_turn = true;
                this.clear_history();
            } catch (err) { 
                logError("Error gameLogic::rematch " + err); 
                return; 
            } 
        };

        /**
        Run bots until no valid moves remain.
        @param {void} Nothing.
        @return {void} Nothing.
        */
        this.next_turn = function () {
            try {
                //logDebug("Logic next turn " + this.turn + " caller is " + arguments.callee.caller.toString());
                var new_board, new_move;
                if (this.state.valid_moves.length === 0) {
                    //dom_loading.style.display = "none";
                    if (this.alpha_score > this.beta_score) {
                        showMessage(this.alpha_name + " wins!");
                        this.alpha_games += 1;
                    } else if (this.alpha_score < this.beta_score) {
                        showMessage(this.beta_name + " wins!");
                        this.beta_games += 1;
                    } else {
                        showMessage("The game is a tie!");
                        this.alpha_games += 0.5;
                        this.beta_games += 0.5;
                    }
                } else {
                    this.turn = this.state.connections.length + 1;
                    new_board = new Board(this.state);
                    if (this.alpha_turn) {
                        //logDebug(this.alpha_name + "'s turn!");
                        if (this.alpha_bot !== undefined) {
                            view.enabled = false;
                            new_move = this.alpha_bot.move(new_board);
                            recieve_message("["+new_move[0]+","+new_move[1]+"]");
                        } else {
                            view.enabled = true;
                        }
                        view.update();
                    } else {
                        //logDebug(this.beta_name + "'s turn!");
                        if (this.beta_bot !== undefined) {
                            view.enabled = false;
                            new_move = this.beta_bot.move(new_board);
                            recieve_message("["+new_move[0]+","+new_move[1]+"]");
                        } else {
                            view.enabled = true;
                        }
                        view.update();
                    }
                }
            } catch (err) { 
                logError("Error gameLogic::next_turn " + err); 
                return; 
            } 
        };

        /**
        Add to the history array and listbox
        @param {array} move - Element[0] = 1st dot, Element[1] = 2nd dot, Element[2] = Who's turn it is (true alpha/ false beta).
        @return {void} Nothing.
        */
        this.add_history = function (move) {
            try {
                var score, opt = document.createElement("option");

                // Record move in list box
                if (this.alpha_turn) {
                    opt.text = "Turn #" + this.turn + " " + this.alpha_name + " made connection [" + move + "]";
                } else {
                    opt.text = "Turn #" + this.turn + " " + this.beta_name + " made connection [" + move + "]";
                }
                score = this.state.score_test(move);
                if (score !== 0) {
                    opt.text += " score +" + score;
                }
                opt.value = this.turn;

                // Record move in list box
                move[2] = this.alpha_turn;
                this.history_pos = this.history.push(move);
                this.history_pos -= 1;
                dom_history.add(opt);
            } catch (err) { 
                logError("Error gameLogic::clear_history " + err); 
                return; 
            } 
        };

        /**
        Clear the history array and listbox
        @param {void} Nothing.
        @return {void} Nothing.
        */
        this.clear_history = function () {
            try {
                this.history.length = 0;
                dom_history.options.length = 0;
            } catch (err) { 
                logError("Error gameLogic::clear_history " + err); 
                return; 
            } 
        };

        /**
        Erase history up to the current turn
        @param {void} Nothing.
        @return {void} Nothing.
        */
        this.erase_history = function () {
            try {
                var i, opt, tempTurn, score;
                //logDebug("Erase history this.history " +this.history.length+ " turn " + (this.turn - 1));

                dom_history.options.length = 0;
                this.history.length = this.turn - 1;
                
                this.state.reset();
                this.alpha_score = 0;
                this.beta_score = 0;

                for (i = 0; i < this.history.length; i += 1) {
                    this.state.apply_move(this.history[i]);

                    opt = document.createElement("option");
                    tempTurn = i + 1;
                    if (this.history[i][2]) {
                        opt.text = "Turn #" + tempTurn + " " + this.alpha_name + " made connection [" + this.history[i][0] + "," + this.history[i][1] + "]";
                    } else {
                        opt.text = "Turn #" + tempTurn + " " + this.beta_name + " made connection [" + this.history[i][0] + "," + this.history[i][1] + "]";
                    }
                    
                    score = this.state.score_move(this.history[i], this.history[i][2]);
                    if (this.history[i][2]) {
                        this.alpha_score += score;
                    } else {
                        this.beta_score += score;
                    }
                    
                    if (score !== 0) {
                        opt.text += " score +" + score;
                    }
                    opt.value = i;
                    dom_history.add(opt);
                }
            } catch (err) { 
                logError("Error gameLogic::erase_history " + err); 
                return; 
            } 
        };

        /**
        Clear the history array and listbox
        @param {number} index - The turn number to move to
        @return {void} Nothing.
        */
        this.show_history = function (index) {
            try {
                //logDebug("Show history index " + index + " turn " + this.turn +" history length " +this.history.length);
                if(index === -1 || index === (this.history.length - 1)) { return; }

                var i, score;
                if (current_line !== undefined) {
                    current_line.connected = false;
                }
                current_line = undefined;
                this.state.reset();
                this.alpha_score = 0;
                this.beta_score = 0;

                for (i = 0; i <= index; i += 1) {
                    this.state.apply_move(this.history[i]);
                    score = this.state.score_move(this.history[i], this.history[i][2]);
                    if (this.history[i][2]) {
                        this.alpha_score += score;
                    } else {
                        this.beta_score += score;
                    }
                }
                this.alpha_turn = this.history[index + 1][2];
                this.turn = index;
                view.update();
            } catch (err) { 
                logError("Error gameLogic::show_history " + err); 
                return; 
            } 
        };

        /**
        Returns a human readable string of the Board.
        @param {void} Nothing.
        @return {string} Returns a human readable string of the board.
        */
        this.toString = function () {
            return "(gameLogic)";
        };

        this.init();
    } catch (err) { 
        logError("Error gameLogic::constructor " + err); 
        return; 
    } 
}/**
The main engine for HTML5 canvas
@class gameManager
@param {void} Nothing
@return {void} Nothing
*/
function gameManager() {
    /**
    Custom code for initializing the game
    @param {vortexEngine} passEngine The instance of the engine functions
    @return {void} Nothing.
    */
    this.init = function(passEngine){
        try {
            this.engine = passEngine;
            logic = new gameLogic(board_size);
            view = new gameView(this.engine.canvasBuffer, this.engine.contextBuffer, logic);
            this.engine.render();
        } catch (err) { 
            logError("Error gameManager::init " + err); 
            return; 
        } 
    };

    /**
    A mouse event has occured
    @param {string} event - The type of event.
    @param {mouseInfo} pos - The mouse position.
    @return {void} Nothing.
    */
    this.mouseEvent = function(event, pos){
        try {
            if (view.enabled) {
                var i, mouseX, mouseY, message, distance, closest = 0, lowest = 99999;
                pos.convertGridToBuffer();
                mouseX = pos.x;
                mouseY = pos.y;

                // If the current line exist then unconnect it
                if (current_line !== undefined) {
                    current_line.connected = false;
                }

                // Find the closest unconnected line to the mouse using manhattan distance
                for (i = 0; i < logic.state.lines.length; i += 1) {
                    distance = Math.abs(mouseX - logic.state.lines[i].x);
                    distance += Math.abs(mouseY - logic.state.lines[i].y);
                    if (lowest > distance) {
                        closest = i;
                        lowest = distance;
                    }
                }

                // Record and connect the new closest line
                current_line = logic.state.lines[closest];
                if (current_line.connected) {
                    current_line = undefined;
                }

                // If a line was selected figure out what type of even it is
                if (current_line !== undefined) {
                    // If mouse down the record the click_line and who's turn it is
                    
                    if (event === 'up') {
                        //if (click_line === current_line) {
                            //logDebug("Mouse up (" + pos.x + "," + pos.y + ")");
                            message = "[" + current_line.alpha.ID + "," + current_line.beta.ID + "," + logic.turn + "]";
                            current_line.connected = true;
                            current_line = undefined;
                            recieve_message(message);
                        //}
                        click_line = undefined;
                    // If mouse up and the click line is the same as the current then send move to logic
                    } else if (event === 'down') {
                        //logDebug("Mouse down (" + pos.x + "," + pos.y + ")");
                        click_line = current_line;
                        current_line.connected = true;
                        current_line.alpha_point = logic.alpha_turn;
                    // If a mouse move the update the view
                    } else if (event === 'move') {
                        current_line.connected = true;
                        current_line.alpha_point = logic.alpha_turn;
                    // If mouse out the unconnect the last current line
                    }// else if (event === 'out') {
                    //    current_line.connected = false;
                    //    current_line = undefined;
                    //}
                    view.update();
                }
            }
        } catch (err) { 
            logError("Error gameManager::mouseEvent " + err); 
            return; 
        } 
    };

    /**
    A resize event has occured
    @param {string} event - The type of event.
    @return {void} Nothing.
    */
    this.resizeEvent = function(passWidth, passHeight){
        try {
            // Center left and right player
            var alphaWidth, alphaHeight, betaWidth, betaHeight, widthHalf, heightHalf, overflow = 0;
			alphaWidth = dom_alpha_panel.scrollWidth / 2;
            alphaHeight = dom_alpha_panel.scrollHeight / 2;
            betaWidth = dom_beta_panel.scrollWidth / 2;
            betaHeight = dom_beta_panel.scrollHeight / 2;
            widthHalf = passWidth / 2;
            heightHalf = passHeight / 2;

            // Tall screen
            if (window.innerWidth === passWidth) {
                overflow = (window.innerHeight - passHeight) / 4;
                dom_alpha_panel.style.marginLeft = -alphaWidth + 'px';
                dom_alpha_panel.style.marginTop = (-heightHalf - overflow - alphaHeight)+ 'px';
                dom_beta_panel.style.marginLeft = -betaWidth + 'px';
                dom_beta_panel.style.marginTop = (heightHalf + overflow - betaHeight) + 'px';

            // Wide screen
            } else {
                overflow = (window.innerWidth - passWidth) / 4;
                dom_alpha_panel.style.marginLeft = (-widthHalf - overflow - alphaWidth) + 'px';
                dom_alpha_panel.style.marginTop = -alphaHeight + 'px';
                dom_beta_panel.style.marginLeft = (widthHalf + overflow - betaWidth) + 'px';
                dom_beta_panel.style.marginTop = -betaHeight + 'px';
            }

            // Center the main menu
            dom_menu_panel.style.marginLeft = (-dom_menu_panel.scrollWidth / 2) + 'px';
            dom_menu_panel.style.marginTop = (-dom_menu_panel.scrollHeight / 2)  + 'px';

            // Center the options menu
            dom_options_panel.style.marginLeft = (-dom_options_panel.scrollWidth / 2) + 'px';
            dom_options_panel.style.marginTop = (-dom_options_panel.scrollHeight / 2)  + 'px';

            // Center the how to play menu
            dom_howTo_panel.style.marginLeft = (-dom_howTo_panel.scrollWidth / 2) + 'px';
            dom_howTo_panel.style.marginTop = (-dom_howTo_panel.scrollHeight / 2)  + 'px';

            // Center the history menu
            dom_history_panel.style.marginLeft = (-dom_history_panel.scrollWidth / 2) + 'px';
            dom_history_panel.style.marginTop = (-dom_history_panel.scrollHeight / 2)  + 'px';

            // Center the message box
            dom_history_panel.style.marginLeft = (-dom_history_panel.scrollWidth / 2) + 'px';
            dom_history_panel.style.marginTop = (-dom_history_panel.scrollHeight / 2)  + 'px';

            // Center the message box menu
            dom_message_box.style.marginLeft = (-dom_message_box.scrollWidth / 2) + 'px';
            dom_message_box.style.marginTop = (-dom_message_box.scrollHeight / 2)  + 'px';

            if (view !== undefined) {
                view.update();
            }
        } catch (err) { 
            logError("Error gameManager::resizeEvent " + err); 
            return; 
        } 
    };

    /**
    Custom code for drawing the buffer
    @param {void} Nothing.
    @return {void} Nothing.
    */
    this.draw = function(){
        try {
            if (view !== undefined) {
                view.update();
            }
        } catch (err) { 
            logError("Error gameManager::draw " + err); 
            return; 
        } 
    };
}/**
A class for representing the current game state
@class gameState
@param    {number} size The height and width of game board
@return    {void} Nothing
*/
function gameState(size) {
    // Optional parameter default to 10
    if (size === undefined) {this.size = 10; } else {this.size = size; }

    /**
    Initlization code for the state class.
    @param {void} Nothing.
    @return {void} Nothing.
    */
    this.init = function () {
        try {
            this.range = this.size - 1;
            this.valid_moves = [];
            this.connections = [];
            this.dots = [];
            this.lines = [];
            this.squares = [];
            this.squared = this.size * this.size;

            // Local variables
            var i, x, y, top, left, bottom, right;

            // Create the dots
            for (i = 0; i < this.squared; i += 1) {
                this.dots.push(new Dot(i + 1));
            }

            // Create the connections
            for (i = 0; i < this.squared; i += 1) {
                x = i % this.size;
                y = Math.floor(i / this.size);

                if (x !== this.range) {
                    this.lines.push(new Line(this.dots[i], this.dots[i + 1]));
                    this.valid_moves.push([this.dots[i].ID, this.dots[i + 1].ID ]);
                }
                if (y !== this.range) {
                    this.lines.push(new Line(this.dots[i], this.dots[i + this.size]));
                    this.valid_moves.push([this.dots[i].ID, this.dots[i + this.size].ID ]);
                }
            }

            // Create the squares
            for (i = 0; i < this.squared; i += 1) {
                x = i % this.size;
                y = Math.floor(i / this.size);

                if (x !== this.range && y !== this.range) {
                    top = this.find_connection(i, i + 1);
                    left = this.find_connection(i, i + this.size);
                    bottom = this.find_connection(i + this.size, i + this.size + 1);
                    right = this.find_connection(i + 1, i + this.size + 1);
                    this.squares.push(new Square(top, left, bottom, right));
                }
            }
        } catch (err) { 
            logError("Error gameState::init " + err); 
            return; 
        } 
    };

    /**
    Rese code for the state class.
    @param {void} Nothing.
    @return {void} Nothing.
    */
    this.reset = function () {
        try {
            var i = 0;
            this.turn = 0;
            this.alpha_turn = true;
            this.valid_moves.length = 0;
            this.connections.length = 0;

            // Re-create the connections
            for (i = 0; i < this.lines.length; i += 1) {
                this.lines[i].connected = false;
                this.valid_moves.push([this.lines[i].alpha.ID, this.lines[i].beta.ID]);
            }

            // Reset side count
            for (i = 0; i < this.squares.length; i += 1) {
                this.squares[i].sides = 0;
            }
        } catch (err) { 
            logError("Error gameState::reset " + err); 
            return; 
        } 
    };

    /**
    Find the connection based off of the two passed ID's
    @param    {number} alpha_ID The the first Dot ID in the connection.
    @param    {number} beta_ID The the second Dot ID in the connection.
    @return {object} Returns the connection if found and undefined otherwise.
    */
    this.find_connection = function (alpha_ID, beta_ID) {
        try {
            var i, j, alpha, beta;
            alpha = this.dots[alpha_ID];
            beta = this.dots[beta_ID];

            for (i = 0; i < alpha.connects.length; i += 1) {
                for (j = 0; j < beta.connects.length; j += 1) {
                    if (alpha.connects[i] === beta.connects[j]) {
                        return alpha.connects[i];
                    }
                }
            }
            return undefined;
        } catch (err) { 
            logError("Error gameState::find_connection " + err); 
            return; 
        }
    };

    /**
    Apply a move from a bot and put the move on connections.
    @param {Array} moveArray the array passed in to be moved.
    @return {void} Nothing.
    */
    this.apply_move = function (moveArray) {
        try {
            var i = 0, testArray;
            for (i = 0; i < this.valid_moves.length; i += 1) {
                testArray = this.valid_moves[i];
                if (testArray[0] === moveArray[0] && testArray[1] === moveArray[1]) {
                    // Move array to the connections list
                    this.valid_moves.splice(i, 1);
                    this.connections.push(moveArray);
                    return;
                }
            }
            return;
        } catch (err) { 
            logError("Error gameState::apply_move " + err); 
            return; 
        }
    };

    /**
    Apply a move from a bot and put the move on connections.
    @param {Array} moveArray the array passed in to be moved.
    @return {void} Nothing.
    */
    this.undo_move = function (moveArray) {
        try {
            var i = 0, testArray;
            for (i = 0; i < this.connections.length; i += 1) {
                testArray = this.connections[i];
                if (testArray[0] === moveArray[0] && testArray[1] === moveArray[1]) {
                    // Move array to the connections list
                    this.connections.splice(i, 1);
                    this.valid_moves.push(moveArray);
                    return;
                }
            }
            return;
        } catch (err) { 
            logError("Error gameState::undo_move " + err); 
            return; 
        }
    };

    /**
    Score the move from a bot and put the move on connections.
    @param {Array} moveArray the array passed in to be moved.
    @return {void} Nothing.
    */
    this.score_move = function (moveArray, turn) {
        try {
            var i, new_move, score = 0;
            new_move = this.find_connection(moveArray[0] - 1, moveArray[1] - 1);
            if (new_move === undefined) {
                logDebug("Can't find move " + moveArray + "<br />");
            } else {
                new_move.connected = true;
                new_move.alpha_point = turn;
                for (i = 0; i < new_move.connects.length; i += 1) {
                    new_move.connects[i].sides += 1;
                    if (new_move.connects[i].sides === 4) {
                        score += 1;
                        new_move.connects[i].alpha_point = turn;
                    }
                }
            }
            return score;
        } catch (err) { 
            logError("Error gameState::score_move " + err); 
            return; 
        }
    };

    /**
    Score the move from a bot and put the move on connections.
    @param {Array} moveArray the array passed in to be moved.
    @return {void} Nothing.
    */
    this.unscore_move = function (moveArray) {
        try {
            var i, new_move, score = 0;
            new_move = this.find_connection(moveArray[0] - 1, moveArray[1] - 1);
            if (new_move === undefined) {
                logDebug("Can't find move " + moveArray + "<br />");
            } else {
                new_move.connected = false;
                for (i = 0; i < new_move.connects.length; i += 1) {
                    new_move.connects[i].sides -= 1;
                    if (new_move.connects[i].sides === 3) {
                        score -= 1;
                    }
                }
            }
            return score;
        } catch (err) { 
            logError("Error gameState::unscore_move " + err); 
            return; 
        }
    };

    /**
    Test if the move scores
    @param {Array} moveArray the array passed in to be moved.
    @return {number} The score of the move.
    */
    this.score_test = function (moveArray) {
        try {
            var i, new_move, score = 0;
            new_move = this.find_connection(moveArray[0] - 1, moveArray[1] - 1);
            if (new_move === undefined) {
                logDebug("Can't find move " + moveArray + "<br />");
            } else {
                for (i = 0; i < new_move.connects.length; i += 1) {
                    if (new_move.connects[i].sides === 4) {
                        score += 1;
                    }
                }
            }
            return score;
        } catch (err) { 
            logError("Error gameState::score_test " + err); 
            return; 
        }
    };

    /**
    Returns a human readable string of the board.
    @param {void} Nothing.
    @return {string} Returns a human readable string of the board.
    */
    this.toString = function () {
        return "(Game State = " + this.size + ", Square = " + this.squared + ")";
    };

    this.init();
}/**
A class for representing the current game state
@class gameView
@param    {number} size The height and width of game Board
@return    {void} Nothing
*/
function gameView(canvas, context, logic) {
    this.canvas = canvas;
    this.context = context;
    this.logic = logic;
    this.state = logic.state;

    /**
    Initlization code for the board class.
    @param {void} Nothing.
    @return {void} Nothing.
    */
    this.init = function () {
        try {
            var i, x, y, x_step, y_step;

            // State variables
            this.last_move = [0, 0];
            this.enabled = true;

            // Set up the sizing variables
            this.margin = 16.0;
            this.width = this.canvas.width - this.margin - this.margin;
            this.height = this.canvas.height - this.margin - this.margin;
            x_step = this.width / (this.state.size - 1.0);
            y_step = this.height / (this.state.size - 1.0);

            // Calculate the constant location for all the dots
            for (i = 0; i < this.state.dots.length; i += 1) {
                x = i % this.state.size;
                y = Math.floor(i / this.state.size);

                this.state.dots[i].x = (x_step * x) + this.margin;
                this.state.dots[i].y = (y_step * y) + this.margin;
            }

            // Calculate the constant location for all the mid point of the lines
            for (i = 0; i < this.state.lines.length; i += 1) {
                this.state.lines[i].x = (this.state.lines[i].alpha.x + this.state.lines[i].beta.x) / 2;
                this.state.lines[i].y = (this.state.lines[i].alpha.y + this.state.lines[i].beta.y) / 2;
            }

            // Calculate the constant location for the squares
            for (i = 0; i < this.state.squares.length; i += 1) {
                this.state.squares[i].x = this.state.squares[i].top.alpha.x;
                this.state.squares[i].y = this.state.squares[i].top.alpha.y;
                this.state.squares[i].width = this.state.squares[i].bottom.beta.x - this.state.squares[i].x;
                this.state.squares[i].height = this.state.squares[i].bottom.beta.y - this.state.squares[i].y;
            }

            // If no context is found then don't draw anything
            if (this.context === undefined) {
                return;
            }

            // Set the colors based on the theme
            if (theme === "Default") {
                this.default_colors();
            } else if (theme === "Retro") {
                this.retro_colors();
            } else if (theme === "Midnight") {
                this.midnight_colors();
            } else if (theme === "Ruby") {
                this.ruby_colors();
            }
        } catch (err) { 
            logError("Error gameView::init " + err); 
            return; 
        }
    };

    /**
    Set the default colors and redraw the grid
    @param {void} Nothing.
    @return {void} Nothing.
    */
    this.default_colors = function () {
        try {
            // Setup default colors
            this.alpha_color = "rgb(34, 150, 243)";
            this.beta_color = "rgb(89,10,224)";
            this.alpha_fill = "rgba(34, 150, 243, 0.5)";
            this.beta_fill = "rgba(89, 10, 224, 0.5)";
            this.background = "rgb(255, 255, 255)";
            this.foreground = "rgb(50, 50, 50)";
            this.curtain = "rgba(0, 0, 0, 0.1)";
            this.draw_grid();
        } catch (err) { 
            logError("Error gameView::default_colors " + err); 
            return; 
        }
    };

    /**
    Set the retro colors and redraw the grid
    @param {void} Nothing.
    @return {void} Nothing.
    */
    this.retro_colors = function () {
        try {
            // Setup retro colors
            this.alpha_color = "rgb(34, 150, 243)"; // Modern blue
            this.beta_color = "rgb(89, 10, 224)"; // Modern purple
            this.alpha_fill = "rgba(34, 150, 243, 0.5)"; // Modern blue with transparency
            this.beta_fill = "rgba(89, 10, 224, 0.5)"; // Modern purple with transparency
            this.background = "rgb(255, 255, 255)"; // White
            this.foreground = "rgb(50, 50, 50)"; // Dark gray
            this.curtain = "rgba(0, 0, 0, 0.1)"; // Lighter transparency
            this.draw_grid();
        } catch (err) { 
            logError("Error gameView::retro_colors " + err); 
            return; 
        }
    };

    /**
    Set the midnight colors and redraw the grid
    @param {void} Nothing.
    @return {void} Nothing.
    */
    this.midnight_colors = function () {
        try {
            // Setup midnight colors
            this.alpha_color = "rgb(34, 150, 243)"; // Modern blue
            this.beta_color = "rgb(89, 10, 224)"; // Modern purple
            this.alpha_fill = "rgba(34, 150, 243, 0.5)"; // Modern blue with transparency
            this.beta_fill = "rgba(89, 10, 224, 0.5)"; // Modern purple with transparency
            this.background = "rgb(255, 255, 255)"; // White
            this.foreground = "rgb(50, 50, 50)"; // Dark gray
            this.curtain = "rgba(0, 0, 0, 0.1)"; // Lighter transparency
            this.draw_grid();
        } catch (err) { 
            logError("Error gameView::midnight_colors " + err); 
            return; 
        }
    };

    /**
    Set the ruby colors and redraw the grid
    @param {void} Nothing.
    @return {void} Nothing.
    */
    this.ruby_colors = function () {
        try {
            // Setup ruby colors
            this.alpha_color = "rgb(34, 150, 243)"; // Modern blue
            this.beta_color = "rgb(89, 10, 224)"; // Modern purple
            this.alpha_fill = "rgba(34, 150, 243, 0.5)"; // Modern blue with transparency
            this.beta_fill = "rgba(89, 10, 224, 0.5)"; // Modern purple with transparency
            this.background = "rgb(255, 255, 255)"; // White
            this.foreground = "rgb(50, 50, 50)"; // Dark gray
            this.curtain = "rgba(0, 0, 0, 0.1)"; // Lighter transparency
            this.draw_grid();
        } catch (err) { 
            logError("Error gameView::ruby_colors " + err); 
            return; 
        }
    };

    /**
    Draw the the grid and save it.
    @param {void} Nothing.
    @return {void} Nothing.
    */
    this.draw_grid = function () {
        try {
            var i, x, y, r;

            // Clear canvas
            this.context.fillStyle = this.background;
            this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

            // Draw dots
            this.context.beginPath();
            this.context.fillStyle = this.foreground;
            this.context.strokeStyle = this.foreground;

            // Change the size of the dots depending on the size
            if (this.state.size < 5) {
                r = 8;
            } else if (this.state.size < 8) {
                r = 6;
            } else if (this.state.size < 12) {
                r = 4;
            } else {
                r = 2;
            }

            // Draw all the dots
            this.context.lineWidth = 1;
            for (i = 0; i < this.state.dots.length; i += 1) {
                x = this.state.dots[i].x;
                y = this.state.dots[i].y;
                this.context.moveTo(x, y);
                this.context.arc(x, y, r, 0, 2 * Math.PI, false);
                this.context.fill();
            }
            this.context.stroke();

            // Save this image for later
            this.myImageData = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
        } catch (err) { 
            logError("Error gameView::draw_grid " + err); 
            return; 
        }
    };

    /**
    Draw the board based on current state
    @param {void} Nothing.
    @return {void} Nothing.
    */
    this.update = function () {
        try {
            var i, x, y, width, height;

            // If no context is found then don't draw anything
            if (this.context === undefined) {
                return;
            }

            // Blit the dots on quickly
            this.context.putImageData(this.myImageData, 0, 0);

            // Draw the full squares by the color of the scoring player
            for (i = 0; i < this.state.squares.length; i += 1) {
                if (this.state.squares[i].sides === 4) {
                    if (this.state.squares[i].alpha_point) {
                        this.context.fillStyle = this.alpha_fill;
                    } else {
                        this.context.fillStyle = this.beta_fill;
                    }

                    x = this.state.squares[i].x;
                    y = this.state.squares[i].y;
                    width = this.state.squares[i].width;
                    height = this.state.squares[i].height;

                    this.context.fillRect(x, y, width, height);
                }
            }
            
            for (i = 0; i < this.state.lines.length; i += 1) {
                if (this.state.lines[i].connected) {
                    this.context.beginPath();
                    if (this.state.lines[i].alpha_point) {
                        this.context.strokeStyle = this.alpha_color;
                    } else {
                        this.context.strokeStyle = this.beta_color;
                    }
                    if (this.state.lines[i].alpha.ID === this.last_move[0] && this.state.lines[i].beta.ID === this.last_move[1]) {
                        this.context.lineWidth = 8;
                    } else if (this.state.lines[i] === click_line) {
                        this.context.lineWidth = 8;
                    } else {
                        this.context.lineWidth = 4;
                    }
                    x = this.state.lines[i].alpha.x;
                    y = this.state.lines[i].alpha.y;
                    this.context.moveTo(x, y);

                    x = this.state.lines[i].beta.x;
                    y = this.state.lines[i].beta.y;
                    this.context.lineTo(x, y);

                    this.context.stroke();
                }
            }

            // Draw a semi transparent curtain if ai's turn
            if (!this.enabled) {
                this.context.fillStyle = this.curtain;
                this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
                //dom_loading.style.display = "block";
            }// else {
                //dom_loading.style.display = "none";
            //}

            dom_alpha_score.innerHTML = this.logic.alpha_score;
            dom_beta_score.innerHTML = this.logic.beta_score;
            //dom_turn.innerHTML = this.logic.turn;
            //dom_match.innerHTML = this.logic.match + 1;
            engine.redraw = true;
        } catch (err) { 
            logError("Error gameView::draw_grid " + err); 
            return; 
        }
    };
    this.init();
}/** 
A class for representing a dot on the board 
@class hardDot 
@param  {number} ID The ID number of the created dot 
@return {void} Nothing 
*/
function hardDot(ID) { 
    // Optional parameter default to 0 
    if (ID === undefined) { this.ID = 0; } else { this.ID = ID; } 
  
    /** 
    Initlization code for the dot class. 
    @param {void} Nothing. 
    @return {void} Nothing. 
    */
    this.init = function () { 
        try { 
            this.connects = []; 
        } catch (err) { 
            logError("Error hardDot::init " + err); 
            return; 
        } 
    }; 
  
    /** 
    Returns a human readable string of the dot. 
    @param {void} Nothing. 
    @return {string} Returns a human readable string of the dot. 
    */
    this.toString = function () { 
        return "(hardDot #" + this.ID + ")"; 
    }; 
  
    this.init(); 
} 
  
/** 
A class for representing a connection on the board 
@class hardLine 
@param  {hardDot} alpha The the first dot object in the line 
@param  {hardDot} beta The the second dot object in the line 
@return {void} Nothing 
*/
function hardLine(alpha, beta) { 
    // Optional parameter default to 0 
    if (alpha === undefined) { this.alpha = new hardDot(); } else { this.alpha = alpha; } 
    if (beta === undefined) { this.beta = new hardDot(); } else { this.beta = beta; } 
  
    /** 
    Initlization code for the line class. 
    @param {void} Nothing. 
    @return {void} Nothing. 
    */
    this.init = function () { 
        try { 
            this.connects = []; 
  
            // Record this connections in each of the dots 
            this.alpha.connects.push(this); 
            this.beta.connects.push(this); 
  
            // The score of this connection 
            this.score = 0; 
            this.chain_link = undefined; 
            this.connected = false; 
        } catch (err) { 
            logError("Error hardLine::init " + err); 
            return; 
        } 
    }; 
  
    /** 
    Returns a human readable string of the connection. 
    @param {void} Nothing. 
    @return {string} Returns a human readable string of the connection. 
    */
    this.toString = function () { 
        return "(hardLine alpha = " + this.alpha.ID + ", beta = " + this.beta.ID + ")"; 
    }; 
  
    this.init(); 
} 
  
/** 
A class for representing a square on the board 
@class hardSquare 
@param  {hardLine} top The the top connection object in the square 
@param  {hardLine} left The the left connection object in the square 
@param  {hardLine} bottom The the bottom connection object in the square 
@param  {hardLine} right The the right connection object in the square 
@return {void} Nothing 
*/
function hardSquare(top, left, bottom, right) { 
    // Optional parameter default to 0 
    if (top === undefined) { this.top = new hardLine(); } else { this.top = top; } 
    if (left === undefined) { this.left = new hardLine(); } else { this.left = left; } 
    if (bottom === undefined) { this.bottom = new hardLine(); } else { this.bottom = bottom; } 
    if (right === undefined) { this.right = new hardLine(); } else { this.right = right; } 
  
    /** 
    Initlization code for the square class. 
    @param {void} Nothing. 
    @return {void} Nothing. 
    */
    this.init = function () { 
        try { 
            // Record this square in each of the lines 
            this.top.connects.push(this); 
            this.left.connects.push(this); 
            this.bottom.connects.push(this); 
            this.right.connects.push(this); 
  
            this.sides = 0; 
        } catch (err) { 
            logError("Error hardSquare::init " + err); 
            return; 
        } 
    }; 
  
    /** 
    Returns a human readable string of the square. 
    @param {void} Nothing. 
    @return {string} Returns a human readable string of the square. 
    */
    this.toString = function () { 
        return "(hardSquare top " + this.top + " left " + this.left + " bottom " + this.bottom + " right " + this.right + ")"; 
    }; 
  
    this.init(); 
}

/** 
A class for representing a chain on the board 
@class hardChain 
@param  {Array} chain_list The list of the lines in the chain. 
@return {void} Nothing 
*/
function hardChain(chain_list) { 
    // Optional parameter default to 0 
    if (chain_list === undefined) { this.list = []; } else { this.list = chain_list; } 
  
    /** 
    Initlization code for the chain class. 
    @param {void} Nothing. 
    @return {void} Nothing. 
    */
    this.init = function () { 
        try { 
            var i, j, opened; 
  
            // Make the chain length - 1 then number of lines in the chain 
            this.size = this.list.length - 1; 
            this.ends = false; 
  
            // Count the number of edges in this list 
            for (i = 0; i < this.list.length; i += 1) { 
                opened = false; 
                for (j = 0; j < this.list[i].connects.length; j += 1) { 
                    if (this.list[i].connects[j].sides < 2) { 
                        opened = true; 
                    } 
                } 
                if (this.list[i].connects.length === 1 || opened) { 
                    this.ends = true; 
                } 
            } 
  
            // If a open chain score by size 
            if (this.ends || this.size === 1) { 
                this.score = this.size; 
            // If an closed chain score 2 no matter what 
            } else { 
                this.score = 2; 
            } 
        } catch (err) { 
            logError("Error hardChain::init " + err); 
            return; 
        } 
    }; 
}

/**
A class for representing the game hardBotState
@class hardBotState
@param    {number} size The height and width of game board
@return    {void} Nothing
*/
function hardBotState(size) {
    // Optional parameter default to 10
    if (size === undefined) { this.size = 10; } else { this.size = size; }
    /**
    Initlization code for the hardBotState class.
    @param {void} Nothing.
    @return {void} Nothing.
    */
    this.init = function () {
        try {
            // Local variables
            var i = 0, x = 0, y = 0, top, left, bottom, right, temp;

            // Some common math conversions
            this.range = this.size - 1;
            this.squared = this.size * this.size;

            // The valid and made moves
            this.valid_moves = [];
            this.connections = [];
            this.history = [];

            // The dots, lines and squares of the board
            this.lines = [];
            this.dots = [];
            this.squares = [];
            this.chains = [];

            this.score_sides = [2, 1, -1, 10];
            this.turn = 0;
            this.started = true;
            this.chain_move = false;
            this.end_game = false;
            this.long_chains = 0;
            this.total_score = 0;
            this.my_score = 0;
            this.enemy_score = 0;

            // Create the dots        
            for (i = 0; i < this.squared; i += 1) {
                this.dots.push(new hardDot(i + 1));
            }

            // Create the lines
            for (i = 0; i < this.squared; i += 1) {
                x = i % this.size;
                y = Math.floor(i / this.size);

                // Test for out of bounds x range
                if (x !== this.range) {
                    temp = new hardLine(this.dots[i], this.dots[i + 1]);
                    this.lines.push(temp);
                    this.valid_moves.push(temp);
                }

                // Test for out of bounds y range
                if (y !== this.range) {
                    temp = new hardLine(this.dots[i], this.dots[i + this.size]);
                    this.lines.push(temp);
                    this.valid_moves.push(temp);
                }
            }

            // Create the squares        
            for (i = 0; i < this.squared; i += 1) {
                x = i % this.size;
                y = Math.floor(i / this.size);

                // Test for out of bounds
                if (x !== this.range && y !== this.range) {
                    top = this.find_connection(i, i + 1);
                    left = this.find_connection(i, i + this.size);
                    bottom = this.find_connection(i + this.size, i + this.size + 1);
                    right = this.find_connection(i + 1, i + this.size + 1);

                    this.squares.push(new hardSquare(top, left, bottom, right));
                }
            }
        } catch (err) {
            logError("Error hardBotState::init " + err);
            return;
        }
    };

    /**
    Reset code for the bot class.
    @param {void} Nothing.
    @return {void} Nothing.
    */
    this.reset = function () {
        try {
            var i;
            this.turn = 0;
            this.connections.length = 0;
            this.valid_moves.length = 0;

            // Reset valid moves
            for (i = 0; i < this.lines.length; i += 1) {
                this.valid_moves.push(this.lines[i]);
            }

            // Reset the chains
            this.chains.length = 0;
            this.long_chains = 0;
            this.chain_move = false;

            // Reset score
            this.total_score = 0;
            this.my_score = 0;
            this.enemy_score = 0;

            this.count_sides();
            return;
        } catch (err) {
            logError("Error hardBotState::reset " + err);
            return;
        }
    };

    /**
    Update the state by what was passed in.
    @param {Object} board The data to update from.
    @return {void} Nothing.
    */
    this.update = function (board) {
        try {
            // Local variables
            var i, tmpArray, findRef;

            // Get the turn count
            this.turn = board.connections.length;
            if (this.turn === 0) { this.started = true; }
            if (this.turn === 1) { this.started = false; }

            // Sync the current valid moves to the board
            this.valid_moves.length = 0;
            for (i = 0; i < board.valid_moves.length; i += 1) {
                tmpArray = board.valid_moves[i];
                findRef = this.find_connection(tmpArray[0] - 1, tmpArray[1] - 1);
                if (findRef !== undefined) {
                    // Reset the line and add it to our state
                    findRef.connected = false;
                    findRef.chain_link = undefined;
                    this.valid_moves.push(findRef);
                }
            }

            // Sync the current connections to the board
            this.connections.length = 0;
            for (i = 0; i < board.connections.length; i += 1) {
                tmpArray = board.connections[i];
                findRef = this.find_connection(tmpArray[0] - 1, tmpArray[1] - 1);
                if (findRef !== undefined) {
                    // Reset the line and add it to our state
                    findRef.connected = true;
                    findRef.chain_link = undefined;
                    this.connections.push(findRef);
                }
            }

            // Reset the chains
            this.chains.length = 0;
            this.long_chains = 0;

            // Correct the square count of sides
            this.count_sides();

            // Calculate score knowing my score and total score
            this.total_score = this.count_squares();
            this.enemy_score = this.total_score - this.my_score;

            return;
        } catch (err) {
            logError("Error hardBotState::update " + err);
            return;
        }
    };

    /**
    Count the number of sides for each square
    @param {void} Nothing.
    @return {void} Nothing.
    */
    this.count_sides = function () {
        try {
            var i, j;

            // Clear squares sides
            for (i = 0; i < this.squares.length; i += 1) {
                this.squares[i].sides = 0;
            }

            // Count new sides
            for (i = 0; i < this.connections.length; i += 1) {
                for (j = 0;  j < this.connections[i].connects.length; j += 1) {
                    this.connections[i].connects[j].sides += 1;
                }
            }
        } catch (err) {
            logError("Error hardBotState::count_sides " + err);
            return;
        }
    };

    /**
    Count the number of full squares
    @param {void} Nothing.
    @return {void} Returns the total number of full squares.
    */
    this.count_squares = function () {
        try {
            var i, count = 0;
            // Clear squares sides
            for (i = 0; i < this.squares.length; i += 1) {
                if (this.squares[i].sides === 4) {
                    count += 1;
                }
            }
            return count;
        } catch (err) {
            logError("Error hardBotState::count_sides " + err);
            return 0;
        }
    };

    /**
    Counts all the open loop chains over the length of 3
    @param {void} Nothing.
    @return {void} Nothing.
    */
    this.count_chains = function () {
        try {
            var i;
            for (i = 0; i < this.chains.length; i += 1) {
                if (this.chains[i].size >= 3 && this.chains[i].ends) {
                    this.long_chains += 1;
                }
            }
            //logDebug("Counted " + this.long_chains + " long chains");            
        } catch (err) {
            logError("Error hardBotState::count_chains " + err);
            return;
        }
    };

    /**
    If every square has to or more square we are in end game
    @param {void} Nothing.
    @return {void} Nothing.
    */
    this.check_end_game = function () {
        try {
            var i, j, point;
            this.end_game = true;
            for (i = 0; i < this.lines.length; i += 1) {
                point = false;
                for (j = 0; j < this.lines[i].connects.length; j += 1) {
                    if (this.lines[i].connects[j].sides >= 2) {
                        point = true;
                    }
                }
                if (!point) {
                    this.end_game = false;
                }
            }
        } catch (err) {
            logError("Error hardBotState::check_end_game " + err);
            return;
        }
    };

    /**
    Apply a line for internal moves.
    @param {line} move the line passed in to be moved.
    @return {void} Nothing.
    */
    this.add_score = function (move) {
        try {
            var i, test_line;
            test_line = this.valid_moves[move];

            // Check how many points this move gives me
            for (i = 0;  i < test_line.connects.length; i += 1) {
                if (test_line.connects[i].sides === 3) {
                    this.my_score += 1;
                }
            }
            return;
        } catch (err) {
            logError("Error hardBotState::apply_line " + err);
            return;
        }
    };

    /**
    Apply a line for internal moves.
    @param {line} move the line passed in to be moved.
    @return {void} Nothing.
    */
    this.apply_line = function (move) {
        try {
            var i;
            move.connected = true;
            for (i = 0;  i < move.connects.length; i += 1) {
                move.connects[i].sides += 1;
            }
            return;
        } catch (err) {
            logError("Error hardBotState::apply_line " + err);
            return;
        }
    };

    /**
    Remove a line for internal moves.
    @param {line}  move the line passed in to be moved.
    @return {void} Nothing.
    */
    this.undo_line = function (move) {
        try {
            var i;
            move.connected = false;
            for (i = 0;  i < move.connects.length; i += 1) {
                move.connects[i].sides -= 1;
            }
            return;
        } catch (err) {
            logError("Error hardBotState::undo_line " + err);
            return;
        }
    };

    /*
    Looks ahead to see more many chains are left
    @param {line} start_line The line to start exploring from.
    @param {int} count The current count of moves left.
    @return {int} The number of found moves.
    */
    this.look_ahead = function (start_line, count) {
        try {
            var i, test_side, max_count = count;

            // Internally add the line to this state
            this.apply_line(start_line);

            // Go through the connected square and see if the chain continues
            for (i = 0;  i < this.squares.length; i += 1) {
                if (this.squares[i].sides === 3) {
                    // Find which line is not connected
                    if (!this.squares[i].top.connected) { test_side = this.squares[i].top; }
                    if (!this.squares[i].left.connected) { test_side = this.squares[i].left; }
                    if (!this.squares[i].bottom.connected) { test_side = this.squares[i].bottom; }
                    if (!this.squares[i].right.connected) { test_side = this.squares[i].right; }

                    max_count = this.look_ahead(test_side, max_count + 1);
                    break;
                }
            }

            // Internally undo the line to this state
            this.undo_line(start_line);
            return max_count;
        } catch (err) {
            logError("Error hardBotState::look_ahead " + err);
            return 0;
        }
    };

    /*
    Check all the chains currently 
    @param {hardLine} start_line the line to start exploring from.
    @return {void} Nothing.
    */
    this.traverse_chain = function (start_line) {
        try {
            var i, test_square, test_side;

            // Internally add the line to this state
            this.apply_line(start_line);

            // Go through the connected square and see if the chain continues
            for (i = 0;  i < start_line.connects.length; i += 1) {
                test_square = start_line.connects[i];
                //logDebug("Testing square "+ test_square + " sides" + test_square.sides);
                if (test_square.sides === 3) {
                    // Find which line is not connected
                    if (!test_square.top.connected) { test_side = test_square.top; }
                    if (!test_square.left.connected) { test_side = test_square.left; }
                    if (!test_square.bottom.connected) { test_side = test_square.bottom; }
                    if (!test_square.right.connected) { test_side = test_square.right; }

                    // Save this line and traverse farther
                    this.history.push(test_side);
                    this.traverse_chain(test_side);
                }
            }

            // Internally undo the line to this state
            this.undo_line(start_line);
            return;
        } catch (err) {
            logError("Error hardBotState::traverse_chain " + err);
            return;
        }
    };

    /**
    Find all of the chains on the board
    @param {void} Nothing.
    @return {void} Nothing.
    */
    this.find_chain = function () {
        try {
            var i, j, found, new_chain;

            // Go through every connection and look for a chain
            for (i = 0; i < this.valid_moves.length; i += 1) {
                found = false;

                // Look for any potential chains for the enemy
                for (j = 0;  j < this.valid_moves[i].connects.length; j += 1) {
                    if (this.valid_moves[i].connects[j].sides === 2) { found = true; }
                }

                // If a potential chain has been found and we have explored it yet
                if (found && this.valid_moves[i].chain_link === undefined) {
                    // Clear history an add this line
                    this.history = [];
                    this.history.push(this.valid_moves[i]);

                    // Traverse the chain
                    this.traverse_chain(this.valid_moves[i]);

                    // Add the chain to the chain list
                    new_chain = new hardChain(this.history);
                    this.chains.push(new_chain);

                    // Record the chains length for every line in the chain 
                    for (j = 0;  j < this.history.length; j += 1) {
                        this.history[j].chain_link = new_chain;
                    }
                }
            }
        } catch (err) {
            logError("Error hardBotState::find_chain " + err);
            return;
        }
    };

    /**
    Score all the moves in the connections array
    @param {void} Nothing.
    @return {void} Nothing.
    */
    this.score_moves = function () {
        try {
            var i, j, score, use_chain;

            // Go through every connection
            for (i = 0; i < this.valid_moves.length; i += 1) {
                score = 0;
                use_chain = true;

                // Go through each square
                for (j = 0;  j < this.valid_moves[i].connects.length; j += 1) {
                    if (this.valid_moves[i].connects[j].sides === 3) { use_chain = false; }
                    score += this.score_sides[this.valid_moves[i].connects[j].sides];
                }

                // Subtract chain length if a chain start
                if (use_chain && this.valid_moves[i].chain_link !== undefined) {
                    score -= this.valid_moves[i].chain_link.score;
                }

                // Add some "fuzz" to the score to help tie breakers
                score += Math.random() * 0.1;

                // Record score
                this.valid_moves[i].score = score;
            }
        } catch (err) {
            logError("Error hardBotState::score_moves " + err);
            return;
        }
    };

    /**
    Returns the best score of the lot
    @param {void} Nothing.
    @return {int} The index valid of the best move
    */
    this.best_move = function () {
        try {
            var i, best = 0, highest = -9999;
            // Go through every connection
            for (i = 0; i < this.valid_moves.length; i += 1) {
                // Save the highest score
                if (this.valid_moves[i].score > highest) {
                    highest = this.valid_moves[i].score;
                    best = i;
                }
            }

            // Return the valid move number
            return best;
        } catch (err) {
            // Return first valid move
            logError("Error hardBotState::best_move " + err);
            return 0;
        }
    };

    /**
    Checks if it's appropriate to doublecross the opponent
    @param {int} The index valid of the old best move
    @return {int} The index valid of the new best move
    */
    this.double_cross = function (old_best) {
        try {
            var i, new_line, new_best, test_line, test_moves, moves_left;
            new_best = old_best;

            // If there is only two moves left then just return old best
            if (this.valid_moves.length <= 2) {return old_best; }

            if (this.chain_move && this.end_game) {
                // Count how many moves are left in this chain
                moves_left = this.look_ahead(this.valid_moves[old_best], 1);
                test_line = this.valid_moves[old_best];

                // If there are only two move left try a double cross
                if (moves_left <= 2 && test_line.connects.length === 2) {
                    // Collect all the surrounding lines in test_moves array
                    test_moves = [];
                    test_moves.push(test_line.connects[0].top);
                    test_moves.push(test_line.connects[0].left);
                    test_moves.push(test_line.connects[0].bottom);
                    test_moves.push(test_line.connects[0].right);
                    test_moves.push(test_line.connects[1].top);
                    test_moves.push(test_line.connects[1].left);
                    test_moves.push(test_line.connects[1].bottom);
                    test_moves.push(test_line.connects[1].right);

                    // Search thought all moves for both squares
                    for (i = 0; i < test_moves.length; i += 1) {
                        // Look for the other available move to double cross the enemy
                        if (!test_moves[i].connected && test_moves[i] !== test_line) {
                            new_line = test_moves[i];
                            break;
                        }
                    }

                    // Search for new move in the list
                    for (i = 0; i < this.valid_moves.length; i += 1) {
                        // If the new move was found update the valid move index and return
                        if (this.valid_moves[i] === new_line) {
                            new_best = i;
                            break;
                        }
                    }
                    this.chain_move = false;
                }
            } else {
                // If a chain of more then 2 is starting then set the chain move flag
                if (this.valid_moves[old_best].chain_link !== undefined) {
                    if (this.valid_moves[old_best].chain_link.size > 2) {
                        this.chain_move = true;
                    }
                }
            }

            return new_best;
        } catch (err) {
            // Return first valid move
            logError("Error hardBotState::double_cross " + err);
            return old_best;
        }
    };

    /**
    Find the connection based off of the two passed ID's
    @param    {number} alpha_ID The the first dot ID in the connection.
    @param    {number} beta_ID The the second dot ID in the connection.
    @return {object} Returns the connection if found and undefined otherwise.
    */
    this.find_connection = function (alpha_ID, beta_ID) {
        try {
            // Find the dot by index
            var i, j, alpha = this.dots[alpha_ID], beta = this.dots[beta_ID];

            // Find a common connection between both dots
            for (i = 0; i < alpha.connects.length; i += 1) {
                for (j = 0; j < beta.connects.length; j += 1) {
                    if (alpha.connects[i] === beta.connects[j]) {
                        // Found return the connection
                        return alpha.connects[i];
                    }
                }
            }
            // Not found return undefined
            return undefined;
        } catch (err) {
            logError("Error hardBotState::find_conection " + err);
            return undefined;
        }
    };

    /**
    Returns a human readable string of the hardBotState.
    @param {void} Nothing.
    @return {string} Returns a human readable string of the hardBotState.
    */
    this.toString = function () {
        return "(Board Size = " + this.size + ", Turn = " + this.turn + ", My Score = " + this.my_score + ", Enemy Score = " + this.enemy_score + ")";
    };

    this.init();
}

/**
A class for my bot
@class hardAI
@param    {number} size The height and width of game board
@return    {void} Nothing
*/
function hardAI() {
    /**
    Initlization code for the bot class.
    @param {void} Nothing.
    @return {void} Nothing.
    */
    this.init = function () {
        try {
            //logDebug("Init" + this);
            this.state = new hardBotState(this.size);
        } catch (err) {
            logError("Error hardAI::init " + err);
            return;
        }
    };

    /**
    Reset code for the bot class.
    @param {void} Nothing.
    @return {void} Nothing.
    */
    this.reset = function () {
        try {
            //logDebug("Reset" + this);
            this.state.reset();
        } catch (err) {
            logError("Error hardAI::reset " + err);
            return;
        }
    };

    /**
    Called by the game logic when it's the bots turn to make a move
    @param {object} board The board reference .
    @return {Array} Returns an array of.
    */
    this.move = function (board) {
        try {
            var turn_start, best;
            turn_start = getTick();

            // Reset init is size changes
            if (this.size !== logic.size) {
                this.size = logic.size;
                this.init();
            }

            //logDebug("---------------------- Turn #" + this.state.turn + " ----------------------");

            // Reset if the valid moves are more then before
            if (board.valid_moves.length > this.state.valid_moves.length) {
                this.reset();
            }

            // Update our state to match the board
            this.state.update(board);

            // Check if we are in the end game
            this.state.check_end_game();

            // Score the size of the chain to prefer smaller chains and cycles first
            this.state.find_chain();
            this.state.count_chains();

            // Score all of the moves
            this.state.score_moves();

            // Find the best move
            best = this.state.best_move();

            // Check if there is a double cross
            best = this.state.double_cross(best);

            // Check if this move adds to my score
            this.state.add_score(best);

            //logDebug("Turn took " + (getTick() - turn_start) + " milliseconds.");
            //logDebug("Bot state: " + this.state.toString());

            // Return the best move back to the engine
            return board.valid_moves[best];
        } catch (err) {
            logError("Error hardAI::move " + err);
            return undefined;
        }
    };

    /**
    Returns a human readable string of the board.
    @param {void} Nothing.
    @return {string} Returns a human readable string of the board.
    */
    this.toString = function () {
        return "(Hard AI)";
    };
}/**
A class for representing a connection on the board
@class Line
@param    {object} alpha The the first Dot object in the Line
@param    {object} beta The the second Dot object in the Line
@return   {void} Nothing
*/
function Line(alpha, beta) {
    // Optional parameter default to 0
    if (alpha === undefined) { this.alpha = new Dot(); } else { this.alpha = alpha; }
    if (beta === undefined) { this.beta = new Dot(); } else { this.beta = beta; }

    /**
    Initlization code for the Line class.
    @param {void} Nothing.
    @return {void} Nothing.
    */
    this.init = function () {
        try {
            this.x = 0;
            this.y = 0;
            this.alpha_point = true;
            this.connected = false;
            this.connects = [];
            // Record this connections in each of the dots
            this.alpha.connects.push(this);
            this.beta.connects.push(this);
        } catch (err) {
            logError("Error Line::init " + err);
            return;
        }
    };

    /**
    Returns a human readable string of the connection.
    @param {void} Nothing.
    @return {string} Returns a human readable string of the connection.
    */
    this.toString = function () {
        return "(Line alpha = " + this.alpha.ID + ", beta = " + this.beta.ID + ")";
    };
    this.init();
}
/**
Safe debug logging
@class logDebug
@param  {string} passStr The debug string to print out to the console
@return {void} Nothing
*/
function logDebug(passStr) {
	if (typeof console !== 'undefined' && DEBUG_MODE) {
		console.log(passStr);
	}
}

/**
Safe error logging
@class logError
@param  {string} passStr The debug string to print out to the console
@return {void} Nothing
*/
function logError(passStr) {
	if (typeof console !== 'undefined') {
		console.error(passStr);
	}
}// Constant variables
var DEBUG_MODE = true;

// DOM Varibles 
var dom_game_area, dom_message_box, dom_message_text, dom_board_size, dom_select_size, dom_theme, dom_select_theme, dom_css, dom_alpha_list, dom_beta_list;
var dom_resume_button, dom_history, dom_history_panel, dom_options_panel, dom_howTo_panel, dom_menu_panel, dom_alpha_panel, dom_alpha_name, dom_alpha_score, dom_beta_panel, dom_beta_name, dom_beta_score;

// Share varibles
var engine, logic, view, current_line, click_line, board_size = 5;
var easyBot, mediumBot, hardBot, expertBot, masterBot;
var theme = "Default", loading = false;

/**
Returns the number of milliseconds since 1/1/1970
@class getTick
@param  {void} Nothing
@return {int} Number of milliseconds since 1/1/1970
*/
function getTick() {
    try {
        var currentTime = new Date();
        return currentTime.getTime();
    } catch (err) {
        logError("Error getTick " + err);
        return 0;
    }
}

/**
Covert an object to an array
@class convertArray
@param  {object} objArray An array created an rhino on rails
@return {Array} A two element array with the values into them
*/
function convertArray(objArray) {
    try {
        var i, strString, splitArray;

        // Use the toString to get the value of object 
        strString = String(objArray.toString());

        // Take off the open and close square bracket
        strString = strString.substring(1, strString.length - 1);

        // Split the object by commas
        splitArray = strString.split(",");

        // Convert array of strings to array of ints
        for (i = 0; i < splitArray.length; i += 1) {
            splitArray[i] = parseInt(splitArray[i], 10);
        }

        return splitArray;
    } catch (err) {
        logError("Error convertArray " + err);
        return [];
    }
}

/**
Called by one of the AI's when a move has been chosen
@param {event} evt - The data and type of event.
@return {void} Nothing.
*/
function recieve_message(evt) {
    try {
        if (dom_message_box.style.display === "none" &&
            dom_options_panel.style.display === "none" &&
            dom_howTo_panel.style.display === "none" &&
            dom_history_panel.style.display === "none" &&
            dom_menu_panel.style.display === "none") {
            var retArray, turn_score;
            logic.thinking = false;

            // Read message and take the last element off 
            retArray = convertArray(evt);
            retArray.length = 2;

            // Erase invalid history if we are in the past and a new move was made
            view.last_move = retArray;
            if (logic.history.length !== (logic.turn - 1)) { 
                logic.erase_history();
                //logic.turn += 1;
            }
            // Find out who's turn it is
            if (logic.alpha_turn) {
                // Make the move for alpha bot
                turn_score = logic.state.score_move(retArray, logic.alpha_turn);
                logic.alpha_score += turn_score;
                logic.add_history(retArray);
                // If the current player didn't score swap turns
                if (turn_score === 0) {
                    //dom_message.innerHTML = logic.beta_name + "'s turn!";
                    logic.alpha_turn = false;
                }
            } else if (!logic.alpha_turn) {
                // Make the move for beta bot
                turn_score = logic.state.score_move(retArray, logic.alpha_turn);
                logic.beta_score += turn_score;
                logic.add_history(retArray);
                // If the current player didn't score swap turns
                if (turn_score === 0) {
                    //dom_message.innerHTML = logic.alpha_name + "'s turn!";
                    logic.alpha_turn = true;
                }
            }
            
            // Apply the move and update the view
            logic.state.apply_move(retArray);
            view.update();
            setTimeout(function goNext() {logic.next_turn();}, 10);
        }
    } catch (err) {
        logError("Error recieve_message " + err);
    }
}

/**
Show the menu
@param {void} Nothing.
@return {void} Nothing.
*/
function showMenu() {
    try {
        //logDebug("Show menu");
        if(logic.turn <= 1 || logic.state.valid_moves.length === 0) {
            dom_resume_button.style.display = "none";
        } else {
            dom_resume_button.style.display = "block";
        }

        dom_message_box.style.display = "none";
        dom_options_panel.style.display = "none";
        dom_howTo_panel.style.display = "none";
        dom_history_panel.style.display = "none";
        dom_menu_panel.style.display = "block";
        view.enabled = false;
        engine.redraw = true;
        
        // Center the main menu
        dom_menu_panel.style.marginLeft = (-dom_menu_panel.scrollWidth / 2) + 'px';
        dom_menu_panel.style.marginTop = (-dom_menu_panel.scrollHeight / 2)  + 'px';
    } catch (err) {
        logError("Error showMenu " + err);
    }
}

/**
Show the menu
@param {void} Nothing.
@return {void} Nothing.
*/
function showHistory() {
    try {
        //logDebug("Show history");
        dom_history_panel.style.display = "block";
        view.enabled = false;
        engine.redraw = true;
        
        // Center the history menu
        dom_history_panel.style.marginLeft = (-dom_history_panel.scrollWidth / 2) + 'px';
        dom_history_panel.style.marginTop = (-dom_history_panel.scrollHeight / 2)  + 'px';
    } catch (err) {
        logError("Error showHistory " + err);
    }
}

/**
Resume a game
@param {void} Nothing.
@return {void} Nothing.
*/
function resumeGame() {
    try {
        //logDebug("Resume game");
        dom_menu_panel.style.display = "none";
        dom_history_panel.style.display = "none";
        dom_message_box.style.display = "none";
        view.enabled = true;
        engine.redraw = true;
        logic.next_turn();
    } catch (err) {
        logError("Error resumeGame " + err);
    }
}

/**
Start a new game
@param {void} Nothing.
@return {void} Nothing.
*/
function newGame() {
    try {
        //logDebug("Start a new game");
        logic.reset();
        dom_menu_panel.style.display = "none";
        dom_history_panel.style.display = "none";
        dom_message_box.style.display = "none";
        view.enabled = true;
        engine.redraw = true;
        logic.next_turn();
    } catch (err) {
        logError("Error newGame " + err);
    }
}

/**
Open the options menu
@param {void} Nothing.
@return {void} Nothing.
*/
function options() {
    try {
        //logDebug("Options");
        dom_options_panel.style.display = "block";
        dom_menu_panel.style.display = "none";

        // Center the options menu
        dom_options_panel.style.marginLeft = (-dom_options_panel.scrollWidth / 2) + 'px';
        dom_options_panel.style.marginTop = (-dom_options_panel.scrollHeight / 2)  + 'px';
    } catch (err) {
        logError("Error options " + err);
    }
}

/**
Open the how to play dialog
@param {string} text - The text displayed.
@return {void} Nothing.
*/
function showMessage(text) {
    try {
        dom_message_text.innerHTML = text;
        dom_message_box.style.display = "block";
        dom_menu_panel.style.display = "none";
        view.enabled = false;
        engine.redraw = true;

        // Center the message box menu
        dom_message_box.style.marginLeft = (-dom_message_box.scrollWidth / 2) + 'px';
        dom_message_box.style.marginTop = (-dom_message_box.scrollHeight / 2)  + 'px';
    } catch (err) {
        logError("Error showMessage " + err);
    }
}

/**
Open the how to play dialog
@param {void} Nothing.
@return {void} Nothing.
*/
function howTo() {
    try {
        //logDebug("How to play");
        dom_howTo_panel.style.display = "block";
        dom_menu_panel.style.display = "none";

        // Center the how to play menu
        dom_howTo_panel.style.marginLeft = (-dom_howTo_panel.scrollWidth / 2) + 'px';
        dom_howTo_panel.style.marginTop = (-dom_howTo_panel.scrollHeight / 2)  + 'px';
    } catch (err) {
        logError("Error howTo " + err);
    }
}

/**
Find the list box entry for the passed value and set list box to that option.
@param {object} listbox - The listbox object to search through.
@param {String} value - The value we are looking for in the listbox.
@return {void} Nothing.
*/
function find_in_list(listbox, value) {
    try {
        var i;
        // Go through every option and set input the any matching thepassed value
        for (i = 0; i < listbox.options.length; i += 1) {
            if (String(value) === listbox.options[i].innerHTML) {
                listbox.selectedIndex = i;
                listbox.options[i].selected = true;
                break;
            }
        }
    } catch (err) {
        logError("Error find_in_list " + err);
    }
}

/**
Called by form when alpha AI changes
@param {void} Nothing.
@return {void} Nothing.
*/
function change_alpha() {
    try {
        var idx, content;

        // Read the selected AI for listbox
        idx = dom_alpha_list.selectedIndex;
        content = dom_alpha_list.options[idx].innerHTML;
        logic.alpha_name = "1st " + content;
        logic.alphaReady = false;
        dom_alpha_name.innerHTML = logic.alpha_name;
        save_to_storage();
        //logDebug("Set Alpha " + logic.alpha_name);

        // If a human then set bot the undefined and wait for move
        if (content === 'Human') {
            logic.alpha_bot = undefined;
            return;
        }

        // If another type of AI the load html page with AI
        if (content === 'Easy AI') {
            logic.alpha_bot = easyBot;
        } else if (content === 'Medium AI') {
            logic.alpha_bot = mediumBot;
        } else if (content === 'Hard AI') {
            logic.alpha_bot = hardBot;
        } else if (content === 'Expert AI') {
            logic.alpha_bot = expertBot;
        } else if (content === 'Master AI') {
            logic.alpha_bot = masterBot;
        }
        
        // If the logic isn't already thinking start the next step
        if (current_line !== undefined) {
            current_line.connected = false;
        }
        current_line = undefined;
    } catch (err) {
        logError("Error change_alpha " + err);
    }
}

/**
Called by form when beta AI changes
@param {void} Nothing.
@return {void} Nothing.
*/
function change_beta() {
    try {
        var idx, content;
        // If the view doesn't exist then return early

        // Read the selected AI for listbox
        idx = dom_beta_list.selectedIndex;
        content = dom_beta_list.options[idx].innerHTML;
        logic.beta_name = "2nd " + content;
        logic.betaReady = false;
        dom_beta_name.innerHTML = logic.beta_name;
        save_to_storage();
        //logDebug("Set Beta " + logic.beta_name);

        // If a human then set bot the undefined and wait for move
        if (content === 'Human') {
            logic.beta_bot = undefined;
            return;
        }

        // If another type of AI the load html page with AI
        if (content === 'Easy AI') {
            logic.beta_bot = easyBot;
        } else if (content === 'Medium AI') {
            logic.beta_bot = mediumBot;
        } else if (content === 'Hard AI') {
            logic.beta_bot = hardBot;
        } else if (content === 'Expert AI') {
            logic.beta_bot = expertBot;
        } else if (content === 'Master AI') {
            logic.beta_bot = masterBot;
        }

        // If the logic isn't already thinking start the next step
        if (current_line !== undefined) {
            current_line.connected = false;
        }
        current_line = undefined;
    } catch (err) {
        logError("Error change_beta " + err);
    }
}

/**
If possible save all the current data to storage for next session.
@param {void} Nothing.
@return {void} Nothing.
*/
function save_to_storage() {
    try {
        var idx, saveAlpha, saveBeta, saveSize, saveTheme;
        if (Storage !== undefined && !loading) {
            // Save alpha bot name
            idx = dom_alpha_list.selectedIndex;
            saveAlpha = dom_alpha_list.options[idx].innerHTML;
            localStorage.setItem("alpha_bot", saveAlpha);

            // Save beta bot name
            idx = dom_beta_list.selectedIndex;
            saveBeta = dom_beta_list.options[idx].innerHTML;
            localStorage.setItem("beta_bot", saveBeta);

            // Save the user size
            saveSize = logic.user_size;
            localStorage.setItem("user_size", saveSize);

            // Save the current theme
            saveTheme = theme;
            localStorage.setItem("theme", saveTheme);
            
            //logDebug("Save alpha_bot ("+saveAlpha+") beta_bot ("+saveBeta+") user_size ("+saveSize+") theme ("+saveTheme+")");
        }
    } catch (err) {
        logError("Error save_to_storage " + err);
    }
}

/**
If possible load all the current data form storage.  Set defaults in case no storage availible.
@param {void} Nothing.
@return {void} Nothing.
*/
function load_from_storage() {
    try {
        var loadAlpha, loadBeta, loadSize, loadTheme;
        theme = "Default";
        board_size = 10;
        loading = true;
        loadAlpha = localStorage.getItem("alpha_bot");
        loadBeta = localStorage.getItem("beta_bot");
        loadSize = localStorage.getItem("user_size");
        loadTheme = localStorage.getItem("theme");

        // Load the alpha bot
        if (loadAlpha) {
            find_in_list(dom_alpha_list, loadAlpha);
            change_alpha();
        }
        // Load the beta bot
        if (loadBeta) {
            find_in_list(dom_beta_list, loadBeta);
            change_beta();
        }
        // Load the board size
        if (loadSize) {
            find_in_list(dom_select_size, loadSize);
            board_size = parseInt(loadSize, 10);
            get_size("" + board_size);
        }
        // Load the theme
        if (loadTheme) {
            find_in_list(dom_select_theme, loadTheme);
            theme = loadTheme;
            set_theme(loadTheme);
        }
        loading = false;
        //logDebug("Load alpha_bot ("+loadAlpha+") beta_bot ("+loadBeta+") user_size ("+loadSize+") theme ("+loadTheme+")");
    } catch (err) {
        logError("Error load_from_storage " + err);
    }
}

/**
Called by form when user changes the current history location.
@param {void} Nothing.
@return {void} Nothing.
*/
function change_history() {
    try {
        // Show the select move in the view
        var idx = dom_history.selectedIndex;
        logic.show_history(idx);
    } catch (err) {
        logError("Error change_history " + err);
    }
}

/**
Called by form when user changes the current size of the board.
@param {void} Nothing.
@return {void} Nothing.
*/
function get_size(string_size) {
    try {
        //logDebug("Set Size " + string_size);
        // If the view doesn't exist then return early
        if (view === undefined) {
            return;
        }

        logic.reset();
        logic.user_size = parseInt(string_size, 10);
        dom_board_size.innerHTML = logic.user_size + " x " + logic.user_size;
        save_to_storage();

        // Get rid of old variables
        current_line = undefined;
        click_line = undefined;

        // Start new logic
        logic = new gameLogic(logic.user_size);

        // Attach new logic to view
        view.logic = logic;
        view.state = logic.state;

        // Run the init again and update view
        view.init();
        view.update();

        // Setup new AI's
        change_alpha();
        change_beta();
    } catch (err) {
        logError("Error get_size " + err);
    }
}

/**
Called by form when user changes the current theme of the page.
@param {void} Nothing.
@return {void} Nothing.
*/
function set_theme(string_theme) {
    try {
        //logDebug("Set Theme " + string_theme);
        // If the view doesn't exist then return early
        if (view === undefined) {
            return;
        }
        theme = string_theme;
        dom_theme.innerHTML = theme;

        // Set the colors based on the theme
        if (theme === "Default") {
            view.default_colors();
            dom_css.href = 'default.css';
        } else if (theme === "Retro") {
            view.retro_colors();
            dom_css.href = 'retro.css';
        } else if (theme === "Midnight") {
            view.midnight_colors();
            dom_css.href = 'midnight.css';
        } else if (theme === "Ruby") {
            view.ruby_colors();
            dom_css.href = 'ruby.css';
        }
        save_to_storage();
        view.update();
    } catch (err) {
        logError("Error get_size " + err);
    }
}


/**
Ran once all of the page has been loaded.
@param {void} Nothing.
@return {void} Nothing.
*/
window.onload = function () {
    try {
        // Save DOM varibles for later 
        dom_alpha_panel = document.getElementById("alphaPanel");
        dom_alpha_name = document.getElementById("alpha_name");
        dom_alpha_score = document.getElementById("alpha_score");
        dom_beta_panel = document.getElementById("betaPanel");
        dom_beta_name = document.getElementById("beta_name");
        dom_beta_score = document.getElementById("beta_score");
        dom_menu_panel = document.getElementById("menuPanel");
        dom_howTo_panel = document.getElementById("howToPanel");
        dom_options_panel = document.getElementById("optionsPanel");
        dom_resume_button = document.getElementById("resumeButton");
        dom_game_area = document.getElementById('gameArea');
        dom_board_size = document.getElementById("board_size");
        dom_select_size = document.getElementById("size");
        dom_theme = document.getElementById("board_theme");
        dom_select_theme = document.getElementById("theme");
        dom_css = document.getElementById('css1');
        dom_alpha_list = document.getElementById("alpha_list");
        dom_beta_list = document.getElementById("beta_list");
        dom_history = document.getElementById("history");
        dom_history_panel = document.getElementById("historyList");
        dom_message_box = document.getElementById("messageBox");
        dom_message_text = document.getElementById("messageText"); 
        
        dom_message_box.style.display = "none";
        dom_menu_panel.style.display = "none";
        dom_howTo_panel.style.display = "none";
        dom_options_panel.style.display = "none";
        dom_history_panel.style.display = "none";
        
        // Create the AI's
        easyBot = new easyAI();
        easyBot.init();
        mediumBot = new mediumAI();
        mediumBot.init();
        hardBot = new hardAI();
        hardBot.init();
        expertBot = new expertAI();
        expertBot.init();
        masterBot = new masterAI();
        masterBot.init();
        
        var game = new gameManager();
        engine = new vortexEngine(8, 8);
        engine.init(game);

        load_from_storage();
        loading = true;
        change_alpha();
        change_beta();
        loading = false;
        showMenu();
    } catch (err) {
        logError("Error window::onload " + err);
    }
}// Constant variables
var MASTER_DOUBLES_ARRAY = [1, 2, -3, 25];
var MASTER_SINGLES_ARRAY = [2, 1, -3, 25];
var MASTER_EXTEND = 0.5;
var MASTER_ENDS = 2;
var MASTER_EDGE = 0.1;
var MASTER_CYCLE = 2.3;
var MASTER_QUAD = 2.6;
var MASTER_DOUBLE_CROSS = 1;
var MASTER_CHAINS = 5;
var MASTER_MIDDLE = 7;

/** 
A class for representing a dot on the board 
@class masterDot 
@param  {number} ID The ID number of the created dot 
@return {void} Nothing 
*/
function masterDot(ID) { 
    // Optional parameter default to 0 
    if (ID === undefined) { this.ID = 0; } else { this.ID = ID; } 
  
    /** 
    Initlization code for the masterDot class. 
    @param {void} Nothing. 
    @return {void} Nothing. 
    */
    this.init = function () { 
        try { 
            this.connects = []; 
        } catch (err) { 
            logError("Error masterDot::init " + err); 
            return; 
        } 
    }; 
  
    /** 
    Returns a human readable string of the masterDot. 
    @param {void} Nothing. 
    @return {string} Returns a human readable string of the masterDot. 
    */
    this.toString = function () { 
        return "(masterDot #" + this.ID + ")"; 
    }; 
  
    this.init(); 
} 
  
/** 
A class for representing a connection on the board 
@class masterLine 
@param  {masterDot} alpha The the first masterDot object in the line 
@param  {masterDot} beta The the second masterDot object in the line 
@return {void} Nothing 
*/
function masterLine(alpha, beta) { 
    // Optional parameter default to 0 
    if (alpha === undefined) { this.alpha = new masterDot(); } else { this.alpha = alpha; } 
    if (beta === undefined) { this.beta = new masterDot(); } else { this.beta = beta; } 
  
    /** 
    Initlization code for the line class. 
    @param {void} Nothing. 
    @return {void} Nothing. 
    */
    this.init = function () { 
        try { 
            this.connects = []; 
  
            // Record this connections in each of the masterDots 
            this.alpha.connects.push(this); 
            this.beta.connects.push(this); 
  
            // The score of this connection 
            this.score = 0; 
            this.chain_link = undefined; 
            this.connected = false; 
            this.tested = false; 
        } catch (err) { 
            logError("Error masterLine::init " + err); 
            return; 
        } 
    }; 
  
    /** 
    Returns a human readable string of the connection. 
    @param {void} Nothing. 
    @return {string} Returns a human readable string of the connection. 
    */
    this.toString = function () { 
        return "(masterLine alpha = " + this.alpha.ID + ", beta = " + this.beta.ID + ")"; 
    }; 
  
    this.init(); 
} 
  
/** 
A class for representing a square on the board 
@class masterSquare 
@param  {masterLine} top The the top connection object in the square 
@param  {masterLine} left The the left connection object in the square 
@param  {masterLine} bottom The the bottom connection object in the square 
@param  {masterLine} right The the right connection object in the square 
@return {void} Nothing 
*/
function masterSquare(top, left, bottom, right) { 
    // Optional parameter default to 0 
    if (top === undefined) { this.top = new masterLine(); } else { this.top = top; } 
    if (left === undefined) { this.left = new masterLine(); } else { this.left = left; } 
    if (bottom === undefined) { this.bottom = new masterLine(); } else { this.bottom = bottom; } 
    if (right === undefined) { this.right = new masterLine(); } else { this.right = right; } 
  
    /** 
    Initlization code for the square class. 
    @param {void} Nothing. 
    @return {void} Nothing. 
    */
    this.init = function () { 
        try { 
            // Record this square in each of the lines 
            this.top.connects.push(this); 
            this.left.connects.push(this); 
            this.bottom.connects.push(this); 
            this.right.connects.push(this); 
  
            // Store edge bonus 
            this.edge_bonus = 0; 
  
            // Number of sides 
            this.sides = 0; 
        } catch (err) { 
            logError("Error masterSquare::init " + err); 
            return; 
        } 
    }; 
  
    /** 
    Returns a human readable string of the square. 
    @param {void} Nothing. 
    @return {string} Returns a human readable string of the square. 
    */
    this.toString = function () { 
        return "(masterSquare top " + this.top + " left " + this.left + " bottom " + this.bottom + " right " + this.right + ")"; 
    }; 
  
    this.init(); 
} 
  
/** 
A class for representing a chain on the board 
@class masterChain 
@param  {Array} chain_list The list of the lines in the chain. 
@return {void} Nothing 
*/
function masterChain(chain_list) { 
    // Optional parameter default to 0 
    if (chain_list === undefined) { this.list = []; } else { this.list = chain_list; } 
  
    /** 
    Initlization code for the chain class. 
    @param {void} Nothing. 
    @return {void} Nothing. 
    */
    this.init = function () { 
        try { 
            // Make the chain length - 1 then number of lines in the chain 
            this.size = this.list.length - 1; 
            this.double_crosses = []; 
            this.middle = []; 
            this.ends = []; 
            this.get_ends(); 
            this.get_middle(); 
  
            // If a open chain score by size 
            if (this.ends.length > 1 || this.size === 1) { 
                this.score = this.size; 
            // If an closed chain score cycle minus the size of the loop 
            } else if (this.ends.length === 0 && this.size === 3) { 
                this.score = MASTER_QUAD + (this.size * 0.01); 
                //logDebug("Quad found " +this.toString()); 
            } else { 
                this.score = MASTER_CYCLE + (this.size * 0.01); 
            } 
        } catch (err) { 
            logError("Error masterChain::init " + err); 
            return; 
        } 
    }; 
  
    /** 
    Count the number of ends in the chain and return them 
    @param {void} Nothing. 
    @return {void} Nothing. 
    */
    this.get_ends = function () { 
        try { 
            var i, j, opened; 
            // Look at every line in the chain 
            for (i = 0; i < this.list.length; i += 1) { 
                opened = false; 
                // Check if the line is open (has less then 2 sides) 
                for (j = 0; j < this.list[i].connects.length; j += 1) { 
                    if (this.list[i].connects[j].sides < 2) { 
                        opened = true; 
                    } 
                } 
                // Add to end list if open or on edge 
                if (this.list[i].connects.length === 1 || opened) { 
                    this.ends.push(this.list[i]); 
                } 
            } 
            return; 
        } catch (err) { 
            logError("Error masterChain::init " + err); 
            return; 
        } 
    }; 
  
    /** 
    Get the middle of a 3 size given quad 
    @param {void} Nothing. 
    @return {void} Nothing. 
    */
    this.get_middle = function () { 
        try { 
            var i, j, is_middle; 
            // Check if quad offer 
            if (this.ends.length === 0 && this.list.length === 3) { 
                for (i = 0; i < this.list.length; i += 1) { 
                    is_middle = true; 
                    // If either side has 3 side then is not the middle 
                    for (j = 0; j < this.list[i].connects.length; j += 1) { 
                        if (this.list[i].connects[j].sides === 3) { 
                            is_middle = false; 
                        } 
                    } 
                    // We found the middle so record it 
                    if (is_middle) { 
                        this.middle.push(this.list[i]); 
                    } 
                } 
            } 
            return; 
        } catch (err) { 
            logError("Error masterChain::init " + err); 
            return; 
        } 
    }; 
  
    /** 
    Returns a human readable string of the chain. 
    @param {void} Nothing. 
    @return {string} Returns a human readable string of the chain. 
    */
    this.toString = function () { 
        return "(masterChain length (" + this.size + ") score (" + this.score + ") )"; 
    }; 
  
    this.init(); 
}

/**
A class for representing the game masterBotState
@class masterBotState
@param    {number} size The height and width of game board
@return    {void} Nothing
*/
function masterBotState(size) {
    // Optional parameter default to 10
    if (size === undefined) { this.size = 10; } else { this.size = size; }
    /**
    Initlization code for the masterBotState class.
    @param {void} Nothing.
    @return {void} Nothing.
    */
    this.init = function () {
        try {
            // Local variables
            var i = 0, x = 0, y = 0, top, left, bottom, right, temp, ref;

            // Some common math conversions
            this.range = this.size - 1;
            this.squared = this.size * this.size;

            // The valid and made moves
            this.valid_moves = [];
            this.connections = [];
            this.history = [];

            // The masterDots, lines and squares of the board
            this.lines = [];
            this.dots = [];
            this.squares = [];
            this.chains = [];
            this.past_crosses = [];
            this.started_chains = [];

            // Array matchs the number of side a square has
            this.score_sides = MASTER_DOUBLES_ARRAY;

            // Game flags
            this.started = true;
            this.winning = false;
            this.end_parity = false;
            this.double_offer = false;
            this.chain_move = false;
            this.end_game = false;
            this.last_end_game = false;

            // Game stats
            this.turn = 0;
            this.total_score = 0;
            this.my_score = 0;
            this.enemy_score = 0;

            // Even wins for counting the chain rule
            this.evens_win = !(this.size & 1);
            this.evens_chains = true;
            this.long_chains = 0;

            // Number of exchanges before 3 or bigger chains with two ends
            this.exchanges = 0;

            // Create the dots
            for (i = 0; i < this.squared; i += 1) {
                this.dots.push(new masterDot(i + 1));
            }

            // Create the lines
            for (i = 0; i < this.squared; i += 1) {
                x = i % this.size;
                y = Math.floor(i / this.size);

                // Test for out of bounds x range
                if (x !== this.range) {
                    temp = new masterLine(this.dots[i], this.dots[i + 1]);
                    this.lines.push(temp);
                    this.valid_moves.push(temp);
                }

                // Test for out of bounds y range
                if (y !== this.range) {
                    temp = new masterLine(this.dots[i], this.dots[i + this.size]);
                    this.lines.push(temp);
                    this.valid_moves.push(temp);
                }
            }

            // Create the squares
            for (i = 0; i < this.squared; i += 1) {
                x = i % this.size;
                y = Math.floor(i / this.size);

                // Test for out of bounds
                if (x !== this.range && y !== this.range) {
                    top = this.find_connection(i, i + 1);
                    left = this.find_connection(i, i + this.size);
                    bottom = this.find_connection(i + this.size, i + this.size + 1);
                    right = this.find_connection(i + 1, i + this.size + 1);

                    // Add an edge bonus of to the edge of the board
                    ref = new masterSquare(top, left, bottom, right);
                    if (x === 0 || x === (this.range - 1) || y === 0 || y === (this.range - 1)) {
                        ref.edge_bonus = MASTER_EDGE;
                    }
                    this.squares.push(ref);
                }
            }
        } catch (err) {
            logError("Error masterBotState::init " + err);
            return;
        }
    };

    /**
    Reset code for the bot class.
    @param {void} Nothing.
    @return {void} Nothing.
    */
    this.reset = function () {
        try {
            var i;
            this.turn = 0;
            this.connections.length = 0;
            this.valid_moves.length = 0;
            this.past_crosses.length = 0;

            // Reset valid moves
            for (i = 0; i < this.lines.length; i += 1) {
                this.valid_moves.push(this.lines[i]);
            }

            // Reset the chains
            this.chains.length = 0;
            this.long_chains = 0;

            // Game flags
            this.winning = false;
            this.end_parity = false;
            this.double_offer = false;
            this.chain_move = false;
            this.end_game = false;
            this.last_end_game = false;

            // Reset score
            this.total_score = 0;
            this.my_score = 0;
            this.enemy_score = 0;

            this.count_sides();
            return;
        } catch (err) {
            logError("Error masterBotState::reset " + err);
            return;
        }
    };

    /**
    Update the state by what was passed in.
    @param {Object} board The data to update from.
    @return {void} Nothing.
    */
    this.update = function (board) {
        try {
            // Local variables
            var i, tmpArray, findRef;

            // Get the turn count
            this.turn = board.connections.length;
            if (this.turn === 0) { this.started = true; }
            if (this.turn === 1) { this.started = false; }

            // Sync the current valid moves to the board
            this.valid_moves.length = 0;
            for (i = 0; i < board.valid_moves.length; i += 1) {
                tmpArray = board.valid_moves[i];
                findRef = this.find_connection(tmpArray[0] - 1, tmpArray[1] - 1);
                if (findRef !== undefined) {
                    // Reset the line and add it to our state
                    findRef.connected = false;
                    findRef.chain_link = undefined;
                    this.valid_moves.push(findRef);
                }
            }

            // Sync the current connections to the board
            this.connections.length = 0;
            for (i = 0; i < board.connections.length; i += 1) {
                tmpArray = board.connections[i];
                findRef = this.find_connection(tmpArray[0] - 1, tmpArray[1] - 1);
                if (findRef !== undefined) {
                    // Reset the line and add it to our state
                    findRef.connected = true;
                    findRef.chain_link = undefined;
                    this.connections.push(findRef);
                }
            }

            // Reset the chains
            this.chains.length = 0;
            this.long_chains = 0;

            // Correct the square count of sides
            this.count_sides();

            // Calculate score knowing my score and total score
            this.total_score = this.count_squares();
            this.enemy_score = this.total_score - this.my_score;

            return;
        } catch (err) {
            logError("Error masterBotState::update " + err);
            return;
        }
    };

    /**
    Count the number of sides for each square
    @param {void} Nothing.
    @return {void} Nothing.
    */
    this.count_sides = function () {
        try {
            var i, j;

            // Clear squares sides
            for (i = 0; i < this.squares.length; i += 1) {
                this.squares[i].sides = 0;
            }

            // Count new sides
            for (i = 0; i < this.connections.length; i += 1) {
                for (j = 0;  j < this.connections[i].connects.length; j += 1) {
                    this.connections[i].connects[j].sides += 1;
                }
            }
        } catch (err) {
            logError("Error masterBotState::count_sides " + err);
            return;
        }
    };

    /**
    Count the number of full squares
    @param {void} Nothing.
    @return {void} Returns the total number of full squares.
    */
    this.count_squares = function () {
        try {
            var i, count = 0;
            // Add one for each full square
            for (i = 0; i < this.squares.length; i += 1) {
                if (this.squares[i].sides === 4) {
                    count += 1;
                }
            }
            return count;
        } catch (err) {
            logError("Error masterBotState::count_sides " + err);
            return 0;
        }
    };

    /**
    Counts all the open loop chains over the length of 3
    @param {void} Nothing.
    @return {void} Nothing.
    */
    this.count_chains = function () {
        try {
            var i;
            // Sort the chains array by score
            this.chains.sort(function (a, b) {
                return a.score - b.score;
            });
            // If a chain 3 or bigger with two ends and a quad then count chain as long
            for (i = 0; i < this.chains.length; i += 1) {
                //logDebug("masterChain #" + i + " size " + this.chains[i].list + " ends " + this.chains[i].ends);
                if (this.chains[i].size >= 3 && this.chains[i].ends.length >= 2) {
                    this.long_chains += 1;
                } else if (this.chains[i].ends.length === 0 && this.chains[i].size === 3) {
                    this.long_chains += 1;
                }
            }
            // Find out how many exchanges until the long chains
            this.exchanges = this.chains.length - this.long_chains;
            // Detremine who is winning
            this.winning = Boolean(this.exchanges & 1);
        } catch (err) {
            logError("Error masterBotState::count_chains " + err);
            return;
        }
    };

    /**
    If every square has to or more sides we are in end game
    @param {void} Nothing.
    @return {Number} The number of safe moves left.
    */
    this.check_end_game = function () {
        try {
            var i, j, point, count = 0;
            this.end_game = true;
            // Look at every line
            for (i = 0; i < this.lines.length; i += 1) {
                point = false;
                // If making this line makes a point record it
                for (j = 0; j < this.lines[i].connects.length; j += 1) {
                    if (this.lines[i].connects[j].sides >= 2) {
                        point = true;
                    }
                }
                // If we have a point then count it
                if (!point) {
                    this.end_game = false;
                    count += 1;
                }
            }
            return count;
        } catch (err) {
            logError("Error masterBotState::check_end_game " + err);
            return 0;
        }
    };

    /**
    Apply a line for internal moves.
    @param {line} move the line passed in to be moved.
    @return {void} Nothing.
    */
    this.add_score = function (move) {
        try {
            var i, test_line;
            test_line = this.valid_moves[move];
            // Check how many points this move gives me
            for (i = 0;  i < test_line.connects.length; i += 1) {
                if (test_line.connects[i].sides === 3) {
                    this.my_score += 1;
                }
            }
            return;
        } catch (err) {
            logError("Error masterBotState::apply_line " + err);
            return;
        }
    };

    /**
    Apply a line for internal moves.
    @param {line} move the line passed in to be moved.
    @return {void} Nothing.
    */
    this.apply_line = function (move) {
        try {
            var i;
            // Put the line in memory
            move.connected = true;
            for (i = 0;  i < move.connects.length; i += 1) {
                move.connects[i].sides += 1;
            }
            return;
        } catch (err) {
            logError("Error masterBotState::apply_line " + err);
            return;
        }
    };

    /**
    Remove a line for internal moves.
    @param {line}  move the line passed in to be moved.
    @return {void} Nothing.
    */
    this.undo_line = function (move) {
        try {
            var i;
            // Take the line out of memory
            move.connected = false;
            for (i = 0;  i < move.connects.length; i += 1) {
                move.connects[i].sides -= 1;
            }
            return;
        } catch (err) {
            logError("Error masterBotState::undo_line " + err);
            return;
        }
    };

    /*
    Looks ahead to see more many chains are left
    @param {line} start_line The line to start exploring from.
    @param {int} count The current count of moves left.
    @return {int} The number of found moves.
    */
    this.look_ahead = function (start_line, count) {
        try {
            var i, test_side, max_count = count;

            // Internally add the line to this state
            this.apply_line(start_line);

            // Go through the connected square and see if the chain continues
            for (i = 0;  i < this.squares.length; i += 1) {
                if (this.squares[i].sides === 3) {
                    // Find which line is not connected
                    if (!this.squares[i].top.connected) { test_side = this.squares[i].top; }
                    if (!this.squares[i].left.connected) { test_side = this.squares[i].left; }
                    if (!this.squares[i].bottom.connected) { test_side = this.squares[i].bottom; }
                    if (!this.squares[i].right.connected) { test_side = this.squares[i].right; }
                    // Look ahead in to the next line
                    max_count = this.look_ahead(test_side, max_count + 1);
                    break;
                }
            }
            // Internally undo the line to this state
            this.undo_line(start_line);
            return max_count;
        } catch (err) {
            logError("Error masterBotState::look_ahead " + err);
            return 0;
        }
    };

    /*
    Check all the chains currently 
    @param {masterLine} start_line the line to start exploring from.
    @return {void} Nothing.
    */
    this.traverse_chain = function (start_line) {
        try {
            var i, j, found, test_square, test_side;

            // Internally add the line to this state
            this.apply_line(start_line);

            if (this.history.length < 100) {
                // Go through the connected square and see if the chain continues
                for (i = 0;  i < start_line.connects.length; i += 1) {
                    test_square = start_line.connects[i];
                    if (test_square.sides === 3) {
                        // Find which line is not connected
                        test_side = undefined;
                        if (!test_square.top.connected) { test_side = test_square.top; }
                        if (!test_square.left.connected) { test_side = test_square.left; }
                        if (!test_square.bottom.connected) { test_side = test_square.bottom; }
                        if (!test_square.right.connected) { test_side = test_square.right; }

                        if (test_side !== undefined) {
                            // Look to see if connection is already in the history
                            found = false;
                            for (j = 0; j < this.history.length; j += 1) {
                                if (this.history[j] === test_side) {
                                    found = true;
                                }
                            }
                            // Save this line and traverse farther
                            if (!found) {
                                this.history.push(test_side);
                                this.traverse_chain(test_side);
                            }
                        }
                    }
                }
            }
            // Internally undo the line to this state
            this.undo_line(start_line);
            return;
        } catch (err) {
            logError("Error masterBotState::traverse_chain " + err);
            return;
        }
    };

    /**
    Find all of the chains on the board
    @param {void} Nothing.
    @return {void} Nothing.
    */
    this.find_chain = function () {
        try {
            var i, j, found, new_chain;

            // Go through every connection and look for a chain
            for (i = 0; i < this.valid_moves.length; i += 1) {
                found = false;

                // Look for any potential chains for the enemy
                for (j = 0;  j < this.valid_moves[i].connects.length; j += 1) {
                    if (this.valid_moves[i].connects[j].sides === 2 || this.valid_moves[i].connects[j].sides === 3) {
                        found = true;
                    }
                }
                // If a potential chain has been found and we have explored it yet
                if (found && this.valid_moves[i].chain_link === undefined) {
                    // Clear history an add this line
                    this.history = [];
                    this.history.push(this.valid_moves[i]);

                    // Traverse the chain
                    this.traverse_chain(this.valid_moves[i]);

                    // Add the chain to the chain list
                    new_chain = new masterChain(this.history);
                    this.chains.push(new_chain);

                    // Record the chains length for every line in the chain 
                    for (j = 0;  j < this.history.length; j += 1) {
                        this.history[j].chain_link = new_chain;
                    }
                }
            }
        } catch (err) {
            logError("Error masterBotState::find_chain " + err);
            return;
        }
    };

    /**
    If we're winning extend long chains if we are losing extend short chains
    @param {void} Nothing.
    @return {void} Nothing.
    */
    this.extend_chains = function () {
        try {
            var i;
            // If winning promote single array if losing use doubles.
            if (this.winning) {
                this.score_sides = MASTER_SINGLES_ARRAY;
            } else {
                this.score_sides = MASTER_DOUBLES_ARRAY;
            }

            // Take off the tested flag
            for (i = 0; i < this.lines.length; i += 1) {
                this.lines[i].tested = false;
            }

            for (i = 0; i < this.chains.length; i += 1) {
                if (this.winning) {
                    // If we are winning the extend the long chains and stop short chains
                    if (this.chains[i].size >= 3) {
                        this.extend_chain(this.chains[i], MASTER_EXTEND);
                    } else {
                        this.extend_chain(this.chains[i], -MASTER_EXTEND);
                    }
                } else {
                    // If we are winning the extend the short chains and stop long chains
                    if (this.chains[i].size < 3) {
                        this.extend_chain(this.chains[i], -MASTER_EXTEND);
                    } else {
                        this.extend_chain(this.chains[i], MASTER_EXTEND);
                    }
                }
            }
        } catch (err) {
            logError("Error masterBotState::extend_chains " + err);
            return;
        }
    };

    /**
    Change the score of the ends to encourage chain growth
    @param {masterChain} test_chain The chain to extend.
    @return {void} Nothing.
    */
    this.extend_chain = function (test_chain, score_amount) {
        try {
            var i, j, opened, safe_moves;
            // Count the number of edges in this list
            for (i = 0; i < test_chain.list.length; i += 1) {
                // Check for open sides
                opened = false;
                for (j = 0; j < test_chain.list[i].connects.length; j += 1) {
                    if (test_chain.list[i].connects[j].sides < 2) {
                        opened = true;
                    }
                }
                // Change the value of the ends of chains to promote or stop growth
                if (test_chain.list[i].connects.length !== 1 || opened) {
                    safe_moves = this.get_moves(test_chain.list[i], 3);
                    for (j = 0; j < safe_moves.length; j += 1) {
                        if (!safe_moves[j].tested) {
                            safe_moves[j].score += score_amount;
                        }
                        safe_moves[j].tested = true;
                    }
                }
            }
        } catch (err) {
            logError("Error masterBotState::extend_chain " + err);
            return;
        }
    };

    /**
    Examines the surrounding moves and returns all the safe move the bot can make
    @param {masterChain} new_chain The chain to extend.
    @param {Number} max The highest safe value.
    @return {void} Nothing.
    */
    this.get_moves = function (new_line, max) {
        try {
            var i, j, safe, test_moves, safe_moves;
            // Grab all of the moves surrounding passed in move
            test_moves = [];
            for (i = 0; i < new_line.connects.length; i += 1) {
                test_moves.push(new_line.connects[i].top);
                test_moves.push(new_line.connects[i].left);
                test_moves.push(new_line.connects[i].bottom);
                test_moves.push(new_line.connects[i].right);
            }
            // Test if the move is under the max sides and not the passed side.
            safe_moves = [];
            for (i = 0; i < test_moves.length; i += 1) {
                safe = true;
                for (j = 0; j < test_moves[i].connects.length; j += 1) {
                    if (test_moves[i].connects[j].sides >= max) {
                        safe = false;
                    }
                }
                if (safe && new_line !== test_moves[i] && !test_moves[i].connected) {
                    safe_moves.push(test_moves[i]);
                    //logDebug("Adding " + test_moves[i] + " to safe moves");
                }
            }
            return safe_moves;
        } catch (err) {
            logError("Error masterBotState::get_moves " + err);
            return [];
        }
    };

    /**
    Score all the moves in the connections array
    @param {void} Nothing.
    @return {void} Nothing.
    */
    this.score_moves = function () {
        try {
            var i, j, score;

            // Go through every connection
            for (i = 0; i < this.valid_moves.length; i += 1) {
                score = 0;

                // Go through each square
                for (j = 0;  j < this.valid_moves[i].connects.length; j += 1) {
                    score += this.score_sides[this.valid_moves[i].connects[j].sides];
                    score += this.valid_moves[i].connects[j].edge_bonus;
                }
                // Add some "fuzz" to the score to help tie breakers
                score += Math.random() * 0.001;

                // Record score
                this.valid_moves[i].score = score;
            }
        } catch (err) {
            logError("Error masterBotState::score_moves " + err);
            return;
        }
    };

    /**
    Score all the chains in the connections array
    @param {void} Nothing.
    @return {void} Nothing.
    */
    this.score_chains = function () {
        try {
            var i, j;
            if (this.chains.length === 0) {
                return;
            }
            this.started_chains.length = 0;
            // Check if we started anywhere
            for (i = 0; i < this.valid_moves.length; i += 1) {
                this.valid_moves[i].score = 0;
                for (j = 0; j < this.valid_moves[i].connects.length; j += 1) {
                    // If a chain has started the score it and set flag
                    if (this.valid_moves[i].connects[j].sides === 3) {
                        this.valid_moves[i].score = MASTER_CHAINS;
                        this.valid_moves[i].score += Math.random() * 0.001;
                        this.started_chains.push(this.valid_moves[i]);
                        break;
                    }
                }
            }
            // If not started then start the smallest chain or cycle
            if (this.started_chains.length === 0) {
                for (i = 0; i < this.chains[0].list.length; i += 1) {
                    this.chains[0].list[i].score = MASTER_CHAINS;
                    this.chains[0].list[i].score += Math.random() * 0.001;
                }
                // Start chains on a double cross location to prevent being double crossed
                for (i = 0; i < this.chains[0].double_crosses.length; i += 1) {
                    this.chains[0].double_crosses[i].score += MASTER_DOUBLE_CROSS;
                }
                // If losing Offer a double trap
                if (!this.winning && this.chains[0].size === 2) {
                    //logDebug("Offer double trap");
                    for (i = 0; i < this.chains[0].ends.length; i += 1) {
                        this.chains[0].ends[i].score += MASTER_ENDS;
                    }
                }
            // If started pick the best started location
            } else {
                // Lower the chance we'll pick a double cross if there are to choices
                for (i = 0; i < this.past_crosses.length; i += 1) {
                    this.past_crosses[i].score -= MASTER_DOUBLE_CROSS;
                }
                // If losing give up a quad
                if (this.winning && this.chains[0].middle.length !== 0) {
                    //logDebug("Quad declined");
                    for (i = 0; i < this.chains[0].middle.length; i += 1) {
                        this.chains[0].middle[i].score += MASTER_MIDDLE;
                    }
                }
            }
        } catch (err) {
            logError("Error masterBotState::score_chains " + err);
            return;
        }
    };

    /**
    Score a sorted list of scores
    @param {void} Nothing.
    @return {void} Nothing.
    */
    this.show_scores = function () {
        try {
            var i, new_list = [];
            // Go through every connection
            for (i = 0; i < this.valid_moves.length; i += 1) {
                new_list.push(this.valid_moves[i]);
            }
            // Sort by score
            new_list.sort(function (a, b) {
                return b.score - a.score;
            });
            // Show this list
            for (i = 0; i < new_list.length; i += 1) {
                logDebug("Move " + new_list[i] + " score " + new_list[i].score);
            }
            return;
        } catch (err) {
            logError("Error masterBotState::best_move " + err);
            return;
        }
    };

    /**
    Returns the best score of the lot
    @param {void} Nothing.
    @return {int} The index valid of the best move
    */
    this.best_move = function () {
        try {
            var i, best = 0, highest = -9999;
            // Go through every connection
            for (i = 0; i < this.valid_moves.length; i += 1) {
                // Save the highest score
                if (this.valid_moves[i].score > highest) {
                    highest = this.valid_moves[i].score;
                    best = i;
                }
            }
            // Return the valid move number
            return best;
        } catch (err) {
            // Return first valid move
            logError("Error masterBotState::best_move " + err);
            return 0;
        }
    };

    /**
    Look for double crosses and add them to the list
    @param {void} Nothing.
    @return {void} Nothing.
    */
    this.find_double_cross = function () {
        try {
            var i, j, k, n, found, test_moves, test_chain;
            for (i = 0; i < this.chains.length; i += 1) {
                test_chain = this.chains[i];
                // If the chain isn't a single
                if (test_chain.list.length >= 1) {
                    for (j = 0; j < test_chain.ends.length; j += 1) {
                        // Look at the end of the chain for double crosses
                        test_moves = this.get_moves(test_chain.ends[j], 3);
                        for (k = 0; k < test_moves.length; k += 1) {
                            test_chain.double_crosses.push(test_moves[k]);
                            //logDebug("Potentail double cross " + test_moves[k]);
                            found = false;
                            // Check if double crosss is already on the master list
                            for (n = 0; n < this.past_crosses.length; n += 1) {
                                if (this.past_crosses[n] === test_moves[k]) {
                                    found = true;
                                }
                            }
                            // If it isn't add double cross to the master list
                            if (!found) {
                                this.past_crosses.push(test_moves[k]);
                            }
                        }
                        // If the chain is a double then ignore the second double cross
                        if (test_chain.size === 2) {break; }
                    }
                }
            }
            return;
        } catch (err) {
            logError("Error masterBotState::find_double_cross " + err);
            return;
        }
    };

    /**
    Checks if it's appropriate to doublecross the opponent
    @param {int} The index valid of the old best move
    @return {int} The index valid of the new best move
    */
    this.double_cross = function (old_best) {
        try {
            var i, new_line, new_best, test_line, test_moves, moves_left;
            new_best = old_best;

            // If there is only two moves left then just return old best
            if (this.valid_moves.length <= 2) {return old_best; }

            if (!this.chain_move) {
                // If a chain of more then 2 is starting then set the chain move flag
                if (this.valid_moves[old_best].chain_link !== undefined) {
                    if (this.valid_moves[old_best].chain_link.size === 1 && this.started_chains.length === 1) {
                        this.double_offer = true;
                        this.chain_move = true;
                    } else if (this.valid_moves[old_best].chain_link.size > 1) {
                        this.chain_move = true;
                        this.double_offer = false;
                    }
                }
            }

            if (this.chain_move && this.end_game) {
                // Count how many moves are left in this chain
                moves_left = this.look_ahead(this.valid_moves[old_best], 1);
                test_line = this.valid_moves[old_best];
                //logDebug("Possible double crosses " + test_line + " moves left " + moves_left);
                // If there are only two move left try a double cross
                if (moves_left === 2 && test_line.connects.length === 2) {
                    // If it's a double trap offer decline if we won chain parity
                    if (this.double_offer && !this.winning) {
                        //logDebug("Double offer taken");
                        this.chain_move = false;
                        return old_best;
                    }
                    // If we have some small chains left and we are winning exit 
                    if (this.exchanges > 3 && this.winning) {
                        //logDebug("Small chains left");
                        this.chain_move = false;
                        return old_best;
                    }

                    // Collect all the surrounding lines in test_moves array
                    test_moves = this.get_moves(test_line, 3);

                    // Search thought all moves for both squares
                    for (i = 0; i < test_moves.length; i += 1) {
                        // Look for the other available move to double cross the enemy
                        if (!test_moves[i].connected && test_moves[i] !== test_line) {
                            new_line = test_moves[i];
                            break;
                        }
                    }
                    // Search for new move in the list
                    for (i = 0; i < this.valid_moves.length; i += 1) {
                        // If the new move was found update the valid move index and return
                        if (this.valid_moves[i] === new_line) {
                            new_best = i;
                            break;
                        }
                    }
                    this.chain_move = false;
                }
            }
            return new_best;
        } catch (err) {
            // Return first valid move
            logError("Error masterBotState::double_cross " + err);
            return old_best;
        }
    };

    /**
    Find the connection based off of the two passed ID's
    @param    {number} alpha_ID The the first dot ID in the connection.
    @param    {number} beta_ID The the second dot ID in the connection.
    @return {object} Returns the connection if found and undefined otherwise.
    */
    this.find_connection = function (alpha_ID, beta_ID) {
        try {
            // Find the dot by index
            var i, j, alpha = this.dots[alpha_ID], beta = this.dots[beta_ID];

            // Find a common connection between both dots
            for (i = 0; i < alpha.connects.length; i += 1) {
                for (j = 0; j < beta.connects.length; j += 1) {
                    if (alpha.connects[i] === beta.connects[j]) {
                        // Found return the connection
                        return alpha.connects[i];
                    }
                }
            }
            // Not found return undefined
            return undefined;
        } catch (err) {
            logError("Error masterBotState::find_conection " + err);
            return undefined;
        }
    };

    /**
    Returns a human readable string of the masterBotState.
    @param {void} Nothing.
    @return {string} Returns a human readable string of the masterBotState.
    */
    this.toString = function () {
        return "(Board Size = " + this.size + ", Turn = " + this.turn + ", My Score = " + this.my_score + ", Enemy Score = " + this.enemy_score + ")";
    };

    this.init();
}

/**
A class for my bot
@class masterAI
@param    {void} Nothing
@return    {void} Nothing
*/
function masterAI() {
    /**
    Initlization code for the bot class.
    @param {void} Nothing.
    @return {void} Nothing.
    */
    this.init = function () {
        try {
            //logDebug("Init" + this);
            this.state = new masterBotState(this.size);
        } catch (err) {
            logError("Error masterAI::init " + err);
            return;
        }
    };

    /**
    Reset code for the bot class.
    @param {void} Nothing.
    @return {void} Nothing.
    */
    this.reset = function () {
        try {
            //logDebug("Reset" + this);
            this.state.reset();
        } catch (err) {
            logError("Error masterAI::reset " + err);
            return;
        }
    };

    /**
    Called by the game logic when it's the bots turn to make a move
    @param {object} board The board reference .
    @return {Array} Returns an array of.
    */
    this.move = function (board) {
        try {
            var best;
            //turn_start = getTick();

            // Reset init is size changes
            if (this.size !== logic.size) {
                //logDebug("Resize Master AI to " + logic.size);
                this.size = logic.size;
                this.init();
            }

            // Reset if the valid moves are more then before
            if (board.valid_moves.length > this.state.valid_moves.length) {
                //logDebug("Started "+this.state.started+" Last game score me: " + this.state.my_score + " enemy " + (this.state.squares.length - this.state.my_score));
                this.reset();
            }

            // Update our state to match the board
            this.state.update(board);

            // Score the size of the chain to prefer smaller chains and cycles first
            this.state.find_chain();
            this.state.count_chains();

            // Check if we are in the end game
            this.state.check_end_game();

            // Extend long chains if winning and short chains if losing
            if (!this.state.end_game) {
                this.state.score_moves();
                this.state.extend_chains();
            } else {
                this.state.find_double_cross();
                this.state.score_chains();
                //this.state.show_scores();
            }

            // Find the best move
            best = this.state.best_move();

            // Check if there is a double cross
            best = this.state.double_cross(best);

            // Check if this move adds to my score
            this.state.add_score(best);

            //logDebug("Turn took " + (getTick() - turn_start) + " milliseconds.");
            //logDebug("Bot state: " + this.state.toString());

            // Return the best move back to the engine
            return board.valid_moves[best];
        } catch (err) {
            logError("Error masterAI::move " + err);
            return undefined;
        }
    };

    /**
    Returns a human readable string of the board.
    @param {void} Nothing.
    @return {string} Returns a human readable string of the board.
    */
    this.toString = function () {
        return "(Master AI)";
    };
}/**
A class for representing the game mediumBotState
@class mediumBotState
@param	{number} size The height and width of game mediumBotState
@return	{void} Nothing
*/
function mediumBotState(size) {
	// Optional parameter default to 10
	if (size === undefined) {this.size = 10; } else {this.size = size; }
	/**
	Initlization code for the bot_state class.
	@param {void} Nothing.
	@return {void} Nothing.
	*/
	this.init = function () {
		try {
			// Local variables
			var i, x, y, top, left, bottom, right, temp;

			// Some common math conversions
			this.range = this.size - 1;
			this.squared = this.size * this.size;

			// The valid and made moves
			this.valid_moves = [];
			this.connections = [];
			this.history = [];

			// The dots, lines and squares of the board
			this.lines = [];
			this.dots = [];
			this.squares = [];

			this.score_sides = [1, 2, 0, 10];
			this.turn = 0;

			// Create the dots
			for (i = 0; i < this.squared; i += 1) {
				this.dots.push(new Dot(i + 1));
			}

			// Create the lines
			for (i = 0; i < this.squared; i += 1) {
				x = i % this.size;
				y = Math.floor(i / this.size);

				// Test for out of bounds x range
				if (x !== this.range) {
					temp = new Line(this.dots[i], this.dots[i + 1]);
					this.lines.push(temp);
					this.valid_moves.push(temp);
				}

				// Test for out of bounds y range
				if (y !== this.range) {
					temp = new Line(this.dots[i], this.dots[i + this.size]);
					this.lines.push(temp);
					this.valid_moves.push(temp);
				}
			}

			// Create the squares
			for (i = 0; i < this.squared; i += 1) {
				x = i % this.size;
				y = Math.floor(i / this.size);

				// Test for out of bounds
				if (x !== this.range && y !== this.range) {
					top = this.find_connection(i, i + 1);
					left = this.find_connection(i, i + this.size);
					bottom = this.find_connection(i + this.size, i + this.size + 1);
					right = this.find_connection(i + 1, i + this.size + 1);

					this.squares.push(new Square(top, left, bottom, right));
				}
			}
		} catch (err) {
			logError("Error Bot_state::init " + err);
			return;
		}
	};

	/**
	Update the state by what was passed in.
	@param {Object} board The data to update from.
	@return {void} Nothing.
	*/
	this.update = function (board) {
		try {
			this.turn += 1;

			// Local variables
			var i, tmpArray, findRef;

			// Sync the current valid moves to the board
			this.valid_moves.length = 0;
			for (i = 0; i < board.valid_moves.length; i += 1) {
				tmpArray = board.valid_moves[i];
				findRef = this.find_connection(tmpArray[0] - 1, tmpArray[1] - 1);
				if (findRef !== undefined) {
					// Reset the line and add it to our state
					findRef.connected = false;
					findRef.chains = 0;
					this.valid_moves.push(findRef);
				}
			}

			// Sync the current connections to the board
			this.connections.length = 0;
			for (i = 0; i < board.connections.length; i += 1) {
				tmpArray = board.connections[i];
				findRef = this.find_connection(tmpArray[0] - 1, tmpArray[1] - 1);
				if (findRef !== undefined) {
					// Reset the line and add it to our state
					findRef.connected = true;
					findRef.chains = 0;
					this.connections.push(findRef);
				}
			}

			// Correct the square count of sides
			this.count_sides();

		} catch (err) {
			logError("Error Bot_state::update " + err);
			return;
		}
	};

	/**
	Reset code for the bot class.
	@param {void} Nothing.
	@return {void} Nothing.
	*/
	this.count_sides = function () {
		try {
			var i, j;
			// Clear squares sides
			for (i = 0; i < this.squares.length; i += 1) {
				this.squares[i].sides = 0;
			}

			// Count new sides
			for (i = 0; i < this.connections.length; i += 1) {
				for (j = 0;  j < this.connections[i].connects.length; j += 1) {
					this.connections[i].connects[j].sides += 1;
				}
			}
		} catch (err) {
			logError("Error Bot_state::count_sides " + err);
			return;
		}
	};

	/**
	Reset code for the bot class.
	@param {void} Nothing.
	@return {void} Nothing.
	*/
	this.reset = function () {
		try {
			var i;
			this.turn = 0;
			this.connections.length = 0;
			this.valid_moves.length = 0;

			// Reset valid moves
			for (i = 0; i < this.lines.length; i += 1) {
				this.valid_moves.push(this.lines[i]);
			}
			this.count_sides();
		} catch (err) {
			logError("Error Bot_state::reset " + err);
			return;
		}
	};

	/**
	Apply a line for internal moves.
	@param {Line} moveLine the line passed in to be moved.
	@return {void} Nothing.
	*/
	this.apply_line = function (moveLine) {
		try {
			var i, j;
			// Find the valid moves
			for (i = 0; i < this.lines.length; i += 1) {
				if (this.lines[i].alpha.ID === moveLine.alpha.ID && this.lines[i].beta.ID === moveLine.beta.ID) {
					// Move array to the connections list
					this.lines[i].connected = true;
					for (j = 0;  j < this.lines[i].connects.length; j += 1) {
						this.lines[i].connects[j].sides += 1;
					}
					return;
				}
			}
			return;
		} catch (err) {
			logError("Error Bot_state::apply_line " + err);
			return;
		}
	};

	/**
	Remove a line for internal moves.
	@param {Line}  moveLine the line passed in to be moved.
	@return {void} Nothing.
	*/
	this.undo_line = function (moveLine) {
		try {
			var i, j;
			// Find the valid moves
			for (i = 0; i < this.lines.length; i += 1) {
				if (this.lines[i].alpha.ID === moveLine.alpha.ID && this.lines[i].beta.ID === moveLine.beta.ID) {
					// Move array to the connections list
					this.lines[i].connected = false;
					for (j = 0;  j < this.lines[i].connects.length; j += 1) {
						this.lines[i].connects[j].sides -= 1;
					}
					return;
				}
			}
			return;
		} catch (err) {
			logError("Error Bot_state::undo_line " + err);
			return;
		}
	};

	/*
	Check all the chains currently 
	@return {Line} start_line the line to start exploring from.
	@return {void} Nothing.
	*/
	this.traverse_chain = function (start_line) {
		try {
			var i, test_square, test_side;

			// Internally add the line to this state
			this.apply_line(start_line);

			// Go through the connected square and see if the chain continues
			for (i = 0;  i < start_line.connects.length; i += 1) {
				test_square = start_line.connects[i];
				//logDebug("Testing square "+ test_square + " sides" + test_square.sides);
				if (test_square.sides === 3) {
					// Find which line is not connected
					if (test_square.top.connected === false) {test_side = test_square.top; }
					if (test_square.left.connected === false) {test_side = test_square.left; }
					if (test_square.bottom.connected === false) {test_side = test_square.bottom; }
					if (test_square.right.connected === false) {test_side = test_square.right; }

					// Save this line and traverse farther
					this.history.push(test_side);
					this.traverse_chain(test_side);
				}
			}

			// Internally undo the line to this state
			this.undo_line(start_line);
			return;
		} catch (err) {
			logError("Error Bot_state::count_chain " + err);
			return;
		}
	};

	/**
	Score all the moves that are in a chain for the enemy
	@return {void} Nothing.
	@return {void} Nothing.
	*/
	this.score_chain = function () {
		try {
			var i, j, found;

			// Go through every connection and look for a chain
			for (i = 0; i < this.valid_moves.length; i += 1) {
				found = false;

				// Look for any potential chains for the enemy
				for (j = 0;  j < this.valid_moves[i].connects.length; j += 1) {
					if (this.valid_moves[i].connects[j].sides === 2) { found = true; }
				}

				// If a potential chain has been found and we have explored it yet
				if (found && this.valid_moves[i].chains === 0) {
					// Clear history an add this line
					this.history.length = 0;
					this.history.push(this.valid_moves[i]);

					// Traverse the chain
					this.traverse_chain(this.valid_moves[i]);

					// Record the chains length for every line in the chain 
					for (j = 0;  j < this.history.length; j += 1) {
						this.history[j].chains = this.history.length;
					}
				}
			}
		} catch (err) {
			logError("Error Bot_state::score_chain " + err);
			return;
		}
	};

	/**
	Score all the moves in the connections array
	@return {void} Nothing.
	@return {void} Nothing.
	*/
	this.score_moves = function () {
		try {
			var i, j, score, chain;

			// Go through every connection
			for (i = 0; i < this.valid_moves.length; i += 1) {
				score = 0;
				chain = false;

				// Go through each square
				for (j = 0;  j < this.valid_moves[i].connects.length; j += 1) {
					if (this.valid_moves[i].connects[j].sides === 2) {chain = true; }
					score += this.score_sides[this.valid_moves[i].connects[j].sides];
				}

				// Subtract chain length if a chain start
				if (chain) {score -= this.valid_moves[i].chains; }

				// Add some "fuzz" to the score to help tie breakers
				score += Math.random() * 0.1;

				// Record score
				this.valid_moves[i].score = score;
			}
		} catch (err) {
			logError("Error Bot_state::score_moves " + err);
			return;
		}
	};

	/**
	Returns the best score of the lot
	@return {void} Nothing.
	@return {Array} An 2 element array with the best move.
	*/
	this.best_move = function () {
		try {
			var i, best = 0, highest = -9999;
			// Go through every connection
			for (i = 0; i < this.valid_moves.length; i += 1) {
				// Save the highest score
				if (this.valid_moves[i].score >= highest) {
					highest = this.valid_moves[i].score;
					best = i;
				}
			}
			// Return the valid move number
			return best;
		} catch (err) {
			// Return first valid move
			logError("Error Bot_state::best_move " + err);
			return 0;
		}
	};

	/**
	Find the connection based off of the two passed ID's
	@param	{number} alpha_ID The the first dot ID in the connection.
	@param	{number} beta_ID The the second dot ID in the connection.
	@return {object} Returns the connection if found and undefined otherwise.
	*/
	this.find_connection = function (alpha_ID, beta_ID) {
		try {
			// Find the dot by index
			var alpha, beta, i, j;
			alpha = this.dots[alpha_ID];
			beta = this.dots[beta_ID];

			// Find a common connection between both dots
			for (i = 0; i < alpha.connects.length; i += 1) {
				for (j = 0; j < beta.connects.length; j += 1) {
					if (alpha.connects[i] === beta.connects[j]) {
						// Found return the connection
						return alpha.connects[i];
					}
				}
			}
			// Not found return undefined
			return undefined;
		} catch (err) {
			logError("Error Bot_state::find_conection " + err);
			return undefined;
		}
	};

	/**
	Returns a human readable string of the bot_state.
	@param {void} Nothing.
	@return {string} Returns a human readable string of the bot_state.
	*/
	this.toString = function () {
		return "(Board Size = " + this.size + ", Square = " + this.squared + ")";
	};

	this.init();
}

/**
A class for my mediumBot
@class mediumBot
@param	{number} size The height and width of game board
@return	{void} Nothing
*/
function mediumAI() {
	/**
	Initlization code for the bot class.
	@param {void} Nothing.
	@return {void} Nothing.
	*/
	this.init = function () {
		try {
			//logDebug("Init" + this);
			this.state = new mediumBotState(this.size);
		} catch (err) {
			logError("Error MyBot::init " + err);
			return;
		}
	};

	/**
	Reset code for the bot class.
	@param {void} Nothing.
	@return {void} Nothing.
	*/
	this.reset = function () {
		try {
			//logDebug("Reset" + this);
			this.state.reset();
		} catch (err) {
			logError("Error myBot::reset " + err);
			return;
		}
	};

	/**
	Called by the game logic when it's the bots turn to make a move
	@param {object} board The board reference .
	@return {Array} Returns an array of.
	*/
	this.move = function (board) {
		try {
			var bestMove;

			// Reset init is size changes
			if (this.size !== logic.size) {
				this.size = logic.size;
				this.init();
			}

			// Reset if the valid moves are more then before
			if (board.valid_moves.length > this.state.valid_moves.length) {
				this.reset();
			}

			// Update our state to match the board
			this.state.update(board);
			//logDebug("---------- Turn #" + this.state.turn + "----------");

			// Score the size of the chain to prefer smaller enemy chains
			this.state.score_chain();

			// Score all of the moves
			this.state.score_moves();

			// Find the best move
			bestMove = this.state.best_move();

			// Return the best move back to the engine
			return board.valid_moves[bestMove];
		} catch (err) {
			logError("Error myBot::move " + err);
			return undefined;
		}
	};

	/**
	Returns a human readable string of the board.
	@param {void} Nothing.
	@return {string} Returns a human readable string of the board.
	*/
	this.toString = function () {
		return "(Medium AI)";
	};
}/**
Mouse Information Class
@class mouseInfo
@param {vortexEngine} passEngine The instance of the engine functions
@return {void} Nothing
*/
function mouseInfo(passEngine) {
	this.engine = passEngine;
	this.position = new point(this.engine, 0, 0);
	this.button = false;
	this.onCanvas = false;
}/**
X-Y Coordinate Class
@class point
@param {vortexEngine} passEngine The instance of the engine functions
@param {float} passX The x position of the point
@param {float} passY The y position of the point
@return {void} Nothing
*/
function point(passEngine, passX, passY) {
	this.engine = passEngine;
	this.x = passX;
	this.y = passY;
	
	this.convertBufferToScreen = function(){
		this.x = (this.x / this.engine.canvasBuffer.width) * this.engine.canvasMain.width;
		this.y = (this.y  / this.engine.canvasBuffer.height) * this.engine.canvasMain.height;
	};
	
	this.convertScreenToBuffer = function(){
		this.x = (this.x / this.engine.canvasMain.width) * this.engine.canvasBuffer.width;
		this.y = (this.y / this.engine.canvasMain.height) * this.engine.canvasBuffer.height;
	};
	
	this.convertBufferToGrid = function(){
		this.x = (this.x / this.engine.canvasBuffer.width) * this.engine.gridWidth;
		this.y = (this.y / this.engine.canvasBuffer.height) * this.engine.gridHeight;
	};

	this.convertScreenToGrid = function(){
		this.x = (this.x / this.engine.canvasMain.width) * this.engine.gridWidth;
		this.y = (this.y / this.engine.canvasMain.height) * this.engine.gridHeight;
	};

	this.convertGridToScreen = function(){
		this.x = (this.x / this.engine.gridWidth) * this.engine.canvasMain.width;
		this.y = (this.y / this.engine.gridHeight) * this.engine.canvasMain.height;
	};
	
	this.convertGridToBuffer = function(){
		this.x = (this.x / this.engine.gridWidth) * this.engine.canvasBuffer.width;
		this.y = (this.y / this.engine.gridHeight) * this.engine.canvasBuffer.height;
	};
	
	this.clone = function() {
		return new point(this.engine, this.x, this.y);
	};
}/**
Rectangle Coordinate Class
@class rectangle
@param {vortexEngine} passEngine The instance of the engine functions
@param {float} passX The x position of the rectangle
@param {float} passY The y position of the rectangle
@param {float} passW The width of the rectangle
@param {float} passH The height of the rectangle
@return {void} Nothing
*/
function rectangle(passEngine, passX, passY, passW, passH)  {
	this.engine = passEngine;
	this.x = passX;
	this.y = passY;
	this.w = passW;
	this.h = passH;

	this.convertBufferToScreen = function(){
		this.x  = (this.x  / this.engine.canvasMain.width) * this.engine.canvasBuffer.width;
		this.y  = (this.y  / this.engine.canvasMain.height) * this.engine.canvasBuffer.height;
		this.w  = (this.w  / this.engine.canvasMain.width) * this.engine.canvasBuffer.width;
		this.h  = (this.h  / this.engine.canvasMain.height) * this.engine.canvasBuffer.height;
	};

	this.convertScreenToBuffer = function(){
		this.x  = (this.x  / this.engine.canvasBuffer.width) * this.engine.canvasMain.width;
		this.y  = (this.y  / this.engine.canvasBuffer.height) * this.engine.canvasMain.height;
		this.w  = (this.w  / this.engine.canvasBuffer.width) * this.engine.canvasMain.width;
		this.h  = (this.h  / this.engine.canvasBuffer.height) * this.engine.canvasMain.height;
	};

	this.convertScreenToGrid = function(){
		this.x  = (this.x  / this.engine.canvasMain.width) * this.engine.gridWidth;
		this.y  = (this.y  / this.engine.canvasMain.height) * this.engine.gridHeight;
		this.w  = (this.w  / this.engine.canvasMain.width) * this.engine.gridWidth;
		this.h  = (this.h  / this.engine.canvasMain.height) * this.engine.gridHeight;
	};
	
	this.convertBufferToGrid = function(){
		this.x  = (this.x  / this.engine.canvasBuffer.width) * this.engine.gridWidth;
		this.y  = (this.y  / this.engine.canvasBuffer.height) * this.engine.gridHeight;
		this.w  = (this.w  / this.engine.canvasBuffer.width) * this.engine.gridWidth;
		this.h  = (this.h  / this.engine.canvasBuffer.height) * this.engine.gridHeight;
	};

	this.convertGridToScreen = function(){
		this.x  = (this.x  / this.engine.gridWidth) * this.engine.canvasMain.width;
		this.y  = (this.y  / this.engine.gridHeight) * this.engine.canvasMain.height;
		this.w  = (this.w  / this.engine.gridWidth) * this.engine.canvasMain.width;
		this.h  = (this.h  / this.engine.gridHeight) * this.engine.canvasMain.height;
	};
	
	this.convertGridToBuffer = function(){
		this.x  = (this.x  / this.engine.gridWidth) * this.engine.canvasBuffer.width;
		this.y  = (this.y  / this.engine.gridHeight) * this.engine.canvasBuffer.height;
		this.w  = (this.w  / this.engine.gridWidth) * this.engine.canvasBuffer.width;
		this.h  = (this.h  / this.engine.gridHeight) * this.engine.canvasBuffer.height;
	};
	
	this.scale = function(passScale){
		var scaleX = this.w * passScale;
		var scaleY = this.h * passScale;
		this.x -= (scaleX - this.w) / 2;
		this.y -= (scaleY - this.h) / 2;
		this.w = scaleX;
		this.h = scaleY;
	};
	
	this.testPoint = function(passPoint) {
		if (passPoint.x >= this.x && 
		    passPoint.x <= (this.x + this.w) &&
			passPoint.y >= this.y && 
			passPoint.y <= (this.y + this.h)) {
			return true;
		}
		return false;
	}
	
	this.clone = function() {
		return new rectangle(this.engine, this.x, this.y, this.w, this.h);
	};
}/**
A class for representing a Square on the board
@class Square
@param	{object} top The the top connection object in the square
@param	{object} left The the left connection object in the square
@param	{object} bottom The the bottom connection object in the square
@param	{object} right The the right connection object in the square
@return	{void} Nothing
*/
function Square(top, left, bottom, right) {
	// Optional parameter default to 0
	if (top === undefined) { this.top = new Line(); } else { this.top = top; }
	if (left === undefined) { this.left = new Line(); } else { this.left = left; }
	if (bottom === undefined) { this.bottom = new Line(); } else { this.bottom = bottom; }
	if (right === undefined) { this.right = new Line(); } else { this.right = right; }

	/**
	Initlization code for the Square class.
	@param {void} Nothing.
	@return {void} Nothing.
	*/
	this.init = function () {
		try {
			// Record this Square in each of the lines
			this.top.connects.push(this);
			this.left.connects.push(this);
			this.bottom.connects.push(this);
			this.right.connects.push(this);
			this.sides = 0;
			this.alpha_point = false;
			this.x = 0;
			this.y = 0;
			this.width = 0;
			this.height = 0;
		} catch (err) {
			logError("Error Square::init " + err);
			return;
		}
	};

	/**
	Returns a human readable string of the Square.
	@param {void} Nothing.
	@return {string} Returns a human readable string of the Square.
	*/
	this.toString = function () {
		return "(Square top " + this.top + " left " + this.left + " bottom " + this.bottom + " right " + this.right + ")";
	};

	this.init();
}/**
The main engine for HTML5 canvas
@class vortexEngine
@param {float} passGridWidth The grid width in units
@param {float} passGridHeight  The grid height in units
@return {void} Nothing
*/
function vortexEngine(passGridWidth, passGridHeight) {
	this.maxWidth = 800;
	this.maxHeight = 800;
	this.fontSize = 16;
	this.gridWidth = passGridWidth;
	this.gridHeight = passGridHeight;
	this.offsetX = 0;
	this.offsetY = 0;
	this.pixelWidth = this.maxWidth / this.gridWidth;
	this.pixelHeight  = this.maxHeight / this.gridHeight;
	this.widthToHeight = this.maxWidth / this.maxHeight;
	this.redraw = true;
	
	// Key and mouse states
	this.keyState = new Array(250);
	this.mouseState = new mouseInfo(this);

	/**
	The start code for the engine
	@class vortexEngine
	@param {gameManager} passGame The instance of the game functions
	@return {void} Nothing
	*/
	this.init = function(passGame){
		var i;
		var instance = this;
		this.game = passGame;
		
		// Make all versions of requestAnimationFrame into one function
		(function() {
			var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
			window.requestAnimationFrame = requestAnimationFrame; })();
		
		this.gameArea = document.getElementById('gameArea');
		this.canvasMain = document.getElementById('gameCanvas');
		
		// Set every key to the state of not pressed
		for (i = 0; i < this.keyState.length; i++) {
			this.keyState[i] = false;
		}
		
		if (!(this.canvasMain.getContext && this.canvasMain.getContext('2d'))) {
			alert("Unable to get context of canvas, please use a newer browser like Internet Explorer 10.0+, Firefox 2.0+ or Chrome 4.0+.");
		} else {
			window.addEventListener('resize', function() {instance.resizeGame();}, false);
			window.addEventListener('orientationchange', function() {instance.resizeGame();}, false);

			this.contextMain = this.canvasMain.getContext('2d');
			
			// Create back up buffer
			this.canvasBuffer = document.createElement('canvas');
			this.canvasBuffer.width = this.maxWidth;
			this.canvasBuffer.height = this.maxHeight;
			this.contextBuffer = this.canvasBuffer.getContext('2d');
			
			// Connect mouse/touch events to main canvas
			this.canvasMain.addEventListener('mousemove', function(e) { instance.mouse_event(e);}, false);
			this.canvasMain.addEventListener('mouseover', function(e) { instance.mouse_event(e);}, false);
			this.canvasMain.addEventListener('mouseup', function(e) { instance.mouse_event(e);}, false);
			this.canvasMain.addEventListener('mousedown', function(e) { instance.mouse_event(e);}, false);
			this.canvasMain.addEventListener('mouseout', function(e) { instance.mouse_event(e);}, false);
			this.canvasMain.addEventListener("touchstart", function(e) { instance.mouse_event(e);}, false);
			this.canvasMain.addEventListener("touchmove", function(e) { instance.mouse_event(e);}, false);
			this.canvasMain.addEventListener("touchend", function(e) { instance.mouse_event(e);}, false);
			
			// Connect keyboard events to main canvas
			window.addEventListener( "keydown", function(e) { instance.key_event(e);}, true);
			window.addEventListener( "keyup", function(e) { instance.key_event(e);}, true);

			// Set the focus on the canvas so the events get passed correctly
			this.canvasMain.focus();
			
			// Resize the game for the first time
			this.resizeGame();
			
			// Run the game init custom code
			this.game.init(this);
			
			// Start the rendering process
			this.render();
		}
	};
	
	/**
	Draw the game grid with one line every unit
	@param {string} passColor The color of the grid.
	@return {void} Nothing.
	*/
	this.drawGrid = function(passColor) {
		// Setup the drawing
		this.contextBuffer.beginPath();
		this.contextBuffer.strokeStyle = passColor;

		var i, x, y;
		for (i = 0; i <= this.gridWidth; i++) {
			x = i * this.pixelWidth;
			this.contextBuffer.moveTo(x, 0);
			this.contextBuffer.lineTo(x, this.maxHeight);
		}
		
		for (i = 0; i <= this.gridHeight; i++) {
			y = i * this.pixelHeight;
			this.contextBuffer.moveTo(0, y);
			this.contextBuffer.lineTo(this.maxWidth, y);
		}

		// Draw the grid all at once
		this.contextBuffer.stroke();
	};
	
	/**
	Resize the game area whenever the size of the windows changes or the device is rotated.
	@param {float} passMaxWidth The back buffers width in pixels
	@param {float} passMaxHeight The back buffers height in pixels
	@param {float} passFont The font used for writing to the buffer
	@return {void} Nothing.
	*/
	this.resizeBuffer = function(passMaxWidth, passMaxHeight, passFontSize) {
		this.maxWidth = passMaxWidth;
		this.maxHeight = passMaxHeight;
		this.fontSize = passFontSize;
		this.offsetX = 0;
		this.offsetY = 0;
		this.pixelWidth = this.maxWidth / this.gridWidth;
		this.pixelHeight  = this.maxHeight / this.gridHeight;
		this.widthToHeight = this.maxWidth / this.maxHeight;
		this.canvasBuffer.width = this.maxWidth;
		this.canvasBuffer.height = this.maxHeight;
		this.resizeGame();
	};
	
	/**
	Resize the game area whenever the size of the windows changes or the device is rotated.
	@param {void} Nothing.
	@return {void} Nothing.
	*/
	this.resizeGame = function() {
		var newWidth = window.innerWidth;
		var newHeight = window.innerHeight;
		var newWidthToHeight = newWidth / newHeight;
		
		if (newWidthToHeight > this.widthToHeight) {
			newWidth = newHeight * this.widthToHeight;
			this.gameArea.style.height = newHeight + 'px';
			this.gameArea.style.width = newWidth + 'px';
		} else {
			newHeight = newWidth / this.widthToHeight;
			this.gameArea.style.width = newWidth + 'px';
			this.gameArea.style.height = newHeight + 'px';
		}

		newWidth = Math.round(newWidth);
		newHeight = Math.round(newHeight);
		
		this.offsetX = (window.innerWidth - newWidth) / 2
		this.offsetY = (window.innerHeight - newHeight) / 2
		
		this.gameArea.style.marginTop = (-newHeight / 2) + 'px';
		this.gameArea.style.marginLeft = (-newWidth / 2) + 'px';

		this.canvasMain.width = newWidth;
		this.canvasMain.height = newHeight;
		
		this.game.resizeEvent(newWidth, newHeight);
	};

	/**
	Called when a keyboard event occurs.
	@param {event} e - The data and type of event.
	@return {void} Nothing.
	*/
	this.key_event = function(e) {
		var pressed = false;

		// If mouse down set pressed true else assume it's a key up
		if (e.type === 'keydown') {
			pressed = true;
		} 

		this.keyState[e.keyCode] = pressed;
	};

	/**
	Called when a mouse event occurs.
	@param {event} e - The data and type of event.
	@return {void} Nothing.
	*/
	this.mouse_event = function(e) {
		var mousePos;
		e.preventDefault();
		
		// Cross browser mouse position of the canvas
		if (e.type === 'touchmove' || e.type === 'touchstart') {
			this.mouseState.position.x = e.touches[0].pageX - this.offsetX;
			this.mouseState.position.y = e.touches[0].pageY - this.offsetY;
			this.mouseState.position.convertScreenToGrid();
		} else if (e.type === 'touchend') {
			// Do nothing and assume the last position was correct
		} else if (e.offsetX) {
			this.mouseState.position.x = e.offsetX;
			this.mouseState.position.y = e.offsetY;
			this.mouseState.position.convertScreenToGrid();
		} else if (e.layerX) {
			this.mouseState.position.x = e.layerX;
			this.mouseState.position.y = e.layerY;
			this.mouseState.position.convertScreenToGrid();
		}

		// If mouse down
		if (e.type === 'mousedown' || e.type === 'touchstart' ) {
			this.mouseState.button = true;
			this.game.mouseEvent("down", this.mouseState.position.clone());
		// If mouse up 
		} else if (e.type === 'mouseup' || e.type === 'touchend' || e.type === "touchleave" || e.type === "touchcancel")  {
			this.mouseState.button = false;
			this.game.mouseEvent("up", this.mouseState.position.clone());
		// If a mouse move 
		} else if (e.type === 'mousemove' || e.type === 'mouseover' || e.type === 'touchmove') {
			this.mouseState.onCanvas = true;
			this.game.mouseEvent("move", this.mouseState.position.clone());
		// If mouse out
		} else if (e.type === 'mouseout') {
			this.mouseState.onCanvas = false;
			this.game.mouseEvent("out", this.mouseState.position.clone());
		}
	};

	/**
	Runs up to 60 fps
	@param {void} Nothing.
	@return {void} Nothing.
	*/
	this.render = function(e) {
		// Figure out how long since last render
		var instance = this;
		var newRender = new Date();
		var delta = newRender - this.lastRender;
		this.lastRender = newRender;
		
		if (this.redraw) {
			// Clear buffer screen and main screen
			this.canvasMain.width = this.canvasMain.width;
			this.canvasBuffer.width = this.canvasBuffer.width;
			
			// Draw on the buffer
			this.game.draw();
			
			// Draw the buffer to the screen
			this.contextMain.drawImage(this.canvasBuffer, 0, 0, this.canvasBuffer.width, this.canvasBuffer.height, 0, 0, this.canvasMain.width, this.canvasMain.height);
		}
		this.redraw = false;
		
		// Setup next render
		window.requestAnimationFrame(this.render.bind(this));
	};
}