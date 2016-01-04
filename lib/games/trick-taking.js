let shuffle = require('knuth-shuffle').knuthShuffle
let cards = require('./standard-cards.js')

//TODO: save game replay -> json or string with array of numbers representing the deck and cards played
// replay could be specific for each game type; i.e. don't really need to share common format

class TrickTaking {
  //TODO: this is just for testing purpose
  static get minCapacity () {return 4}
  static get maxCapacity () {return 4}
  constructor () {
    if (new.target === TrickTaking) {
      //TODO: cleanup ^_^
      throw new TypeError("Cannot construct Abstract instances directly");
    }
    this.rounds = []
    this.capacity = 4 //kinda RepeatYourself
    this.currentPlayer = -1 //currentPlayer == -1 means waiting for 'ready'
    this.scoreboard = []
  }
  /*
  if all players are ready, we can call newGame()
  */
  next () {
    if (!this.currentRound) {
      this.newRound()
    }
    else {
      this.newTrick()
    }
  }
  newDeck () {
    return shuffle(cards.slice(0))
  }
  newRound () {
    if(this.currentRound) {
      this.rounds.push(this.currentRound)
    }
    this.currentRound = {
      deck: this.newDeck(),
      hands: [],
      trump: '',
      tricks: [],
      taken: [],
      points: [],
      bids: [], //not all game hav dis
      maxTrick: 13 // for ruffy
    }
    this.newTrick()
    let maxTrick = this.currentRound.maxTrick
    //handcard out according to maxTrick
    for (let i = 0; i < 4; i++) {
      this.currentRound.hands.push(this.currentRound.deck.slice(i*maxTrick, (i+1)*maxTrick))
      this.currentRound.hands[i].sort(byID)
      //the one who has 2♣
      let startingCard = cards.find(card => card.rank == '2' && card.suit == '♣')
      if (this.currentRound.hands[i].indexOf(startingCard) != -1) {
        this.currentPlayer = i
        this.leader = i
      }
      this.currentRound.taken.push([])
      this.currentRound.points.push(0)
      this.currentRound.bids.push(null)
    }
  }
  newTrick () {
    if(this.currentTrick) {
      this.currentRound.tricks.push(this.currentTrick)
    }
    this.currentTrick = []
    if (this.currentRound.tricks.length == this.currentRound.maxTrick) {
      this.showScoreboard()
    }
  }
  get field() {
    return {
      hands: this.currentRound.hands.map(hand => hand.length),
      trick: this.currentTrick,
      currentPlayer: this.currentPlayer,
      leader: this.leader,
      points: this.currentRound.points
    }
  }
  isPlayable(player, cardId) {
    if (cardId < 0 || cardId >= cards.length) {
      return "don't hack"
    }
    let card = cards[cardId]
    // if it is not player's turn
    if (player != this.currentPlayer) {
      return "It's not ur turn dude!"
    }
    // if player doesn't have that card (and probably is hacking)
    if (this.currentRound.hands[player].indexOf(card) == -1) {
      return "u don't hav dat damn card man (and don't hack too)"
    }
    // if player is the leader
    if (this.currentTrick.length == 0) {
      // TODO: if this is the first turn, the player must play 2♣
      return true
    }
    let suit2follow = this.currentTrick[0].suit
    // if player follows suit
    if (card.suit == suit2follow) {
      return true
    }
    // find out if the player has dat suit but doesn't give a shit
    for(let i of this.currentRound.hands[player]) {
      if(i.suit == suit2follow) return 'You must follow suit!'
    }
    return true
  }
  playCard(player, cardId) {
    let msg = this.isPlayable(player, cardId)
    if (msg === true) {
      let card = cards[cardId]
      let idx = this.currentRound.hands[player].indexOf(card)
      this.currentRound.hands[player].splice(idx, 1)
      this.currentTrick.push(card)
      return true
    }
    else {
      return msg
    }
  }
  //find the winner of this trick or shift to next player
  endTurn () {
    if(this.currentTrick.length == 4) {
      let winner = 0
      let winningCard = this.currentTrick[0]
      for(let i = 1; i < 4; i++) {
        if (this.currentTrick[i].suit == winningCard.suit) {
          if (this.currentTrick[i].id > winningCard.id) {
            winner = i
            winningCard = this.currentTrick[i]
          }
        }
        else if (this.currentTrick[i].suit == this.currentRound.trump) {
          winner = i
          winningCard = this.currentTrick[i]
        }
      }
      //shifting~~
      let diff = (3 - this.currentPlayer + 4) % 4
      winner = (winner - diff + 4) % 4
      this.currentRound.taken[winner].push(...this.currentTrick)
      this.currentPlayer = winner
      //this.calculatePoint()
      //this.newTrick()
      return true
    }
    else {
      this.currentPlayer++
      this.currentPlayer %= 4
      return false
    }
  }
  calculatePoint () {
    this.currentRound.taken.forEach((player, index) => {
      this.currentRound.points[index] = player.length/4
    })
  }
}

module.exports = TrickTaking

// An important difference between function declarations and class declarations
// is that function declarations are hoisted and class declarations are not.

function byID(a, b) {
  if (a.id < b.id) return -1
  if (a.id > b.id) return 1
  return 0
}
