// Page elements
var $newPlayerName = $("#newPlayerName");
var $newPlayerButton = $("#newPlayerButton");

var $highscores = $("#highScores");
var $numPlayersButtons = $(".numPlayersButton");
var $numPlayersHeader = $("#numPlayersHeader");
var $newPlayerArea = $("#newPlayerArea");
var $currentPlayersArea = $("#currentPlayersArea");

var $startGame = $("#startGame");

// Variables
var numPlayers = 0;
var chosenPlayers = 0;
var currentPlayers = [];

// The API object contains methods for each kind of request we'll make
var API = {
  savePlayer: function(player) {
    console.log(JSON.stringify(player));
    return $.ajax({
      headers: {
        "Content-Type": "application/json"
      },
      type: "POST",
      url: "api/players",
      data: JSON.stringify(player)
    });
  },
  saveThis: function(player) {
    return $.ajax({
      method: "PUT",
      url: "/api/players",
      data: player
    });
  },
  getPlayers: function() {
    return $.ajax({
      url: "api/players",
      type: "GET"
    });
  },
  getPlayer: function(id) {
    return $.ajax({
      url: "api/players/"+id,
      type: "GET"
    });
  },
  deletePlayer: function(id) {
    return $.ajax({
      url: "api/players/" + id,
      type: "DELETE"
    });
  }
};

API.getPlayers();

// refreshPlayers gets new examples from the db and repopulates the list
var refreshPlayers = function() {
  API.getPlayers().then(function(data) {
    var $players = data.map(function(player) {
      var $row = $("<span style='display: inline-block; padding: 5px; background: lightblue; border: 1px solid black'>");
      $row.addClass("player");
      $row.attr("id","player"+player.id);

      $row.append("<p>" + player.playerName + " </p>");
      $row.append("<p>Score: " + player.score + "</p>");
      $row.append("<p>Wins: " + player.wins + "</p>");
      $row.append("<p>Losses: " + player.losses + "</p>");
      $row.append("<button style='background-color: lightgreen' onclick='playerChosen("+player.id+")'>Select</button>");
      $row.append("<button style='background-color: darkred' onclick='handleDeleteBtnClick("+player.id+")'>Remove</button>");

      return $row;
    });

    $highscores.empty();
    $highscores.append($players);
  });
};

// Save the new player to the db and refresh the highscore
var playerFormSubmit = function(event) {

  console.log("Creating new player");
  event.preventDefault();

  var newPlayer = {
    playerName: $newPlayerName.val().trim(),
    score: 0,
    round: 0,
    wins: 0,
    losses: 0
  }

  if (!newPlayer.playerName) {
    alert("You must enter a player name!");
    return;
  }

  API.savePlayer(newPlayer).then(function() {
    refreshPlayers();
  });

  $newPlayerName.val("");
};

// Remove a player from the highscore list and refresh the list
var handleDeleteBtnClick = function(id) {
  console.log("Deleting player");

  API.deletePlayer(id).then(function() {
    refreshPlayers();
  });
};

var numPlayersChosen = function(quantity) {
  console.log("Number of players chosen!");
  console.log(quantity);
  numPlayers = quantity;
  //$highscores.style.display = 'block';
  //$newPlayerButton.display = 'none';
  $highscores.css("display", "block");
  $newPlayerArea.css("display", "block");
  $numPlayersButtons.css("display", "none");
  $numPlayersHeader.css("display", "none");
}

var playerChosen = function(playerID) {
  $("#player"+playerID).css("display", "none");
  chosenPlayers++;

  API.getPlayer(playerID).then(function(player) {
    currentPlayers.push(player);
  });

  if (chosenPlayers >= numPlayers) {
    console.log("All players selected");
    $highscores.css("display", "none");
    $startGame.css("display", "block");
    $newPlayerArea.css("display", "none");

    for (var i = 1; i <= currentPlayers.length; i++) {
      var $row = $("<span style='display: inline-block; padding: 5px; background: lightblue; border: 1px solid black'>");
      $row.append("<p style='font-weight: bold;'>Player "+i+"</p>");
      $row.append("<p>" + currentPlayers[i-1].playerName + " </p>");
      $row.append("<p>Score: " + currentPlayers[i-1].score + "</p>");
      $row.append("<p><span style='padding: 2px';>Wins: " + currentPlayers[i-1].wins + "</span>"+
        "<span style='padding:2px;'>Losses: " + currentPlayers[i-1].losses +"</span></p>");
      $currentPlayersArea.append($row);
      $currentPlayersArea.append("<span style='font-weight: bold; font-size: 20px; padding: 3px'>VS</span>");
    }
    API.getPlayer(playerID).then(function(player) {
      var $row = $("<span style='display: inline-block; padding: 5px; background: lightblue; border: 1px solid black'>");
      $row.append("<p style='font-weight: bold;'>Player "+chosenPlayers+"</p>");
      $row.append("<p>" + player.playerName + " </p>");
      $row.append("<p>Score: " + player.score + "</p>");
      $row.append("<p><span style='padding: 2px';>Wins: " + player.wins + "</span>"+
        "<span style='padding:2px;'>Losses: " + player.losses +"</span></p>");
      $currentPlayersArea.append($row);
    });
  }
  console.log(currentPlayers);
}

// Add event listeners to the submit and delete buttons
$newPlayerButton.on("click", playerFormSubmit);
refreshPlayers();
