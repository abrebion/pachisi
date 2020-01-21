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

  // Get player name
  getPlayerName(player) {
    return player.name;
  }

  // Rotate through players
  rotatePlayer() {
    if (this.currentPlayer < this.players.length - 1) this.currentPlayer += 1;
    else this.currentPlayer = 0;
    // console.log("Next player is: " + this.currentPlayer);
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
    this.canStart = false;
    this.startAttempt = 3;
  }

  checkIfCanMove(dice) {
    return dice === 6 ? true : false;
  }

  move() {
    // const currentTop = getCellCoordinates(this.position).top;
    // const currentLeft = getCellCoordinates(this.position).left;
    const increment = this.rollDice();

    if (!this.checkIfCanMove(increment)) {
      console.log("You should get a 6 to move a token on the board");
      return;
    }

    const currentPosition = this.position;
    let nextPosition = 0;

    if (this.isSafe === false) {
      nextPosition = this.position + increment <= 39 ? this.position + increment : this.position + increment - 40;
    }
    if (this.position < this.start && this.position + increment >= this.start) {
      this.isSafe = true;
      this.isSafePosition = this.position + increment - (this.start - 1);
      if (this.isSafePosition > 4) {
        this.isSaved = true;
        console.log(this, "Token is saved");
        return;
      }
      nextPosition = this.isSafePosition;
    }
    if (!this.isSaved) this.position = nextPosition;
    if (this.isSafe) {
      this.position = this.isSafePosition;
    }

    const newTop = getCellCoordinates(nextPosition, this.color, this.isSafe).top;
    const newLeft = getCellCoordinates(nextPosition, this.color, this.isSafe).left;
    console.log(`Player "token-${this.color}-${this.id}" is moving from position ${currentPosition} to position ${nextPosition}`);
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
function getCellCoordinates(cell, color = null, safe = false) {
  if (safe) {
    console.log(`Targeted cell: .cell.${color}-safe-${cell}`);
    return document.querySelector(`.cell.${color}-safe-${cell}`).getBoundingClientRect();
  }
  return document.getElementById("cell-" + cell).getBoundingClientRect();
}
