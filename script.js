let targetValue = Math.floor(Math.random() * 10) + 1; // 1–10
let revealed = false;

const slider = document.getElementById("guess-slider");
const guessValue = document.getElementById("guess-value");
const targetDiv = document.getElementById("target");
const resultDiv = document.getElementById("result");

slider.addEventListener("input", () => {
    guessValue.textContent = slider.value;
});

document.getElementById("reveal-btn").addEventListener("click", () => {
    if (!revealed) {
        targetDiv.classList.remove("hidden");

        // Position relativ (1–10 → 0–100%)
        const percent = ((targetValue - 1) / 9) * 100;

        targetDiv.innerHTML = `<div style="
            position:absolute;
            left:${percent}%;
            width:4px;
            height:20px;
            background:black;
            top:-5px;
        "></div>`;

        revealed = true;
    }
});

document.getElementById("submit-btn").addEventListener("click", () => {
    const guess = parseInt(slider.value);
    const diff = Math.abs(guess - targetValue);

    // Angepasstes Scoring für kleinere Skala
    let score;
    if (diff === 0) score = 4;
    else if (diff === 1) score = 3;
    else if (diff === 2) score = 2;
    else if (diff <= 3) score = 1;
    else score = 0;

    resultDiv.textContent = `Ziel: ${targetValue} | Dein Guess: ${guess} | Punkte: ${score}`;
});

document.getElementById("new-round").addEventListener("click", () => {
    targetValue = Math.floor(Math.random() * 10) + 1;
    revealed = false;
    targetDiv.classList.add("hidden");
    targetDiv.innerHTML = "";
    resultDiv.textContent = "";
    slider.value = 5;
    guessValue.textContent = 5;
});