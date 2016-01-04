let suits = ['♣', '♦', '♥', '♠']
let ranks = [
  'rank2', 'rank3', 'rank4', 'rank5', 'rank6', 'rank7', 'rank8', 'rank9',
  'rank10', 'jack', 'queen', 'king', 'ace'
]
let cards = []
let id = 0
suits.forEach(suit => {
  ranks.forEach(rank => {
    let num
    if (rank[0] == 'r') {
      num = rank.slice(4)
    }
    else {
      num = rank.slice(0,1).toUpperCase()
    }
    cards.push({
      id: id++,
      rank: num,
      suit: suit,
      classname: `card ${suit} ${rank}`
    })
  })
})

module.exports = cards
