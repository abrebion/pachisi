class Game {
  constructor(players) {
    this.players = players;
    this.currentPlayer = 0;
    this.currentToken = 0;
    this.initPlayers();
  }

  // Set the starting position based on color
  getStartingPosition(color) {
    if (color === "green") return 0;
    if (color === "yellow") return 10;
    if (color === "red") return 20;
    if (color === "blue") return 30;
  }

  // Initialize token positions on board
  initPlayers() {
    // console.log(this);
    // console.log("Next player to play:" + this.currentPlayer);
    return this.players.map(player => {
      const tokens = [];
      for (let i = 1; i <= 4; i++) {
        tokens.push(new Token(player.color, i, this.getStartingPosition(player.color)));
        const newTokenEl = document.createElement("div");
        newTokenEl.id = `token-${player.color}-${i}`;
        newTokenEl.className = `token ${player.color}`;
        document.body.appendChild(newTokenEl);
        const yardTop = getCellCoordinates("yard-" + player.color + "-" + i).top;
        const yardLeft = getCellCoordinates("yard-" + player.color + "-" + i).left;
        newTokenEl.style.top = `${yardTop + 12.5}px`;
        newTokenEl.style.left = `${yardLeft + 12.5}px`;
      }
      // Render player's names
      document.querySelector("#player-" + player.color + " .player-name").textContent = player.name;
      document.getElementById("roll-dice-btn").textContent = `${this.getPlayerName(this.players[this.currentPlayer])} rolls the dice`;
      player.tokens = tokens;
      return player;
    });
  }

  resetBoard() {
    console.log("Reset");
    document.querySelectorAll(".token").forEach(el => el.remove());
    document.querySelectorAll(".player-name").forEach(el => el.remove());
  }

  // Get player name
  getPlayerName(player) {
    return player.name;
  }

  // Rotate through players
  rotatePlayer() {
    if (this.currentPlayer < this.players.length - 1) this.currentPlayer += 1;
    else this.currentPlayer = 0;
    console.log("Next player is: " + this.currentPlayer);
    document.getElementById("roll-dice-btn").textContent = `${this.getPlayerName(this.players[this.currentPlayer])} rolls the dice`;
  }

  selectToken(player) {
    this.currentToken = player.tokens[0];
    return this.currentToken;
  }

  // Player play
  play(token) {
    return evt => {
      token.move();
      this.rotatePlayer();
      document.getElementById("roll-dice-btn").onclick = this.play(this.selectToken(this.players[this.currentPlayer]));
    };
  }
}

class Token {
  constructor(color, id, start) {
    this.id = id;
    this.color = color;
    this.start = start;
    this.position = this.start;
    this.isPlaying = false;
    this.isSafe = false;
    this.isSafePosition = null;
    this.isSaved = false;
  }
  move() {
    // const currentTop = getCellCoordinates(this.position).top;
    // const currentLeft = getCellCoordinates(this.position).left;
    const increment = this.rollDice();
    const currentPosition = this.position;
    this.position = this.position + increment <= 39 ? this.position + increment : this.position + increment - 40;

    const newTop = getCellCoordinates(this.position).top;
    const newLeft = getCellCoordinates(this.position).left;
    console.log(`Player "token-${this.color}-${this.id}" is moving from position ${currentPosition} to position ${this.position}`);
    document.getElementById("token-" + this.color + "-" + this.id).style.top = `${newTop + 10}px`;
    document.getElementById("token-" + this.color + "-" + this.id).style.left = `${newLeft + 10}px`;
  }
  rollDice() {
    const diceValue = Math.floor(Math.random() * 6 + 1);
    document.getElementById("dice-value").textContent = `You got a ${diceValue}!`;
    return diceValue;
  }
}

// Get token current position
function getCellCoordinates(cell) {
  return document.getElementById("cell-" + cell).getBoundingClientRect();
}
