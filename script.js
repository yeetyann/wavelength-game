let prompts = [];
let promptDeck = [];
let currentPrompt = null;
let targetValue = 5;
let revealed = false;
let guess = 5;

// DOM Elements
const promptTitle = document.getElementById("prompt-title");
const leftLabel = document.getElementById("left-label");
const rightLabel = document.getElementById("right-label");

const guessValue = document.getElementById("guess-value");

const targetDiv = document.getElementById("target");
const resultDiv = document.getElementById("result");

const revealBtn = document.getElementById("reveal-btn");

// Canvas
const canvas = document.getElementById("gauge");
const ctx = canvas.getContext("2d");

// Load prompts
async function loadPrompts() {
    const response = await fetch("prompts.json");
    prompts = await response.json();
    resetPromptDeck();
}

// Shuffle
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Deck
function resetPromptDeck() {
    promptDeck = shuffleArray(prompts);
}

function drawNextPrompt() {
    if (promptDeck.length === 0) {
        resetPromptDeck();
    }
    return promptDeck.pop();
}

// Gauge Drawing
function drawGauge() {
    const cx = canvas.width / 2;
    const cy = canvas.height - 10;
    const radius = 150;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const colors = ["green", "limegreen", "yellow", "orange", "red"];

    for (let i = 0; i < 5; i++) {
        const start = Math.PI + (i * Math.PI / 5);
        const end = start + Math.PI / 5;

        ctx.beginPath();
        ctx.arc(cx, cy, radius, start, end);
        ctx.lineWidth = 20;
        ctx.strokeStyle = colors[i];
        ctx.stroke();
    }

    const angle = Math.PI + ((guess - 1) / 9) * Math.PI;

    const needleLength = radius - 20;

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(
        cx + Math.cos(angle) * needleLength,
        cy + Math.sin(angle) * needleLength
    );
    ctx.lineWidth = 3;
    ctx.strokeStyle = "black";
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cx, cy, 6, 0, 2 * Math.PI);
    ctx.fillStyle = "black";
    ctx.fill();
}

// Click interaction
canvas.addEventListener("click", (e) => {
    const rect = canvas.getBoundingClientRect();

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const cx = canvas.width / 2;
    const cy = canvas.height - 10;

    const dx = x - cx;
    const dy = y - cy;

    let angle = Math.atan2(dy, dx);

    if (angle < Math.PI && angle > 0) return;

    let normalized = angle - Math.PI;
    if (normalized < 0) normalized += Math.PI;

    const value = Math.round((normalized / Math.PI) * 9) + 1;

    guess = Math.min(10, Math.max(1, value));
    guessValue.textContent = guess;

    drawGauge();
});

// New round
function startNewRound() {
    currentPrompt = drawNextPrompt();
    targetValue = Math.floor(Math.random() * 10) + 1;
    revealed = false;

    promptTitle.textContent = currentPrompt.title || "";
    leftLabel.textContent = currentPrompt.low;
    rightLabel.textContent = currentPrompt.high;

    targetDiv.classList.add("hidden");
    targetDiv.innerHTML = "";
    resultDiv.textContent = "";

    guess = 5;
    guessValue.textContent = 5;

    revealBtn.textContent = "Ziel anzeigen (Clue-Giver)";

    drawGauge();
}

// Toggle reveal
revealBtn.addEventListener("click", () => {
    if (!revealed) {
        targetDiv.classList.remove("hidden");

        const percent = ((targetValue - 1) / 9) * 100;

        targetDiv.innerHTML = `
            <div style="
                position:absolute;
                left:${percent}%;
                width:4px;
                height:20px;
                background:black;
                top:-5px;
                transform: translateX(-50%);
            "></div>
        `;

        revealBtn.textContent = "Ziel ausblenden";
        revealed = true;

    } else {
        targetDiv.classList.add("hidden");
        targetDiv.innerHTML = "";

        revealBtn.textContent = "Ziel anzeigen (Clue-Giver)";
        revealed = false;
    }
});

// Submit
document.getElementById("submit-btn").addEventListener("click", () => {
    const diff = Math.abs(guess - targetValue);

    let score;
    if (diff === 0) score = 4;
    else if (diff === 1) score = 3;
    else if (diff === 2) score = 2;
    else if (diff <= 3) score = 1;
    else score = 0;

    resultDiv.textContent =
        `${currentPrompt.low} ↔ ${currentPrompt.high} | Ziel: ${targetValue} | Guess: ${guess} | Punkte: ${score}`;
});

// Button
document.getElementById("new-round").addEventListener("click", startNewRound);

// Init
async function initGame() {
    try {
        await loadPrompts();
        startNewRound();
    } catch (err) {
        console.error(err);
        promptTitle.textContent = "Fehler beim Laden der Prompts";
    }
}

initGame();