import mainGame from "./mainGame.js";

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
  scene: [mainGame],
};

const game = new Phaser.Game(config);
