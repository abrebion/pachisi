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
    console.log(this);
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
      const playerName = document.createElement("span");
      playerName.textContent = player.name;
      document.querySelector("#player-" + player.color + " .player-name").appendChild(playerName);
      const playerScoreLabel = document.createElement("span");
      playerScoreLabel.textContent = ", score: ";
      document.querySelector("#player-" + player.color + " .player-name").appendChild(playerScoreLabel);
      const playerScoreValue = document.createElement("span");
      playerScoreValue.className = "score";
      playerScoreValue.textContent = "0";
      document.querySelector("#player-" + player.color + " .player-name").appendChild(playerScoreValue);
      document.getElementById("roll-dice-btn").textContent = `${this.getPlayerName(this.players[this.currentPlayer])} rolls the dice`;
      player.tokens = tokens;
      return player;
    });
  }

  // Get player name
  getPlayerName(player) {
    return player.name;
  }

  // Increment and render score
  incrementScore(player) {
    player.score += 1;
    document.querySelector("#player-" + player.color + " .player-name .score").textContent = `${player.score}`;
    document.querySelector("#player-" + player.color + " .player-name .score").classList.add("animated");
  }

  // Rotate through players
  rotatePlayer() {
    if (this.currentPlayer < this.players.length - 1) this.currentPlayer += 1;
    else this.currentPlayer = 0;
    // console.log("Next player is: " + this.currentPlayer);
    document.getElementById("roll-dice-btn").textContent = `${this.getPlayerName(this.players[this.currentPlayer])} rolls the dice`;
  }

  getActiveTokens() {
    return this.players
      .reduce((acc, element) => {
        const token = element.tokens.filter(el => el.isPlaying);
        acc.push(token);
        return acc;
      }, [])
      .flat();
  }

  selectToken(player) {
    // this.currentToken = player.tokens[0];
    this.currentToken = player.tokens.filter(element => !element.isSaved)[0];
    return this.currentToken;
  }

  // Main function to rotate players
  play(token) {
    return evt => {
      token.move();
      if (token.isSaved) {
        this.incrementScore(this.players[this.currentPlayer]);
      }
      if (token.initialPosition) {
        console.log("Player plays again because he's just entered the board");
        token.initialPosition = false;
      } else if (token.canPlayAgain) {
        console.log("Player plays again because he got a 6.");
        token.canPlayAgain = false;
      } else {
        this.rotatePlayer();
      }
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
    this.safePosition = null;
    this.isSaved = false;
    this.canMove = false;
    this.startAttempt = 3;
    this.initialPosition = false;
    this.canPlayAgain = false;
  }

  move() {
    // console.log("canMove: " + this.canMove + ", startAttempts: " + this.startAttempt, "position: " + this.position);

    const increment = this.rollDice();

    // console.log(`You get a ${increment}.`);
    if (!this.canMove) {
      if (increment !== 6 && this.startAttempt > 0) {
        this.startAttempt -= 1;
        // document.getElementById("dice-value").textContent = `You got a ${increment}. Sorry, but you should get a 6 to move on!`;
        console.log(`You got a ${increment}. You should get a 6 to move a token on the board. You have ${this.startAttempt} atttempt(s) left.`);
        // console.log(this);
        this.move();
        return;
      }
      if (increment === 6) {
        // document.getElementById("dice-value").textContent = `Great! You got a ${increment}. Enter the game and play again!`;
        console.log("You got a 6. Well done!");
        this.canMove = true;
        this.isPlaying = true;
        this.initialPosition = true;
      }
    }

    if (!this.canMove) {
      this.renderUserMessage(increment);
      this.startAttempt = 3;
      return;
    }

    console.log(this);
    if (increment === 6 && !this.initialPosition) {
      // document.getElementById("dice-value").textContent = `You got a ${increment}. You can play again!`;
      this.canPlayAgain = true;
    } else {
      // document.getElementById("dice-value").textContent = `You got a ${increment}.`;
    }
    const currentPosition = this.position;
    let nextPosition = 0;

    if (this.initialPosition === true) {
      nextPosition = this.start;
    } else {
      // Token is entering the safe zone
      const translatedStart = this.start || 40;
      // console.log("Translate", translatedStart);

      if (this.position < translatedStart && this.position + increment >= translatedStart) {
        this.isSafe = true;
        this.safePosition = this.position + increment - (translatedStart - 1);
        this.position = null;
        if (this.safePosition > 4) {
          this.isSaved = true;
          alert(`Token ${this.color} is saved. Old position: ${this.position}, increment:  ${increment}, safePosition: ${this.safePosition}`);
          game.incrementScore();
          return;
        }
        nextPosition = this.safePosition;
      }

      // Token is already in the safe zone but has not reach the end
      else if (this.safePosition) {
        nextPosition = this.safePosition + increment;
        if (nextPosition > 4) {
          this.isSaved = true;
          alert(`Token ${this.color} is saved`);
          document.getElementById("token-" + this.color + "-" + this.id).remove();
          // game.incrementScore();
          return;
        }
      } else {
        nextPosition = this.position + increment <= 39 ? this.position + increment : this.position + increment - 40;
        this.position = nextPosition;
      }
    }

    // Condition to ease debugging
    // if (this.color === "blue") {
    //   nextPosition = this.start;
    //   this.position = nextPosition;
    // }

    // if (this.color === "green") nextPosition = this.start;

    const newTop = getCellCoordinates(nextPosition, this.color, this.isSafe).top;
    const newLeft = getCellCoordinates(nextPosition, this.color, this.isSafe).left;
    console.log(`Player "token-${this.color}-${this.id}" is moving by ${increment}, from position ${currentPosition} to position ${nextPosition}`);
    document.getElementById("token-" + this.color + "-" + this.id).style.top = `${newTop + 10}px`;
    document.getElementById("token-" + this.color + "-" + this.id).style.left = `${newLeft + 10}px`;
    this.hitCompetitor(nextPosition, this.callbackHit);
    this.renderUserMessage(increment);
  }

  renderUserMessage(increment) {
    const userMessageEl = document.getElementById("dice-value");
    let userMessage;
    if (increment === 6 && this.initialPosition) userMessage = `Great! You got a ${increment} to enter the game.<br>You can play again.`;
    else if (!this.canMove) userMessage = `Ouch! You should get a 6 to enter the game.<br>Try the next round.`;
    else if (increment === 6) userMessage = `Lucky you! You got a ${increment}.<br>You can roll the dice one more time.`;
    else userMessage = `You got a ${increment}.`;
    userMessageEl.innerHTML = userMessage;
  }

  hitCompetitor(nextPosition, callback) {
    const activeTokens = game.getActiveTokens();
    // console.log(activeTokens);
    activeTokens.forEach(token => {
      if (token.color !== this.color && token.position === nextPosition) {
        this.init(token);
        callback();
      }
    });
    return activeTokens;
  }

  callbackHit() {
    // alert("You hit someone!");
    const hitModal = document.createElement("div");
    hitModal.className = "hit-modal";
    document.getElementById("board").appendChild(hitModal);
    setTimeout(() => {
      hitModal.remove();
    }, 1000);
  }

  init(token) {
    token.isPlaying = false;
    token.isSafe = false;
    token.safePosition = null;
    token.isSaved = false;
    token.position = token.start;
    token.canMove = false;
    token.startAttempt = 3;
    token.initialPosition = false;
    token.canPlayAgain = false;
    this.replaceTokenInYard(token);
    return token;
  }

  replaceTokenInYard(token) {
    const tokenEl = document.getElementById(`token-${token.color}-${token.id}`);
    const yardTop = getCellCoordinates("yard-" + token.color + "-" + token.id).top;
    const yardLeft = getCellCoordinates("yard-" + token.color + "-" + token.id).left;
    tokenEl.style.top = `${yardTop + 12.5}px`;
    tokenEl.style.left = `${yardLeft + 12.5}px`;
  }

  rollDice() {
    const diceValue = Math.floor(Math.random() * 6 + 1);
    // document.getElementById("dice-value").textContent = `You got a ${diceValue}!`;
    return diceValue;
  }
}

// Get token current position
function getCellCoordinates(cell, color = null, safe = false) {
  if (safe) {
    // console.log(`Targeted cell: .cell.${color}-safe-${cell}`);
    return document.querySelector(`.cell.${color}-safe-${cell}`).getBoundingClientRect();
  }
  return document.getElementById("cell-" + cell).getBoundingClientRect();
}
