import { preload } from "./preload.js";
import { initialValues } from "./constants.js";
import { createStartingEnemies } from "./helpermethods.js";
const gameState = { ...initialValues };

function create() {
  gameState.active = true;
  gameState.player = this.physics.add.sprite(225, 475, "codey").setScale(2);
  gameState.playerBullets = this.physics.add.group();
  gameState.enemies = this.physics.add.group();
  gameState.cursors = this.input.keyboard.createCursorKeys();
  const platforms = this.physics.add.staticGroup();
  platforms.create(250, 550, "platform").setScale(1.3, 0.3).refreshBody();
  this.physics.add.collider(gameState.player, platforms);
  //create 2 rows of 8 enemies with value 4
  createStartingEnemies(gameState, "4", 1, 2);

  //create 2 rows of 8 enemies with value 2
  createStartingEnemies(gameState, "2", 3, 4);

  //add some properties to each enemy
  gameState.enemies.getChildren().forEach((enemy) => {
    enemy.value = enemy.texture.key;
  });

  function mainGameLoop(hitBug, repellent) {
    hitBug.destroy();
    repellent.destroy();
    console.log(
      "doesn't matter what we put here because this will never be called"
    );
  }

  function powerUpLoop(hitBug, megaPowerUp, scene) {
    hitBug.destroy();
    megaPowerUp.destroy();
    console.log("This shouldn't be called, but it will be");
  }

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

const update = () => {
  if (Phaser.Input.Keyboard.JustDown(gameState.cursors.space)) {
    const bullet = gameState.playerBullets
      .create(gameState.player.x, gameState.player.y, "playerBullets")
      .setGravityY(-400)
      .setVelocityY(-300);
    bullet.setScale(0.75);
  }
};

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
