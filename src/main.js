const defaultPlayerSetting = [
  { id: 1, color: "blue", active: true },
  { id: 2, color: "green", active: true },
  { id: 3, color: "red", active: false },
  { id: 4, color: "yellow", active: false }
];

let game;

const body = document.body;
const playerSettings = document.getElementById("player-settings");
const startBtn = document.querySelector("button.btn.start-game");
document.querySelector("button[data-modal=rules]").onclick = showRules;
startBtn.onclick = startGame;
document.querySelector(".add-player-btn").onclick = addPlayer;
const diceBtn = document.getElementById("roll-dice-btn");

// Show/hide rules modal
function showRules(evt) {
  const urlToLoad = evt.target.getAttribute("data-modal") + ".html";
  axios
    .get(urlToLoad)
    .then(function(response) {
      const backgroundOverlay = document.createElement("div");
      body.appendChild(backgroundOverlay);
      const modalWindow = document.createElement("div");
      body.appendChild(modalWindow);
      modalWindow.className = "modal-is-visible";
      backgroundOverlay.className = "background-overlay";
      modalWindow.innerHTML = response.data;
      const closeBtnEl = document.createElement("i");
      modalWindow.appendChild(closeBtnEl);
      closeBtnEl.className = "modal-close-btn fas fa-window-close";
      closeBtnEl.onclick = function(evt) {
        evt.target.closest(".modal-is-visible").previousElementSibling.remove();
        evt.target.closest(".modal-is-visible").remove();
      };
    })
    .catch(function(error) {
      console.log(error);
    });
}

// Add player
function addPlayer(evt) {
  const playerNumber = document.querySelectorAll("#player-settings fieldset").length;
  const newPlayerID = playerNumber + 1;

  if (playerNumber >= 4) return;

  const playerInputHTML = `
            <label for="">Player ${newPlayerID}:</label>
            <input type="text" placeholder="Enter your name" >
            <select name="color" id="player-${newPlayerID}">
              <option value="blue">Blue</option>
              <option value="green">Green</option>
              <option value="red">Red</option>
              <option value="yellow">Yellow</option>
            </select><i class="fas fa-plus-square add-player-btn"></i><i class="fas fa-minus-square remove-player-btn"></i>
    `;

  const newPlayerInput = document.createElement("fieldset");
  newPlayerInput.innerHTML = playerInputHTML;
  playerSettings.appendChild(newPlayerInput);
  newPlayerInput.querySelector(`#player-${newPlayerID}`).value = getPlayerSettings(newPlayerID).color;
  newPlayerInput.querySelector(".add-player-btn").onclick = addPlayer;
  newPlayerInput.querySelector(".remove-player-btn").onclick = removePlayer;
}

// Remove player
function removePlayer(evt) {
  evt.target.closest("fieldset").remove();
}

// Get player setting
function getPlayerSettings(player) {
  return defaultPlayerSetting.reduce((acc, el) => {
    if (el.id === player) acc = el;
    return acc;
  }, {});
}

function resetPlayerSettings() {
  game.resetBoard();
  playerSettings.querySelectorAll("input, select").forEach(element => {
    element.value = "";
    element.disabled = false;
  });
  playerSettings.querySelectorAll("fieldset").forEach((element, index) => {
    if (index > 1) element.remove();
  });
  playerSettings.style.opacity = 1;
  startBtn.textContent = "Start";
  startBtn.removeEventListener("click", resetPlayerSettings);
}

function disablePlayerSetings() {
  playerSettings.style.opacity = 0.4;
  playerSettings.querySelectorAll("input, select").forEach(element => {
    element.disabled = true;
  });
  playerSettings.querySelectorAll(".add-player-btn").forEach(element => {
    element.removeEventListener("click", addPlayer, false);
    element.style.cursor = "initial";
  });
  playerSettings.querySelectorAll(".remove-player-btn").forEach(element => {
    element.removeEventListener("click", removePlayer, true);
    element.style.cursor = "initial";
  });
}

function getPlayers() {
  return [...document.querySelectorAll("#player-settings fieldset")].map((e, index) => {
    return {
      id: index + 1,
      name: e.querySelector("input[type=text]").value,
      color: e.querySelector("select").value
    };
  });
}

// Start game
function startGame(evt) {
  game = new Game(getPlayers());
  disablePlayerSetings();
  startBtn.textContent = "Reset";
  startBtn.removeEventListener("click", game.play());
  startBtn.addEventListener("click", resetPlayerSettings);
  document.getElementById("dice").classList.toggle("animated");
  diceBtn.classList.toggle("inactive");
  diceBtn.onclick = game.play(game.selectToken(game.players[game.currentPlayer]));
  console.log("Next player: ", game.players[game.currentPlayer]);
}

// // Parametric CSS animation
// const mainStylesheet = [...document.styleSheets].filter(e => e.title === "main")[0];
// console.log(mainStylesheet);
