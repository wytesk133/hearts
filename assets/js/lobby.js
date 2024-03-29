cardApp.controller('LobbyCtrl', ['$scope', 'socket', ($scope, socket) => {
  // pre-populate a room name
  $scope.name = 'Room-' + Math.floor(Math.random() * 128)

  $scope.rooms = []

  socket.on('room:list', data => {
    $scope.rooms = data
  })

  socket.on('game:list', data => {
    $scope.games = data
    // pre-select a game
    $scope.game = $scope.games[0]
    $scope.updateCapacity()
  })

  $scope.updateCapacity = () => {
    $scope.range = []
    for(let i = $scope.game.min; i <= $scope.game.max; i++) {
      $scope.range.push(i)
    }
    $scope.capacity = $scope.game.min
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
    if (playerName === '') {
      $scope.alert('Your name must not be empty!')
      return
    }
    let data = {
      name: $scope.name,
      //TODO: permit only allowed characters
      password: $scope.password || '', // TODO: or initialize them first?
      game: $scope.game.internalName,
      capacity: $scope.capacity,
      creator: playerName
    }
    socket.emit('room:create', data, err => {
      $scope.alert(err)
    })
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
