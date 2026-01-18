let spinning = false;
let balance = 100;
let currentRotation = 0;

const spinButton = document.getElementById('spin-button') || null;
const placeBetButton = document.getElementById('place-bet') || null;

if (spinButton) spinButton.disabled = true;

const numberMap = [0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26];

const bettingOptions = {
    "straight": { multiplier: 35 },
    "voisins": { numbers: [17, 22, 18, 29, 7, 28, 12, 35, 3, 26, 0, 32, 15, 19, 4, 21, 2, 25], multiplier: 2 },
    "tiers": { numbers: [12, 3, 6, 24, 5, 10, 23, 8, 30, 11, 36, 13, 27], multiplier: 2 },
    "orphans": { numbers: [1, 6, 9, 14, 17, 20, 31, 34], multiplier: 2 },
    "zero-game": { numbers: [7, 12, 35, 3, 26, 0, 32, 15], multiplier: 2 },
    "first-dozen": { numbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], multiplier: 2 },
    "second-dozen": { numbers: [13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24], multiplier: 2 },
    "third-dozen": { numbers: [25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36], multiplier: 2 },
    "first-column": { numbers: [1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34], multiplier: 2 },
    "second-column": { numbers: [2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35], multiplier: 2 },
    "third-column": { numbers: [3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36], multiplier: 2 },
    "red": { numbers: [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36], multiplier: 1 },
    "black": { numbers: [2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35], multiplier: 1 },
    "even": { numbers: [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36], multiplier: 1 },
    "odd": { numbers: [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29, 31, 33, 35], multiplier: 1 },
    "low": { numbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18], multiplier: 1 },
    "high": { numbers: [19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36], multiplier: 1 }
};

const wheel = document.getElementById('wheel');
const ball = document.getElementById('ball');
const resultText = document.getElementById('result');
const balanceText = document.getElementById('balance');
const betNumberInput = document.getElementById('bet-number');
let betType = "";
let betAmount = 0;
let betNumber = null;

document.getElementById("bet-type").addEventListener("change", function() {
    betType = this.value;
    if (betType === "straight") {
        betNumberInput.style.display = "inline-block";
    } else {
        betNumberInput.style.display = "none";
        betNumber = null;
    }
});

async function placeBet() {
    betType = document.getElementById("bet-type").value;
    betAmount = parseInt(document.getElementById("bet-amount").value);
    if (isNaN(betAmount) || betAmount > balance || betAmount <= 0) {
        alert("Invalid tét!");
        return;
    }
    if (betType === "straight") {
        betNumber = parseInt(betNumberInput.value);
        if (isNaN(betNumber) || betNumber < 0 || betNumber > 36) {
            alert("Adj meg valid számot 0 és 36 között.");
            return;
        }
    }

    await fetch("../api/update_balance.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ delta: -betAmount })
    });

    await loadBalance();

    if (spinButton) spinButton.disabled = false;
    if (placeBetButton) placeBetButton.disabled = true;

    alert(`Bet placed: ${betType} - ${betAmount} coins`);
}

async function spinWheel() {
    if (spinning) return;
    spinning = true;
    if (spinButton) spinButton.disabled = true;

    ball.style.transition = "none";
    ball.style.transform = "translate(-50%, -50%) rotate(0deg) translate(0px, -110px)";

    setTimeout(() => {
        let randomSpin = Math.floor(Math.random() * 360) + 3600;
        currentRotation += randomSpin;
        let ballSpin = -(360 * 13);

        wheel.style.transform = `rotate(${currentRotation}deg)`;
        ball.style.transition = "transform 5s cubic-bezier(0.25, 1, 0.5, 1)";
        ball.style.transform = `translate(-50%, -50%) rotate(${ballSpin}deg) translate(0px, -110px)`;

        setTimeout(async () => {
            let finalAngle = (currentRotation % 360 + 360) % 360;
            let sectorSize = 360 / numberMap.length;
            let winningIndex = Math.round(((360 - finalAngle) % 360) / sectorSize) % numberMap.length;
            let winningNumber = numberMap[winningIndex];
            resultText.innerText = `Nyertes szám: ${winningNumber}`;

            let won = false;
            if (betType === "straight" && winningNumber === betNumber) {
                won = true;
            } else if (bettingOptions[betType]?.numbers?.includes(winningNumber)) {
                won = true;
            }

            if (won) {
                let winnings = betAmount * (bettingOptions[betType].multiplier + 1);

                await fetch("../api/update_balance.php", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ delta: winnings })
                });

                await loadBalance();
                alert(`Nyertél! Kifizetés: ${winnings} coins`);
            } else {
                await loadBalance();
                alert("A tétedet vitte a kaszinó");
            }

            spinning = false;
            if (spinButton) spinButton.disabled = false;
            if (placeBetButton) placeBetButton.disabled = false;
        }, 5000);
    }, 100);
}


// balance lekérő helper (mert korábban hiányzott)
async function loadBalance() {
    const res = await fetch("../api/get_balance.php");
    const b = await res.text();
    balance = parseInt(b);
    balanceText.innerText = balance;
}