let targetValue = Math.floor(Math.random() * 101);
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
        targetDiv.style.position = "relative";
        targetDiv.innerHTML = `<div style="
            position:absolute;
            left:${targetValue}%;
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

    let score;
    if (diff === 0) score = 4;
    else if (diff <= 5) score = 3;
    else if (diff <= 10) score = 2;
    else if (diff <= 20) score = 1;
    else score = 0;

    resultDiv.textContent = `Ziel: ${targetValue} | Dein Guess: ${guess} | Punkte: ${score}`;
});

document.getElementById("new-round").addEventListener("click", () => {
    targetValue = Math.floor(Math.random() * 101);
    revealed = false;
    targetDiv.classList.add("hidden");
    targetDiv.innerHTML = "";
    resultDiv.textContent = "";
    slider.value = 50;
    guessValue.textContent = 50;
});