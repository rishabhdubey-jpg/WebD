/*************************************************
 * SNAKE GAME – FINAL VERSION
 * Features:
 * - Self collision
 * - Fullscreen mode (F)
 * - Theme switcher (T)
 * - Speed increases per score
 * - Background grid
 *************************************************/

const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

const DEFAULT_WIDTH = 700;
const DEFAULT_HEIGHT = 400;
const CELL_SIZE = 50;

canvas.width = DEFAULT_WIDTH;
canvas.height = DEFAULT_HEIGHT;

/*  GAME STATE  */

let snake = [[0, 0]];
let direction = "right";
let score = 0;
let gameOver = false;
let food = generateFood();
let pulse = 0;

/*  THEMES  */

const themes = {
  dark: {
    bg: "#0f172a",
    grid: "#1e293b",
    snake: "#22c55e",
    head: "#4ade80",
    food: "#ef4444",
    text: "#e5e7eb"
  },
  light: {
    bg: "#ecfeff",
    grid: "#cbd5e1",
    snake: "#0f766e",
    head: "#14b8a6",
    food: "#dc2626",
    text: "#0f172a"
  }
};

let currentTheme = "dark";

/*  SPEED  */

let speed = 220;
let gameInterval = setInterval(gameLoop, speed);

/*  INPUT  */

document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowUp" && direction !== "down") direction = "up";
  if (e.key === "ArrowDown" && direction !== "up") direction = "down";
  if (e.key === "ArrowLeft" && direction !== "right") direction = "left";
  if (e.key === "ArrowRight" && direction !== "left") direction = "right";

  if (e.key === "T" || e.key === "t") toggleTheme();
  if (e.key === "F" || e.key === "f") toggleFullscreen();
});

/*  GAME LOOP  */

function gameLoop() {
  draw();
  update();
}

/*  DRAW  */

function draw() {
  const theme = themes[currentTheme];
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = theme.bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawGrid(theme.grid);

  snake.forEach((part, index) => {
    ctx.shadowBlur = 15;
    ctx.shadowColor = theme.snake;
    ctx.fillStyle = index === snake.length - 1 ? theme.head : theme.snake;
    drawRoundedCell(part[0], part[1]);
  });

  ctx.shadowBlur = 0;

  pulse += 0.1;
  const scale = 1 + Math.sin(pulse) * 0.12;

  ctx.save();
  ctx.translate(food[0] + 25, food[1] + 25);
  ctx.scale(scale, scale);
  ctx.fillStyle = theme.food;
  ctx.beginPath();
  ctx.arc(0, 0, 18, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.fillStyle = theme.text;
  ctx.font = "18px Poppins";
  ctx.fillText(`Score: ${score}`, 20, 30);
  ctx.font = "14px Poppins";
  ctx.fillText("T: Theme | F: Fullscreen", 20, 50);

  if (gameOver) {
    ctx.fillStyle = "rgba(0,0,0,0.7)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#fff";
    ctx.font = "36px Poppins";
    ctx.fillText("GAME OVER", canvas.width / 2 - 110, canvas.height / 2);
    clearInterval(gameInterval);
  }
}

/*  UPDATE  */

function update() {
  if (gameOver) return;

  const [x, y] = snake[snake.length - 1];
  let newX = x;
  let newY = y;

  if (direction === "right") newX += CELL_SIZE;
  if (direction === "left") newX -= CELL_SIZE;
  if (direction === "down") newY += CELL_SIZE;
  if (direction === "up") newY -= CELL_SIZE;

  // Wall collision
  if (
    newX < 0 ||
    newY < 0 ||
    newX >= canvas.width ||
    newY >= canvas.height
  ) {
    gameOver = true;
    return;
  }

  // Self collision
  if (hasHitSelf(newX, newY)) {
    gameOver = true;
    return;
  }

  if (newX === food[0] && newY === food[1]) {
    score++;
    food = generateFood();
    increaseSpeed();
  } else {
    snake.shift();
  }

  snake.push([newX, newY]);
}

/*  HELPERS  */

function hasHitSelf(x, y) {
  return snake.some(segment => segment[0] === x && segment[1] === y);
}

function generateFood() {
  return [
    Math.floor(Math.random() * (canvas.width / CELL_SIZE)) * CELL_SIZE,
    Math.floor(Math.random() * (canvas.height / CELL_SIZE)) * CELL_SIZE
  ];
}

function increaseSpeed() {
  if (score % 3 === 0 && speed > 80) {
    speed -= 15;
    clearInterval(gameInterval);
    gameInterval = setInterval(gameLoop, speed);
  }
}

function drawGrid(color) {
  ctx.strokeStyle = color;
  for (let x = 0; x <= canvas.width; x += CELL_SIZE) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  for (let y = 0; y <= canvas.height; y += CELL_SIZE) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }
}

function drawRoundedCell(x, y) {
  const size = 46;
  const r = 10;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + size - r, y);
  ctx.quadraticCurveTo(x + size, y, x + size, y + r);
  ctx.lineTo(x + size, y + size - r);
  ctx.quadraticCurveTo(x + size, y + size, x + size - r, y + size);
  ctx.lineTo(x + r, y + size);
  ctx.quadraticCurveTo(x, y + size, x, y + size - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.fill();
}

/*  UI HELPERS */

function toggleTheme() {
  currentTheme = currentTheme === "dark" ? "light" : "dark";
}

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    canvas.requestFullscreen();
    resizeCanvas(window.innerWidth, window.innerHeight);
  } else {
    document.exitFullscreen();
    resizeCanvas(DEFAULT_WIDTH, DEFAULT_HEIGHT);
  }
}

function resizeCanvas(w, h) {
  canvas.width = Math.floor(w / CELL_SIZE) * CELL_SIZE;
  canvas.height = Math.floor(h / CELL_SIZE) * CELL_SIZE;
}
