import { addBackground } from "./helpermethods.js";

export default class Intro extends Phaser.Scene {
  constructor() {
    super("welcome");
  }

  init(data) {
    this.volume = data.sfxVolume || 100;
  }

  preload() {
    this.load.image("background", "assets/background.png");
    this.load.image("logo", "assets/logo.png");
    this.load.image("settings", "assets/settings.png");
    this.load.audio("startupSound", "assets/audio/startup_sound.wav");
  }

  create() {
    addBackground(this);
    const startupSound = this.sound.add("startupSound", {
      loop: false,
      volume: this.volume / 100,
    });
    startupSound.play();
    const logo = this.add.image(225, 150, "logo").setScale(0.3).setAlpha(0);
    this.tweens.add({
      targets: logo,
      alpha: 1,
      duration: 4000,
      repeat: 0,
      startDelay: 1000,
    });

    const settings = this.add
      .text(225, 350, "Settings")
      .setInteractive()
      .setAlpha(0);

    const startButton = this.add
      .text(225, 300, "Start")
      .setInteractive()
      .setAlpha(0);

    this.tweens.add({
      targets: [settings, startButton],
      alpha: 1,
      duration: 4000,
      repeat: 0,
      startDelay: 2000,
    });

    startButton.on("pointerup", () => {
      this.scene.start("game", { sfxVolume: this.volume });
    });
    settings.on("pointerup", () => {
      this.scene.start("settings");
    });
  }
}
