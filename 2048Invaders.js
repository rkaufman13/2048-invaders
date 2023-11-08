import { preload } from "./preload.js";
import {
  sortedEnemies,
  sortedEnemiesY,
  rollAnNSidedDie,
  findValidXSlot,
  updateScore,
  powerOf2,
  topRowHasSpace,
  spawnDoubleBug,
  createStartingEnemies,
} from "./helpermethods.js";

import { initialValues, LEFT_BUFFER, RIGHT_BUFFER } from "./constants.js";

const gameState = { ...initialValues };

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

const spawnBug = (xVal, yVal, bugVal) => {
  gameState.activeBug = 0;
  gameState.enemies
    .create(xVal, yVal, bugVal)
    .setScale(gameState.scale)
    .setGravityY(-200);
};

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
  createStartingEnemies(gameState, "4", 1, 2);

  //create 2 rows of 8 enemies with value 2
  createStartingEnemies(gameState, "2", 3, 4);

  //add some properties to each enemy
  gameState.enemies.getChildren().forEach((enemy) => {
    enemy.value = enemy.texture.key;
  });

  //create pellets (ew)
  const pellets = this.physics.add.group();
  //create powerups
  gameState.powerUps = this.physics.add.group();

  gameState.megaPowerUps = this.physics.add.group();

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

  //generate a random bug within the parameters we want

  gameState.pelletsLoop = this.time.addEvent({
    delay: 1000,
    callback: genPellet,
    args: [this],
    callbackScope: this,
    loop: true,
  });

  // Uses the physics plugin to create the player
  gameState.player = this.physics.add.sprite(225, 475, "codey").setScale(2);
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

  function mainGameLoop(hitBug, repellent) {
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

        const rowIsEmpty = spawnDoubleBug(hitBug, oldBug, gameState);

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
          if (topRowHasSpace(gameState)) {
            const yVal = sortedEnemiesY(gameState)[0].y;
            //find valid x slot
            const xVal = findValidXSlot(gameState);

            gameState.enemies
              .create(xVal, yVal, getRandBug(hitBug))
              .setScale(gameState.scale)
              .setGravityY(-200);
          } else {
            //spawn bug in new row
            const xVal = findValidXSlot(gameState);
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

  function powerUpLoop(hitBug, megaPowerUp, scene) {
    megaPowerUp.destroy();
    hitBug.setVelocityY(0);
    const hitBugX = hitBug.x;
    const hitBugY = hitBug.y;
    const hitBugValue = hitBug.texture.key;

    const matchingEnemies = gameState.enemies
      .getChildren()
      .filter((enemy) => enemy.texture.key == hitBugValue);

    const matchingEnemiesValues = matchingEnemies
      .map((enemy) => parseInt(enemy.texture.key))
      .reduce((acc, curr) => acc + curr);
    let newBugValue;
    for (let i = matchingEnemiesValues; i >= 2; i--) {
      if (powerOf2(i)) {
        newBugValue = i;
        break;
      }
    }
    matchingEnemies.forEach((enemy) => {
      const enemyTween = scene.tweens.add({
        targets: enemy,
        x: hitBugX,
        y: hitBugY,
        duration: 200,
        repeat: 0,
        onComplete: () => {
          enemy.destroy();
        },
      });
    });

    spawnBug(hitBugX, hitBugY, newBugValue);
  }

  //main game loop
  this.physics.add.collider(
    gameState.enemies,
    gameState.playerBullets,
    (hitBug, repellent) => {
      mainGameLoop(hitBug, repellent);
    }
  );

  this.physics.add.collider(
    gameState.enemies,
    gameState.megaPowerUp,
    (enemy, megaPowerUp) => {
      powerUpLoop(enemy, megaPowerUp, this.scene);
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
