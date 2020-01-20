class Token {
  constructor(color, id, start) {
    this.id = id;
    this.color = color;
    this.start = start;
    this.position = 0;
    this.isPlaying = false;
    this.isSafe = false;
    this.isSafePosition = null;
    this.isSaved = false;
  }
  move() {
    const currentTop = getCellCoordinates(this.position).top;
    const currentLeft = getCellCoordinates(this.position).left;
    const increment = this.rollDice();
    const newTokenIndex = this.position + increment;
    const newTop = getCellCoordinates(newTokenIndex).top;
    const newLeft = getCellCoordinates(newTokenIndex).left;
    console.log(`Moving from position ${this.position} @{${currentTop},${currentLeft}} to position ${newTokenIndex} @{${newTop},${newLeft}}`);
    document.getElementById("token-green-1").style.top = `${newTop + 10}px`;
    document.getElementById("token-green-1").style.left = `${newLeft + 10}px`;
    this.position += increment;
  }
  rollDice() {
    const diceValue = Math.floor(Math.random() * 6 + 1);
    document.getElementById("dice-value").textContent = `You got a ${diceValue}!`;
    return diceValue;
  }
}

class Game {
  constructor(players) {
    this.players = players;
    this.tokens = this.initializePlayer(players);
    this.currentPlayer = 1;
    this.currentToken = this.tokens[0];
  }

  // Set the starting position based on color
  getStartingPosition(color) {
    if (color === "green") return 0;
    if (color === "yellow") return 10;
    if (color === "red") return 20;
    if (color === "blue") return 30;
  }

  // Rotate through players
  rotatePlayer() {
    this.currentPlayer += this.currentPlayer < this.players.length - 1 ? 1 : 0;
  }

  initializePlayer(players) {
    // Initialize token positions on board
    const tokens = [];
    players.forEach(player => {
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
    });
    return tokens;
  }

  // Player play
  play(player, token) {
    return evt => {
      debugger;
      token.move();
      this.rotatePlayer();
      console.log("Next player to play:" + this.currentPlayer);
    };
  }
}

// Get token current position
function getCellCoordinates(cell) {
  return document.getElementById("cell-" + cell).getBoundingClientRect();
}
