export default class Settings extends Phaser.Scene {
  constructor() {
    super("settings");
  }

  preload() {
    this.load.image("slider", "assets/settings/slider_bar.png");
    this.load.image("leftclick", "assets/settings/left_click.png");
    this.load.image("rightclick", "assets/settings/right_click.png");
    this.load.image("handle", "assets/settings/handle.png");
  }

  create() {
    this.add.text(200, 50, "Settings", { fontSize: "15px", fill: "#fff" });

    this.add.text(100, 150, "Volume", { fontSize: "15px", fill: "#fff" });
    this.add.image(220, 155, "slider").setScale(3);
    this.add.image(250, 155, "handle").setScale(3);
    const leftButton = this.add
      .image(170, 155, "leftclick")
      .setScale(3)
      .setInteractive();
    const rightButton = this.add
      .image(265, 155, "rightclick")
      .setScale(3)
      .setInteractive();
  }
}
