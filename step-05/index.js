'use strict';

// Dont Touch ==========================================================================================================
var os = require('os');
var nodeStatic = require('node-static');
// var http = require('http');

var socketIO = require('socket.io');

const https = require('https');
const fs = require('fs');

const options = {
  key: fs.readFileSync('./private.pem'),
  cert: fs.readFileSync('./public.pem')
};

var fileServer = new(nodeStatic.Server)();
let app = https.createServer(options, (req, res)=>{
  fileServer.serve(req, res);
}).listen(3478);

// =====================================================================================================================

console.log('Started WebRTC server');

var io = socketIO.listen(app);
io.sockets.on('connection', function(socket) {

  // convenience function to log server messages on the client
  function log() {
    var array = ['Message from server:'];
    array.push.apply(array, arguments);
    socket.emit('log', array);
  }

  socket.on('message', function(message) {
    log('Client said: ', message);

    // 현재 소켓 ID로 IN/OUT 처리됨
    if(message==="bye" && socket.room['foo']){
      io.of('/').in('foo').clients((error, socketIds)=>{
        if(error) throw error;

        socketIds.forEach(socketId=>{
          io.sockets.sockets[socketId].leave('foo');
        })
      })
    }

    // for a real app, would be room-only (not broadcast)
    socket.broadcast.emit('message', message);
  });

  socket.on('create or join', function(room) {
    log('Received request to create or join room ' + room);

    var clientsInRoom = io.sockets.adapter.rooms[room];
    var numClients = clientsInRoom ? Object.keys(clientsInRoom.sockets).length : 0;
    log('Room ' + room + ' now has ' + numClients + ' client(s)');

    // 방 생성
    if (numClients === 0) {
      socket.join(room);

      log('Client ID ' + socket.id + ' created room ' + room);
      socket.emit('created', room, socket.id);
      console.log('created');

    // 방 참여(인원 확대 -> CSS 카메라 처리 해야함)
    } else if (numClients < 4) {
      log('Client ID ' + socket.id + ' joined room ' + room);
      io.sockets.in(room).emit('join', room);
      socket.join(room);
      socket.emit('joined', room, socket.id);
      io.sockets.in(room).emit('ready');
      console.log('joined');
    } else { // max two clients
      socket.emit('full', room);
    }
  });

  // 이건 뭔지 모르겠다.
  socket.on('ipaddr', function() {
    var ifaces = os.networkInterfaces();
    for (var dev in ifaces) {
      ifaces[dev].forEach(function(details) {
        if (details.family === 'IPv4' && details.address !== '127.0.0.1') {
          socket.emit('ipaddr', details.address);
        }
      });
    }
  });

  // 채팅 방 나갈 경우
  socket.on('bye', function(){
    console.log('received bye');
  });
});