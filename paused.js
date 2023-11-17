export default class Paused extends Phaser.Scene {
  constructor() {
    super("paused");
  }

  preload() {}

  create() {
    this.pauseButton = this.input.keyboard.addKey("P");

    this.add.text(125, 130, "Paused. Press P to resume", {
      fontSize: "15px",
      fill: "#fff",
      backgroundColor: "#000",
    });
  }

  update() {
    if (Phaser.Input.Keyboard.JustDown(this.pauseButton)) {
      this.scene.resume("game");

      this.scene.stop();
    }
  }
}
