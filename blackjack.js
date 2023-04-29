// Déclarer deck_id comme variable globale
let deckId;
let playerScore = 0;
let dealerScore = 0;
let isPlayer = true;

// Créer un nouveau deck mélangé
function ShuffleCards() {
  fetch("https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=6")
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      deckId = data.deck_id;
      playerScore = 0;
      dealerScore = 0;
      document.getElementById("hit-button").disabled = false;
      document.getElementById("stand-button").disabled = false;
      document.getElementById("deal-button").innerText = "Reset";
      document
        .getElementById("deal-button")
        .setAttribute("onclick", "ResetGame()");
      document.getElementById("player-score").innerText = "Score: 0";
      document.getElementById("dealer-score").innerText = "Score: 0";
      DrawCards();
    })
    .catch((error) => console.error(error));
}

// Distribution des cartes
function DrawCards() {
  fetch("https://deckofcardsapi.com/api/deck/" + deckId + "/draw/?count=4")
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      // Afficher les cartes du joueur
      for (let i = 0; i < 2; i++) {
        playerScore += getValue(data.cards[i].value);
        document.getElementById("player-score").innerText =
          "Me: " + playerScore;
      }
      // Afficher les cartes du dealer
      for (let i = 2; i < 4; i++) {
        dealerScore += getValue(data.cards[i].value);
        document.getElementById("dealer-score").innerText =
          "Dealer: " + dealerScore;
      }
    })
    .catch((error) => console.error(error));
}

// Piocher une carte
function Hit() {
  fetch("https://deckofcardsapi.com/api/deck/" + deckId + "/draw/?count=1")
    .then((response) => response.json())
    .then((data) => {
      const cardValue = getValue(data.cards[0].value);
      playerScore += cardValue;
      document.getElementById("player-score").innerText = "Me: " + playerScore;
      if (playerScore > 21) {
        determineWinner();
      }
    })
    .catch((error) => console.error(error));
}

// Permet de mettre à jour le score du dealer
function DealerScore(numbers) {
  const dealerScoreElement = document.getElementById("dealer-score");
  dealerScoreElement.innerText = "Dealer: " + dealerScore;
}

// Fonction pour réinitialiser le jeu
function ResetGame() {
  ShuffleCards();
}

// Fonction pour retourner la valeur numérique d'une carte
function getValue(cardValue) {
  if (cardValue === "ACE") {
    return 11;
  } else if (
    cardValue === "KING" ||
    cardValue === "QUEEN" ||
    cardValue === "JACK"
  ) {
    return 10;
  } else {
    return parseInt(cardValue);
  }
}

function Stand() {
  document.getElementById("hit-button").disabled = true;
  document.getElementById("stand-button").disabled = true;
  if (dealerScore < 17) {
    DealerHit();
  } else {
    determineWinner();
  }
}

function DealerHit() {
  fetch("https://deckofcardsapi.com/api/deck/" + deckId + "/draw/?count=1")
    .then((response) => response.json())
    .then((data) => {
      const cardValue = getValue(data.cards[0].value);
      dealerScore += cardValue;
      document.getElementById("dealer-score").innerText =
        "Dealer: " + dealerScore;
      if (dealerScore < 17) {
        DealerHit();
      } else {
        setTimeout(() => {//le setTimeout permet de mettre à jour le score avant les alert de résulat
          determineWinner();
        }, 500);
      }
    })
    .catch((error) => console.error(error));
}



function determineWinner() {
  document.getElementById("hit-button").disabled = true;
  document.getElementById("stand-button").disabled = true;

  if (playerScore > 21) {
    alert("You Bust, Dealer Win !!");
  } else if (dealerScore > 21) {
    alert("Dealer Bust, Player Win !!");
  } else if (playerScore === dealerScore) {
    alert("It's a Tie!");
  } else if (playerScore > dealerScore) {
    alert("Player Wins!");
  } else {
    alert("Dealer Wins!");
  }
}
