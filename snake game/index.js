/*************************************************
 SNAKE GAME – HUMAN READABLE VERSION
 * Features:
 * - Theme switcher (Press T)
 * - Speed increases as score grows
 * - Smooth animations & glow effects
 *************************************************/

/* CANVAS SETUP  */

const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

canvas.width = 700;
canvas.height = 400;

/*  GAME CONSTANTS  */

const CELL_SIZE = 50;

/*  GAME STATE  */

let snake = [[0, 0]];          // Snake body (each cell is [x, y])
let direction = "right";       // Current movement direction
let score = 0;                // Player score
let gameOver = false;          // Game state flag
let food = generateFood();     // Food position
let foodPulse = 0;             // For food animation

/*  THEMES  */

const themes = {
  dark: {
    background: "#0f172a",
    snakeBody: "#22c55e",
    snakeHead: "#4ade80",
    food: "#ef4444",
    text: "#e5e7eb"
  },
  light: {
    background: "#ecfeff",
    snakeBody: "#0f766e",
    snakeHead: "#14b8a6",
    food: "#dc2626",
    text: "#0f172a"
  }
};

let currentTheme = "dark";

/*  SPEED CONTROL  */

let speed = 220; // milliseconds
let gameInterval = setInterval(gameLoop, speed);

/*  INPUT HANDLING  */

document.addEventListener("keydown", (e) => {

  // Prevent instant reverse direction
  if (e.key === "ArrowUp" && direction !== "down") direction = "up";
  if (e.key === "ArrowDown" && direction !== "up") direction = "down";
  if (e.key === "ArrowLeft" && direction !== "right") direction = "left";
  if (e.key === "ArrowRight" && direction !== "left") direction = "right";

  // Theme toggle
  if (e.key === "t" || e.key === "T") {
    currentTheme = currentTheme === "dark" ? "light" : "dark";
  }
});

/*  MAIN GAME LOOP  */

function gameLoop() {
  drawGame();
  updateGame();
}

/*  DRAWING  */

function drawGame() {
  const theme = themes[currentTheme];

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  ctx.fillStyle = theme.background;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  snake.forEach((segment, index) => {
    ctx.shadowBlur = 15;
    ctx.shadowColor = theme.snakeBody;

    ctx.fillStyle =
      index === snake.length - 1
        ? theme.snakeHead
        : theme.snakeBody;

    drawRoundedCell(segment[0], segment[1]);
  });

  ctx.shadowBlur = 0;

  // Draw food with pulse animation
  foodPulse += 0.1;
  const scale = 1 + Math.sin(foodPulse) * 0.12;

  ctx.save();
  ctx.translate(food[0] + 25, food[1] + 25);
  ctx.scale(scale, scale);
  ctx.fillStyle = theme.food;
  ctx.beginPath();
  ctx.arc(0, 0, 18, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.fillStyle = theme.text;
  ctx.font = "20px Poppins, sans-serif";
  ctx.fillText(`Score: ${score}`, 20, 30);
  ctx.font = "14px Poppins";
  ctx.fillText(`Theme: ${currentTheme.toUpperCase()} (Press T)`, 20, 50);

  if (gameOver) {
    ctx.fillStyle = "rgba(0,0,0,0.7)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#ffffff";
    ctx.font = "38px Poppins";
    ctx.fillText("GAME OVER", 230, 190);
    ctx.font = "18px Poppins";
    ctx.fillText("Refresh to Restart", 260, 225);

    clearInterval(gameInterval);
  }
}

/*  GAME LOGIC  */

function updateGame() {
  if (gameOver) return;

  const [headX, headY] = snake[snake.length - 1];
  let newX = headX;
  let newY = headY;

  // Move snake
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

  // Food eaten
  if (newX === food[0] && newY === food[1]) {
    score++;
    food = generateFood();
    increaseSpeed();
  } else {
    snake.shift();
  }

  // Add new head
  snake.push([newX, newY]);
}

/* SPEED LOGIC */
function increaseSpeed() {
  // Every 3 points, speed up (with a safe limit)
  if (score % 3 === 0 && speed > 80) {
    speed -= 15;
    clearInterval(gameInterval);
    gameInterval = setInterval(gameLoop, speed);
  }
}

/* HELPERS */

function generateFood() {
  return [
    Math.floor(Math.random() * (canvas.width / CELL_SIZE)) * CELL_SIZE,
    Math.floor(Math.random() * (canvas.height / CELL_SIZE)) * CELL_SIZE
  ];
}

function drawRoundedCell(x, y) {
  const size = 46;
  const radius = 10;

  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + size - radius, y);
  ctx.quadraticCurveTo(x + size, y, x + size, y + radius);
  ctx.lineTo(x + size, y + size - radius);
  ctx.quadraticCurveTo(x + size, y + size, x + size - radius, y + size);
  ctx.lineTo(x + radius, y + size);
  ctx.quadraticCurveTo(x, y + size, x, y + size - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.fill();
}
