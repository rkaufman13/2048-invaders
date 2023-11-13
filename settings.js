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
    let volume = 100;
    this.add.text(200, 50, "Settings", { fontSize: "15px", fill: "#fff" });

    this.add.text(100, 150, "Volume", { fontSize: "15px", fill: "#fff" });
    this.add.image(220, 155, "slider").setScale(3);
    const handle = this.add.image(250, 155, "handle").setScale(3);
    const leftButton = this.add
      .image(170, 153, "leftclick")
      .setScale(3)
      .setInteractive();
    const rightButton = this.add
      .image(270, 153, "rightclick")
      .setScale(3)
      .setInteractive();

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
  }
}
