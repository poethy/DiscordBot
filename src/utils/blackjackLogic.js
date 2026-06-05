const { freshDeck, handValue } = require('./deck');

function startGame() {
  const deck = freshDeck();
  return {
    deck,
    playerHand: [deck.pop(), deck.pop()],
    dealerHand: [deck.pop(), deck.pop()],
    status:  'playing',  // 'playing' | 'finished'
    result:  null,       // 'player_win' | 'dealer_win' | 'push' | 'blackjack'
    doubled: false,
  };
}

function checkNaturals(state) {
  const playerBJ = handValue(state.playerHand).value === 21;
  const dealerBJ = handValue(state.dealerHand).value === 21;

  if (playerBJ && dealerBJ) { state.status = 'finished'; state.result = 'push';       return 'push'; }
  if (playerBJ)              { state.status = 'finished'; state.result = 'blackjack';  return 'blackjack'; }
  if (dealerBJ)              { state.status = 'finished'; state.result = 'dealer_win'; return 'dealer_blackjack'; }
  return null;
}

function playerHit(state) {
  state.playerHand.push(state.deck.pop());
  const { value } = handValue(state.playerHand);

  if (value > 21) {
    state.status = 'finished';
    state.result = 'dealer_win';
  } else if (value === 21) {
    runDealerTurn(state);
  }
  return state;
}

function playerStand(state) {
  runDealerTurn(state);
  return state;
}

function playerDoubleDown(state) {
  state.doubled = true;
  state.playerHand.push(state.deck.pop());
  const { value } = handValue(state.playerHand);

  if (value > 21) {
    state.status = 'finished';
    state.result = 'dealer_win';
  } else {
    runDealerTurn(state);
  }
  return state;
}

function runDealerTurn(state) {
  while (handValue(state.dealerHand).value < 17) {
    state.dealerHand.push(state.deck.pop());
  }

  const playerTotal = handValue(state.playerHand).value;
  const dealerTotal = handValue(state.dealerHand).value;

  if      (dealerTotal > 21)           state.result = 'player_win';
  else if (playerTotal > dealerTotal)  state.result = 'player_win';
  else if (dealerTotal > playerTotal)  state.result = 'dealer_win';
  else                                 state.result = 'push';

  state.status = 'finished';
}

module.exports = { startGame, checkNaturals, playerHit, playerStand, playerDoubleDown };
