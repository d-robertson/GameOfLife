$('#loader').click(function() {
  var rawInput = $('#load-data').val();
  rawInput = rawInput.split('\n');

  var loadOffsetX = null;
  var loadOffsetY = Math.floor((gridSize - (rawInput.length - 2)) / 2);

  // Check the lines, find the offset.
  for (var i=0; i<rawInput.length; i++) {
    if (rawInput[i][0] === "!" || rawInput[i].length < 1 ) {
      continue;
    } else if (loadOffsetX === null) {
      console.log(gridSize, Math.floor((gridSize - rawInput[i].length) / 2), loadOffsetY )
      loadOffsetX = Math.floor((gridSize - rawInput[i].length) / 2);
    }
  }

  var loading = new Board();
  loading.initEmpty();


  for (var y=0; y<rawInput.length; y++) {
    if (rawInput[y][0] === "!" || rawInput[y].length < 1 ) {continue;}
    for (var x=0; x<rawInput[y].length; x++) {
      console.log(rawInput[y].length, y,x);
      if (rawInput[y][x] === "O") {
        console.log(loadOffsetX, (loadOffsetX-1) + x);
        loading.grid[(loadOffsetX-1) + x][(loadOffsetY-1) + y] = true;
      }
    }
  }

  live.grid = loading.grid;
  live.commit();

})