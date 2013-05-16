$(function () {

	var $cf = $('#connect-four'),
		$cols = $('.col', $cf),
		translations = [
			{x: 1, y: 0}, // Right
			{x: 0, y: 1}, // Up
			{x: 1, y: 1}, // Diagonal up right
			{x: 1, y: -1} // Diagonal down right
		],
		grid = [ // The base grid where -1 is an empty cell
			[-1,-1,-1,-1,-1,-1,-1],
			[-1,-1,-1,-1,-1,-1,-1],
			[-1,-1,-1,-1,-1,-1,-1],
			[-1,-1,-1,-1,-1,-1,-1],
			[-1,-1,-1,-1,-1,-1,-1],
			[-1,-1,-1,-1,-1,-1,-1]
		]
		player = 0;

	function victoryCheck(grid, y, x, id) {
		var count, i, j;
		// Loop over each of the 4 directions
		for (i = 0, l = translations.length; i < l; i++) {
			count = 0;
			// Check along the line in that particular direction
			for (j = -5; j < 5; j++) {
				if (grid[y + (translations[i].y * j)] !== undefined) {
					if (grid[y + translations[i].y * j][x + translations[i].x * j] === id) {
						count++;
					} else {
						// Maybe the line broke
						count = 0;
					}
				}
				if (count >= 4) {
					return true;
				}
			}
		}
	}

	function addToColumn(grid, colIndex, id) {
		var tempGrid = deepCopy(grid), i,
			added = false;
		for (i = tempGrid.length - 1; i >= 0; i--) {
			if (tempGrid[i][colIndex] === -1) {
				tempGrid[i][colIndex] = id;
				added = true;
				break;
			}
		}
		if (added) {
			return {
				grid: tempGrid,
				rowIndex: i
			};
		} else {
			// Column is full already
			return false;
		}
	}

	function doTurn(grid) {
		var scores = [0, 0, 0, 0, 0, 0, 0], i, colIndex;
		scores = aiTurn(grid, 4, player, scores, true);
		console.log(scores);
		for (i = 0; i < scores.length; i++) {
			if (colIndex === undefined || scores[i] > scores[colIndex]) {
				colIndex = i;
			}
		}
		$cols.eq(colIndex).click();
	}

	function aiTurn(grid, count, id, scores, initial, scoreTracker) {
		var result, i = 0, counter, p;
		while (i < 7) {
			p = id;
			if (initial) {
				scoreTracker = i;
			}
			counter = count;
			result = addToColumn(grid, i, p);
			if (result) {
				if (victoryCheck(result.grid, result.rowIndex, i, p)) {
					if (p === player) {
						scores[scoreTracker] += counter;
					} else {
						scores[scoreTracker] -= counter + 1;
					}
				}
				p = p === 0 ? 1 : 0;
				if (counter-- > 0) {
					aiTurn(result.grid, counter, p, scores, false, scoreTracker);
				}
			}
			i += 1;
		}
		return scores;
	}


	function victory() {
		alert('Victory!');
	}

	function deepCopy(obj) {
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


	$cols.click(function () {
		var colIndex = $cols.index($(this)),
			$cells = $cols.eq(colIndex).children(),
			$target = $cells.not('.disc').last(),
			rowIndex = $cells.index($target);
		if (rowIndex === -1) {
			return; // Column is full, go again
		}
		grid[rowIndex][colIndex] = player; // Set the matric value to the player id
		$target.addClass((player === 0 ? 'disc yellow' : 'disc red'));
		if (victoryCheck(grid, rowIndex, colIndex, player)) {
			victory();
		}
		player = player === 0 ? 1 : 0;
		if (player === 1) {
			doTurn(grid);
		}
	});

});

var cf = {};

cf.Game = function () {

	this.$cf = $('#connect-four'),
	this.$cols = $('.col', $cf),
	this.translations = translations = [
		{x: 1, y: 0}, // Right
		{x: 0, y: 1}, // Up
		{x: 1, y: 1}, // Diagonal up right
		{x: 1, y: -1} // Diagonal down right
	];
	this.grid = [ // The base grid where -1 is an empty cell
		[-1,-1,-1,-1,-1,-1,-1],
		[-1,-1,-1,-1,-1,-1,-1],
		[-1,-1,-1,-1,-1,-1,-1],
		[-1,-1,-1,-1,-1,-1,-1],
		[-1,-1,-1,-1,-1,-1,-1],
		[-1,-1,-1,-1,-1,-1,-1]
	];

};

cf.Game.prototype = {

	_bind: function () {

	}

}