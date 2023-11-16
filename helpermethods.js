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
  return gameState.enemies.getChildren().sort((a, b) => a.y - b.y);
}

export function sortedEnemiesRow(gameState) {
  return gameState.enemies.getChildren().sort((a, b) => a.row - b.row);
}

export function rollAnNSidedDie(n) {
  return Math.floor(Math.random() * n) + 1;
}

export const updateScore = (gameState) => {
  const newScore = gameState.enemies.getChildren().reduce((acc, curr) => {
    return acc + parseInt(curr.texture.key);
  }, 0);
  gameState.sumValueOfEnemies = newScore;
};

export const findValidXSlot = (gameState) => {
  const topRow = sortedEnemiesRow(gameState)[0].row;
  const topRowFilledSlots = gameState.enemies
    .getChildren()
    .filter((enemy) => enemy.row == topRow)
    .map((enemy) => enemy.col);
  let slot = rollAnNSidedDie(8);
  while (topRowFilledSlots.includes(slot)) {
    slot = rollAnNSidedDie(8);
  }
  return [(slot - 1) * 50 + sortedEnemies(gameState)[0].x, slot];
};

export const bottomRowIsOrWillBeEmpty = (hitBug, oldBug, gameState) => {
  /*we need to account for the following states, which is actually quite simple:
    1) if both killed bugs were in the bottom row, When the callback is completed, there will be (at least) one new bug in this row, so the row cannot be empty.
    2) if one killed bug was in the bottom row, and there are or are not bugs in that row. if the more recently "touched" bug is in the bottom row, the row cannot be empty.
    2.5) if the less recently "touched" bug is in the bottom row, it may be the last bug in the row.
    3) neither killed bug was in the bottom row, in which case the bottom row cannot be empty.
    */
  const sortedEnemies = sortedEnemiesY(gameState);
  const bottomRow = sortedEnemies[sortedEnemies.length - 1].row;
  if (
    oldBug.row == bottomRow &&
    sortedEnemies.filter((enemy) => enemy.row == bottomRow).length == 1
  ) {
    return true;
  }
  return false;
};

export function powerOf2(v) {
  return v && !(v & (v - 1));
}

export function topRowHasSpace(gameState) {
  const topRow = sortedEnemiesRow(gameState)[0].row;
  const topRowEmptySlots =
    8 -
    gameState.enemies.getChildren().filter((enemy) => enemy.row == topRow)
      .length;
  return topRowEmptySlots > 0;
}

export function spawnBug(xVal, yVal, bugVal, row, col, gameState) {
  const newEnemy = gameState.enemies
    .create(xVal, yVal, bugVal)
    .setScale(gameState.scale)
    .setGravityY(-200)
    .setName(`Bug ${xVal}:${yVal}`);
  newEnemy.row = row;
  newEnemy.col = col;
  newEnemy.value = bugVal;
}

export function tweenAndDestroy(hitBug, oldBug, xVal, yVal, scene) {
  scene.tweens.add({
    targets: oldBug,
    x: xVal,
    y: yVal,
    duration: 50,
    repeat: 0,
    onComplete: () => {
      oldBug.destroy();
      hitBug.destroy();
    },
  });
}

export function createStartingEnemies(gameState, value, firstRow, secondRow) {
  for (let xVal = 1; xVal < 9; xVal++) {
    for (let yVal = firstRow; yVal <= secondRow; yVal++) {
      const enemy = gameState.enemies
        .create(50 * xVal, 50 * yVal + TOP_BUFFER, value, 0)
        .setScale(gameState.scale)
        .setGravityY(-200)
        .setName(`Bug ${xVal}:${yVal}`);
      enemy.row = yVal;
      enemy.col = xVal;
      enemy.value = value;
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
    const newPellet = pellets
      .create(randomBug.x, randomBug.y, "enemyBullet")
      .setScale(1.5);
    newPellet.setVelocityY(50);
  }
}

export function genMegaMagnet(gameState) {
  const lowestYVal =
    sortedEnemiesY(gameState)[sortedEnemiesY(gameState).length - 1].y;
  const megaMagnet = gameState.megaPowerUpPickups
    .create(rollAnNSidedDie(450), lowestYVal, "megaPowerup-pickup")
    .setScale(0.25)
    .setName("megaMagnetPickup");
  megaMagnet.play("megaMagnetPickupAnim");
  gameState.genMegaMagnetFX.play();
  megaMagnet.setVelocityY(30);
  gameState.megaPowerUpPickup = megaMagnet;
}

export function genTimedSpawn(gameState) {
  const lowestValEnemy = gameState.enemies
    .getChildren()
    .sort(
      (enemy, enemy2) =>
        parseInt(enemy.texture.key) - parseInt(enemy2.texture.key)
    )[0];
  generateBugInTopRow(gameState, lowestValEnemy);
}

export function generateBugInTopRow(gameState, baseBug) {
  if (topRowHasSpace(gameState)) {
    const [xVal, col] = findValidXSlot(gameState);
    console.log("column chosen in partially empty row:", col);
    const yVal = sortedEnemiesY(gameState)[0].y;
    const row = sortedEnemiesY(gameState)[0].row;
    spawnBug(xVal, yVal, getRandBug(baseBug), row, col, gameState);
  } else {
    const col = rollAnNSidedDie(8);
    console.log("column chosen in new (empty) row:", col);
    const xVal = (col - 1) * 50 + sortedEnemies(gameState)[0].x;
    const yVal = sortedEnemiesY(gameState)[0].y - 50;
    const row = sortedEnemiesY(gameState)[0].row - 1;
    spawnBug(xVal, yVal, getRandBug(baseBug), row, col, gameState);
    while (sortedEnemiesY(gameState)[0].y < TOP_BUFFER) {
      gameState.enemies.getChildren().forEach((bug) => (bug.y += 20));
    }
  }
}

export function getRandBug(bug) {
  let basenum = parseInt(bug.texture.key);
  /*newnum should occasionally be 2
    maybe 1/3 of the time?
    and the rest of the time it should be within 1 power of 2 of the number that was just destroyed
    //*/
  let isTwo = rollAnNSidedDie(3);
  if (isTwo == 1) {
    return 2;
  } else {
    let choices = [basenum / 2, basenum / 2, basenum, basenum * 2];
    let choice = Math.floor(Math.random() * choices.length);

    while (choices[choice] < 2 || choices[choice] > 2048) {
      choice = Math.floor(Math.random() * choices.length);
    }

    return choices[choice];
  }
}

export function addBackground(scene) {
  let background = scene.add.image(
    scene.cameras.main.width / 2,
    scene.cameras.main.height / 2,
    "background"
  );
  let scaleX = scene.cameras.main.width / background.width;
  let scaleY = scene.cameras.main.height / background.height;
  let scale = Math.max(scaleX, scaleY);
  background.setScale(scale).setScrollFactor(0);
}

export function genDelay(gameState) {
  return 1000 - gameState.sumValueOfEnemies / 5;
}
