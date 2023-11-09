export function preload() {
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
  this.load.image("16", "assets/16.png");
  this.load.image("32", "assets/32.png");
  this.load.image("64", "assets/64.png");
  this.load.image("128", "assets/128.png");
  this.load.image("256", "assets/256.png");
  this.load.image("512", "assets/512.png");
  this.load.image("1024", "assets/1024.png");
  this.load.image("2048", "assets/2048.png");
  this.load.image("platform", "assets/platform.png");
  this.load.image("codey", "assets/ship.png");
  this.load.image("enemyBullet", "assets/bugPellet.png");
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
  this.load.audio("shoot", "assets/audio/Shoot_1.wav");
  this.load.audio("heal", "assets/audio/Power_Up_2.wav");
  this.load.audio("hitSelf", "assets/audio/Hit_3.wav");
  this.load.audio("bgm", "assets/audio/Technocracy.mp3");
  this.load.audio("explosion", "assets/audio/Explosion.wav");
}
