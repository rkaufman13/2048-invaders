import { TOP_BUFFER } from "./constants.js";

// Helper Methods below:
// sortedEnemies() returns an array of enemy sprites sorted by their x coordinate
export function sortedEnemies(gameState) {
  const orderedByXCoord = gameState.enemies
    .getChildren()
    .sort((a, b) => a.x - b.x);
  return orderedByXCoord;
}

export function sortedEnemiesY(gameState) {
  const orderedByYCoord = gameState.enemies
    .getChildren()
    .sort((a, b) => a.y - b.y);
  return orderedByYCoord;
}

export function rollAnNSidedDie(n) {
  const num = Math.floor(Math.random() * n);
  return num;
}

export const updateScore = (gameState) => {
  const newScore = gameState.enemies.getChildren().reduce((acc, curr) => {
    return acc + parseInt(curr.texture.key);
  }, 0);
  gameState.sumValueOfEnemies = newScore;
};

export const findValidXSlot = (gameState) => {
  let slot = rollAnNSidedDie(8);
  while (gameState.topRow[slot] != null) {
    slot = rollAnNSidedDie(8);
  }
  gameState.topRow[slot] = slot;

  return slot * 50 + sortedEnemies(gameState)[0].x;
};

export const bottomRowIsEmpty = (yVal, yValOldBug, gameState) => {
  const sortedEnemies = sortedEnemiesY(gameState);
  const lowestEnemyY = Math.max(yVal, yValOldBug);
  return sortedEnemies.filter((enemy) => enemy.y === lowestEnemyY).length == 0;
};

export function powerOf2(v) {
  return v && !(v & (v - 1));
}

export function topRowHasSpace(gameState) {
  if (
    Object.values(gameState.topRow).filter((slot) => slot != null).length == 8
  ) {
    const newTopRow = Object.fromEntries(
      Object.keys(gameState.topRow).map((key) => [key, null])
    );
    gameState.topRow = newTopRow;
  }
  return (
    Object.values(gameState.topRow).filter((slot) => slot != null).length >= 1
  );
}

export function spawnDoubleBug(hitBug, oldBug, gameState) {
  const yVal = Math.ceil(hitBug.y / 10) * 10;
  const yValOldBug = Math.ceil(oldBug.y / 10) * 10;
  const doublebug = hitBug.texture.key * 2;
  const xVal = hitBug.x;
  hitBug.destroy();
  oldBug.destroy();
  const rowIsEmpty = bottomRowIsEmpty(yVal, yValOldBug, gameState);
  gameState.activeBug = 0;
  gameState.enemies
    .create(xVal, yVal, doublebug)
    .setScale(gameState.scale)
    .setGravityY(-200)
    .setName("newBug");

  return rowIsEmpty;
}

export function createStartingEnemies(gameState, value, firstRow, secondRow) {
  for (let xVal = 1; xVal < 9; xVal++) {
    for (let yVal = firstRow; yVal <= secondRow; yVal++) {
      gameState.enemies
        .create(50 * xVal, 50 * yVal + TOP_BUFFER, value, 0)
        .setScale(gameState.scale)
        .setGravityY(-200)
        .setName(`Bug ${xVal}:${yVal}`);
    }
  }
}

export function genPellet(gameState, pellets) {
  let randomBug = Phaser.Utils.Array.GetRandom(gameState.enemies.getChildren());
  //most of the time we spawn a enemy projectile.
  //but x% of the time (let's say 1% for now) we spawn a powerup. 1% may be too generous.
  const isPowerup = rollAnNSidedDie(100) == 1;
  if (isPowerup) {
    const powerUp = gameState.powerUps.create(
      randomBug.x,
      randomBug.y,
      "health-powerup"
    );
    powerUp.setScale(2.5);
    powerUp.setVelocityY(80);
  } else {
    const newPellet = pellets.create(randomBug.x, randomBug.y, "enemyBullet");
    newPellet.setVelocityY(50);
  }
}

export function genDelay(gameState) {
  return 1000;
}
