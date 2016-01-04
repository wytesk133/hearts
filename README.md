npm install -g bower
npm install -g grunt-cli

http://sourceforge.net/projects/vector-cards/
https://github.com/pakastin/deck-of-cards

Client->Server
==============
  room:create     -> host a new game
  room:join       -> join game with password
  (room:leave)    -> no leave? use disconnect instead? room:leave calls disconnect?
  play:card       -> play a card
  --play:bid      -> bidding (for some games)
  --(play:select) -> for some other feedback to server (e.g. select player/trump suit)
  play:ready      -> ready 2 start/ready to play next trick/round

Server->Client
==============
  room:list         -> list all available rooms
  game:list         -> list all available games
  room:waiting      -> wait 4 ppl 2 join
  room:start        -> load template
  game:state        -> bid, play, viewing result, waiting 4 ppl
  (game:wait4ready) -> wait for play:ready from client

Room
====
  id       -> referencing purpose; auto increment
  name     -> room name
  password -> room password; blank => public room
  capacity -> set by host; not exceeding max/min of game (should be move into game object?)
  members  -> [socket.id,..]
  game     -> gameObj's internalName
  gameObj  -> object

Game
====
  name
  internalName
  capacity // dupe with room.cap
  minCapacity
  maxCapacity
  currentRound
  round[]
    deck[]
    hand[][]
    trump
    currentTrick
    trick[][]
    points[]
    bid[]

Technologies/Libraries
======================
  NodeJS
  ExpressJS
  socket.io
  Sass
  Babel
  AngularJS
  Twitter Bootstrap
  jQuery
  FontAwesome
  Random (Uniformly & Quickly)
  [... from packages.json & bower.json]
  written in ECMAScript 2015 (ES6)

License
=======
GPL v3
Copyright 2015 Waitaya Krongapiradee
See more in CONTRIBUTORS.md
