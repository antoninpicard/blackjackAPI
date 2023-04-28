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
      document.getElementById("player-cards").innerHTML = "";
      document.getElementById("dealer-cards").innerHTML = "";
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
      const playerCardsElement = document.getElementById("player-cards");
      const dealerCardsElement = document.getElementById("dealer-cards");

      // Afficher les cartes du joueur
      for (let i = 0; i < 2; i++) {
        playerScore += getValue(data.cards[i].value);
        document.getElementById("player-score").innerText =
          "Me: " + playerScore;

        const img = document.createElement("img");
        img.src = data.cards[i].image;
        playerCardsElement.appendChild(img);
      }

      // Afficher la première carte du dealer
      dealerScore += getValue(data.cards[2].value);
      document.getElementById("dealer-score").innerText =
        "Dealer: " + dealerScore;

      const img1 = document.createElement("img");
      img1.src = data.cards[2].image;
      dealerCardsElement.appendChild(img1);

      // Ajouter la seconde carte du dealer, mais la laisser retournée
      dealerScore += getValue(data.cards[3].value);
      const img2 = document.createElement("img");
      img2.src = "retourne.png"; // Utiliser l'image "retourne.png" à la place de la vraie carte
      img2.setAttribute("data-real-image", data.cards[3].image); // Stocker la vraie image de la carte pour la révéler plus tard
      dealerCardsElement.appendChild(img2);

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

      // Ajouter l'image de la carte tirée
      const playerCardsElement = document.getElementById("player-cards");
      const img = document.createElement("img");
      img.src = data.cards[0].image;
      playerCardsElement.appendChild(img);

      if (playerScore > 21) {
        Bust(isPlayer);
      }
    })
    .catch((error) => console.error(error));
}

// Permet de mettre à jour le score du dealer
function DealerScore(numbers) {
  const dealerScoreElement = document.getElementById("dealer-score");
  dealerScoreElement.innerText = "Dealer: " + dealerScore;
}

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

  // Révéler la seconde carte du dealer
  const dealerCardsElement = document.getElementById("dealer-cards");
  const hiddenCard = dealerCardsElement.getElementsByTagName("img")[1];
  hiddenCard.src = hiddenCard.dataset.realImage;

  if (dealerScore < 17) {
    DealerHit();
  } else {
    setTimeout(checkResult, 500); // Ajout d'un délai de 0.5 seconde avant d'afficher le résultat
  }
}


function DealerHit() {
  fetch("https://deckofcardsapi.com/api/deck/" + deckId + "/draw/?count=1")
    .then(response => response.json())
    .then(data => {
      const cardValue = getValue(data.cards[0].value);
      dealerScore += cardValue;
      document.getElementById("dealer-score").innerText = "Dealer: " + dealerScore;

      // Ajouter l'image de la carte tirée
      const dealerCardsElement = document.getElementById("dealer-cards");
      const img = document.createElement("img");
      img.src = data.cards[0].image;
      dealerCardsElement.appendChild(img);

      if (dealerScore < 17) {
        DealerHit();
      } else if (dealerScore > 21) {
        setTimeout(() => Bust((isPlayer = false)), 1000); // Ajout d'un délai de 1 seconde avant de vérifier le résultat
      } else {
        setTimeout(checkResult, 500); // Ajout d'un délai de 0.5 seconde avant d'afficher le résultat
      }
    })
    .catch(error => console.error(error));
}

function checkResult() {
  if (playerScore > 21) {
    announceResult("You bust! Dealer wins!");
  } else if (dealerScore > 21) {
    announceResult("Dealer busts! You win!");
  } else if (playerScore > dealerScore) {
    announceResult("You win!");
  } else if (playerScore < dealerScore) {
    announceResult("Dealer wins!");
  } else {
    announceResult("It's a tie!");
  }
}


function Bust(isPlayer) {
  document.getElementById("hit-button").disabled = true;
  document.getElementById("stand-button").disabled = true;

  // Révéler la seconde carte du dealer si le joueur fait un "bust"
  if (isPlayer) {
    const dealerCardsElement = document.getElementById("dealer-cards");
    const hiddenCard = dealerCardsElement.getElementsByTagName("img")[1];
    hiddenCard.src = hiddenCard.dataset.realImage;
  }

  checkResult();
}

function announceResult(message) {
  console.log(message);
  alert(message);
}