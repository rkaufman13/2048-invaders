export default class Paused extends Phaser.Scene {
  constructor() {
    super("paused");
  }

  create() {
    this.add.text(200, 200, "Paused", { fontSize: "15px", fill: "#000" });

    this.input.on("pointerup", () => {
      this.scene.resume("game");

      this.scene.stop();
    });
  }
}
