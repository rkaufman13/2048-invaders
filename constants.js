export const TOP_BUFFER = 50;
export const LEFT_BUFFER = 25;
export const RIGHT_BUFFER = 15;
export const basicFontConfig = {
  fontSize: "15px",
  fill: "#fff",
};

export const initialValues = {
  powerUpVelocity: 1,
  randomspawncounter: 0,
  sumValueOfEnemies: 0,
  scale: 0.5,
  rowToYValue: {
    1: 0 + TOP_BUFFER,
    2: 50 + TOP_BUFFER,
    3: 100 + TOP_BUFFER,
    4: 150 + TOP_BUFFER,
  },
};

export const instructions =
  "You are a brave fighter who hates math. Your enemies are growing exponentionally larger by the minute. Your only hope to defeat them is to combine them into the largest known number: 2048.\nShoot the number enemies on the screen, trying to match two of the same number. If you do that, they'll combine into one bigger enemy. Keep doing this until 2048 appears, and then kill it!";
