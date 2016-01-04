//TODO: compare babel output with these code to see if i spaced and indented properly

localStorage.debug = '*'

let cardApp = angular.module('cardApp', [])

cardApp.controller('MainCtrl', ['$scope', 'socket', ($scope, socket) => {
  $scope.page = 'lobby'

  socket.on('game:load', data => {
    $scope.capacity = data.capacity
    $scope.page = 'waiting'
    $scope.gameTemplate = `partials/${data.game}.html`
    window.onbeforeunload = e => 'Dude, are you sure you want to leave? Think of the kittens!'
  })
  socket.on('room:members', data => {
    $scope.members = data
  })
  socket.on('room:start', data => {
    $scope.page = 'game'
    $scope.south = data
    $scope.west = (data+1)%4
    $scope.north = (data+2)%4
    $scope.east = (data+3)%4
  })
  $scope.alert = msg => {
    $scope.alertMsg = msg
    $('#alert').modal('show')
  }
  $scope.prompt = msg => {
    return prompt(msg)
    //TODO: http://bootboxjs.com/
    $('#prompt').modal('show')
  }
  //TODO: under construction
  socket.on('reconnect', () => {
    setTimeout(() => {
      window.onbeforeunload = null
      window.location.reload()
    }, 1000)
  })
}])

// http://briantford.com/blog/angular-socket-io
//TODO: known issue: socket receives info before listeners are registered
cardApp.factory('socket', ['$timeout', $timeout => {
  let socket = io()
  return {
    on: (eventName, callback) => {
      console.log(`---> on ${eventName}`)
      socket.on(eventName, (...args) => {
        $timeout(() => {
          callback.apply(socket, args)
        })
      })
    },
    emit: (eventName, data, callback) => {
      socket.emit(eventName, data, (...args) => {
        $timeout(() => {
          if (callback) {
            callback.apply(socket, args)
          }
        })
      })
    }
  }
}])

function modalPrompt (question, choice) {
  //TODO: under construction
}
