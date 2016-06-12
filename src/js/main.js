function Board() {
  this.grid = [];
}

Board.prototype.initEmpty = function() {
  this.grid = [];
  for (var y=0; y<60; y++) {
    this.grid.push([]);
    for (var x=0; x<60; x++) {
      this.grid[y].push(false); // Using boolians because its only 1 bit of data
    }
  }
}

Board.prototype.commit = function() {
  var html = "";

  // Generate HTML data based on array data
  for (var y=0; y<60; y++) {
    for (var x=0; x<60; x++) {
      if (this.grid[x][y]) {
        html += '<div id="' + ((60*y) + x) + '" class="y"></div>';
      } else {
        html += '<div id="' + ((60*y) + x) + '"></div>';
      }
    }
  }

  // Print to board
  $('.primary').html(html);
}


Board.prototype.applyRules = function(liveBoard) {
  for (var y=0; y<60; y++) { 
    for (var x=0; x<60; x++) {
      // Iterate through each cell and apply the 4 rules to it.
      var livingNeighbors = 0;
      for (var i=0; i<9; i++) {

        // Scanning management - skip 4 and abort if array query is OOB
        if (i === 4) { continue; } // i === 4 is it's own self.
        xCoord = (x-1) + (i % 3);
        yCoord = (y-1) + Math.floor(i/3);

        // Out of array bounds error fix. Skip the loops that are OOB
        // if (xCoord < 0 || xCoord > 59) { continue;}
        // if (yCoord < 0 || yCoord > 59) { continue;}
        if (xCoord < 0) { 
          xCoord = 59
        } else if (xCoord > 59) {
          xCoord = 0;
        }
        if (yCoord < 0) { 
          yCoord = 59;
        } else if (yCoord > 59) {
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
        // console.log("Rule 1");
        // console.log("this.grid[x][y] is: ", this.grid[x][y], liveBoard.grid[x][y]);
      }
      // Rule 2 - Any live cell with more than three live neighbours dies
      if (liveBoard.grid[x][y] && livingNeighbors > 3) {
        this.grid[x][y] = false;
        // console.log("Rule 2");
      }
      // Rule 3 - Any live cell with two or three live neighbours lives, unchanged, to the next generation.
      if (livingNeighbors === 2 || livingNeighbors === 3 ) {
        this.grid[x][y] = liveBoard.grid[x][y]
        // console.log("Rule 3");
        // continue;
      }
      // Rule 4 - Any dead cell with exactly three live neighbours will come to life.
      if (liveBoard.grid[x][y] === false && livingNeighbors === 3) {
        this.grid[x][y] = true;
        // console.log("Rule 4");
      }
    }
  }
}

function nextGeneration(live, buffer) {
  console.log("played");
  buffer.initEmpty();
  buffer.applyRules(live);
  buffer.commit();
  live.grid = buffer.grid;
}


// On Doc Ready
$(document).ready(function() {
  var playing = null;

  var live = new Board();
  live.initEmpty();
  
  var buffer = new Board();
  buffer.grid = live.grid;
  buffer.commit();
  
  // Event Deligation
  $('.primary').on("click", "div", function(event) {
    if ($(this).hasClass('y')) {
      $(this).removeClass('y'); // Remove class and remove from grid
      live.grid[$(this).attr('id') % 60][Math.floor($(this).attr('id') / 60)] = false;
    } else {
      $(this).addClass('y'); // Add class and add to grid
      live.grid[$(this).attr('id') % 60][Math.floor($(this).attr('id') / 60)] = true;
    }  
  })
  $('#next').click(function() {
    nextGeneration(live, buffer);
  })
  $('#play').click(function() {
    // If not playing, play. Else stop the playing
    if (playing === null) {
      playing = setInterval(function() {
        nextGeneration(live,buffer);
      }, 100);
    } else {
      clearTimeout(playing);
      playing = null;
    }
  })

})




// invert board
// if (liveBoard.grid[x][y] === false) {
//   this.grid[x][y] = true;
//   continue;
// }