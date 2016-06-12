var myFirebaseRef = new Firebase("https://flickering-fire-8876.firebaseio.com/");
var data = [];

myFirebaseRef.on("value", function(snapshot) {
  fireData = snapshot.val();

  for (var key in fireData) {
    var incID = 0;
    var obj = {
      id: incID,
      text: key,
      data: fireData[key]
    };
    data.push(obj);
    incID += 1;
  }

  // Alphabetical sort
  data = data.sort(function(a,b) {
    if ( b.text.toLowerCase() < a.text.toLowerCase() ) { return 1 }
    else if ( b.text.toLowerCase() > a.text.toLowerCase() ) { return -1 }
    else { return 0 }
  });

  // Add data to list.
  $(".select2").select2({
    data: data
    // Uncomment next line if typing function never gets fixed
    // minimumResultsForSearch: Infinity
  });
});

$('#select2').click(function() {
  // console.log($('div.row select').select2('data')[0].text)
  // console.log('here', $('div.row select').select2('data')[0].data);
  loadSchem($('div.row select').select2('data')[0].data);
})

function loadSchem(rawData) {
  console.log(rawData);
  rawData = rawData.split('\n');

  var loadOffsetX = null;
  var loadOffsetY = Math.floor((gridSize - (rawData.length - 2)) / 2);

  // Check the lines, find the offset.
  for (var i=0; i<rawData.length; i++) {
    if (rawData[i][0] === "!" || rawData[i].length < 1 ) {
      continue;
    } else if (loadOffsetX === null) {
      console.log(gridSize, Math.floor((gridSize - rawData[i].length) / 2), loadOffsetY )
      loadOffsetX = Math.floor((gridSize - rawData[i].length) / 2);
    }
  }

  var loading = new Board();
  loading.initEmpty();

  // Go through each instruction and draw to this instance of loading.grid
  for (var y=0; y<rawData.length; y++) {
    if (rawData[y][0] === "!" || rawData[y].length < 1 ) {continue;}
    for (var x=0; x<rawData[y].length; x++) {
      if (rawData[y][x] === "O") {
        loading.grid[(loadOffsetX-1) + x][(loadOffsetY-1) + y] = true;
      }
    }
  }

  live.grid = loading.grid;
  live.commit();
}

$('#loader').click(function() {
  var rawInput = $('#load-data').val();
  if (rawInput[0] !== "!") {
    console.log("Not a RAWTEXT official format");
  } else {
    loadSchem(rawInput);
  }
})

$('#saver').click(function() {
  var rawInput = $('#load-data').val();
  if (rawInput[0] !== "!") {
    console.log("Not a RAWTEXT official format");
  } else {
    var name = rawInput.split(/:\s?(.*)\n/)[1].trim()
      // console.log("obj ", obj2)
      // var newEntry = '{ "' + name + '": "' + 'rawInput' + '" }'
      myFirebaseRef.child(name).set(rawInput);
    }

});

