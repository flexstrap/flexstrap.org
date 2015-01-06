require('6to5/register')
require('6to5/polyfill')

var express = require('express'),
    port    = (process.env.NODE_PORT || 5050)

var server = express()

require('./server/config')(server)

server.listen(port)

console.log('Express server listening on port:', port)
