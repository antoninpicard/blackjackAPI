// Déclarer deck_id comme variable globale
let deckId;
let playerScore = 0;
let dealerScore = 0;
let isPlayer = true;
let cards;
let playerCards = [];
let dealerCards = [];
const playerCardsDiv = document.getElementById("player-cards-container");
const dealerCardsDiv = document.getElementById("dealer-cards-container");
let balance = 3000;
let bet = 0;


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
        .setAttribute("onclick", "resetGame()"); // Remplacez location.reload() par resetGame()
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
        const cardValue = getValue(data.cards[i].value, true);
        playerScore += cardValue;
        playerCards.push({ value: data.cards[i].value, score: cardValue }); // Ajoutez cette ligne pour stocker les cartes du joueur
        document.getElementById("player-score").innerText = "Me: " + playerScore;
      }
      
      
      for (let i = 2; i < 4; i++) {
        const cardValue = getValue(data.cards[i].value, false); // Passer 'false' pour indiquer que c'est pour le dealer
        dealerScore += cardValue;
        dealerCards.push({ value: data.cards[i].value, score: cardValue }); // Ajouter cette ligne pour stocker les cartes du dealer
        document.getElementById("dealer-score").innerText =
          "Dealer: " + dealerScore;
      }
      
      // Affichage des cartes du dealer
      cards = document.createElement("img");
      cards.src = data.cards[2].images.png;
      dealerCardsDiv.appendChild(cards);
      
      cards = document.createElement("img");
      cards.src = data.cards[3].images.png;
      dealerCardsDiv.appendChild(cards);
      


      //affichage cards player
      cards = document.createElement("img");
      cards.src = data.cards[0].images.png;
      playerCardsDiv.appendChild(cards);

      cards = document.createElement("img");
      cards.src = data.cards[1].images.png;
      playerCardsDiv.appendChild(cards);



      
    })
    .catch((error) => console.error(error));
}

// Piocher une carte
function Hit() {
  fetch("https://deckofcardsapi.com/api/deck/" + deckId + "/draw/?count=1")
    .then((response) => response.json())
    .then((data) => {
      const cardValue = getValue(data.cards[0].value, true);
      playerScore += cardValue;
      playerCards.push({ value: data.cards[0].value, score: cardValue });
      

      //affichage carte quand on hit
      cards = document.createElement("img");
      cards.src = data.cards[0].images.png;
      playerCardsDiv.appendChild(cards);

      if (playerScore > 21) {
        for (let i = 0; i < playerCards.length; i++) {
          if (playerCards[i].value === "ACE" && playerCards[i].score === 11) {
            playerScore -= 10; // Changez la valeur de l'As de 11 à 1
            playerCards[i].score = 1;
            break;
          }
        }
      }
    
      document.getElementById("player-score").innerText = "Me: " + playerScore;

      if (playerScore > 21) {
        setTimeout(determineWinner, 500);
      }
    })
    .catch((error) => console.error(error));
}

// Permet de mettre à jour le score du dealer
function DealerScore(numbers) {
  const dealerScoreElement = document.getElementById("dealer-score");
  dealerScoreElement.innerText = "Dealer: " + dealerScore;
}




// Fonction pour retourner la valeur numérique d'une carte
function getValue(cardValue, isPlayerCard) {
  if (cardValue === "ACE") {
    let score = isPlayerCard ? playerScore : dealerScore;
    if (score + 11 > 21) {
      return 1;
    } else {
      return 11;
    }
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
      const cardValue = getValue(data.cards[0].value, false); // Passer 'false' pour indiquer que c'est pour le dealer
      dealerScore += cardValue;
      dealerCards.push({ value: data.cards[0].value, score: cardValue }); // Ajouter cette ligne pour stocker les cartes du dealer
      // Affichage de la carte supplémentaire du dealer
      cards = document.createElement("img");
      cards.src = data.cards[0].images.png;
      dealerCardsDiv.appendChild(cards);
      if (dealerScore > 21) {
        for (let i = 0; i < dealerCards.length; i++) {
          if (dealerCards[i].value === "ACE" && dealerCards[i].score === 11) {
            dealerScore -= 10; // Changez la valeur de l'As de 11 à 1
            dealerCards[i].score = 1;
            break;
          }
        }
      }

      document.getElementById("dealer-score").innerText =
        "Dealer: " + dealerScore;
      if (dealerScore < 17) {
        DealerHit();
      } else {
        setTimeout(() => {
          //le setTimeout permet de mettre à jour le score et l'affichage des cartes avant les alerts de résulat
          determineWinner();
        }, 1000);
      }
    })
    .catch((error) => console.error(error));
}




function resetGame() {
  playerScore = 0;
  dealerScore = 0;
  playerCards = [];
  dealerCards = [];
  playerCardsDiv.innerHTML = '';
  dealerCardsDiv.innerHTML = '';
  document.getElementById("player-score").innerText = "Me: 0";
  document.getElementById("dealer-score").innerText = "Dealer: 0";
  document.getElementById("hit-button").disabled = true;
  document.getElementById("stand-button").disabled = true;
  bet = 0; // Réinitialisez la mise à 0
  document.getElementById("bet").value = 0; // Mettez à jour le champ de mise
  document.getElementById("deal-button").innerText = "Deal"; // Changez le texte du bouton en "Deal"
  document.getElementById("deal-button").setAttribute("onclick", "placeBet()"); // Ajoutez un attribut onclick pour appeler placeBet()
}



function placeBet() {
  bet = parseInt(document.getElementById("bet").value);

  if (bet > 0 && bet <= balance) {
    balance -= bet;
    document.getElementById("balance").innerText = "Balance: " + balance;
    document.getElementById("bet").disabled = true;
    ShuffleCards(); // Appelez ShuffleCards() après avoir vérifié que la mise est valide
  } else if (bet > balance) {
    alert("You cannot bet more than your current balance.");
  } else {
    alert("Invalid bet. Please enter a valid amount.");
  }
}




function determineWinner() {
  document.getElementById("hit-button").disabled = true;
  document.getElementById("stand-button").disabled = true;

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
    if (playerScore === 21 && playerHand.length === 2) {
      payout = bet * 2.5;
      message = "Blackjack! Player Wins!";
    } else {
      payout = bet * 2;
      message = "Player Wins!";
    }
  } else {
    message = "Dealer Wins!";
  }

  balance += payout;
  document.getElementById("balance").innerText = "Balance: " + balance;
  document.getElementById("bet").disabled = false;
  alert(message);
}


