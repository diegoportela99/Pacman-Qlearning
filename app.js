/* global Pacman, Ghost */

// Movement of game set as - 150 ms

// Q learning Params

var aliveReward = -1;
var deathReward = -10000;
var scoreReward = 50000000;

var alpha = 0.2; // Learning Rate
var alphaDecay = 1; // Decay factor of learning rate

var discountFactor = 0.9; // Discount factor

var mode = "play";

var randomness, decayFactor;

if (mode === "play") {
  randomness = 0.0001;
  decayFactor = 1;
} else {
  randomness = 0.6;
  decayFactor = 3;
}

var eMin = 0.0001;

var previousState = null;
var previousAction = null;
var countGame = 0;
var gameScores = [];

var start = 0;
var end = 0;

// (UP,LEFT,DOWN,RIGHT)
var Q = [0, 0, 0, 0];

var countMoves = 0;
var moves = [];
var moveSinceScore = 0;

// // Function to save data to a file
// function download(content, fileName, contentType) {
//   var a = document.createElement("a");
//   var file = new Blob([content], { type: contentType });
//   a.href = URL.createObjectURL(file);
//   a.download = fileName;
//   a.click();
// }
// download(jsonData, "json.txt", "text/plain");

// ---

let topScore = 0;
let score = 0;

const width = 28;
const grid = document.querySelector(".grid");
const walls = [
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
  1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 0,
  1, 1, 1, 1, 0, 1, 1, 3, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1,
  1, 0, 1, 1, 1, 1, 3, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1,
  1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1,
  1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1,
  1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1,
  1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
  0, 1, 1, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
  1, 1, 0, 1, 1, 4, 1, 1, 1, 2, 2, 1, 1, 1, 4, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1,
  1, 1, 1, 1, 0, 1, 1, 4, 1, 2, 2, 2, 2, 2, 2, 1, 4, 1, 1, 0, 1, 1, 1, 1, 1, 1,
  1, 1, 1, 1, 1, 1, 0, 0, 0, 4, 1, 2, 2, 2, 2, 2, 2, 1, 4, 0, 0, 0, 1, 1, 1, 1,
  1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 4, 1, 2, 2, 2, 2, 2, 2, 1, 4, 1, 1, 0, 1, 1,
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 4, 1, 1, 1, 1, 1, 1, 1, 1, 4, 1, 1, 0,
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 4, 1, 1, 1, 1, 1, 1, 1, 1, 4, 1,
  1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 4, 4, 4, 4, 4, 4, 4,
  4, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 0,
  1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1,
  1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 3, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 3, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 0,
  1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1,
  1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0,
  0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1, 1,
  1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0,
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1,
  1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
  1, 1, 1, 1,
];
const cells = [];

const legend = ["food", "wall", "nest", "big-food"];

const setCells = () => {
  for (let i = 0; i < width * width; i++) {
    const cell = document.createElement("DIV");
    if (legend[walls[i]]) cell.classList.add(legend[walls[i]]);
    grid.appendChild(cell);
    cells.push(cell);
  }
};

const resetCells = () => {
  curr = 0;
  cells.forEach((cell) => {
    if (cell.className.includes("pacman")) {
      cell.className = legend[walls[curr]] + " pacman";
    } else {
      cell.className = legend[walls[curr]];
    }
    curr++;
  });
};

setCells();

const addValue = () => {
  score++;
};

const ghosts = [
  new Ghost(cells, "ghost orange", 348, gameOver),
  new Ghost(cells, "ghost red", 376, gameOver),
  new Ghost(cells, "ghost cyan", 351, gameOver),
  new Ghost(cells, "ghost pink", 379, gameOver),
];

function becomeHunter() {
  ghosts.forEach((ghost) => ghost.becomePrey());
}

const pacman = new Pacman(cells, 490, becomeHunter, addValue);

ghosts.forEach((ghost) => ghost.animate());

let gameIsOver, ghostCaught;

const gameTimer = setInterval(() => {
  cells.forEach((cell) => {
    const isPac = cell.classList.contains("pacman");
    const isGhost = cell.classList.contains("ghost");
    const isPrey = cell.classList.contains("prey");
    const isDeceased = cell.classList.contains("deceased");
    const ghostColor = Array.from(cell.classList).find((c) =>
      ["red", "orange", "cyan", "pink"].includes(c)
    );

    if (isPac && isGhost && !isPrey && !isDeceased) {
      gameIsOver = true;
    }

    if (isPac && isGhost && isPrey) {
      ghostCaught = ghosts.find((ghost) => ghost.hasClass(ghostColor));
    }
  });

  if (gameIsOver) gameOver();
  if (ghostCaught) ghostCaught.caputure();
}, 30);

function gameOver() {
  topScore = Math.max(topScore, score);
  gameScores.push(score);
  // update Q of previous state (state which lead to gameOver)
  previousReward = Q[previousState];

  if (previousAction === null) index = 0;
  if (previousAction === "U") index = 0;
  if (previousAction === "L") index = 1;
  if (previousAction === "D") index = 2;
  if (previousAction === "R") index = 3;

  previousReward[index] =
    (1 - alpha) * previousReward[index] + alpha * deathReward;

  Q[previousState] = previousReward;

  previousState = null;
  previousAction = null;

  // // show some stats
  // if (countGame % 100 === 1) {
  //   end = time();
  //   timeD = end - start;
  //   console.log (str(countGame)+ " : " + "\t" + 'meanScore: ' +  str(np.mean(gameScores[-100:])) + "| HighScore: " + str(np.max(gameScores)) +
  //             '| moves: ' + str(np.mean(moves[-100:])) + "| time for 10 games: " + str(round(timeD*10)/100))
  //   start = time();
  // }

  // decrease alpha / e over time (moves)
  if (countGame % 100 === 0) {
    alpha = alpha * alphaDecay;
    if (randomness > eMin) randomness = randomness / decayFactor;
  }

  countGame += 1;

  score = 0;
  pacman.position = pacman.startPosition;
  ghosts.forEach((ghost) => ghost.stop());
  resetCells();
  gameIsOver = false;
  ghostCaught = false;
}

// input (raw game state) (cells)
// Returns state as -> 5x5 matrix value from pacman center
function stateHandler(currentCells) {
  return [];
}

// Implements the QLearning algorithm, returns an action given a state
function QLearning() {
  action = ["left", "up", "right", "down"];
  return action[0];
}

// Saves data as a pickle file for future use
function saveLearning() {}

// Gets the data from learning file (Q learning Pickle file) and returns it
function getLearningFile() {
  return "";
}
