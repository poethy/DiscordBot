const SUITS  = ['♠', '♥', '♦', '♣'];
const VALUES = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

function buildDeck() {
  const deck = [];
  for (const suit of SUITS) {
    for (const value of VALUES) {
      deck.push({ suit, value, display: `${value}${suit}` });
    }
  }
  return deck;
}

function shuffle(deck) {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

function freshDeck() {
  return shuffle(buildDeck());
}

// A=1, 2-10=face, J=11, Q=12, K=13
function numericRank(card) {
  if (card.value === 'A') return 1;
  if (card.value === 'J') return 11;
  if (card.value === 'Q') return 12;
  if (card.value === 'K') return 13;
  return parseInt(card.value, 10);
}

// Blackjack hand value with soft Ace handling
function handValue(cards) {
  let total = 0;
  let aces  = 0;

  for (const card of cards) {
    if (card.value === 'A') {
      aces++;
      total += 11;
    } else if (['J', 'Q', 'K'].includes(card.value)) {
      total += 10;
    } else {
      total += parseInt(card.value, 10);
    }
  }

  while (total > 21 && aces > 0) {
    total -= 10;
    aces--;
  }

  return { value: total, soft: aces > 0 };
}

function formatHand(cards, hideSecond = false) {
  if (hideSecond && cards.length >= 2) {
    return `${cards[0].display}  ??  (mostrando: ${handValue([cards[0]]).value})`;
  }
  const { value, soft } = handValue(cards);
  const label = soft ? `soft ${value}` : `${value}`;
  return `${cards.map(c => c.display).join('  ')}  (total: ${label})`;
}

module.exports = { buildDeck, shuffle, freshDeck, numericRank, handValue, formatHand };
