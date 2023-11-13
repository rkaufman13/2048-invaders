import {
  sortedEnemies,
  sortedEnemiesY,
  rollAnNSidedDie,
  findValidXSlot,
  updateScore,
  powerOf2,
  topRowHasSpace,
  spawnBug,
  tweenAndDestroy,
  bottomRowIsOrWillBeEmpty,
  createStartingEnemies,
  genPellet,
  genDelay,
  genMegaMagnet,
  getRandBug,
  addBackground,
} from "./helpermethods.js";

import {
  initialValues,
  LEFT_BUFFER,
  RIGHT_BUFFER,
  FINISHED_SPRITES_ARRAY,
} from "./constants.js";

const gameState = { ...initialValues };

const youWin = (scene) => {
  gameState.active = false;
  gameState.pelletsLoop.destroy();
  scene.physics.pause();
  scene.add.text(200, 300, "You Win", { fontSize: "15px", fill: "#000" });
};

export default class mainGame extends Phaser.Scene {
  constructor() {
    super("game");
  }

  init(data) {
    gameState.volume = data.sfxVolume || 100;
  }

  preload() {
    this.load.spritesheet("2", "assets/2.png", {
      frameWidth: 83,
      frameHeight: 90,
    });
    this.load.spritesheet("4", "assets/4.png", {
      frameWidth: 83,
      frameHeight: 90,
    });
    this.load.spritesheet("8", "assets/8.png", {
      frameWidth: 83,
      frameHeight: 90,
    });
    this.load.spritesheet("16", "assets/16.png", {
      frameWidth: 83,
      frameHeight: 90,
    });
    this.load.image("32", "assets/32.png");
    this.load.image("64", "assets/64.png");
    this.load.image("128", "assets/128.png");
    this.load.image("256", "assets/256.png");
    this.load.image("512", "assets/512.png");
    this.load.image("1024", "assets/1024.png");
    this.load.image("2048", "assets/2048.png");
    this.load.image("platform", "assets/platform.png");
    this.load.image("codey", "assets/ship.png");
    this.load.image("enemyBullet", "assets/enemybullet.png");
    this.load.spritesheet("playerBullets", "assets/basicbullet.png", {
      frameWidth: 20,
      frameHeight: 24,
    });
    this.load.image("background", "assets/background.png");
    this.load.image("health-powerup", "assets/health-powerup.png");
    this.load.spritesheet("healthBar", "assets/healthbar.png", {
      frameWidth: 42,
      frameHeight: 7,
    });
    this.load.spritesheet("megaPowerup", "assets/mega-powerup.png", {
      frameWidth: 142,
      frameHeight: 142,
    });
    this.load.spritesheet("pauseButton", "assets/pause_play.png", {
      frameWidth: 12,
      frameHeight: 13,
    });
    this.load.audio("shoot", "assets/audio/Shoot_1.wav");
    this.load.audio("heal", "assets/audio/Power_Up_2.wav");
    this.load.audio("hitSelf", "assets/audio/Hit_3.wav");
    this.load.audio("bgm", "assets/audio/spaceship_shooter.mp3");
    this.load.audio("explosion", "assets/audio/Explosion.wav");
    this.load.audio("collectMagnet", "assets/audio/Retro Impact Metal 05.wav");
    this.load.audio(
      "shootMegaMagnet",
      "assets/audio/Retro Weapon Laser 03.wav"
    );
  }

  create() {
    function gameOver(scene) {
      gameState.active = false;
      gameState.bgm.stop();
      gameState.pelletsLoop.destroy();
      gameState.generateMegaMagnets.destroy();
      scene.physics.pause();
      scene.add.text(100, 250, "Game Over. Click to restart", {
        fontSize: "15px",
        fill: "#fff",
        backgroundColor: "#000",
      });
    }

    // When gameState.active is true, the game is being played and not over. When gameState.active is false, then it's game over
    gameState.active = true;

    addBackground(this);

    gameState.shoot = this.sound.add("shoot", {
      loop: false,
      volume: gameState.volume / 100,
    });
    const heal = this.sound.add("heal", {
      loop: false,
      volume: gameState.volume / 100,
    });
    const hitSelf = this.sound.add("hitSelf", {
      loop: false,
      volume: gameState.volume / 100,
    });
    const explosion = this.sound.add("explosion", {
      loop: false,
      volume: gameState.volume / 100,
    });
    const powerUpGained = this.sound.add("collectMagnet", {
      loop: false,
      volume: gameState.volume / 100,
    });
    gameState.shootMegaMagnetFX = this.sound.add("shootMegaMagnet", {
      loop: false,
      volume: gameState.volume / 100,
    });
    gameState.bgm = this.sound.add("bgm", {
      loop: true,
      volume: gameState.volume / 100,
    });
    gameState.bgm.play();

    // When gameState.active is false, the game will listen for a pointerup event and restart when the event happens
    this.input.on("pointerup", () => {
      if (gameState.active === false) {
        this.scene.restart();
        this.gameState = initialValues;
      }
    });

    //create score counter
    const scoreText = this.add.text(
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

    gameState.cursors = this.input.keyboard.createCursorKeys();
    gameState.pauseButton = this.input.keyboard.addKey("P");

    const pellets = this.physics.add.group();

    gameState.powerUps = this.physics.add.group();

    gameState.megaPowerUps = this.physics.add.group();

    gameState.megaPowerUp = null;
    gameState.playerBullets = this.physics.add.group();

    gameState.pelletsLoop = this.time.addEvent({
      delay: genDelay(gameState),
      callback: genPellet,
      args: [gameState, pellets],
      callbackScope: this,
      loop: true,
    });

    gameState.generateMegaMagnets = this.time.addEvent({
      delay: 1000 * 2 * 60,
      callback: genMegaMagnet,
      args: [gameState],
      callbackScope: this,
      loop: true,
    });

    // Uses the physics plugin to create the player
    gameState.player = this.physics.add.sprite(225, 475, "codey").setScale(2);
    //set healthBar
    gameState.healthBar = this.add.image(40, 15, "healthBar", 0).setScale(2);

    // Create Colliders
    gameState.player.setCollideWorldBounds(true);
    this.physics.add.collider(gameState.player, platforms);
    this.physics.add.collider(pellets, platforms, function (pellet) {
      pellet.destroy();
    });
    this.physics.add.collider(gameState.powerUps, platforms, (powerUp) => {
      powerUp.destroy();
    });
    this.physics.add.collider(
      gameState.enemies.getChildren(),
      platforms,
      () => {
        gameOver(this);
      }
    );

    //comment out the enemy pellet collider below to test the game without dying
    this.physics.add.collider(pellets, gameState.player, (player, pellet) => {
      pellet.destroy();

      if (gameState.healthBar.frame.name < 3) {
        hitSelf.play();
        gameState.healthBar.setFrame(gameState.healthBar.frame.name + 1);
      } else {
        gameState.healthBar.setFrame(4);
        explosion.play();
        gameOver(this);
      }
    });

    //make healing items heal you
    this.physics.add.collider(
      gameState.player,
      gameState.powerUps,
      (player, powerUp) => {
        powerUp.destroy();
        heal.play();
        if (gameState.healthBar.frame.name > 0) {
          gameState.healthBar.setFrame(gameState.healthBar.frame.name - 1);
        }
      }
    );

    //give the magnet to the player when they catch it
    this.physics.add.collider(
      gameState.player,
      gameState.megaPowerUps,
      (player, megaPowerUp) => {
        megaPowerUp.destroy();
        powerUpGained.play();
        gameState.timeForMegaPowerUp = true;
      }
    );

    function mainGameLoop(hitBug, repellent, scene) {
      //get rid of the pellet and stop the enemy from moving backward
      repellent.destroy();
      hitBug.setVelocityY(0);

      //check if you won the game by hitting the 2048 tile
      if (hitBug.texture.key === "2048") {
        youWin(scene);
      }
      if (gameState.activeBug === 0) {
        gameState.activeBug = hitBug;
        //temp workaround until all images are made
        if (FINISHED_SPRITES_ARRAY.includes(hitBug.texture.key)) {
          hitBug.setFrame(1);
        }
        hitBug.alpha = 0.5;
      } else {
        const oldBug = gameState.activeBug;
        if (oldBug === hitBug) {
          gameState.activeBug = 0;
          hitBug.alpha = 1;
          //temp workaround until all images are made
          if (FINISHED_SPRITES_ARRAY.includes(hitBug.texture.key)) {
            hitBug.setFrame(0);
          }
        } else if (hitBug.texture.key === oldBug.texture.key) {
          const yVal = Math.ceil(hitBug.y / 10) * 10;
          const hitBugRow = hitBug.row;
          const doubleBugVal = hitBug.texture.key * 2;
          const xVal = hitBug.x;
          const rowIsEmpty = bottomRowIsOrWillBeEmpty(
            hitBug,
            oldBug,
            gameState
          );
          gameState.activeBug = 0;
          tweenAndDestroy(hitBug, oldBug, xVal, yVal, scene);
          spawnBug(xVal, yVal, doubleBugVal, hitBugRow, gameState);
          updateScore(gameState);
          scoreText.setText(`Your score: ${gameState.sumValueOfEnemies}`);

          gameState.randomspawncounter++;
          if (rollAnNSidedDie(3) === 0) {
            gameState.randomspawncounter++;
          }
          if (rowIsEmpty) {
            gameState.enemies.getChildren().forEach((bug) => {
              scene.tweens.add({
                targets: bug,
                y: bug.y + 50,
                duration: 50,
                repeat: 0,
              });
              bug.row++;
            });
          }
          if (gameState.randomspawncounter >= 2) {
            //todo DRY
            if (topRowHasSpace(gameState)) {
              const yVal = sortedEnemiesY(gameState)[0].y;
              const row = sortedEnemiesY(gameState)[0].row;
              const xVal = findValidXSlot(gameState);
              spawnBug(xVal, yVal, getRandBug(hitBug), row, gameState);
            } else {
              const xVal = findValidXSlot(gameState);
              const yVal = sortedEnemiesY(gameState)[0].y - 50;
              //todo replace with call to spawn method
              const row = sortedEnemiesY(gameState)[0].row - 1;
              spawnBug(xVal, yVal, getRandBug(hitBug), row, gameState);
              gameState.enemies.getChildren().forEach((bug) => (bug.y += 10));
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

    function megaPowerUpLoop(hitBug, megaPowerUp, scene) {
      megaPowerUp.destroy();
      hitBug.setVelocityY(0);
      const hitBugX = hitBug.x;
      const hitBugY = hitBug.y;
      const hitBugValue = hitBug.texture.key;
      const hitBugRow = hitBug.row;

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
        //i reiterate this is insanity
        const enemyTween = scene.scene.tweens.add({
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

      spawnBug(hitBugX, hitBugY, newBugValue, hitBugRow, gameState);
    }

    //main game loop
    this.physics.add.collider(
      gameState.enemies,
      gameState.playerBullets,
      (hitBug, repellent) => {
        mainGameLoop(hitBug, repellent, this);
      }
    );

    this.physics.add.collider(
      gameState.enemies,
      gameState.megaPowerUps,
      (megaPowerUp, enemy) => {
        megaPowerUpLoop(megaPowerUp, enemy, this.scene);
      }
    );

    this.anims.create({
      key: "shootPlayerBullet",
      frameRate: 7,
      frames: this.anims.generateFrameNumbers("playerBullets", {
        start: 0,
        end: 1,
      }),
      repeat: -1,
    });

    this.anims.create({
      key: "shootMegaMagnetAnim",
      frameRate: 4,
      frames: this.anims.generateFrameNumbers("megaPowerup", {
        start: 0,
        end: 3,
      }),
      repeat: -1,
    });
  }

  update() {
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
        gameState.shoot.play();
        const bullet = gameState.playerBullets
          .create(gameState.player.x, gameState.player.y, "playerBullets")
          .setGravityY(-400)
          .setVelocityY(-300);
        bullet.setScale(0.75);
        bullet.play("shootPlayerBullet");
      }

      //fire megamagnet
      if (Phaser.Input.Keyboard.JustDown(gameState.cursors.shift)) {
        if (gameState.timeForMegaPowerUp) {
          gameState.timeForMegaPowerUp = false;
          gameState.megaPowerUp = gameState.megaPowerUps
            .create(gameState.player.x, gameState.player.y, "megaPowerup")
            .setGravityY(-400)
            .setScale(0.25)
            .setName("megaPowerup");
          gameState.megaPowerUp.play("shootMegaMagnetAnim");
          gameState.shootMegaMagnetFX.play();
        } else {
          //pass
        }
      }

      if (Phaser.Input.Keyboard.JustDown(gameState.pauseButton)) {
        this.scene.launch("paused");
        gameState.bgm.pause();
        this.scene.pause();
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
  }
}
