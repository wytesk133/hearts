global.availableGames = {
  hearts: require('./games/hearts.js')
}

function GameList () {
  let result = []
  for(let key in global.availableGames) {
    let data = global.availableGames[key]
    result.push({
      name: data.name,
      internalName: data.internalName,
      min: data.minCapacity,
      max: data.maxCapacity
    })
  }
  return result
}

let Room = require('./room.js')
let maxLen = 255
let io = global.io

// google: javascript cookie vs local storage
//TODO: give users their token for reconnection
//TODO: do something when user leave room or disconnect
let crypto = require('crypto')
let token = crypto.randomBytes(64).toString('hex');

io.on('connection', socket => {
  if (global.development) {
    console.log(`a user connected ${socket.id}`)
  }

  socket.on('disconnect', () => {
    if (global.development) {
      console.log(`user disconnected ${socket.id}`)
    }
  })

  // when user is ready i.e. templates are loaded and listeners are registered
  socket.on('lobby:hello', () => {
    socket.join('lobby')
    socket.emit('room:list', Room.publicList())
    socket.emit('game:list', GameList())
  })

  // don't have to sanitize names because angular.js will display properly
  // just trim them with maximum size of 255 characters
  socket.on('room:create', data => {
    if (!global.availableGames[data.game]) return "don't hack"
    let room = new Room(data.name.substring(0, maxLen), data.password.substring(0, maxLen), data.game, parseInt(data.capacity), socket.id)
    room.addMember(socket, data.creator.substring(0, maxLen))
  })
  socket.on('room:join', (data, err) => {
    let room = Room.find(data.room)
    if(room === false) {
      err('Room not found!')
    }
    else if(room.members.length + 1 > room.capacity) {
      err('The room is full!')
    }
    else if(!room.auth(data.password)) {
      err('Wrong password!')
    }
    else {
      room.addMember(socket, data.name.substring(0, maxLen))
    }
  })

  socket.on('game:ready', flag => {
    if(socket.currentRoom) {
      socket.currentRoom.ready(socket.id, flag)
    }
  })

  //TODO: move to room.js?
  socket.on('play:card', (data, err) => {
    let cardId = parseInt(data)
    if(socket.currentRoom) {
      let room = socket.currentRoom
      let player = room.user2Index(socket.id)
      let msg = room.game.playCard(player, cardId)
      if(msg === true) {
        if (room.game.endTurn()) {
          room.update()
          // prevent anyone from playing at this moment
          let tmp = room.game.currentPlayer
          room.game.currentPlayer = -1
          // TODO: improve this
          setTimeout(() => {
            room.game.leader = tmp
            room.game.currentPlayer = tmp
            room.game.calculatePoint()
            room.game.next()
            room.update()
          }, 3000)
        }
        else {
          room.update()
        }
      }
      else {
        err(msg)
      }
    }
    else {
      err("Don't try to hack, okay?")
    }
  })

  socket.on('room:leave', () => {
    //
  })

  socket.on('play:bid', data => {
    //
  })
})
