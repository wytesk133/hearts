function play(hands, isPlayable, me) {
  while(1) {
    let card = Math.floor(Math.random() * hands.length);
    if (isPlayable(me, card.id)) {
      return card.id
    }
  }
}

module.exports = play
