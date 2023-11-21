import mainGame from "./mainGame.js";
import intro from "./intro.js";
import paused from "./paused.js";
import settings from "./settings.js";

const config = {
  type: Phaser.AUTO,
  width: 450,
  height: 525,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 200 },
      enableBody: true,
    },
  },
  scene: [intro, mainGame, paused, settings],
};

const game = new Phaser.Game(config);
game.debugMode = false;
