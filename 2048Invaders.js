import { preload } from "./preload.js";
import {
  sortedEnemies,
  sortedEnemiesY,
  rollAnNSidedDie,
} from "./helpermethods.js";

import {
  initialValues,
  TOP_BUFFER,
  LEFT_BUFFER,
  RIGHT_BUFFER,
} from "./constants.js";

const gameState = { ...initialValues };

const gameOver = (scene) => {
  gameState.active = false;
  gameState.pelletsLoop.destroy();
  scene.physics.pause();
  scene.add.text(100, 250, "Game Over. Click to restart", {
    fontSize: "15px",
    fill: "#fff",
    backgroundColor: "#000",
  });
};

const youWin = (scene) => {
  gameState.active = false;
  gameState.pelletsLoop.destroy();
  scene.physics.pause();
  scene.add.text(200, 300, "You Win", { fontSize: "15px", fill: "#000" });
};

function create() {
  // When gameState.active is true, the game is being played and not over. When gameState.active is false, then it's game over
  gameState.active = true;

  let background = this.add.image(
    this.cameras.main.width / 2,
    this.cameras.main.height / 2,
    "background"
  );
  let scaleX = this.cameras.main.width / background.width;
  let scaleY = this.cameras.main.height / background.height;
  let scale = Math.max(scaleX, scaleY);
  background.setScale(scale).setScrollFactor(0);

  // When gameState.active is false, the game will listen for a pointerup event and restart when the event happens
  this.input.on("pointerup", () => {
    if (gameState.active === false) {
      this.scene.restart();
      this.gameState = initialValues;
    }
  });

  //create score counter
  const score = this.add.text(
    300,
    10,
    `Your score: ${gameState.sumValueOfEnemies}`,
    {
      fontSize: "15px",
      fill: "#fff",
      backgroundColor: "#000",
    }
  );

  // Creating static platforms
  const platforms = this.physics.add.staticGroup();
  platforms.create(250, 550, "platform").setScale(1.3, 0.3).refreshBody();

  gameState.enemies = this.physics.add.group();
  //create 2 rows of 8 enemies with value 4
  for (let xVal = 1; xVal < 9; xVal++) {
    for (let yVal = 1; yVal <= 2; yVal++) {
      gameState.enemies
        .create(50 * xVal, 50 * yVal + TOP_BUFFER, "4", 0)
        .setScale(gameState.scale)
        .setGravityY(-200);
    }
  }
  //create 2 rows of 8 enemies with value 2
  for (let xVal = 1; xVal < 9; xVal++) {
    for (let yVal = 3; yVal <= 4; yVal++) {
      gameState.enemies
        .create(50 * xVal, 50 * yVal + TOP_BUFFER, "2", 0)
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
  //create powerups
  gameState.powerUps = this.physics.add.group();

  function genPellet(scene) {
    let randomBug = Phaser.Utils.Array.GetRandom(
      gameState.enemies.getChildren()
    );
    //most of the time we spawn a enemy projectile.
    //but x% of the time (let's say 1% for now) we spawn a powerup. 1% may be too generous.
    const isPowerup = rollAnNSidedDie(100) == 1;
    if (isPowerup) {
      const powerUp = gameState.powerUps.create(
        randomBug.x,
        randomBug.y,
        "health-powerup"
      );
      powerUp.setScale(2.5);
    } else {
      const newPellet = pellets.create(randomBug.x, randomBug.y, "enemyBullet");
      newPellet.setVelocityY(50);
    }
  }

  const bottomRowIsEmpty = (yVal, yValOldBug) => {
    const sortedEnemies = sortedEnemiesY(gameState);
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
    let slot = rollAnNSidedDie(8);
    while (gameState.topRow[slot] != null) {
      slot = rollAnNSidedDie(8);
    }
    gameState.topRow[slot] = slot;

    return slot * 50 + sortedEnemies(gameState)[0].x;
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
    let isTwo = rollAnNSidedDie(3);
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

  gameState.pelletsLoop = this.time.addEvent({
    delay: 1000,
    callback: genPellet,
    args: [this],
    callbackScope: this,
    loop: true,
  });

  // Uses the physics plugin to create the player
  gameState.player = this.physics.add.sprite(225, 450, "codey").setScale(2);
  //set healthBar
  gameState.healthBar = this.add.image(40, 15, "healthBar", 0).setScale(2);

  // Create Collider objects
  gameState.player.setCollideWorldBounds(true);
  this.physics.add.collider(gameState.player, platforms);
  this.physics.add.collider(pellets, platforms, function (pellet) {
    pellet.destroy();
  });
  this.physics.add.collider(gameState.powerUps, platforms, (powerUp) => {
    powerUp.destroy();
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

  this.physics.add.collider(
    gameState.player,
    gameState.powerUps,
    (player, powerUp) => {
      powerUp.destroy();
      if (gameState.healthBar.frame.name > 0) {
        gameState.healthBar.setFrame(gameState.healthBar.frame.name - 1);
      }
    }
  );

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
        if (hitBug.texture.key == "2" || hitBug.texture.key == "4") {
          //temp workaround until all images are made
          hitBug.setFrame(1);
        }
        hitBug.alpha = 0.5;
      }
      //or, it's not the first hit, so we check for what was hit
      else {
        const oldBug = gameState.activeBug;
        //make sure they didn't hit the same bug twice, if they do, reset
        if (oldBug === hitBug) {
          gameState.activeBug = 0;
          hitBug.alpha = 1;
          if (hitBug.texture.key == "2" || hitBug.texture.key == "4") {
            //temp workaround until all images are made
            hitBug.setFrame(0);
          }
        }
        //otherwise, they hit 2 different bugs, and we need to check to see if their values are equal
        else if (hitBug.texture.key === oldBug.texture.key) {
          //they match, so let's get rid of them and spawn double their value, after checking for row fullness

          const rowIsEmpty = spawnDoubleBug(hitBug, oldBug);
          updateScore(gameState);
          score.setText(`Your score: ${gameState.sumValueOfEnemies}`);
          //here we have a 100% chance to increase randomSpawnCounter as well as a 33% chance to increase it twice
          gameState.randomspawncounter++;
          if (rollAnNSidedDie(3) === 0) {
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
              const yVal = sortedEnemiesY(gameState)[0].y;
              //find valid x slot
              const xVal = findValidXSlot();

              gameState.enemies
                .create(xVal, yVal, getRandBug(hitBug))
                .setScale(gameState.scale)
                .setGravityY(-200);
            } else {
              //spawn bug in new row
              const xVal = findValidXSlot();

              const yVal = sortedEnemiesY(gameState)[0].y - 50;
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

function update(time, delta) {
  if (gameState.active) {
    // If the game is active, then players can control the ship
    if (gameState.cursors.left.isDown) {
      gameState.player.setVelocityX(-160);
    } else if (gameState.cursors.right.isDown) {
      gameState.player.setVelocityX(160);
    } else {
      gameState.player.setVelocityX(0);
    }

    this.anims.create({
      key: "shootPlayerBullet",
      frameRate: 7,
      frames: this.anims.generateFrameNumbers("playerBullets", {
        start: 0,
        end: 1,
      }),
      repeat: -1,
    });

    // Fire at the enemies
    if (Phaser.Input.Keyboard.JustDown(gameState.cursors.space)) {
      const bullet = gameState.playerBullets
        .create(gameState.player.x, gameState.player.y, "playerBullets")
        .setGravityY(-400)
        .setVelocityY(-300);
      bullet.setScale(0.75);
      bullet.play("shootPlayerBullet");
    }

    // Add logic for winning condition and enemy movements below:

    gameState.enemies
      .getChildren()
      .forEach((bug) => (bug.x = bug.x + gameState.enemyVelocity));
    gameState.leftMostBug = sortedEnemies(gameState)[0];
    gameState.rightMostBug =
      sortedEnemies(gameState)[sortedEnemies(gameState).length - 1];
    if (
      gameState.leftMostBug.x < 10 + LEFT_BUFFER ||
      gameState.rightMostBug.x > 440 - RIGHT_BUFFER
    ) {
      gameState.enemyVelocity = gameState.enemyVelocity * -1;
    }
  }
  gameState.powerUps.getChildren().forEach((powerup) => {
    powerup.setVelocityY(80);
  });
}

const config = {
  type: Phaser.AUTO,
  width: 450,
  height: 550,
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
