$(function () {

	new cf.Game();

});


var cf = {};

cf.Game = function () {

	this.gameState = new cf.GameState();
	this.ai = new cf.AI(this);
	this.player = 0;
	this.activePlayer = 0;
	this.complete = false; // Set to true when a victory is attained

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

	_bind: function () {
		var self = this;
		self.$cols.on('click', function () {
			var colIndex = self.$cols.index($(this)),
				result = self.gameState.addToColumn(colIndex, false, self.activePlayer),
				victoryCells;
			if (!result || self.complete) {
				return;
			}
			self.$cols.eq(colIndex).find('.cell').eq(result.lastTurn.rowIndex).removeClass('red yellow').addClass((self.activePlayer === 0 ? 'disc yellow' : 'disc red'));
			if (victoryCells = result.victoryCheck()) {
				self.complete = true;
				self._highlightCells(victoryCells);
				window.setTimeout(function () {
					self._reset();
					new cf.Game();
				}, 2000);
			}
			self.activePlayer = self.activePlayer === 0 ? 1 : 0;
			if (self.activePlayer === 1) {
				self.ai.findTurn();
			}
		});
	},

	_reset: function () {
		this.$cells.removeClass('disc highlight');
		this.$cols.off('click');
	},

	_highlightCells: function (cells) {
		var i;
		for (i = 0; i < cells.length; i++) {
			this.$cols.eq(cells[i].colIndex).find('.cell').eq(cells[i].rowIndex).addClass('highlight');
		}
	}

};

cf.GameState = function () {

	this.grid = [ // The base grid where -1 is an empty cell
		[-1,-1,-1,-1,-1,-1,-1],
		[-1,-1,-1,-1,-1,-1,-1],
		[-1,-1,-1,-1,-1,-1,-1],
		[-1,-1,-1,-1,-1,-1,-1],
		[-1,-1,-1,-1,-1,-1,-1],
		[-1,-1,-1,-1,-1,-1,-1]
	];

};

cf.GameState.prototype = {

	constructor: cf.GameState,

	addToColumn: function (colIndex, preserve, id) {
		var tempState, i;
		if (preserve) {
			tempState = this.clone();
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
		var cells, i, j;
		// Loop over each of the 4 directions
		for (i = 0, l = this.translations.length; i < l; i++) {
			cells = [];
			// Check along the line in that particular direction
			for (j = -5; j < 5; j++) {
				if (this.grid[this.lastTurn.rowIndex + (this.translations[i].y * j)] !== undefined) {
					if (this.grid[this.lastTurn.rowIndex + this.translations[i].y * j][this.lastTurn.colIndex + this.translations[i].x * j] === this.lastTurn.player) {
						cells.push({colIndex: this.lastTurn.colIndex + this.translations[i].x * j, rowIndex: this.lastTurn.rowIndex + this.translations[i].y * j});
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

	clone: function () {
		var result = new cf.GameState();
		result.grid = cf.utils.deepCopy(this.grid);
		return result;
	},

	translations: [ // Static final
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

	findTurn: function () {
		var scores = [0, 0, 0, 0, 0, 0, 0], i, colIndex;
		scores = this.checkTurn(this.game.gameState, 4, this.game.activePlayer, scores, true);
		for (i = 0; i < scores.length; i++) { // Find the highest score for a column that isn't full
			if ((colIndex === undefined || scores[i] > scores[colIndex]) && this.game.gameState.addToColumn(i, true)) {
				colIndex = i;
			}
		}
		this.game.$cols.eq(colIndex).click();
	},

	checkTurn: function (state, count, id, scores, initial, scoreTracker) {
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
					this.checkTurn(result, counter, p, scores, false, scoreTracker);
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

