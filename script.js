let prompts = [];
let currentPrompt = null;
let targetValue = 5;
let revealed = false;

const promptTitle = document.getElementById("prompt-title");
const leftLabel = document.getElementById("left-label");
const rightLabel = document.getElementById("right-label");
const guessValue = document.getElementById("guess-value");
const slider = document.getElementById("guess-slider");
const targetDiv = document.getElementById("target");
const resultDiv = document.getElementById("result");

async function loadPrompts() {
    const response = await fetch("prompts.json");
    prompts = await response.json();
}

function getRandomPrompt() {
    const index = Math.floor(Math.random() * prompts.length);
    return prompts[index];
}

function startNewRound() {
    currentPrompt = getRandomPrompt();
    targetValue = Math.floor(Math.random() * 10) + 1;
    revealed = false;

    promptTitle.textContent = currentPrompt.title;
    leftLabel.textContent = currentPrompt.low;
    rightLabel.textContent = currentPrompt.high;

    targetDiv.classList.add("hidden");
    targetDiv.innerHTML = "";
    resultDiv.textContent = "";

    slider.value = 5;
    guessValue.textContent = 5;
}

slider.addEventListener("input", () => {
    guessValue.textContent = slider.value;
});

document.getElementById("reveal-btn").addEventListener("click", () => {
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
            "></div>
        `;

        revealed = true;
    }
});

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

document.getElementById("new-round").addEventListener("click", () => {
    startNewRound();
});

async function initGame() {
    await loadPrompts();
    startNewRound();
}

initGame();