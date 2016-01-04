cardApp.controller('LobbyCtrl', ['$scope', 'socket', ($scope, socket) => {
  socket.on('room:list', data => {
    $scope.rooms = data
  })

  socket.on('game:list', data => {
    $scope.games = data
  })

  $scope.updateCapacity = () => {
    $scope.range = []
    for(let i = $scope.game.min; i <= $scope.game.max; i++) {
      $scope.range.push(i)
    }
  }

  $scope.createGame = () => {
    // TODO: find other way to enforce 'required'
    if (!$scope.game) {
      $scope.alert('Please select game')
      return
    }
    if (!$scope.capacity) {
      $scope.alert('Please select capacity')
      return
    }
    let playerName = $scope.prompt("What's your name?")
    if (playerName === null) return
    let data = {
      //TODO: verify at the server side that name is not empty
      name: $scope.name,
      //TODO: permit only allowed characters
      password: $scope.password || '', // TODO: or initialize them first?
      game: $scope.game.internalName,
      capacity: $scope.capacity,
      creator: playerName
    }
    socket.emit('room:create', data)
  }

  $scope.join = room => {
    let name = $scope.prompt("What's your name?")
    if (name === null) return
    let password = ''
    if (room.private) {
      password = $scope.prompt('Enter password')
      if (password === null) return
    }
    let data = {
      room: room.id,
      name: name,
      password: password
    }
    socket.emit('room:join', data, err => {
      $scope.alert(err)
    })
  }

  // TODO: emit again when user leave room and re-join lobby
  let token = null
  socket.emit('lobby:hello', token) //it's me...
}])
