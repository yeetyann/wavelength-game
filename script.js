let prompts = [];
let promptDeck = [];
let currentPrompt = null;
let targetValue = 5;
let revealed = false;

// DOM Elements
const promptTitle = document.getElementById("prompt-title");
const leftLabel = document.getElementById("left-label");
const rightLabel = document.getElementById("right-label");

const slider = document.getElementById("guess-slider");
const guessValue = document.getElementById("guess-value");

const targetDiv = document.getElementById("target");
const resultDiv = document.getElementById("result");

const revealBtn = document.getElementById("reveal-btn");

// Load prompts
async function loadPrompts() {
    const response = await fetch("prompts.json");
    prompts = await response.json();

    if (!Array.isArray(prompts) || prompts.length === 0) {
        throw new Error("prompts.json is empty or invalid.");
    }

    resetPromptDeck();
}

// Fisher-Yates shuffle
function shuffleArray(array) {
    const shuffled = [...array];

    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled;
}

// Create a new shuffled deck
function resetPromptDeck() {
    promptDeck = shuffleArray(prompts);
}

// Draw next prompt from deck
function drawNextPrompt() {
    if (promptDeck.length === 0) {
        resetPromptDeck();
    }

    return promptDeck.pop();
}

// Start new round
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

    slider.value = 5;
    guessValue.textContent = 5;

    revealBtn.textContent = "Ziel anzeigen (Clue-Giver)";
}

// Slider update
slider.addEventListener("input", () => {
    guessValue.textContent = slider.value;
});

// Toggle reveal target
revealBtn.addEventListener("click", () => {
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

// Submit guess
document.getElementById("submit-btn").addEventListener("click", () => {
    const guess = parseInt(slider.value, 10);
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

// New round button
document.getElementById("new-round").addEventListener("click", () => {
    startNewRound();
});

// Init
async function initGame() {
    try {
        await loadPrompts();
        startNewRound();
    } catch (error) {
        console.error("Failed to initialize game:", error);
        promptTitle.textContent = "Fehler beim Laden der Prompts";
        leftLabel.textContent = "-";
        rightLabel.textContent = "-";
        resultDiv.textContent = "Bitte prüfe deine prompts.json.";
    }
}

initGame();