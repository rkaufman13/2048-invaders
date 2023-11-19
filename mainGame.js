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
  getLowestYEnemy,
  moveEnemiesDown,
} from "./helpermethods.js";

import { initialValues, LEFT_BUFFER, RIGHT_BUFFER } from "./constants.js";

const gameState = { ...initialValues };

const youWin = (scene) => {
  this.active = false;
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
    this.volume = data.sfxVolume || 100;
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
    this.load.image("ship", "assets/ship.png");
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
      scene.active = false;
      scene.bgm.stop();
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

    this.active = true;
    this.activeBug = 0;
    this.randomSpawnCounter = 0;
    this.enemyVelocity = 0.5;

    addBackground(this);

    this.shoot = this.sound.add("shoot", {
      loop: false,
      volume: this.volume / 100,
    });
    const heal = this.sound.add("heal", {
      loop: false,
      volume: this.volume / 100,
    });
    const hitSelf = this.sound.add("hitSelf", {
      loop: false,
      volume: this.volume / 100,
    });
    const explosion = this.sound.add("explosion", {
      loop: false,
      volume: this.volume / 100,
    });
    const powerUpGained = this.sound.add("collectMagnet", {
      loop: false,
      volume: this.volume / 100,
    });
    this.shootMegaMagnetFX = this.sound.add("shootMegaMagnet", {
      loop: false,
      volume: this.volume / 100,
    });

    gameState.genMegaMagnetFX = this.sound.add("generateMagnet", {
      loop: false,
      volume: this.volume / 100,
    });

    this.firstHit = this.sound.add("firstHit", {
      loop: false,
      volume: this.volume / 100,
    });
    this.secondHitBad = this.sound.add("secondHitBad", {
      loop: false,
      volume: this.volume / 100,
    });
    this.secondHitGood = this.sound.add("secondHitGood", {
      loop: false,
      volume: this.volume / 100,
    });
    this.bgm = this.sound.add("bgm", {
      loop: true,
      volume: this.volume / 100,
    });
    this.bgm.play();
    this.events.on("resume", () => {
      this.bgm.resume();
    });

    this.input.on("pointerup", () => {
      if (this.active === false) {
        this.scene.restart();
        this.gameState = initialValues;
      }
    });

    //create score counter
    this.scoreText = this.add.text(
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

    this.cursors = this.input.keyboard.createCursorKeys();
    this.pauseButton = this.input.keyboard.addKey("P");

    const pellets = this.physics.add.group();

    gameState.powerUps = this.physics.add.group();

    gameState.megaPowerUps = this.physics.add.group();
    gameState.megaPowerUpPickups = this.physics.add.group();

    gameState.megaPowerUp = null;
    this.playerBullets = this.physics.add.group();

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
      args: [gameState, this],
    });

    // Uses the physics plugin to create the player
    this.player = this.physics.add.sprite(225, 515, "ship").setScale(2);
    //set healthBar
    this.healthBar = this.add.image(40, 15, "healthBar", 0).setScale(2);

    // Create Colliders
    this.player.setCollideWorldBounds(true);
    this.physics.add.collider(this.player, platforms);
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

    this.physics.add.collider(pellets, this.player, (player, pellet) => {
      pellet.destroy();

      if (this.healthBar.frame.name < 3) {
        hitSelf.play();
        this.healthBar.setFrame(this.healthBar.frame.name + 1);
      } else {
        this.healthBar.setFrame(4);
        explosion.play();
        gameOver(this);
      }
    });

    //make healing items heal you
    this.physics.add.collider(
      this.player,
      gameState.powerUps,
      (player, powerUp) => {
        powerUp.destroy();
        heal.play();
        if (this.healthBar.frame.name > 0) {
          this.healthBar.setFrame(this.healthBar.frame.name - 1);
        }
      }
    );

    //give the magnet to the player when they catch it
    this.physics.add.collider(
      this.player,
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
      repellent.destroy();
      hitBug.setVelocityY(0);

      //check if you won the game by hitting the 2048 tile
      if (parseInt(hitBug.texture.key) === 2048) {
        youWin(scene);
      }
      if (scene.activeBug === 0) {
        scene.activeBug = hitBug;
        hitBug.setFrame(1);
        scene.firstHit.play();
      } else {
        const oldBug = scene.activeBug;
        if (oldBug === hitBug) {
          scene.activeBug = 0;
          scene.secondHitBad.play();
          hitBug.setFrame(0);
        } else if (hitBug.value === oldBug.value) {
          const yVal = Math.ceil(hitBug.y / 10) * 10;
          const doubleBugVal = hitBug.value * 2;
          const xVal = hitBug.x;
          const rowIsEmpty = bottomRowIsOrWillBeEmpty(oldBug, gameState);
          scene.activeBug = 0;
          scene.secondHitGood.play();
          tweenAndDestroy(hitBug, oldBug, xVal, yVal, scene);

          spawnBug(
            hitBug.x,
            doubleBugVal,
            hitBug.row,
            hitBug.col,
            gameState,
            scene
          );
          if (rowIsEmpty && getLowestYEnemy(gameState).y < 300) {
            moveEnemiesDown(gameState);
          }
          updateScore(gameState);
          scene.scoreText.setText(`Your score: ${gameState.sumValueOfEnemies}`);

          scene.randomSpawnCounter++;
          if (rollAnNSidedDie(3) === 0) {
            scene.randomSpawnCounter++;
          }

          if (scene.randomSpawnCounter >= 2) {
            generateBugInTopRow(gameState, hitBug, scene);
            scene.randomSpawnCounter = 0;
          }
        }

        //otherwise, they hit two different bugs but NOT ones that match, so we reset
        else {
          scene.activeBug = hitBug;
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
        .filter((enemy) => enemy.value == hitBugValue);

      const matchingEnemiesValues = matchingEnemies
        .map((enemy) => enemy.value)
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
        newBugValue,
        hitBug.row,
        hitBug.col,
        gameState,
        scene.scene
      );
      //cleanup--if any bugs were in a hit state we want to reset everything
      scene.activeBug = 0;
      gameState.enemies.getChildren().forEach((enemy) => {
        enemy.setFrame(0);
      });
    }

    this.physics.add.collider(
      gameState.enemies,
      this.playerBullets,
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
    if (this.active) {
      // If the game is active, then players can control the ship
      if (this.cursors.left.isDown) {
        this.player.setVelocityX(-220);
      } else if (this.cursors.right.isDown) {
        this.player.setVelocityX(220);
      } else {
        this.player.setVelocityX(0);
      }

      // Fire at the enemies
      if (Phaser.Input.Keyboard.JustDown(this.cursors.space)) {
        this.shoot.play();
        const bullet = this.playerBullets
          .create(this.player.x, this.player.y, "playerBullets")
          .setGravityY(-450)
          .setVelocityY(-400);
        bullet.setScale(0.75);
        bullet.play("shootPlayerBullet");
      }

      //fire megamagnet
      if (Phaser.Input.Keyboard.JustDown(this.cursors.shift)) {
        if (gameState.timeForMegaPowerUp) {
          gameState.timeForMegaPowerUp = false;
          this.inventory.setFrame(0);
          gameState.megaPowerUp = gameState.megaPowerUps
            .create(this.player.x, this.player.y, "megaPowerup")
            .setGravityY(-400)
            .setScale(0.25)
            .setName("megaPowerup");
          gameState.megaPowerUp.play("shootMegaMagnetAnim");
          this.shootMegaMagnetFX.play();
        } else {
          //pass
        }
      }

      if (Phaser.Input.Keyboard.JustDown(this.pauseButton)) {
        this.bgm.pause();
        this.scene.launch("paused");
        this.scene.pause();
      }

      gameState.enemies
        .getChildren()
        .forEach((bug) => (bug.x = bug.x + this.enemyVelocity));

      const leftMostBug = sortedEnemies(gameState)[0];
      const rightMostBug =
        sortedEnemies(gameState)[sortedEnemies(gameState).length - 1];
      if (
        leftMostBug.x < 10 + LEFT_BUFFER ||
        rightMostBug.x > 440 - RIGHT_BUFFER
      ) {
        this.enemyVelocity *= -1;
      }

      //if bug y does not equal the bug's y as determined by its row, fix
      gameState.enemies.getChildren().forEach((bug) => {
        const desiredY = gameState.rowToYValue[bug.row];
        if (bug.y != desiredY) {
          this.tweens.add({
            targets: bug,
            y: desiredY,
            duration: 100,
            repeat: 0,
          });
        }
      });
    }
  }
}
