"use strict";

const palette = [
  ["blue", "Blue"], ["cyan", "Cyan"], ["orange", "Orange"], ["red", "Red"],
  ["green", "Green"], ["magenta", "Magenta"], ["black", "Black"], ["pink", "Pink"],
  ["yellow", "Yellow"], ["white", "White"], ["lightgray", "Light gray"], ["#C896DE", "Lavender"],
  ["#6F3258", "Plum"], ["#800000", "Maroon"], ["#800080", "Purple"], ["#008040", "Dark green"],
  ["#373737", "Charcoal"], ["#5A5AF5", "Periwinkle"]
];
const colorNames = new Map(palette);

function boardSettings() {
  const [rows, columns, padding] = location.search.slice(1).split(",").map(Number);
  const size = rows * columns;
  if (Number.isInteger(rows) && Number.isInteger(columns) && rows > 0 && columns > 0 &&
      size >= 2 && size <= palette.length * 2 && size % 2 === 0 && Number.isFinite(padding) && padding > 0) {
    return { rows, columns, padding };
  }
  return { rows: 4, columns: 6, padding: 40 };
}

function shuffledColors(pairCount) {
  const colors = [];
  for (const [color] of palette.slice(0, pairCount)) colors.push(color, color);
  for (let index = colors.length - 1; index > 0; index--) {
    const pick = Math.floor(Math.random() * (index + 1));
    [colors[index], colors[pick]] = [colors[pick], colors[index]];
  }
  return colors;
}

const { rows, columns, padding } = boardSettings();
const board = document.querySelector("#board");
const attempts = document.querySelector("#attempts");
const lapses = document.querySelector("#lapses");
const result = document.querySelector("#result");
const tileSize = Math.min(padding, 200) * 2 + 18;
const gap = columns > 8 ? 4 : 8;
board.style.setProperty("--columns", columns);
board.style.setProperty("--gap", `${gap}px`);
board.style.setProperty("--board-width", `${columns * tileSize + (columns - 1) * gap}px`);

let game;
let mismatchTimer;

function updateBoard() {
  if (attempts.textContent !== String(game.attempts)) attempts.textContent = game.attempts;
  if (lapses.textContent !== String(game.lapses)) lapses.textContent = game.lapses;
  if (game.complete) result.textContent = "Board complete";

  game.tiles.forEach((tile, index) => {
    const button = board.children[index];
    const row = Math.floor(index / columns) + 1;
    const column = index % columns + 1;
    const description = tile.faceUp ? colorNames.get(tile.color) : "Face down";
    const matched = tile.matched ? ", matched" : "";
    button.dataset.faceUp = tile.faceUp;
    button.dataset.matched = tile.matched;
    button.setAttribute("aria-disabled", tile.faceUp || game.mismatch);
    button.setAttribute("aria-label", `Row ${row}, column ${column}, ${description}${matched}`);
  });
}

function flipTile(index) {
  if (!game.flip(index)) return;
  updateBoard();
  if (game.mismatch) {
    mismatchTimer = setTimeout(() => {
      game.hideMismatch();
      updateBoard();
    }, 1000);
  }
}

function newGame() {
  clearTimeout(mismatchTimer);
  game = createGame(shuffledColors(rows * columns / 2));
  result.textContent = "";
  board.textContent = "";
  game.tiles.forEach((tile, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "tile";
    button.style.setProperty("--tile-color", tile.color);
    button.addEventListener("click", () => flipTile(index));
    board.appendChild(button);
  });
  updateBoard();
}

document.querySelector("#new-game").addEventListener("click", newGame);
newGame();
