$(function () {

	new cf.Game();

});


var cf = {};

cf.Game = function () {

	this.gameState = new cf.GameState();
	this.ai = new cf.AI(this);

	this.player = 0;
	this.activePlayer = 0;
	this._complete = false; // Set to true when victory or draw occurs

	this.$container = $('#connect-four');
	this.$cols = $('.col', this.$container);
	this.$cells = $('.cell', this.$container);

	this.init();

};

cf.Game.prototype = {

	init: function () {
		this._reset();
		this._bind();
	},

	makeTurn: function (colIndex) {
		var result = this.gameState.addToColumn(colIndex, false, this.activePlayer),
			self = this, victoryCells;
		if (!result || this._complete) {
			return;
		}
		this.gameState.totalTurns += 1;
		this.$cols.eq(colIndex).find('.cell').eq(result.lastTurn.rowIndex).removeClass('red yellow').addClass((this.activePlayer === 0 ? 'disc yellow' : 'disc red'));
		if (victoryCells = result.victoryCheck() || this.gameState.totalTurns >= this.gameState.totalCells) {
			this._complete = true;
			this._highlightCells(victoryCells);
			window.setTimeout(function () {
				self._reset();
				new cf.Game();
			}, 2000);
		}
		this.activePlayer = this.activePlayer === 0 ? 1 : 0;
		if (this.activePlayer === 1) {
			window.setTimeout(function () { // Delay AI turn so browser can render
				self.ai.makeTurn();
			}, 20);
		}
	},

	_bind: function () {
		var self = this;
		self.$cols.on('click', function () {
			if (self.activePlayer === self.player) {
				var colIndex = self.$cols.index($(this));
				self.makeTurn(colIndex);
			}
		});
	},

	_reset: function () {
		this.$cells.removeClass('disc highlight');
		this.$cols.off('click');
	},

	_highlightCells: function (cells) {
		var i;
		if (cells) {
			for (i = 0; i < cells.length; i++) {
				this.$cols.eq(cells[i].colIndex).find('.cell').eq(cells[i].rowIndex).addClass('highlight');
			}
		}
	}

};

cf.GameState = function () {

	this.grid = this._createGrid(7, 6); // The base grid where -1 is an empty cell
	this.totalCells = 7 * 6;
	this.totalTurns = 0;

};

cf.GameState.prototype = {

	constructor: cf.GameState,

	addToColumn: function (colIndex, preserve, id) {
		var tempState, i;
		if (preserve) {
			tempState = this._clone();
		} else {
			tempState = this;
		}
		for (i = tempState.grid.length - 1; i >= 0; i--) {
			if (tempState.grid[i][colIndex] === -1) {
				tempState.grid[i][colIndex] = id || 0;
				tempState.lastTurn = {
					rowIndex: i,
					colIndex: colIndex,
					player: id
				};
				return tempState;
			}
		}
		// Column is full already
		return false;
	},

	victoryCheck: function () {
		var cells, i, j, row, col;
		// Loop over each of the 4 directions
		for (i = 0, l = this._translations.length; i < l; i++) {
			cells = [];
			// Check along the line in that particular direction
			for (j = -4; j < 4; j++) {
				row = this.lastTurn.rowIndex + (this._translations[i].y * j);
				if (this.grid[row] !== undefined) {
					col = this.lastTurn.colIndex + (this._translations[i].x * j);
					if (this.grid[row][col] === this.lastTurn.player) {
						cells.push({
							rowIndex: row,
							colIndex: col
						});
					} else {
						// Maybe the line broke
						cells = [];
					}
				}
				if (cells.length >= 4) {
					return cells;
				}
			}
		}
	},

	_createGrid: function (x, y) {
		var i, j, temp, result = [];
		for (i = 0; i < y; i++) {
			temp = [];
			for (j = 0; j < x; j++) {
				temp.push(-1);
			}
			result.push(temp);
		}
		return result;
	},

	_clone: function () {
		var result = new cf.GameState();
		result.grid = cf.utils.deepCopy(this.grid);
		return result;
	},

	_translations: [ // Static final
		{x: 1, y: 0}, // Right
		{x: 0, y: 1}, // Up
		{x: 1, y: 1}, // Diagonal up right
		{x: 1, y: -1} // Diagonal down right
	]

};

cf.Player = function (game, id) {
	this.game = game;
	this.id = id;
};

cf.AI = function (game) {

	this.game = game;

};

cf.AI.prototype = {

	makeTurn: function () {
		var scores = [0, 0, 0, 0, 0, 0, 0], i, colIndex,
			self = this;
		scores = this._checkTurn(this.game.gameState, 4, this.game.activePlayer, scores, true);
		for (i = 0; i < scores.length; i++) { // Find the highest score for a column that isn't full
			if ((colIndex === undefined || scores[i] > scores[colIndex]) && this.game.gameState.addToColumn(i, true)) {
				colIndex = i;
			}
		}
		self.game.makeTurn(colIndex);
	},

	_checkTurn: function (state, count, id, scores, initial, scoreTracker) {
		var result, i = 0, counter, p, victoryFound;
		while (i < 7) {
			p = id;
			victoryFound = false;
			if (initial) {
				scoreTracker = i;
			}
			counter = count;
			result = state.addToColumn(i, true, p);
			if (result) {
				if (result.victoryCheck()) {
					if (p === this.game.activePlayer) {
						victoryFound = true;
						scores[scoreTracker] += Math.pow(counter, 3);
					} else {
						scores[scoreTracker] -= Math.pow(counter, 3);
					}
				}
				p = p === 0 ? 1 : 0;
				if (counter-- > 0 && !victoryFound) {
					this._checkTurn(result, counter, p, scores, false, scoreTracker);
				}
			}
			i += 1;
		}
		return scores;
	}

};

cf.utils = {

	deepCopy: function (obj) {
		if (Object.prototype.toString.call(obj) === '[object Array]') {
			var out = [], i = 0, len = obj.length;
			for ( ; i < len; i++ ) {
				out[i] = arguments.callee(obj[i]);
			}
			return out;
		}
		if (typeof obj === 'object') {
			var out = {}, i;
			for ( i in obj ) {
				out[i] = arguments.callee(obj[i]);
			}
			return out;
		}
		return obj;
	}

};

