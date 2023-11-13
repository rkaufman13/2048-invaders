import { basicFontConfig, instructions } from "./constants.js";

export default class Settings extends Phaser.Scene {
  constructor() {
    super("settings");
  }

  preload() {
    this.load.image("slider", "assets/settings/slider_bar.png");
    this.load.image("leftclick", "assets/settings/left_click.png");
    this.load.image("rightclick", "assets/settings/right_click.png");
    this.load.image("handle", "assets/settings/handle.png");
    this.load.image("close", "assets/settings/close.png");
    this.load.image("bg-box", "assets/settings/settings_box.png");
    this.load.image("heal", "assets/health-powerup.png");
    this.load.spritesheet("magnet", "assets/mega-powerup.png", {
      frameWidth: 142,
      frameHeight: 142,
    });
  }

  create() {
    this.anims.create({
      key: "shootMegaMagnetAnim",
      frameRate: 4,
      frames: this.anims.generateFrameNumbers("magnet", {
        start: 0,
        end: 3,
      }),
      repeat: -1,
    });

    let volume = 100;
    this.add.image(225, 225, "bg-box");
    this.add.text(150, 50, "Settings", basicFontConfig);
    this.add.text(150, 175, "How to Play", basicFontConfig);
    this.add.text(50, 200, instructions, {
      fontSize: "15px",
      fill: "#fff",
      wordWrap: { width: 380, useAdvancedWrap: true },
    });
    this.add.image(55, 380, "heal").setScale(2);
    this.add.text(65, 375, "<-Heals you", basicFontConfig);
    this.add.image(200, 380, "magnet").setScale(0.25);
    this.add.text(220, 375, "<-???", basicFontConfig);

    this.add.text(100, 100, "Volume", basicFontConfig);
    this.add.image(220, 105, "slider").setScale(3);
    const handle = this.add.image(250, 105, "handle").setScale(3);
    const leftButton = this.add
      .image(170, 103, "leftclick")
      .setScale(3)
      .setInteractive();
    const rightButton = this.add
      .image(270, 103, "rightclick")
      .setScale(3)
      .setInteractive();

    const closeButton = this.add.image(410, 40, "close").setInteractive();

    leftButton.on("pointerup", () => {
      if (volume >= 10) {
        volume -= 10;
        handle.x -= 6;
      }
    });
    rightButton.on("pointerup", () => {
      if (volume <= 90) {
        volume += 10;
        handle.x += 6;
      }
    });

    closeButton.on("pointerup", () => {
      this.scene.start("welcome", { sfxVolume: volume });
    });
  }
}
