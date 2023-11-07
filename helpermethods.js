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
