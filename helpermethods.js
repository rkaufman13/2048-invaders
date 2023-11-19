import { TOP_BUFFER } from "./constants.js";

// Helper Methods below:
// sortedEnemies() returns an array of enemy sprites sorted by their x coordinate
export function sortedEnemies(gameState) {
  const orderedByXCoord = gameState.enemies
    .getChildren()
    .sort((a, b) => a.x - b.x);
  return orderedByXCoord;
}

export function moveEnemiesDown(gameState) {
  for (const [row, value] of Object.entries(gameState.rowToYValue)) {
    gameState.rowToYValue[row] = value + 50;
  }
}

export function sortedEnemiesY(gameState) {
  return gameState.enemies.getChildren().sort((a, b) => a.y - b.y);
}

export function sortedEnemiesRow(gameState) {
  return gameState.enemies.getChildren().sort((a, b) => a.row - b.row);
}

export function getLowestYEnemy(gameState) {
  return sortedEnemiesY(gameState)[sortedEnemiesY(gameState).length - 1];
}

export function getHighestYEnemy(gameState) {
  return sortedEnemiesY(gameState)[0];
}

export function getHighestRowEnemy(gameState) {
  return sortedEnemiesRow(gameState)[0];
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

export const findValidXSlot = (gameState, row) => {
  const filledSlots = gameState.enemies
    .getChildren()
    .filter((enemy) => enemy.row == row)
    .map((enemy) => enemy.col);
  let slot = rollAnNSidedDie(8);
  while (filledSlots.includes(slot)) {
    slot = rollAnNSidedDie(8);
  }
  return [(slot - 1) * 50 + sortedEnemies(gameState)[0].x, slot];
};

export const bottomRowIsOrWillBeEmpty = (oldBug, gameState) => {
  /*we need to account for the following states, which is actually quite simple:
    1) if both killed bugs were in the bottom row, When the callback is completed, there will be (at least) one new bug in this row, so the row cannot be empty.
    2) if one killed bug was in the bottom row, and there are or are not bugs in that row. if the more recently "touched" bug is in the bottom row, the row cannot be empty.
    2.5) if the less recently "touched" bug is in the bottom row, it may be the last bug in the row.
    3) neither killed bug was in the bottom row, in which case the bottom row cannot be empty.
    */
  const sortedEnemies = sortedEnemiesRow(gameState);
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

export function rowHasSpace(gameState, row) {
  const rowEmptySlots =
    8 -
    gameState.enemies.getChildren().filter((enemy) => enemy.row == row).length;
  return rowEmptySlots > 0;
}

export function spawnBug(xVal, bugVal, row, col, gameState, scene) {
  const newEnemy = gameState.enemies
    .create(xVal, gameState.rowToYValue[row], bugVal)
    .setScale(0.05)
    .setGravityY(-200)
    .setName(`Bug ${col}:${row}`)
    .setAlpha(0);
  scene.tweens.add({
    targets: newEnemy,
    alpha: 1,
    scale: gameState.scale,
    duration: 200,
    repeat: 0,
  });
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
  for (let col = 1; col < 9; col++) {
    for (let row = firstRow; row <= secondRow; row++) {
      const enemy = gameState.enemies
        .create(50 * col, gameState.rowToYValue[row], value, 0)
        .setScale(gameState.scale)
        .setGravityY(-200)
        .setName(`Bug ${col}:${row}`);
      enemy.row = row;
      enemy.col = col;
      enemy.value = value;
    }
  }
}

function makeBullet(velocityX, velocityY, name, randomBug, pellets) {
  pellets
    .create(randomBug.x, randomBug.y, "enemyBullet")
    .setScale(1.5)
    .setName(name)
    .setVelocityX(velocityX)
    .setVelocityY(velocityY);
}

function makeBullets(velocities, name, randomBug, pellets) {
  for (let i = 0; i < velocities.length; i++) {
    makeBullet(
      velocities[i][0],
      velocities[i][1],
      `bullet for ${name} bug`,
      randomBug,
      pellets
    );
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
    const bugValue = randomBug.value;
    switch (bugValue) {
      case 2:
        makeBullets([[0, 50]], 2, randomBug, pellets);
        break;
      case 4:
        makeBullets([[0, 100]], 4, randomBug, pellets);
        break;
      case 8:
        makeBullets(
          [
            [0, 50],
            [0, 75],
          ],
          8,
          randomBug,
          pellets
        );
        break;
      case 16:
        makeBullets(
          [
            [50, 50],
            [-50, 50],
          ],
          16,
          randomBug,
          pellets
        );
        break;
      case 32:
        makeBullets(
          [
            [50, 100],
            [-50, 100],
          ],
          32,
          randomBug,
          pellets
        );
        break;
      case 64:
        makeBullets(
          [
            [50, 50],
            [50, 75],
            [-50, 50],
            [-50, 75],
          ],
          64,
          randomBug,
          pellets
        );
        break;
      case 128:
        makeBullets(
          [
            [75, 75],
            [75, 100],
            [-75, 75],
            [-75, 100],
          ],
          128,
          randomBug,
          pellets
        );
        break;
      case 256:
        makeBullets(
          [
            [50, 75],
            [75, 75],
            [75, 100],
            [-50, 75],
            [-75, 75],
            [-75, 100],
          ],
          256,
          randomBug,
          pellets
        );
        break;
      case 512:
        makeBullets(
          [
            [0, 75],
            [50, 75],
            [75, 75],
            [75, 100],
            [-50, 75],
            [-75, 75],
            [-75, 100],
          ],
          512,
          randomBug,
          pellets
        );
        break;
      case 1024:
        makeBullets(
          [
            [50, 75],
            [75, 75],
            [75, 100],
            [100, 100],
            [-50, 75],
            [-75, 75],
            [-75, 100],
            [-100, 100],
          ],
          1024,
          randomBug,
          pellets
        );
        break;
      default:
        break;
    }
  }
}

export function genMegaMagnet(gameState) {
  const megaMagnet = gameState.megaPowerUpPickups
    .create(rollAnNSidedDie(450), 100, "megaPowerup-pickup")
    .setScale(0.25)
    .setName("megaMagnetPickup");
  megaMagnet.play("megaMagnetPickupAnim");
  gameState.genMegaMagnetFX.play();
  megaMagnet.setVelocityY(20);
  gameState.megaPowerUpPickup = megaMagnet;
}

export function genTimedSpawn(gameState, scene) {
  // sortedEnemiesRow(gameState).forEach((bug) =>
  //   console.log(`[${bug.x},${bug.y}], row: ${bug.row}, value: ${bug.value}`)
  // );
  if (rollAnNSidedDie(2) == 1) {
    const lowestValEnemy = gameState.enemies
      .getChildren()
      .sort(
        (enemy, enemy2) =>
          parseInt(enemy.texture.key) - parseInt(enemy2.texture.key)
      )[0];
    generateBugInTopRow(gameState, lowestValEnemy, scene);
  } else {
    generateBugInBottomRow(gameState, scene);
  }
}

export function generateBugInTopRow(gameState, baseBug, scene) {
  if (rowHasSpace(gameState, sortedEnemiesRow(gameState)[0].row)) {
    const topRow = sortedEnemiesRow(gameState)[0].row;
    const [xVal, col] = findValidXSlot(gameState, topRow);
    const row = getHighestRowEnemy(gameState).row;
    spawnBug(xVal, getRandBug(baseBug), row, col, gameState, scene);
  } else {
    const col = rollAnNSidedDie(8);
    const xVal = (col - 1) * 50 + sortedEnemies(gameState)[0].x;
    const row = getHighestRowEnemy(gameState).row - 1;
    if (!gameState.rowToYValue[row]) {
      gameState.rowToYValue[row] =
        gameState.rowToYValue[getHighestRowEnemy(gameState).row] - 50;
    }
    spawnBug(xVal, getRandBug(baseBug), row, col, gameState, scene);
    if (getHighestRowEnemy(gameState).y < TOP_BUFFER) {
      moveEnemiesDown(gameState);
    }
  }
}

function generateBugInBottomRow(gameState, scene) {
  const bottomRow =
    sortedEnemiesRow(gameState)[sortedEnemiesRow(gameState).length - 1].row;
  if (rowHasSpace(gameState, bottomRow)) {
    const [xVal, col] = findValidXSlot(gameState, bottomRow);
    const row = getLowestYEnemy(gameState).row;
    spawnBug(xVal, 2, row, col, gameState, scene);
  } else {
    generateBugInTopRow(gameState, 2, scene);
  }
}

export function getRandBug(bug) {
  let basenum = parseInt(bug.texture.key);
  /*newnum should frequently be 2
    and the rest of the time it should be within 1 power of 2 of the number that was just destroyed
    //*/
  let isTwo = rollAnNSidedDie(3);
  if (isTwo != 1) {
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
