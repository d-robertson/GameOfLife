var gridSize = 60;
var generation = 0;
var live;
var buffer;
var first;

function Board() {
  this.grid = [];
  this.size = gridSize;
}

Board.prototype.initEmpty = function() {
  this.grid = [];
  for (var y=0; y<this.size; y++) {
    this.grid.push([]);
    for (var x=0; x<this.size; x++) {
      this.grid[y].push(false); // Using boolians because its only 1 bit of data
    }
  }
}

Board.prototype.commit = function() {
  var html = "";

  // Generate HTML data based on array data
  for (var y=0; y<this.size; y++) {
    for (var x=0; x<this.size; x++) {
      if (this.grid[x][y]) {
        html += '<div id="' + ((this.size*y) + x) + '" class="y"></div>';
      } else {
        html += '<div id="' + ((this.size*y) + x) + '"></div>';
      }
    }
  }

  // Print to board
  $('.primary').html(html);
}


Board.prototype.applyRules = function(liveBoard) {
  for (var y=0; y<this.size; y++) { 
    for (var x=0; x<this.size; x++) {
      // Iterate through each cell and apply the 4 rules to it.
      var livingNeighbors = 0;
      for (var i=0; i<9; i++) {

        // Scanning management - skip 4 and abort if array query is OOB
        if (i === 4) { continue; } // i === 4 is it's own self.
        xCoord = (x-1) + (i % 3);
        yCoord = (y-1) + Math.floor(i/3);

        // Instead of out of bounds errors, correct it by looping
        if (xCoord < 0) { 
          xCoord = this.size -1
        } else if (xCoord > this.size -1) {
          xCoord = 0;
        }
        if (yCoord < 0) { 
          yCoord = this.size -1;
        } else if (yCoord > this.size -1) {
          yCoord = 0;
        }

        // Count the living neighbors
        if (liveBoard.grid[ xCoord ][ yCoord ]) {
          livingNeighbors += 1;
        }
      }

      // Rule 1 - Any live cell with fewer than two live neighbours dies
      if (liveBoard.grid[x][y] && livingNeighbors < 2) {
        this.grid[x][y] = false;
      }
      // Rule 2 - Any live cell with more than three live neighbours dies
      if (liveBoard.grid[x][y] && livingNeighbors > 3) {
        this.grid[x][y] = false;
      }
      // Rule 3 - Any live cell with two or three live neighbours lives, unchanged, to the next generation.
      if (livingNeighbors === 2 || livingNeighbors === 3 ) {
        this.grid[x][y] = liveBoard.grid[x][y]
      }
      // Rule 4 - Any dead cell with exactly three live neighbours will come to life.
      if (liveBoard.grid[x][y] === false && livingNeighbors === 3) {
        this.grid[x][y] = true;
      }
    }
  }
}

function nextGeneration(live, buffer) {
  buffer.initEmpty();
  buffer.applyRules(live);
  buffer.commit();
  live.grid = buffer.grid;
  generation += 1;
  document.title = generation + " generations";
}

function setBrowserSize(live, buffer) {
  var startingGridSize = gridSize;

  if ($(window).width() > 768) {
    gridSize = 60;
  }
  if ($(window).width() > 660 && $(window).width() <= 768) {
    gridSize = 32;
  }
  if ($(window).width() > 480 && $(window).width() <= 660) {
    gridSize = 15;
  }
  if ($(window).width() <= 480) {
    gridSize = 10;
  }

  // Reset everything due to screen size change
  if (startingGridSize !== gridSize) { 
    live.size = gridSize;
    buffer.size = gridSize;
    live.grid = [];
    buffer.grid = [];
    live.initEmpty();
    buffer.initEmpty();
    buffer.commit();
    startingGridSize = gridSize;
  }
}

// On Doc Ready
$(document).ready(function() {
  var playing = null;

  // Board initialization. Two boards: live & buffer. Buffer is the next generation
  live = new Board();
  live.initEmpty();
  buffer = new Board();
  buffer.initEmpty();
  buffer.commit();

  setBrowserSize(live, buffer); // Set initial screen size
  
  // Set screen size due to resize
  $(window).resize(function() {
    if (playing) {
      clearTimeout(playing);
      playing = null;
    }
    setBrowserSize(live, buffer);
  })

  // Event Deligation
  $('.primary').on("click", "div", function(event) {
    if ($(this).hasClass('y')) {
      $(this).removeClass('y'); // Remove class and remove from grid
      live.grid[$(this).attr('id') % gridSize][Math.floor($(this).attr('id') / gridSize)] = false;
    } else {
      $(this).addClass('y'); // Add class and add to grid
      live.grid[$(this).attr('id') % gridSize][Math.floor($(this).attr('id') / gridSize)] = true;
    }  
  })

  // Clear Button
  $('#clear').click(function() {
    generation = 0;
    live.grid = [];
    live.initEmpty();
    live.commit();
    document.title = generation + " generations";
    $('#first').addClass('disabled');
    if (playing !== null) {
      $('#play').text("Play");
      clearTimeout(playing);
      playing = null;
    }
  })

  // First Button
  $('#first').click(function() {
    if (!$('#first').hasClass('disabled')) {
      live.grid = first.grid;
      live.commit();
      generation = 0;
      document.title = generation + " generations";
      $('#first').addClass('disabled');
      // Stop playing
      if (playing !== null) {
        $('#play').text("Play");
        clearTimeout(playing);
        playing = null;
      }
    }

  })

  // Next Button
  $('#next').click(function() {
    if (generation === 0) {
      first = new Board();
      first.grid = live.grid;
      $('#first').removeClass("disabled");
    }
    if (playing === null) {
      nextGeneration(live, buffer);
    }
  })

  // Play Button
  $('#play').click(function() {
    if (generation === 0) {
      first = new Board();
      first.grid = live.grid;
      $('#first').removeClass("disabled");
    }

    // If not playing, play. Else stop the playing
    if (playing === null) {
      $('#play').text("Stop");
      playing = setInterval(function() {
        nextGeneration(live,buffer);
      }, 100);
    } else {
      $('#play').text("Play");
      clearTimeout(playing);
      playing = null;
    }
  })

})

