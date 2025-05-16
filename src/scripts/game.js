const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const GRAVITY = 0.3;
const FLAP = -6;
const BIRD_SIZE = 24;
const PIPE_WIDTH = 50;
const PIPE_GAP = 120;
const PIPE_SPEED = 2;

let birdY = canvas.height / 2;
let birdV = 0;
let pipes = [];
let score = 0;
let gameOver = false;

function resetGame() {
    birdY = canvas.height / 2;
    birdV = 0;
    pipes = [];
    score = 0;
    gameOver = false;
}

function drawBird() {
    // Body (red)
    ctx.save();
    ctx.translate(60, birdY);

    ctx.beginPath();
    ctx.arc(0, 0, BIRD_SIZE / 2, 0, Math.PI * 2);
    ctx.fillStyle = "#d32b2b";
    ctx.fill();
    ctx.strokeStyle = "#a00";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Belly (white)
    ctx.beginPath();
    ctx.arc(0, 6, BIRD_SIZE / 3, 0, Math.PI, true);
    ctx.fillStyle = "#fff";
    ctx.fill();

    // Beak (yellow triangle)
    ctx.beginPath();
    ctx.moveTo(BIRD_SIZE / 2 - 2, 0);
    ctx.lineTo(BIRD_SIZE / 2 + 8, -4);
    ctx.lineTo(BIRD_SIZE / 2 + 8, 4);
    ctx.closePath();
    ctx.fillStyle = "#ff0";
    ctx.fill();
    ctx.strokeStyle = "#cc0";
    ctx.stroke();

    // Left Eye (white)
    ctx.beginPath();
    ctx.arc(-5, -5, 4, 0, Math.PI * 2);
    ctx.fillStyle = "#fff";
    ctx.fill();
    ctx.strokeStyle = "#222";
    ctx.stroke();

    // Right Eye (white)
    ctx.beginPath();
    ctx.arc(5, -5, 4, 0, Math.PI * 2);
    ctx.fillStyle = "#fff";
    ctx.fill();
    ctx.stroke();

    // Left Pupil
    ctx.beginPath();
    ctx.arc(-5, -5, 1.5, 0, Math.PI * 2);
    ctx.fillStyle = "#222";
    ctx.fill();

    // Right Pupil
    ctx.beginPath();
    ctx.arc(5, -5, 1.5, 0, Math.PI * 2);
    ctx.fillStyle = "#222";
    ctx.fill();

    // Eyebrows (angry)
    ctx.strokeStyle = "#222";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-8, -10);
    ctx.lineTo(-2, -8);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(2, -8);
    ctx.lineTo(8, -12);
    ctx.stroke();

    ctx.restore();
}

function drawPipes() {
    pipes.forEach(pipe => {
        // Pipe body (green with gradient)
        let grad = ctx.createLinearGradient(pipe.x, 0, pipe.x + PIPE_WIDTH, 0);
        grad.addColorStop(0, "#43a047");
        grad.addColorStop(1, "#388e3c");
        ctx.fillStyle = grad;

        // Top pipe body
        ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.top);
        // Bottom pipe body
        ctx.fillRect(pipe.x, pipe.top + PIPE_GAP, PIPE_WIDTH, canvas.height - pipe.top - PIPE_GAP);

        // Pipe caps (lighter green)
        ctx.fillStyle = "#a5d6a7";
        // Top cap
        ctx.fillRect(pipe.x - 4, pipe.top - 12, PIPE_WIDTH + 8, 12);
        // Bottom cap
        ctx.fillRect(pipe.x - 4, pipe.top + PIPE_GAP, PIPE_WIDTH + 8, 12);

        // Pipe shadow (optional, for depth)
        ctx.save();
        ctx.globalAlpha = 0.2;
        ctx.fillStyle = "#222";
        // Top shadow
        ctx.fillRect(pipe.x + PIPE_WIDTH - 6, 0, 6, pipe.top);
        // Bottom shadow
        ctx.fillRect(pipe.x + PIPE_WIDTH - 6, pipe.top + PIPE_GAP, 6, canvas.height - pipe.top - PIPE_GAP);
        ctx.restore();
    });
}

function drawScore() {
                       ctx.fillStyle = "#000"; // Black color for visibility
    ctx.font = "24px Arial";
    ctx.textAlign = "left";
    ctx.fillText(`Score: ${score}`, 10, 30);
}

function updatePipes() {
    if (pipes.length === 0 || pipes[pipes.length - 1].x < canvas.width - 140) {
        const top = Math.random() * (canvas.height - PIPE_GAP - 80) + 40;
        pipes.push({ x: canvas.width, top });
    }
    pipes.forEach(pipe => pipe.x -= PIPE_SPEED);
    if (pipes.length && pipes[0].x < -PIPE_WIDTH) pipes.shift();
}

function checkCollision() {
    if (birdY + BIRD_SIZE / 2 > canvas.height || birdY - BIRD_SIZE / 2 < 0) return true;
    for (let pipe of pipes) {
        if (
            60 + BIRD_SIZE / 2 > pipe.x && 60 - BIRD_SIZE / 2 < pipe.x + PIPE_WIDTH &&
            (birdY - BIRD_SIZE / 2 < pipe.top || birdY + BIRD_SIZE / 2 > pipe.top + PIPE_GAP)
        ) {
            return true;
        }
    }
    return false;
}

function updateScore() {
    pipes.forEach(pipe => {
        if (!pipe.passed && pipe.x + PIPE_WIDTH < 60) {
            score++;
            pipe.passed = true;
        }
    });
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!gameOver) {
        birdV += GRAVITY;
        birdY += birdV;

        updatePipes();
        updateScore();

        if (checkCollision()) {
            gameOver = true;
        }
    }

    drawPipes();
    drawBird();

          // Only show score and Game Over when game is over
    if (gameOver) {
        ctx.fillStyle = "#000"; // Black color for Game Over
        ctx.font = "32px Arial";
        ctx.textAlign = "center";
        ctx.fillText("Game Over", canvas.width / 2, canvas.height / 2);
        ctx.font = "20px Arial";
        ctx.fillText("Press Enter to restart", canvas.width / 2, canvas.height / 2 + 40);

        // Show final score in black at top left
        ctx.textAlign = "left";
        drawScore();
    }

    // Draw ground
    ctx.fillStyle = "#8d6e63";
    ctx.fillRect(0, canvas.height - 40, canvas.width, 40);
    ctx.fillStyle = "#a1887f";
    for (let i = 0; i < canvas.width; i += 40) {
        ctx.fillRect(i, canvas.height - 40, 20, 20);
    }

    requestAnimationFrame(gameLoop);
}

// Controls
document.addEventListener('keydown', function(e) {
    if ((e.code === 'Space' || e.key === ' ') && !gameOver) {
        birdV = FLAP;
    } else if ((e.code === 'Enter' || e.key === 'Enter') && gameOver) {
        resetGame();
    } else if (e.code === 'Escape') {
        resetGame();
    }
});

canvas.addEventListener('mousedown', function() {
    if (!gameOver) {
        birdV = FLAP;
    }
});
canvas.addEventListener('touchstart', function(e) {
    e.preventDefault();
    if (!gameOver) {
        birdV = FLAP;
    }
}, { passive: false });

resetGame();
gameLoop();