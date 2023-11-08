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

export const topRowHasSpace = (gameState) => {
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
};

export const spawnDoubleBug = (hitBug, oldBug, gameState) => {
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
    .setGravityY(-200);
  return rowIsEmpty;
};

export const createStartingEnemies = (
  gameState,
  value,
  firstRow,
  secondRow
) => {
  for (let xVal = 1; xVal < 9; xVal++) {
    for (let yVal = firstRow; yVal <= secondRow; yVal++) {
      gameState.enemies
        .create(50 * xVal, 50 * yVal + TOP_BUFFER, value, 0)
        .setScale(gameState.scale)
        .setGravityY(-200);
    }
  }
};
function sortedEnemiesRows() {
  const sortedByRows = gameState.enemies.getChildren().sort(function (a, b) {
    if (a.y === b.y) {
      return a.x - b.x;
    }
    return a.y - b.y;
  });
  return sortedByRows;
}
// numOfTotalEnemies() returns the number of total enemies
function numOfTotalEnemies() {
  const totalEnemies = gameState.enemies.getChildren().length;
  return totalEnemies;
}
