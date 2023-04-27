//déclarer deck_id comme variable globale
let deckId;
let playerScore = 0;
let dealerScore = 0;
let isPlayer = true;

//créer un nouveau deck mélanger
function ShuffleCards() {
  fetch('https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=6')
  .then(response => response.json())
  .then(data => {
    console.log(data);
    deckId = data.deck_id;
    playerScore = 0;
    dealerScore = 0;
    document.getElementById('hit-button').disabled = false;
    document.getElementById('stand-button').disabled = false;
    document.getElementById('deal-button').innerText = 'Reset';
    document.getElementById('deal-button').setAttribute('onclick', 'ResetGame()');
    document.getElementById('player-score').innerText = 'Score: 0';
    document.getElementById('dealer-score').innerText = 'Score: 0';
    DrawCards();
  })
  .catch(error => console.error(error));
}

//distribution des cartes
function DrawCards() {
  fetch("https://deckofcardsapi.com/api/deck/" + deckId + "/draw/?count=4")
  .then(response => response.json())
  .then(data => {
    console.log(data);
    // Afficher les cartes du joueur
    for(let i=0; i<2; i++){
      playerScore += getValue(data.cards[i].value);
      document.getElementById('player-score').innerText = 'Me: ' + playerScore;
    }
    // Afficher les cartes du dealer
    for(let i=2; i<4; i++){
      dealerScore += getValue(data.cards[i].value);
      document.getElementById('dealer-score').innerText = 'Dealer: ' + dealerScore;
    }
  })
  .catch(error => console.error(error));
}

//piocher une carte
function Hit() {
  fetch("https://deckofcardsapi.com/api/deck/" + deckId + "/draw/?count=1")
  .then(response => response.json())
  .then(data => {
    const cardValue = getValue(data.cards[0].value);
    playerScore += cardValue;
    document.getElementById('player-score').innerText = 'Me: ' + playerScore;
    if(playerScore > 21){
        Bust(isPlayer);
    }
  })
  .catch(error => console.error(error));
}

//permet de mettre à jour le score du dealer
function DealerScore(numbers){
  const dealerScoreElement = document.getElementById('dealer-score');
  dealerScoreElement.innerText = 'Dealer: ' + dealerScore;
}

//fonction pour réinitialiser le jeu
function ResetGame(){
  ShuffleCards();
}

//fonction pour retourner la valeur numérique d'une carte
function getValue(cardValue){
  if(cardValue === 'ACE'){
    return 11;
  } else if(cardValue === 'KING' || cardValue === 'QUEEN' || cardValue === 'JACK'){
    return 10;
  } else {
    return parseInt(cardValue);
  }
}

function Stand(){
    document.getElementById('hit-button').disabled = true;
    document.getElementById('stand-button').disabled = true;
    if (dealerScore < 17) {
            DealerHit();

    }
}

function DealerHit() {
  fetch("https://deckofcardsapi.com/api/deck/" + deckId + "/draw/?count=1")
  .then(response => response.json())
  .then(data => {
    const cardValue = getValue(data.cards[0].value);
    dealerScore += cardValue;
    document.getElementById('dealer-score').innerText = 'Dealer: ' + dealerScore;
    if (dealerScore < 17) {

            DealerHit();

    }
    if(dealerScore >21){
        Bust(isPlayer = false);
    }
  })
  .catch(error => console.error(error));
}

function Bust(isPlayer){
    document.getElementById('hit-button').disabled = true;
    document.getElementById('stand-button').disabled = true;
    if (isPlayer){
        console.log('You Bust, Dealer Win !!')
    } else {
        console.log('Dealer Bust, Player Win !!')
    }
}

