cardApp.controller('HeartsCtrl', ['$scope', 'socket', '$timeout', ($scope, socket, $timeout) => {
  socket.on('game:hand', data => {
    $scope.hand = data
  })
  socket.on('heart:broken', () => {
    //TODO: show animation
    $scope.heartBroken = 1 //fade
    $timeout(() => {
      $scope.heartBroken = 0
    }, 3000)
  })
  socket.on('game:state', data => {
    $scope.hands = data.hands
    $scope.currentPlayer = data.currentPlayer
    $scope.points = data.points
    $scope.field = [null, null, null, null]
    for (let i = 0, p = data.leader; i < data.trick.length; i++, p = (p + 1) % 4) {
      $scope.field[p] = data.trick[i]
    }
    //*RANDOM BOT, LOL
    $scope.randomPlay()
    //END*/
  })
  //*RANDOM BOT, LOL
  //TODO: after end game set currentPlayer = -1
  $scope.randomPlay = () => {
    if ($scope.currentPlayer == $scope.south && $scope.members[$scope.south].name == 'bot random') {
      let x = Math.floor(Math.random() * $scope.hand.length);
      $scope.playCard($scope.hand[x].id)
    }
  }
  //END*/
  //TODO:sometimes we can play > 1 card
  $scope.playCard = cardId => {
    socket.emit('play:card', cardId, err => {
      //*RANDOM BOT, LOL
      if ($scope.members[$scope.south].name != 'bot random') {
        $scope.alert(err)
      }
      $scope.randomPlay()
      //END*/
    })
  }
  socket.on('game:scoreboard', data => {
    //TODO: tmp
    $scope.scores = data
    $('#scoreboard').modal('show')
  })
  // preload image (shows loading spinner)
  var img = new Image()
  img.onload = () => {
    // done with preloading (shows ready tick)
    socket.emit('game:ready', 1)
  }
  // TODO: what if the aplication is bind as subdirectory
  img.src = '/assets/images/cards.png'
}])
