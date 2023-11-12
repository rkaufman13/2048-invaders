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

export const bottomRowIsOrWillBeEmpty = (hitBug, oldBug, gameState) => {
  /*this currently accounts for 'there are no enemies remaining with the largest y value of the two bugs we just killed
    which actually could not be the bottom row lol
    we need to account for the following states
    1) both killed bugs were in the bottom row (at the time this is called they will still be alive, because callback hell), and there are or are not bugs remaining in that row
    2) one killed bug was in the bottom row, and there are or are not bugs in that row
    3) neither killed bug was in the bottom row, in which case the bottom row is never empty
    */
  const sortedEnemies = sortedEnemiesY(gameState);
  if (
    hitBug.row == 4 &&
    oldBug.row == 4 &&
    sortedEnemies.filter((enemy) => enemy.row == 4).length == 2
  ) {
    return true;
  } else if (
    (hitBug.row == 4 || oldBug.row == 4) &&
    sortedEnemies.filter((enemy) => enemy.row == 4).length == 1
  ) {
    return true;
  }
  return false;
};

export function powerOf2(v) {
  return v && !(v & (v - 1));
}

export function topRowHasSpace(gameState) {
  //todo now that we have a row property on enemies, can this be made more efficient?
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

export function spawnBug(xVal, yVal, bugVal, row, gameState) {
  gameState.activeBug = 0;
  const newEnemy = gameState.enemies
    .create(xVal, yVal, bugVal)
    .setScale(gameState.scale)
    .setGravityY(-200)
    .setName(`Bug ${xVal}:${yVal}`);
  newEnemy.row = row;
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
      enemy.value = enemy.texture.key;
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
  const megaMagnet = gameState.megaPowerUps
    .create(rollAnNSidedDie(450), lowestYVal + 100, "megaPowerup")
    .setScale(0.25)
    .setName("megaMagnet");
  megaMagnet.play("shootMegaMagnetAnim");
  //play powerup gen sound
  megaMagnet.setVelocityY(30);
  gameState.megaPowerUp = megaMagnet;
}

export function getRandBug(bug) {
  let basenum = bug.texture.key;
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

export function genDelay(gameState) {
  return 1000;
}
