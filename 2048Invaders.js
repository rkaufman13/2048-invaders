function preload() {
  this.load.image("2", "2.png");
  this.load.image("4", "4.png");
  this.load.image("8", "8.png");
  this.load.image("16", "16.png");
  this.load.image("32", "32.png");
  this.load.image("64", "64.png");
  this.load.image("128", "128.png");
  this.load.image("256", "256.png");
  this.load.image("512", "512.png");
  this.load.image("1024", "1024.png");
  this.load.image("2048", "2048.png");
  this.load.image("platform", "platform.png");
  this.load.image("codey", "codey.png");
  this.load.image("enemyBullet", "bugPellet.png");
  this.load.image("playerBullets", "bugRepellent.png");
}

// Helper Methods below:
// sortedEnemies() returns an array of enemy sprites sorted by their x coordinate
function sortedEnemies() {
  const orderedByXCoord = gameState.enemies
    .getChildren()
    .sort((a, b) => a.x - b.x);
  return orderedByXCoord;
}
function sortedEnemiesY() {
  const orderedByXCoord = gameState.enemies
    .getChildren()
    .sort((a, b) => a.y - b.y);
  return orderedByXCoord;
}

function sortedEnemiesRows() {
  const sortedByRows = gameState.enemies.getChildren().sort(function (a, b) {
    if (a.y === b.y) {
      return a.x - b.x;
    }
    return a.y - b.y;
  });

  return sortedByRows;
}
// numOfTotalEnemies() returns the number of total enemies
function numOfTotalEnemies() {
  const totalEnemies = gameState.enemies.getChildren().length;
  return totalEnemies;
}

const gameOver = (scene) => {
  gameState.active = false;
  gameState.pelletsLoop.destroy();
  scene.physics.pause();
  scene.add.text(100, 250, "Game Over. Click to restart", {
    fontSize: "15px",
    fill: "#000",
  });
};

const youWin = (scene) => {
  gameState.active = false;
  gameState.pelletsLoop.destroy();
  scene.physics.pause();
  scene.add.text(200, 300, "You Win", { fontSize: "15px", fill: "#000" });
};

const initialValues = {
  enemyVelocity: 0.5,
  activeBug: 0,
  randomspawncounter: 0,
  toprowcount: 0,
  toprow: Array(8).fill("full"),
  arraypos: 0,
  bottomrow: 8,
  sumValueOfEnemies: 0,
  scale: 0.5,
};

const gameState = { ...initialValues };

function create() {
  // When gameState.active is true, the game is being played and not over. When gameState.active is false, then it's game over
  gameState.active = true;

  // When gameState.active is false, the game will listen for a pointerup event and restart when the event happens
  this.input.on("pointerup", () => {
    if (gameState.active === false) {
      this.scene.restart();
      this.gameState = initialValues;
    }
  });

  // Creating static platforms
  const platforms = this.physics.add.staticGroup();
  platforms.create(225, 400, "platform").setScale(1, 0.3).refreshBody();

  gameState.enemies = this.physics.add.group();
  //hardcoded this for now, maybe someone else can make it better
  for (let xVal = 1; xVal < 9; xVal++) {
    for (let yVal = 1; yVal <= 2; yVal++) {
      gameState.enemies
        .create(50 * xVal, 50 * yVal, "4")
        .setScale(gameState.scale)
        .setGravityY(-200);
    }
  }
  for (let xVal = 1; xVal < 9; xVal++) {
    for (let yVal = 3; yVal <= 4; yVal++) {
      gameState.enemies
        .create(50 * xVal, 50 * yVal, "2")
        .setScale(gameState.scale)
        .setGravityY(-200);
    }
  }

  //add some properties to each enemy
  gameState.enemies.getChildren().forEach((enemy) => {
    enemy.value = enemy.texture.key;
  });

  //create pellets (ew)
  const pellets = this.physics.add.group();

  function genPellet() {
    let randomBug = Phaser.Utils.Array.GetRandom(
      gameState.enemies.getChildren()
    );
    const newPellet = pellets.create(randomBug.x, randomBug.y, "enemyBullet");
    newPellet.setVelocityY(50);
  }

  //generate a random bug within the parameters we want
  function getRandBug(bug) {
    let basenum = bug.texture.key;
    let newnum = Math.pow(2, Math.ceil(Math.random() * Math.log2(basenum)));
    return newnum;
  }

  function RollAnNSidedDie(n) {
    let num = Math.floor(Math.random() * n);
    return num;
  }

  gameState.pelletsLoop = this.time.addEvent({
    delay: 1000,
    callback: genPellet,
    callbackScope: this,
    loop: true,
  });
  // Uses the physics plugin to create the player
  gameState.player = this.physics.add.sprite(225, 350, "codey").setScale(0.6);

  // Create Collider objects
  gameState.player.setCollideWorldBounds(true);
  this.physics.add.collider(gameState.player, platforms);
  this.physics.add.collider(pellets, platforms, function (pellet) {
    pellet.destroy();
  });
  this.physics.add.collider(gameState.enemies.getChildren(), platforms, () => {
    gameOver(this);
  });

  //comment out the enemy pellet collider below to test the game without dying
  this.physics.add.collider(pellets, gameState.player, () => {
    gameOver(this);
  });

  // Creates cursor objects to be used in update()
  gameState.cursors = this.input.keyboard.createCursorKeys();

  gameState.playerBullets = this.physics.add.group();

  this.physics.add.collider(
    gameState.enemies,
    gameState.playerBullets,
    (hitBug, repellent) => {
      //get rid of the pellet and stop the enemy from moving backward
      repellent.destroy();
      hitBug.setVelocityY(0);

      //check if you won the game by hitting the 2048 tile
      if (hitBug.texture.key === "2048") {
        youWin(scene);
      }
      //check if the bug is the first one hit
      if (gameState.activeBug === 0) {
        gameState.activeBug = hitBug;
        hitBug.alpha = 0.5;
      }
      //or, it's not the first hit, so we check for what was hit
      else {
        oldBug = gameState.activeBug;
        //make sure they didn't hit the same bug twice, if they do, reset
        if (oldBug === hitBug) {
          gameState.activeBug = 0;
          hitBug.alpha = 1;
        }
        //otherwise, they hit 2 different bugs, and we need to check to see if their values are equal
        else if (hitBug.texture.key === oldBug.texture.key) {
          //they match, so let's get rid of them and spawn double their value
          let doublebug = hitBug.texture.key * 2;
          let xVal = hitBug.x;
          let yVal = Math.ceil(hitBug.y / 10) * 10;
          let oldBugYVal = Math.ceil(oldBug.y / 10) * 10;
          let lowestBug =
            Math.ceil(sortedEnemiesY()[sortedEnemiesY().length - 1].y / 10) *
            10;
          hitBug.destroy();
          oldBug.destroy();
          gameState.activeBug = 0;
          gameState.enemies
            .create(xVal, yVal, doublebug)
            .setScale(gameState.scale)
            .setGravityY(-200);
          //here we have a 100% chance to increase randomSpawnCounter as well as a 33% chance to increase it twice
          gameState.randomspawncounter++;
          if (RollAnNSidedDie(3) === 0) {
            gameState.randomspawncounter++;
          }
          if (oldBugYVal === lowestBug && yVal === lowestBug) {
            gameState.bottomrow--;
          } else if (oldBugYVal === lowestBug && oldBugYVal > yVal) {
            gameState.bottomrow--;
          }

          //if the bottom row is now empty, move everything down by 10
          if (gameState.bottomrow === 0) {
            for (i = 0; i < sortedEnemies().length; i++) {
              if (
                sortedEnemies()[i].y ===
                Math.ceil(
                  sortedEnemiesY()[sortedEnemiesY().length - 1].y / 10
                ) *
                  10
              ) {
                gameState.bottomrow++;
              }
            }
            gameState.enemies
              .getChildren()
              .forEach((bug) => (bug.y = bug.y + 50));
          }

          //now, let's spawn an extra "jerk" number at the top at a preset interval
          if (gameState.randomspawncounter >= 3) {
            //spawn another number
            console.log("another number");

            if (gameState.toprow.indexOf(0) != -1) {
              do {
                gameState.arraypos = RollAnNSidedDie(8);
              } while (gameState.toprow[gameState.arraypos] === "full");
              yVal = sortedEnemiesY()[0].y;
              xVal = gameState.arraypos * 50 + sortedEnemies()[0].x;
              gameState.enemies
                .create(xVal, yVal, getRandBug(hitBug))
                .setScale(gameState.scale)
                .setGravityY(-200);
              gameState.toprow[gameState.arraypos] = "full";
            } else {
              //this must mean the top row is full, so we start a new row
              gameState.toprow = Array(8).fill(0);
              gameState.arraypos = RollAnNSidedDie(8);
              yVal = sortedEnemiesY()[0].y - 50;
              xVal = gameState.arraypos * 50 + sortedEnemies()[0].x;
              gameState.enemies
                .create(xVal, yVal, getRandBug(hitBug))
                .setScale(gameState.scale)
                .setGravityY(-200);
              gameState.toprow[gameState.arraypos] = "full";
              gameState.enemies
                .getChildren()
                .forEach((bug) => (bug.y = bug.y + 10));
            }
            gameState.randomspawncounter = 0;
          }
        }
        //otherwise, they hit two different bugs but NOT ones that match, so we reset
        else {
          gameState.activeBug = hitBug;
          hitBug.alpha = 0.5;
          oldBug.alpha = 1;
        }
      }
    }
  );
}

function update() {
  if (gameState.active) {
    // If the game is active, then players can control the ship
    if (gameState.cursors.left.isDown) {
      gameState.player.setVelocityX(-160);
    } else if (gameState.cursors.right.isDown) {
      gameState.player.setVelocityX(160);
    } else {
      gameState.player.setVelocityX(0);
    }

    // Fire at the enemies
    if (Phaser.Input.Keyboard.JustDown(gameState.cursors.space)) {
      gameState.playerBullets
        .create(gameState.player.x, gameState.player.y, "playerBullets")
        .setGravityY(-400)
        .setVelocityY(-300);
    }

    // Add logic for winning condition and enemy movements below:

    gameState.enemies
      .getChildren()
      .forEach((bug) => (bug.x = bug.x + gameState.enemyVelocity));
    gameState.leftMostBug = sortedEnemies()[0];
    gameState.rightMostBug = sortedEnemies()[sortedEnemies().length - 1];
    if (gameState.leftMostBug.x < 10 || gameState.rightMostBug.x > 440) {
      gameState.enemyVelocity = gameState.enemyVelocity * -1;
    }
    //darken the background as the game gets more intense; currently disabled bc lazy
    /*
            gameState.sumValueOfEnemies = gameState.enemies.getChildren().map(function (bug){return parseInt(bug.texture.key, 10)}).reduce((a, b) => a+b);
              switch (gameState.sumValueOfEnemies){
                case (gameState.sumValueOfEnemies < 120):
                  break;
                  case (gameState.sumValueOfEnemies >= 120 && gameState.sumValueOfEnemies < 800):
                    this.cameras.main.backgroundColor = "a3cfe2";
                    break;
              }        */
  }
}

const config = {
  type: Phaser.AUTO,
  width: 450,
  height: 400,
  backgroundColor: "b9eaff",
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 200 },
      enableBody: true,
    },
  },
  scene: {
    preload,
    create,
    update,
  },
};

const game = new Phaser.Game(config);
