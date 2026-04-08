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

// ---------- Prompt loading ----------
async function loadPrompts() {
    const response = await fetch("./prompts.json");

    if (!response.ok) {
        throw new Error(`HTTP error while loading prompts.json: ${response.status}`);
    }

    const data = await response.json();

    if (!Array.isArray(data) || data.length === 0) {
        throw new Error("prompts.json is empty or not an array.");
    }

    for (const entry of data) {
        if (
            typeof entry !== "object" ||
            entry === null ||
            typeof entry.low !== "string" ||
            typeof entry.high !== "string"
        ) {
            throw new Error("prompts.json contains invalid entries.");
        }
    }

    prompts = data;
    resetPromptDeck();
}

// ---------- Shuffle / deck ----------
function shuffleArray(array) {
    const shuffled = [...array];

    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled;
}

function resetPromptDeck() {
    promptDeck = shuffleArray(prompts);
}

function drawNextPrompt() {
    if (promptDeck.length === 0) {
        resetPromptDeck();
    }

    return promptDeck.pop();
}

// ---------- Gauge ----------
function drawGauge() {
    const cx = canvas.width / 2;
    const cy = canvas.height - 10;
    const radius = 150;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const colors = ["#2e7d32", "#7cb342", "#fdd835", "#fb8c00", "#e53935"];

    for (let i = 0; i < 5; i++) {
        const start = Math.PI + (i * Math.PI / 5);
        const end = start + Math.PI / 5;

        ctx.beginPath();
        ctx.arc(cx, cy, radius, start, end);
        ctx.lineWidth = 24;
        ctx.strokeStyle = colors[i];
        ctx.stroke();
    }

    const angle = Math.PI + ((guess - 1) / 9) * Math.PI;
    const needleLength = radius - 25;

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(
        cx + Math.cos(angle) * needleLength,
        cy + Math.sin(angle) * needleLength
    );
    ctx.lineWidth = 4;
    ctx.strokeStyle = "#111";
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cx, cy, 9, 0, 2 * Math.PI);
    ctx.fillStyle = "#111";
    ctx.fill();
}

function updateGuessFromPointer(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;

    const cx = canvas.width / 2;
    const cy = canvas.height - 10;

    const dx = x - cx;
    const dy = y - cy;

    let angle = Math.atan2(dy, dx);

    // only allow upper semicircle
    if (angle > 0) {
        return;
    }

    // map [-PI, 0] -> [0, PI]
    const normalized = angle + Math.PI;

    const value = Math.round((normalized / Math.PI) * 9) + 1;
    guess = Math.max(1, Math.min(10, value));

    guessValue.textContent = guess;
    drawGauge();
}

canvas.addEventListener("click", (e) => {
    updateGuessFromPointer(e.clientX, e.clientY);
});

// ---------- Round logic ----------
function startNewRound() {
    currentPrompt = drawNextPrompt();
    targetValue = Math.floor(Math.random() * 10) + 1;
    revealed = false;
    guess = 5;

    promptTitle.textContent = currentPrompt.title || "Ohne Titel";
    leftLabel.textContent = currentPrompt.low;
    rightLabel.textContent = currentPrompt.high;

    guessValue.textContent = guess;
    targetDiv.classList.add("hidden");
    targetDiv.innerHTML = "";
    resultDiv.textContent = "";
    revealBtn.textContent = "Ziel anzeigen (Clue-Giver)";

    drawGauge();
}

// ---------- Reveal ----------
revealBtn.addEventListener("click", () => {
    if (!currentPrompt) {
        resultDiv.textContent = "Noch keine Prompts geladen.";
        return;
    }

    if (!revealed) {
        targetDiv.classList.remove("hidden");

        const percent = ((targetValue - 1) / 9) * 100;

        targetDiv.innerHTML = `
            <div style="
                position: absolute;
                left: ${percent}%;
                width: 4px;
                height: 20px;
                background: black;
                top: -5px;
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

// ---------- Submit ----------
document.getElementById("submit-btn").addEventListener("click", () => {
    if (!currentPrompt) {
        resultDiv.textContent = "Noch keine Prompts geladen.";
        return;
    }

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

// ---------- Button ----------
document.getElementById("new-round").addEventListener("click", () => {
    if (!prompts.length) {
        resultDiv.textContent = "Prompts konnten nicht geladen werden.";
        return;
    }
    startNewRound();
});

// ---------- Init ----------
async function initGame() {
    drawGauge();

    try {
        await loadPrompts();
        startNewRound();
    } catch (err) {
        console.error("Init error:", err);
        promptTitle.textContent = "Fehler beim Laden der Prompts";
        leftLabel.textContent = "-";
        rightLabel.textContent = "-";
        resultDiv.textContent = "Prüfe prompts.json und den Dateipfad.";
    }
}

initGame();