let rooms = []
let availableGames = global.availableGames

let _id = 0;

class Room {
  static find (id) {
    let result = false
    rooms.forEach(r => {
      if (r.id === id) result = r // you can't return here
    })
    return result
  }
  static publicList () {
    let result = []
    rooms.forEach(room => {
      if(room.members.length < room.capacity) {
        result.push({
          id: room.id,
          name: room.name,
          private: room.private,
          game: room.game.name,
          capacity: room.capacity,
          member: room.members.length
        })
      }
    })
    return result
  }
  constructor (name, password, game, capacity, creator) {
    this.id = _id++
    this.name = name
    this.password = password
    this.game = new availableGames[game]
    //TODO: sanitize int before calling this func
    let min = availableGames[game].minCapacity
    let max = availableGames[game].maxCapacity
    this.capacity = clamp(capacity, min, max)
    this.members = [] //TODO: member order does matter (when someone quit)
    this.host = creator
    rooms.push(this)
    this._ready = new Set()
  }
  get private () {return this.password != ''}
  get memberList() {
    return this.members.map(member => {
      return {
        name: member.name,
        ready: this._ready.has(member.id)
      }
    })
  }
  auth (password) {
    return !this.private || this.password == password
  }
  addMember (socket, name) {
    socket.leave('lobby')
    socket.join(`room-${this.id}`)
    socket.currentRoom = this
    this.members.push({id: socket.id, name: name})
    global.io.to('lobby').emit('room:list', Room.publicList())
    global.io.to(socket.id).emit('game:load', {
      game: this.game.internalName,
      capacity: this.capacity
    })
    this.broadcast('room:members', this.memberList)
  }
  user2Index (uid) {
    //TODO: allow a player to leave and others to join in place of him/her
    let result = false;
    this.members.forEach((member, index) => {
      if (member.id == uid) result = index
    })
    return result
  }
  ready (uid, flag) {
    if (flag) {
      this._ready.add(uid)
    }
    else {
      this._ready.delete(uid)
    }
    this.broadcast('room:members', this.memberList)
    if (this._ready.size == this.capacity) {
      this._ready.clear()
      // tell players their order (id) instead of just say 'room:start'
      for (let i=0; i<this.members.length; i++) {
        global.io.to(this.members[i].id).emit('room:start', i)
      }
      //this.broadcast('room:start')
      this.game.next()
      this.update()
    }
  }
  broadcast (event, data) {
    global.io.to(`room-${this.id}`).emit(event, data)
  }
  update () {
    this.members.forEach(member => {
      global.io.to(member.id).emit('game:hand', this.game.currentRound.hands[this.user2Index(member.id)])
    })
    this.broadcast('game:state', this.game.field)
    if (this.game.heartBroken) {
      this.broadcast('heart:broken')
    }
    //TODO: tmp
    let gameEnded = this.game.scoreboard.length != 0
    if (gameEnded) {
      this.broadcast('game:scoreboard', this.game.scoreboard)
    }
  }
}

module.exports = Room

//TODO: do i need to space after function name
// https://stackoverflow.com/questions/11409895/whats-the-most-elegant-way-to-cap-a-number-to-a-segment
function clamp (num, min, max) {
  return num < min ? min : num > max ? max : num;
}
