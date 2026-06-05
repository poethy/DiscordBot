const { freshDeck, numericRank } = require('./deck');

function startGame() {
  const deck = freshDeck();
  return {
    deck,
    currentCard: deck.pop(),
    streak:      0,
    score:       0,
    status:      'playing',  // 'playing' | 'finished'
    lastResult:  null,       // 'correct' | 'correct_same' | 'wrong'
    lastGuess:   null,
    nextCard:    null,
  };
}

function makeGuess(state, guess) {
  if (state.deck.length === 0) {
    const { freshDeck: fd } = require('./deck');
    state.deck = fd();
  }

  const nextCard     = state.deck.pop();
  state.nextCard     = nextCard;
  const currentRank  = numericRank(state.currentCard);
  const nextRank     = numericRank(nextCard);

  const correct =
    (guess === 'higher' && nextRank > currentRank)  ||
    (guess === 'lower'  && nextRank < currentRank)  ||
    (guess === 'same'   && nextRank === currentRank);

  if (correct) {
    state.streak++;
    state.score    += guess === 'same' ? 3 : 1;
    state.lastResult = guess === 'same' ? 'correct_same' : 'correct';
  } else {
    state.lastResult = 'wrong';
    state.streak     = 0;
    state.status     = 'finished';
  }

  state.lastGuess  = guess;
  state.currentCard = nextCard;
  return state;
}

module.exports = { startGame, makeGuess };
