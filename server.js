/*
*  Friends with Friends: Real-time Multi-player Card Game
*  Copyright (C) 2015  Waitaya Krongapiradee
*
*  This program is free software: you can redistribute it and/or modify
*  it under the terms of the GNU General Public License as published by
*  the Free Software Foundation, either version 3 of the License, or
*  (at your option) any later version.
*
*  This program is distributed in the hope that it will be useful,
*  but WITHOUT ANY WARRANTY; without even the implied warranty of
*  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
*  GNU General Public License for more details.
*
*  You should have received a copy of the GNU General Public License
*  along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

//TODO: change var to let
// www.sitepoint.com/preparing-ecmascript-6-let-const
let http = require('http')
let path = require('path')
let express = require('express')
let babelMiddleware = require("babel-connect")
let sassMiddleware = require('node-sass-middleware')

let app = express()
let server = http.createServer(app)
// https://stackoverflow.com/a/25896899
let io = require('socket.io')(server)
global.io = io;

global.development = process.env.NODE_ENV !== 'production'
//process.env.PORT
//require config.json
//options ||= config.json ||=default
//TODO: priority: which comes first, config file or env variable?

// Security Stuff
// http://expressjs.com/advanced/best-practice-security.html
app.disable('x-powered-by')

//TODO: add other middlewares such as compression() and
// https://stackoverflow.com/q/16978256

// Middlewares
app.use('/assets/css', sassMiddleware({
    /* Options */
    src: path.join(__dirname, 'assets', 'css'),
    dest: path.join(__dirname, 'tmp', 'sass'),
    //dest: path.join(__dirname, 'public', 'assets', 'css'),
    debug: global.development, //TODO: if production write to log file instead
    sourceComments: global.development,
    outputStyle: global.development ? 'expanded' : 'compressed'
}))
//TODO: this is just a quick fix; open a pull request for middleware to send output in request everytime like babel
app.use('/assets/css', express.static(path.join(__dirname, 'tmp', 'sass')))

//TODO: what is ast
//no sourcemap please :)
app.use('/assets/js', babelMiddleware({
  src: path.join(__dirname, 'assets', 'js'),
  dest: path.join(__dirname, 'tmp', 'babel'),
  options: {
    compact: !global.development,
    comments: global.development
  }
}))

// the priority of middlewares does matter
app.use(express.static(path.join(__dirname, 'public')))
app.use('/assets/vendor', express.static(path.join(__dirname, 'bower_components')))

// https://stackoverflow.com/a/18283508
require('./lib/app.js')

// listen to me pls.
let port = process.env.PORT || 3000

// TODO: https server
server.listen(port, () => {
  console.log(`Server listening at *:${port}`)
})
