// Variables globales
let deckId, playerScore, dealerScore, playerCards, dealerCards;
playerScore = dealerScore = 0;
playerCards = [];
dealerCards = [];
const playerCardsDiv = document.getElementById("player-cards-container");
const dealerCardsDiv = document.getElementById("dealer-cards-container");
let balance = 3000;
let bet = 0;

// Créer un nouveau deck mélangé
async function shuffleCards() {
  try {
    const response = await fetch(
      "https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=6"
    );
    const data = await response.json();
    deckId = data.deck_id;

    resetUI();
    drawCards();
  } catch (error) {
    console.error(error);
  }
}

// Distribution des cartes
async function drawCards() {
  try {
    const response = await fetch(
      `https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=4`
    );
    const data = await response.json();

    displayCards(data, 0, 2, true);
    displayCards(data, 2, 4, false);
  } catch (error) {
    console.error(error);
  }
}

// Piocher une carte
async function hit() {
  try {
    const response = await fetch(
      `https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=1`
    );
    const data = await response.json();

    const cardValue = getValue(data.cards[0].value, true);
    playerScore += cardValue;
    playerCards.push({ value: data.cards[0].value, score: cardValue });

    updateScore("player-score", playerScore, "Me");
    displayCard(data, 0, playerCardsDiv);

    checkBust(playerCards, playerScore, "player-score", "Me", determineWinner);
  } catch (error) {
    console.error(error);
  }
}

// Dealer hit
async function dealerHit() {
  try {
    const response = await fetch(
      `https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=1`
    );
    const data = await response.json();

    const cardValue = getValue(data.cards[0].value, false);
    dealerScore += cardValue;
    dealerCards.push({ value: data.cards[0].value, score: cardValue });

    updateScore("dealer-score", dealerScore, "Dealer");
    displayCard(data, 0, dealerCardsDiv);

    if (dealerScore < 17) {
      dealerHit();
    } else {
      setTimeout(determineWinner, 1000);
    }
  } catch (error) {
    console.error(error);
  }
}

function stand() {
  disableButtons();
  dealerScore < 17 ? dealerHit() : determineWinner();
}

function resetGame() {
  resetScores();
  resetCards();
  enableButtons();

  bet = 0;
  document.getElementById("bet").value = 0;
  document.getElementById("deal-button").innerText = "Deal";
  document.getElementById("deal-button").setAttribute("onclick", "placeBet()");
}

function placeBet() {
  bet = parseInt(document.getElementById("bet").value);

  if (bet > 0 && bet <= balance) {
    updateBalance(-bet);
    disableBetInput();
    shuffleCards();
  } else {
    bet > balance
      ? alert("You cannot bet more than your current balance.")
      : alert("Invalid bet. Please enter a valid amount.");
  }
}

function determineWinner() {
  disableButtons();
  const [payout, message] = calculatePayout();
  updateBalance(payout);
  enableBetInput();
  alert(message);
}

// Fonctions utilitaires
function getValue(cardValue, isPlayerCard) {
  if (cardValue === "ACE") {
    let score = isPlayerCard ? playerScore : dealerScore;
    return score + 11 > 21 ? 1 : 11;
  }
  if (["KING", "QUEEN", "JACK"].includes(cardValue)) return 10;
  return parseInt(cardValue);
}

function displayCards(data, start, end, isPlayer) {
  for (let i = start; i < end; i++) {
    const cardValue = getValue(data.cards[i].value, isPlayer);
    const score = isPlayer
      ? (playerScore += cardValue)
      : (dealerScore += cardValue);
    const cards = isPlayer ? playerCards : dealerCards;
    cards.push({ value: data.cards[i].value, score: cardValue });

    const scoreElement = isPlayer ? "player-score" : "dealer-score";
    const scorePrefix = isPlayer ? "Me" : "Dealer";
    updateScore(scoreElement, score, scorePrefix);

    const cardsDiv = isPlayer ? playerCardsDiv : dealerCardsDiv;
    displayCard(data, i, cardsDiv);
  }
}

function displayCard(data, index, cardsDiv) {
  const card = document.createElement("img");
  card.src = data.cards[index].images.png;
  cardsDiv.appendChild(card);
}

function checkBust(cards, score, scoreElement, scorePrefix, callback) {
  if (score > 21) {
    for (let card of cards) {
      if (card.value === "ACE" && card.score === 11) {
        score -= 10;
        card.score = 1;
        break;
      }
    }
    updateScore(scoreElement, score, scorePrefix);
    if (score > 21) setTimeout(callback, 500);
  }
}

function updateScore(elementId, score, prefix) {
  document.getElementById(elementId).innerText = `${prefix}: ${score}`;
}

function resetScores() {
  playerScore = dealerScore = 0;
  updateScore("player-score", playerScore, "Me");
  updateScore("dealer-score", dealerScore, "Dealer");
}

function resetCards() {
  playerCards = [];
  dealerCards = [];
  playerCardsDiv.innerHTML = "";
  dealerCardsDiv.innerHTML = "";
}

function disableButtons() {
  document.getElementById("hit-button").disabled = true;
  document.getElementById("stand-button").disabled = true;
}

function enableButtons() {
  document.getElementById("hit-button").disabled = false;
  document.getElementById("stand-button").disabled = false;
}

function updateBalance(amount) {
  balance += amount;
  document.getElementById("balance").innerText = "Balance: " + balance;
}

function disableBetInput() {
  document.getElementById("bet").disabled = true;
}

function enableBetInput() {
  document.getElementById("bet").disabled = false;
}

function calculatePayout() {
  let payout = 0;
  let message = "";

  if (playerScore > 21) {
    message = "You Bust, Dealer Win !!";
  } else if (dealerScore > 21) {
    payout = bet * 2;
    message = "Dealer Bust, Player Win !!";
  } else if (playerScore === dealerScore) {
    payout = bet;
    message = "It's a Tie!";
  } else if (playerScore > dealerScore) {
    if (playerScore === 21 && playerCards.length === 2) {
      payout = bet * 2.5;
      message = "Blackjack! Player Wins!";
    } else {
      payout = bet * 2;
      message = "Player Wins!";
    }
  } else {
    message = "Dealer Wins!";
  }

  return { payout, message };
}

// Fonction pour initialiser le jeu
function init() {
  resetGame();
  document.getElementById("balance").innerText = "Balance: " + balance;
  document.getElementById("bet").value = 0;
}

init();
