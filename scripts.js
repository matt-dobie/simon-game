/*
  Author: Matthew Dobie
  Author URL: mattdobie.com
  Description: Script for simple Simon Game
*/


//// UI ////
var ui = {};

// Switch on display
ui.switchOn = function() {
  $(".switch").addClass("switch-on");
  $(".count").addClass("counter-on");
};

// Switch off display
ui.switchOff = function() {
  $(".switch").removeClass("switch-on");
  $(".count").removeClass("counter-on");
  $(".led").removeClass("led-on");
  $(".count").html("--");
};

// Toggle strict mode LED
ui.toggleStrictLed = function () {
  var target = $(".led");
  if (target.hasClass("led-on")) {
    target.removeClass("led-on");
  }
  else {
    target.addClass("led-on");
  }
};

// Light up main buttons
ui.lightUp = function(lightIndex) {
  var lightButton;
  var background;
  var color;
  var sound;
  switch (lightIndex) {
    case 0:
      lightButton = "#green";
      color = "#13ff7c";
      sound = game.sounds.green;
      break;
    case 1:
      lightButton = "#red";
      color = "#ff4c4c";
      sound = game.sounds.red;
      break;
    case 3:
      lightButton = "#yellow";
      color = "#fed93f";
      sound = game.sounds.yellow;
      break;
    case 2:
      lightButton = "#blue";
      color = "#1c8cff";
      sound = game.sounds.blue;
      break;
  }
  if (game.isPaused && lightIndex !== game.simon.sequence[game.userIndex]) {
    sound = game.sounds.error;
    ui.updateCount("!!");
    $(".count").removeClass("counter-on");
    setTimeout(function() {
      $(".count").addClass("counter-on");
      setTimeout(function() {
        $(".count").removeClass("counter-on");
        setTimeout(function() {
          $(".count").addClass("counter-on");
          setTimeout(function() {
            ui.updateCount(game.score);
          }, 200);
        }, 200);
      }, 200); 
    }, 200);
  }
  background = $(lightButton).css("background-color");
  $(lightButton).css("background-color", color);
  sound.play();
  setTimeout(function() {
    $(lightButton).css("background-color", background);
  }, 400*game.tempo); 
};

// Update score counter
ui.updateCount = function(count) {
  if (game.isOn) {
    $(".count").html(count);
  }
};

// Toggle cursor
ui.togglePointer = function() {
  if (game.isPaused) {
    $(".button-main").css("cursor", "pointer");
  }
  else {
    $(".button-main").css("cursor", "default");
  }
};


//// GAME OBJECT ////
var game = {};

// Game state vars
game.isOn = false;
game.isStrict = false;

// Game sounds
game.sounds = {
  green: new Audio("https://s3.amazonaws.com/freecodecamp/simonSound1.mp3"),
  red: new Audio("https://s3.amazonaws.com/freecodecamp/simonSound2.mp3"),
  yellow: new Audio("https://s3.amazonaws.com/freecodecamp/simonSound3.mp3"),
  blue: new Audio("https://s3.amazonaws.com/freecodecamp/simonSound4.mp3"),
  error: new Audio("http://www.soundjig.com/pages/soundfx/beeps.php?mp3=beep7.mp3")
};

// Toggle strict mode
game.toggleStrict = function() {
  ui.toggleStrictLed();
  game.isStrict = game.isStrict ? false : true;
};

// Reset game
game.reset = function() {
  if (game.simon) {
    game.simon.sequence = [];
  }
  game.userIndex = 0;
  game.score = 0;
  game.tempo = 1;
  game.isPaused = false;
  ui.updateCount("--");
  ui.togglePointer();
};

// Win game
game.win = function() {
  game.isPaused = false;
  var lightIndex = 0;
  ui.updateCount(":D");
  var win = setInterval(function() {
    if (game.isOn) {
      ui.lightUp(lightIndex);
    }
    lightIndex++;
    if (lightIndex === 4) {
      clearInterval(win);
      setTimeout(function() {
        game.reset();
      }, 1000);
    }
  }, 200);
};


//// SIMON CONSTRUCTOR ////
var Simon = function() {

  // Sequence array
  this.sequence = [];

  // Add light to sequence
  this.addLight = function() {
    var random = Math.floor(Math.random() * 4);
    this.sequence.push(random);
  };

  // Play sequence in order
  this.playSequence = function() {
    var sequence = this.sequence;
    var numOfLights = sequence.length;
    var lightIndex = 0;
    setTimeout(function() {
      var lightCounter = setInterval(function() {
        if (game.isOn) {
          ui.lightUp(sequence[lightIndex]);
        }
        lightIndex++;
        if (lightIndex === numOfLights) {
          clearInterval(lightCounter);
          game.isPaused = true;
          ui.togglePointer();
        }
      }, 1000*game.tempo);
    }, 1200);
  }
};                                                                                                                                                   


//// CONTROL ////
$(document).ready(function() {

  // Switch game on/off
  $(".switch-slot").on("click", function() {
    if (!game.isOn) {
      game.isOn = true;
      ui.switchOn();
    }
    else {
      game.isOn = false;
      game.reset();
      ui.switchOff();
    }
  });

  // Toggle strict mode
  $("#strict").on("click", function() {
    if (game.isOn) {
      game.toggleStrict();
    }
  });

  // Start game
  $("#start").on("click", function() {
    if (game.isOn) {
      game.reset();
      ui.updateCount("0");
      game.simon = new Simon();
      game.simon.addLight();
      game.simon.playSequence();
    }
  });

  // Click light button
  $(".button-main").on("click", function() {
    if (game.isOn && game.isPaused) {
      var buttonIndex = parseInt($(this).attr("val"));
      ui.lightUp(buttonIndex);
      // If correct button
      if (buttonIndex === game.simon.sequence[game.userIndex]) {
        game.userIndex++;
        // If last button in sequence
        if (game.userIndex === game.simon.sequence.length) {
          game.userIndex = 0;
          game.isPaused = false;
          game.score++;
          if (game.score > 4) {
            game.tempo = 0.75;
          }
          else if (game.score > 9) {
            game.tempo = 0.5;
          }
          else if (game.score > 14) {
            game.tempo = 0.3;
          }
          ui.updateCount(game.score);
          if (game.score < 20) {
            ui.togglePointer();
            game.simon.addLight();
            game.simon.playSequence();
          }
          else { // Win when score is 20
            setTimeout(function() {
              game.win();
            }, 1500);
          }
        }
      }
      // If incorrect button
      else {
        if (!game.isStrict) {
          game.userIndex = 0;
          game.isPaused = false;
        }
        else {  // Strict mode
          game.reset();
          game.simon = new Simon();
          game.simon.addLight();
        } 
        ui.togglePointer();
        game.simon.playSequence();
      }

    }
  });
});