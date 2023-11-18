import {
  sortedEnemies,
  rollAnNSidedDie,
  updateScore,
  powerOf2,
  spawnBug,
  tweenAndDestroy,
  bottomRowIsOrWillBeEmpty,
  createStartingEnemies,
  genPellet,
  genMegaMagnet,
  addBackground,
  generateBugInTopRow,
  genTimedSpawn,
} from "./helpermethods.js";

import { initialValues, LEFT_BUFFER, RIGHT_BUFFER } from "./constants.js";

const gameState = { ...initialValues };

const youWin = (scene) => {
  gameState.active = false;
  gameState.pelletsLoop.destroy();
  gameState.megaPowerUpLoop.destroy();
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
    this.load.spritesheet("32", "assets/32.png", {
      frameWidth: 83,
      frameHeight: 90,
    });
    this.load.spritesheet("64", "assets/64.png", {
      frameWidth: 83,
      frameHeight: 90,
    });
    this.load.spritesheet("128", "assets/128.png", {
      frameWidth: 83,
      frameHeight: 90,
    });
    this.load.spritesheet("256", "assets/256.png", {
      frameWidth: 83,
      frameHeight: 90,
    });
    this.load.spritesheet("512", "assets/512.png", {
      frameWidth: 83,
      frameHeight: 90,
    });
    this.load.spritesheet("1024", "assets/1024.png", {
      frameWidth: 83,
      frameHeight: 90,
    });
    this.load.spritesheet("2048", "assets/2048.png", {
      frameWidth: 83,
      frameHeight: 90,
    });

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
    this.load.spritesheet(
      "megaPowerup-pickup",
      "assets/mega-powerup-pickup.png",
      {
        frameWidth: 142,
        frameHeight: 142,
      }
    );
    this.load.spritesheet(
      "megaPowerup-inventory",
      "assets/mega-powerup-inventory.png",
      { frameWidth: 142, frameHeight: 142 }
    );
    this.load.spritesheet("pauseButton", "assets/pause_play.png", {
      frameWidth: 12,
      frameHeight: 13,
    });
    this.load.audio("shoot", "assets/audio/Shoot_1.wav");
    this.load.audio("heal", "assets/audio/Power_Up_2.wav");
    this.load.audio("hitSelf", "assets/audio/Hit_3.wav");
    this.load.audio("bgm", "assets/audio/Race to Mars.mp3");

    this.load.audio("explosion", "assets/audio/Explosion.wav");
    this.load.audio(
      "generateMagnet",
      "assets/audio/Retro Musicaly 03 nananana.wav"
    );
    this.load.audio("collectMagnet", "assets/audio/Retro Impact Metal 05.wav");
    this.load.audio(
      "shootMegaMagnet",
      "assets/audio/Retro Weapon Laser 03.wav"
    );
    this.load.audio("firstHit", "assets/audio/Retro Jump Simple B 05.wav");
    this.load.audio("secondHitBad", "assets/audio/Retro Negative Short 23.wav");
    this.load.audio(
      "secondHitGood",
      "assets/audio/Retro PowerUP StereoUP 05.wav"
    );
  }

  create() {
    function gameOver(scene) {
      gameState.active = false;
      gameState.bgm.stop();
      gameState.pelletsLoop.destroy();
      gameState.generateMegaMagnets.destroy();
      scene.timedSpawn.destroy();
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

    gameState.genMegaMagnetFX = this.sound.add("generateMagnet", {
      loop: false,
      volume: gameState.volume / 100,
    });

    this.firstHit = this.sound.add("firstHit", {
      loop: false,
      volume: gameState.volume / 100,
    });
    this.secondHitBad = this.sound.add("secondHitBad", {
      loop: false,
      volume: gameState.volume / 100,
    });
    this.secondHitGood = this.sound.add("secondHitGood", {
      loop: false,
      volume: gameState.volume / 100,
    });
    gameState.bgm = this.sound.add("bgm", {
      loop: true,
      volume: gameState.volume / 100,
    });
    gameState.bgm.play();
    this.events.on("resume", () => {
      gameState.bgm.resume();
    });

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

    //create powerup inventory slot
    this.inventory = this.add
      .image(100, 15, "megaPowerup-inventory", 0)
      .setScale(0.2);

    // Creating static platforms
    const platforms = this.physics.add.staticGroup();
    platforms.create(250, 550, "platform").setScale(1.3, 0.3).refreshBody();

    gameState.enemies = this.physics.add.group();

    //create 2 rows of 8 enemies with value 4
    createStartingEnemies(gameState, 4, 1, 2);

    //create 2 rows of 8 enemies with value 2
    createStartingEnemies(gameState, 2, 3, 4);

    gameState.cursors = this.input.keyboard.createCursorKeys();
    gameState.pauseButton = this.input.keyboard.addKey("P");

    const pellets = this.physics.add.group();

    gameState.powerUps = this.physics.add.group();

    gameState.megaPowerUps = this.physics.add.group();
    gameState.megaPowerUpPickups = this.physics.add.group();

    gameState.megaPowerUp = null;
    gameState.playerBullets = this.physics.add.group();

    gameState.pelletsLoop = this.time.addEvent({
      delay: 1000,
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

    this.timedSpawn = this.time.addEvent({
      delay: 1000 * 10,
      callback: genTimedSpawn,
      loop: true,
      callbackScope: this,
      args: [gameState],
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
      gameState.megaPowerUpPickups,
      platforms,
      (powerUp) => {
        powerUp.destroy();
        gameState.genMegaMagnetFX.stop();
      }
    );
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
      gameState.megaPowerUpPickups,
      (player, megaPowerUp) => {
        megaPowerUp.destroy();
        gameState.genMegaMagnetFX.stop();
        powerUpGained.play();
        this.inventory.setFrame(1);
        gameState.timeForMegaPowerUp = true;
      }
    );

    function mainGameLoop(hitBug, repellent, scene) {
      //get rid of the pellet and stop the enemy from moving backward
      repellent.destroy();
      hitBug.setVelocityY(0);

      //check if you won the game by hitting the 2048 tile
      if (parseInt(hitBug.texture.key) === 2048) {
        youWin(scene);
      }
      if (gameState.activeBug === 0) {
        gameState.activeBug = hitBug;
        hitBug.setFrame(1);
        scene.firstHit.play();
      } else {
        const oldBug = gameState.activeBug;
        if (oldBug === hitBug) {
          gameState.activeBug = 0;
          scene.secondHitBad.play();
          hitBug.setFrame(0);
        } else if (hitBug.value === oldBug.value) {
          const yVal = Math.ceil(hitBug.y / 10) * 10;
          const doubleBugVal = hitBug.value * 2;
          const xVal = hitBug.x;
          const rowIsEmpty = bottomRowIsOrWillBeEmpty(
            hitBug,
            oldBug,
            gameState
          );
          gameState.activeBug = 0;
          scene.secondHitGood.play();
          tweenAndDestroy(hitBug, oldBug, xVal, yVal, scene);

          spawnBug(
            hitBug.x,
            yVal,
            doubleBugVal,
            hitBug.row,
            hitBug.col,
            gameState
          );
          if (rowIsEmpty) {
            gameState.enemies.getChildren().forEach((bug) => {
              scene.tweens.add({
                targets: bug,
                y: bug.y + 50,
                duration: 50,
                repeat: 0,
              });
            });
          }
          updateScore(gameState);
          scoreText.setText(`Your score: ${gameState.sumValueOfEnemies}`);

          gameState.randomspawncounter++;
          if (rollAnNSidedDie(3) === 0) {
            gameState.randomspawncounter++;
          }

          if (gameState.randomspawncounter >= 2) {
            generateBugInTopRow(gameState, hitBug);
            gameState.randomspawncounter = 0;
          }
        }

        //otherwise, they hit two different bugs but NOT ones that match, so we reset
        else {
          gameState.activeBug = hitBug;
          hitBug.setFrame(1);
          oldBug.setFrame(0);
          scene.secondHitBad.play();
        }
      }
    }

    function megaPowerUpLoop(hitBug, megaPowerUp, scene) {
      megaPowerUp.destroy();
      hitBug.setVelocityY(0);
      const hitBugX = hitBug.x;
      const hitBugY = hitBug.y;
      const hitBugValue = parseInt(hitBug.texture.key);

      const matchingEnemies = gameState.enemies
        .getChildren()
        .filter((enemy) => parseInt(enemy.texture.key) == hitBugValue);

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

      spawnBug(
        hitBugX,
        hitBugY,
        newBugValue,
        hitBug.row,
        hitBug.col,
        gameState
      );
      //cleanup--if any bugs were in a hit state we want to reset everything
      gameState.activeBug = 0;
      gameState.enemies.getChildren().forEach((enemy) => {
        enemy.setFrame(0);
      });
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
    this.anims.create({
      key: "megaMagnetPickupAnim",
      frameRate: 4,
      frames: this.anims.generateFrameNumbers("megaPowerup-pickup", {
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
          this.inventory.setFrame(0);
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
        gameState.bgm.pause();
        this.scene.launch("paused");
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
