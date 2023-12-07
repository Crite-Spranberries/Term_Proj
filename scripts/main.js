const bing = new Audio('../sfx/bing_sfx.mp3');
const bg_music = new Audio('../sfx/gamblin_man.mp3');
bg_music.volume = 0.1;

const NUMBER_OF_PLAYER_DICE = 2;
const NUMBER_OF_COMPUTER_DICE = 2;
const MAX_INTERVAL_DURATION = 500;
const INITIAL_INTERVAL_DURATION = 50;
const SLOWDOWN_FACTOR = 1.1;

let intervalPlayer;
let intervalComputer;
let intervalDuration = INITIAL_INTERVAL_DURATION;

const playerDiceContainer = document.querySelector(".player-dice-container");
const computerDiceContainer = document.querySelector(".computer-dice-container");
const btnRollDice = document.querySelector(".btn-roll-dice");

let playerDiceValues = [1, 1]; // Default vals
let computerDiceValues = [1, 1]; // Default vals

let currentRound = 0;
bg_music.play();

function createDice(number) {
    const dice = document.createElement("img");
    dice.classList.add("dice");
    dice.src = `./img/dice_face_${number}.png`; // Die face format
    return dice;
}

function randomizeDice(diceContainer, numberOfDice, diceValues) {
    diceContainer.innerHTML = "";
    for (let i = 0; i < numberOfDice; i++) {
        const random = Math.floor((Math.random() * 6) + 1);
        const dice = createDice(random);
        diceContainer.appendChild(dice);
        diceValues[i] = random;
    }
    const click = new Audio('./sfx/click_sfx.mp3');
    click.play(); // Plays clicking audio for each randomization
}

function slowDown(container, numberOfDice, diceValues, interval, callback) {
    intervalDuration *= SLOWDOWN_FACTOR;

    if (intervalDuration < MAX_INTERVAL_DURATION) {
        randomizeDice(container, numberOfDice, diceValues);
        interval = setTimeout(() => slowDown(container, numberOfDice, diceValues, interval, callback), intervalDuration);
    } else if (container === computerDiceContainer) {
        console.log("Computer's animation complete");
        bing.play(); // Bing audio sfx when computer's dice finish randomizing
        callback(); // Execute the callback function after computer's animation completes
    }
}

randomizeDice(playerDiceContainer, NUMBER_OF_PLAYER_DICE, playerDiceValues);
randomizeDice(computerDiceContainer, NUMBER_OF_COMPUTER_DICE, computerDiceValues);

btnRollDice.addEventListener("click", () => {
    // Check if the game is over
    const isGameOver = currentRound === 3;

    // Add flip animation class to each individual dice
    playerDiceContainer.childNodes.forEach(dice => dice.classList.add("dice-flip-animation"));
    computerDiceContainer.childNodes.forEach(dice => dice.classList.add("dice-flip-animation"));

    // Wait for a short delay and then remove the flip animation class
    setTimeout(() => {
        playerDiceContainer.childNodes.forEach(dice => dice.classList.remove("dice-flip-animation"));
        computerDiceContainer.childNodes.forEach(dice => dice.classList.remove("dice-flip-animation"));

        // Continue with the rest of the dice roll logic
        intervalDuration = INITIAL_INTERVAL_DURATION; // Reset interval duration on each roll
        clearInterval(intervalPlayer);
        clearInterval(intervalComputer);

        currentRound += 1; // Increment the round counter

        // Execute player animation
        intervalPlayer = setTimeout(() => slowDown(playerDiceContainer, NUMBER_OF_PLAYER_DICE, playerDiceValues, intervalPlayer, () => {
            updateGameInfo(); // Update game info after player's animation completes
            if (currentRound < 3) {
                alert(`Round ${currentRound} Winner: ${determineWinner(playerDiceValues[0], computerDiceValues[0])}`);
            } else if (isGameOver) {
                alert(`Game Over!\nFinal Winner: ${determineWinner(playerDiceValues[0], computerDiceValues[0])}`);
                btnRollDice.disabled = true;
                btnRollDice.textContent = "Game Over"; // Change the button text to "Game Over"
            }
        }), intervalDuration);

        // Execute computer animation
        intervalComputer = setTimeout(() => slowDown(computerDiceContainer, NUMBER_OF_COMPUTER_DICE, computerDiceValues, intervalComputer, () => {
            updateGameInfo(); // Update game info after computer's animation completes
            if (currentRound < 3) {
                alert(`Round ${currentRound} Winner: ${determineWinner(playerDiceValues[0], computerDiceValues[0])}`);
            }
        }), intervalDuration);
    }, 1000); // Anim interval for the dice flipping
});


function updateGameInfo() {
    const computerRoundInfo = calculateRoundInfo(computerDiceValues);
    const playerRoundInfo = calculateRoundInfo(playerDiceValues);

    document.getElementById("computer-round").innerText = `CPU Rolled: ${computerRoundInfo[0]}, ${computerRoundInfo[1]}`;
    document.getElementById("player-round").innerText = `Player Rolled: ${playerRoundInfo[0]}, ${playerRoundInfo[1]}`;

    const computerTotal = parseInt(document.getElementById("computer-total").innerText.match(/\d+/)) + computerRoundInfo[2];
    const playerTotal = parseInt(document.getElementById("player-total").innerText.match(/\d+/)) + playerRoundInfo[2];

    document.getElementById("computer-total").innerText = `CPU Total: ${computerTotal}`;
    document.getElementById("player-total").innerText = `Player Total: ${playerTotal}`;

    if (currentRound === 3) {
        // Display final winner after 3 rounds
        const finalWinner = determineWinner(playerTotal, computerTotal);
        alert(`Game Over!\nFinal Winner: ${finalWinner}`);

        // Disable the "Roll Dice" button after the game is won
        btnRollDice.disabled = true;
    } else {
        // Enable the "Roll Dice" button if the game is not won yet
        btnRollDice.disabled = false;
    }
}

function calculateRoundInfo(diceValues) {
    const score1 = getIndividualScore(diceValues[0]);
    const score2 = getIndividualScore(diceValues[1]);
    const totalScore = score1 + score2;

    return [score1, score2, totalScore];
}

function getIndividualScore(dieValue) {
    if (dieValue === 1) {
        return 0; // If either die is 1, the score for the round is 0
    } else if (playerDiceValues[0] === playerDiceValues[1] && dieValue === playerDiceValues[0]) {
        return (dieValue + dieValue) * 2; // If it's a pair, score is double the sum
    } else {
        return dieValue; // For any other combination, score is the value of the die
    }
}

function determineWinner(playerTotal, computerTotal) {
    return playerTotal > computerTotal ? "Player" : playerTotal < computerTotal ? "Computer" : "It's a tie!";
}

function resetGame(){
    const isConfirmed = confirm("Are you sure you want to reset the game?");
            if (isConfirmed) {
                alert("Game reset. Reloading the page.");
                location.reload();
            }
}
