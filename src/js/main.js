var gridSize = 60;
var generation = 0;
var live;
var buffer;
var first;
var debugLoops = 0;

function Board() {
  this.grid = [];
  this.size = gridSize;
}

Board.prototype.initEmpty = function() {
  this.grid = [];
  for (var y=0; y<this.size; y++) {
    this.grid.push([]);
    for (var x=0; x<this.size; x++) {
      this.grid[y].push(null); // Using boolians because its only 1 bit of data
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

Board.prototype.countNeighbors = function(x,y,liveBoard) {
  // Iterate through each cell and apply the 4 rules to it.
  var livingNeighbors = 0;
  for (var i=0; i<9; i++) {
    if (livingNeighbors >= 4) {break;}
    debugLoops += 1;

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
  // if (x == 57 && y == 2) {
  //   console.log("while leaving: ", livingNeighbors);
  // }
  return livingNeighbors;
}

Board.prototype.applyRules = function(x, y, liveBoard, liveNeighbors) {
  // Rule 1 - Any live cell with fewer than two live neighbours dies
  if (liveBoard.grid[x][y] && liveNeighbors < 2) {
    this.grid[x][y] = false;
    // console.log('rule 1');
  }
  // Rule 2 - Any live cell with more than three live neighbours dies
  if (liveBoard.grid[x][y] && liveNeighbors > 3) {
    this.grid[x][y] = false;
    // console.log('rule 2');
  }
  // Rule 3 - Any live cell with two or three live neighbours lives, unchanged, to the next generation.
  if (liveNeighbors === 2 || liveNeighbors === 3 ) {
    this.grid[x][y] = liveBoard.grid[x][y]
    // console.log('rule 3');
  }
  // Rule 4 - Any dead cell with exactly three live neighbours will come to life.
  if ((liveBoard.grid[x][y] === false || liveBoard.grid[x][y] === null) && liveNeighbors === 3) {
    this.grid[x][y] = true;
    // console.log('rule 4');
  }
  // If nothing happens by now, set it away from null to avoid re-calculation
  if (liveBoard.grid[x][y] === null) {
    liveBoard.grid[x][y] = false;
  }
}

Board.prototype.calculate = function(liveBoard) {
  // var resumeX, resumeY = 0;

  for (var y=0; y<this.size; y++) { 
    for (var x=0; x<this.size; x++) {
      var liveNeighbors;
      var prevCoordX;
      var prevCoordY

      // Method for skipping as many cycles as possible
      // If found a black square...
      if (liveBoard.grid[x][y]) {

        for (var i=0; i<9; i++) {
          // NEED TO SKIP DOUBLE CHECKS
          if (i === 4) { continue; } // i === 4 is it's own self.
          xCoord = (x-1) + (i % 3);
          yCoord = (y-1) + Math.floor(i/3);
          
          // Needs refinement
          // If it is simply one more square over, then skip this loop as it has
          // already been calculated
          // if ( prevCoordY === yCoord && prevCoordX === prevCoordX + 1 ) {
          //   console.log("saved one", yCoord, lastCoord[1]);
          //   lastCoord = [xCoord, yCoord];
          //   continue;
          // }

          

          // Instead of out of bounds errors, correct it by looping
          // This code is duplicated inside countNeighbors. Condense?
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

          if (xCoord == 1 && yCoord == 1) {
            console.log("11: ", liveBoard.grid[xCoord][yCoord])
          }

          

          // Wierd bug where this.countNeighbors() must be inside this function.
          // Assignment to a variable results in incorrect integer.
          this.applyRules(xCoord, yCoord, liveBoard, this.countNeighbors(xCoord, yCoord, liveBoard) )
          lastCoord = [xCoord, yCoord];
        }



        // Old code before shortening

        // Check the 3 squares above the currently found black square
        // for (var a=x-1; a<(x-1)+3; a++) {
        //   liveNeighbors = this.countNeighbors(a,y-1,liveBoard);
        //   this.applyRules(a, y-1, liveBoard, liveNeighbors)
        //   liveNeighbors = 0;
        //   console.log("checking ", a, y-1);
        // }

        // // If the previous square (left one) is null, calculate it
        // if (this.grid[x-1][y] === null) {
        //   liveNeighbors = this.countNeighbors(x-1,y,liveBoard);
        //   this.applyRules(x-1, y, liveBoard, liveNeighbors)
        //   liveNeighbors = 0;
        // }
        
        // // Calculate current cell
        // liveNeighbors = this.countNeighbors(x,y,liveBoard);
        // this.applyRules(x, y, liveBoard, liveNeighbors)
        // liveNeighbors = 0;

        // // Check the square to the right. Room for optimization?
        // if (this.grid[x+1][y] === null) {
        //   liveNeighbors = this.countNeighbors(x+1,y,liveBoard);
        //   this.applyRules(x+1, y, liveBoard, liveNeighbors)
        //   liveNeighbors = 0;
        // }

        // // Check the 3 squares beflow the currently found black square
        // for (var a=x-1; a<(x-1)+3; a++) {
        //   liveNeighbors = this.countNeighbors(a,y+1,liveBoard);
        //   this.applyRules(a, y+1, liveBoard, liveNeighbors)
        //   liveNeighbors = 0;
        //   console.log("checking ", a, y+1);
        // }



      }

      // old old code where it checked every cell. 32,000 loops per gen

      // liveNeighbors = this.countNeighbors(x,y,liveBoard);
      // this.applyRules(x, y, liveBoard, liveNeighbors)

      
    }
  }
}

function nextGeneration(live, buffer) {
  buffer.initEmpty();
  buffer.calculate(live);
  buffer.commit();
  live.grid = buffer.grid;
  generation += 1;
  console.log("cycles per gen: ", debugLoops);
  debugLoops = 0;
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
      $('#play').text("Play");
    }
    setBrowserSize(live, buffer);
  })

  // Event Deligation
  $('.primary').on("click", "div", function(event) {
    if ($(this).hasClass('y')) {
      $(this).removeClass('y'); // Remove class and remove from grid
      live.grid[$(this).attr('id') % gridSize][Math.floor($(this).attr('id') / gridSize)] = null;
    } else {
      $(this).addClass('y'); // Add class and add to grid
      live.grid[$(this).attr('id') % gridSize][Math.floor($(this).attr('id') / gridSize)] = true;
      console.log($(this).attr('id') % gridSize,Math.floor($(this).attr('id') / gridSize));
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

