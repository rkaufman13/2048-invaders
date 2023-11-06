function preload() {
  this.load.image("2", "assets/2.png");
  this.load.image("4", "assets/4.png");
  this.load.image("8", "assets/8.png");
  this.load.image("16", "assets/16.png");
  this.load.image("32", "assets/32.png");
  this.load.image("64", "assets/64.png");
  this.load.image("128", "assets/128.png");
  this.load.image("256", "assets/256.png");
  this.load.image("512", "assets/512.png");
  this.load.image("1024", "assets/1024.png");
  this.load.image("2048", "assets/2048.png");
  this.load.image("platform", "assets/platform.png");
  this.load.image("codey", "assets/codey.png");
  this.load.image("enemyBullet", "assets/bugPellet.png");
  this.load.image("playerBullets", "assets/bugRepellent.png");
  this.load.spritesheet("healthBar", "assets/healthbar.png", {
    frameWidth: 42,
    frameHeight: 7,
  });
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
  const orderedByYCoord = gameState.enemies
    .getChildren()
    .sort((a, b) => a.y - b.y);
  return orderedByYCoord;
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
  topRow: {
    0: null,
    1: null,
    2: null,
    3: null,
    4: null,
    5: null,
    6: null,
    7: null,
  },
  sumValueOfEnemies: 0,
  scale: 0.5,
};

const TOP_BUFFER = 50;

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
  //create 2 rows of 8 enemies with value 4
  for (let xVal = 1; xVal < 9; xVal++) {
    for (let yVal = 1; yVal <= 2; yVal++) {
      gameState.enemies
        .create(50 * xVal, 50 * yVal + TOP_BUFFER, "4")
        .setScale(gameState.scale)
        .setGravityY(-200);
    }
  }
  //create 2 rows of 8 enemies with value 2
  for (let xVal = 1; xVal < 9; xVal++) {
    for (let yVal = 3; yVal <= 4; yVal++) {
      gameState.enemies
        .create(50 * xVal, 50 * yVal + TOP_BUFFER, "2")
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

  const bottomRowIsEmpty = (yVal, yValOldBug) => {
    const sortedEnemies = sortedEnemiesY();
    const lowestEnemyY = Math.max(yVal, yValOldBug);
    return (
      sortedEnemies.filter((enemy) => enemy.y === lowestEnemyY).length == 0
    );
  };

  const topRowHasSpace = () => {
    if (
      Object.values(gameState.topRow).filter((slot) => slot != null).length == 8
    ) {
      const newTopRow = Object.fromEntries(
        Object.keys(gameState.topRow).map((key) => [key, null])
      );
      gameState.topRow = newTopRow;
    }
    return (
      Object.values(gameState.topRow).filter((slot) => slot != null).length >= 1
    );
  };

  const findValidXSlot = () => {
    let slot = RollAnNSidedDie(8);
    while (gameState.topRow[slot] != null) {
      slot = RollAnNSidedDie(8);
    }
    gameState.topRow[slot] = slot;

    return slot * 50 + sortedEnemies()[0].x;
  };

  const spawnDoubleBug = (hitBug, oldBug) => {
    const yVal = Math.ceil(hitBug.y / 10) * 10;
    const yValOldBug = Math.ceil(oldBug.y / 10) * 10;
    const doublebug = hitBug.texture.key * 2;
    const xVal = hitBug.x;
    hitBug.destroy();
    oldBug.destroy();
    const rowIsEmpty = bottomRowIsEmpty(yVal, yValOldBug);
    gameState.activeBug = 0;
    gameState.enemies
      .create(xVal, yVal, doublebug)
      .setScale(gameState.scale)
      .setGravityY(-200);
    return rowIsEmpty;
  };

  //generate a random bug within the parameters we want
  function getRandBug(bug) {
    let basenum = bug.texture.key;
    /*newnum should occasionally be 2
    maybe 1/3 of the time?
    and the rest of the time it should be within 1 power of 2 of the number that was just destroyed
    //*/
    let isTwo = RollAnNSidedDie(3);
    if (isTwo == 1) {
      return 2;
    } else {
      let choices = [basenum / 2, basenum / 2, basenum, basenum * 2];
      let choice = Math.floor(Math.random() * choices.length);

      while (choices[choice] < 2 || choices[choice] > 2048) {
        choice = Math.floor(Math.random() * choices.length);
      }

      return choices[choice];
    }
  }

  function RollAnNSidedDie(n) {
    const num = Math.floor(Math.random() * n);
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
  //set healthBar
  gameState.healthBar = this.add.image(30, 15, "healthBar", 0);

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
  this.physics.add.collider(pellets, gameState.player, (player, pellet) => {
    //the callback function passes in the params BACKWARDS
    pellet.destroy();
    if (gameState.healthBar.frame.name < 3) {
      gameState.healthBar.setFrame(gameState.healthBar.frame.name + 1);
    } else {
      gameState.healthBar.setFrame(4);
      gameOver(this);
    }
  });

  // Creates cursor objects to be used in update()
  gameState.cursors = this.input.keyboard.createCursorKeys();

  gameState.playerBullets = this.physics.add.group();

  //main game loop
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
          //they match, so let's get rid of them and spawn double their value, after checking for row fullness

          const rowIsEmpty = spawnDoubleBug(hitBug, oldBug);

          //here we have a 100% chance to increase randomSpawnCounter as well as a 33% chance to increase it twice
          gameState.randomspawncounter++;
          if (RollAnNSidedDie(3) === 0) {
            gameState.randomspawncounter++;
          }
          //if the bottom row is now empty, move everything down by 1 row
          if (rowIsEmpty) {
            gameState.enemies.getChildren().forEach((bug) => {
              bug.y = bug.y + 50;
            });
          }

          //now, let's spawn an extra "jerk" number at the top at a preset interval
          if (gameState.randomspawncounter >= 2) {
            //spawn another number
            if (topRowHasSpace()) {
              yVal = sortedEnemiesY()[0].y;
              //find valid x slot
              xVal = findValidXSlot();

              gameState.enemies
                .create(xVal, yVal, getRandBug(hitBug))
                .setScale(gameState.scale)
                .setGravityY(-200);
            } else {
              //spawn bug in new row
              const xVal = findValidXSlot();

              const yVal = sortedEnemiesY()[0].y - 50;
              gameState.enemies
                .create(xVal, yVal, getRandBug(hitBug))
                .setScale(gameState.scale)
                .setGravityY(-200);

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
  height: 450,
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
