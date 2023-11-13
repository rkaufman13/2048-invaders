export const initialValues = {
  enemyVelocity: 0.5,
  powerUpVelocity: 1,
  activeBug: 0,
  randomspawncounter: 0,
  topRow: {
    0: null,
    1: null,
    2: null,
    3: null,
    4: null,
    5: null,
    6: null,
    7: null,
  },
  sumValueOfEnemies: 0,
  scale: 0.5,
  rowIsEmpty: false,
};

export const TOP_BUFFER = 50;
export const LEFT_BUFFER = 25;
export const RIGHT_BUFFER = 15;
export const FINISHED_SPRITES_ARRAY = ["2", "4", "8", "16"];
export const basicFontConfig = {
  fontSize: "15px",
  fill: "#fff",
};

export const instructions =
  "You are a brave fighter who hates math. Your enemies are growing exponentionally larger by the minute. Your only hope to defeat them is to combine them into the largest known number: 2048.\nShoot the number enemies on the screen, trying to match two of the same number. If you do that, they'll combine into one bigger enemy. Keep doing this until 2048 appears, and then kill it!";
