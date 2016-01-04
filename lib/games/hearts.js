let cards = require('./standard-cards.js')
let TrickTaking = require('./trick-taking.js')

class Hearts extends TrickTaking {
  constructor () {
    super()
    this.heartBroken = 0
  }
  //TODO: DRY
  static get name() {return 'Hearts <3'}
  get name() {return 'Hearts <3'}
  static get internalName() {return 'hearts'}
  get internalName() {return 'hearts'}
  isPenalty(cardId) {
    let card = cards[cardId]
    if (card.suit == '♥') return true
    if (card.rank == 'Q' && card.suit == '♠') return true
    return false
  }
  // TODO: check heartBroken flag
  isPlayable(player, cardId) {
    let msg = super.isPlayable(player, cardId)
    if (msg !== true) return msg
    let card = cards[cardId]
    // the first card of the game must be 2♣
    if (this.currentRound.tricks.length == 0 && this.currentTrick.length == 0) {
      if(card.rank == '2' && card.suit == '♣') {
        return true
      }
      else {
        return 'You must lead 2♣'
      }
    }
    // no bleeding on the first trick
    if (this.currentRound.tricks.length == 0 && this.isPenalty(cardId)) {
      return 'No bleeding on the first trick'
    }
    if (card.suit == '♥') {
      // we already ensure that player follows suit by super.isPlayable()
      if (this.currentTrick.length != 0) {
        this.heartBroken = true
        return true
      }
      // player is the leader
      else {
        if (this.heartBroken) {
          return true
        }
        let onlyHearts = true
        this.currentRound.hands[player].forEach(card => {
          if (card.suit != '♥') {
            onlyHearts = false
          }
        })
        if (onlyHearts) {
          return true
        }
        return 'heart is not broken, yet my heart is broken 💔'
      }
    }
    return true
  }
  //TODO: extra spaces??
  calculatePoint () {
    for (let i = 0; i < 4; i++) {
      this.currentRound.points[i] = 0
      for(let card of this.currentRound.taken[i]) {
        if (card.suit == '♥') {
          this.currentRound.points[i] ++
        }
        else if (card.rank == 'Q' && card.suit == '♠') {
          this.currentRound.points[i] += 13
        }
      }
      if (this.currentRound.points[i] == 26) {
        this.shootTheMoon(i)
        break;
      }
    }
  }
  shootTheMoon (winner) {
    for (let i = 0; i < 4; i++) {
      this.currentRound.points[i] = i == winner? 0 : 26
    }
  }
  showScoreboard() {
    //highlight(winner)
    this.scoreboard.push(this.currentRound.points)
    let theEnd = false
    this.currentRound.points.forEach(p => {
      if (p >= 100) {
        theEnd = true
      }
    })
    if(theEnd) this.scoreboard.push('end')
    //this.endGame()
    //TODO: export replay
  }
}

module.exports = Hearts
