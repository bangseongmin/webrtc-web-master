'use strict';

var isChannelReady = false;
var isInitiator = false;
var isStarted = false;
var localStream;
var pc;
var remoteStream = [];
var turnReady;
var participant = 0;
var pcConfig = {
  'iceServers': [{
    'urls': 'stun:stun.l.google.com:19302'
  },{
    'urls': 'turn:172.26.39.30:3478?transport=tcp',
    'username':'testadmin',
    'credential': '123456'  
  }]
};


/////////////////////////////////////////////

// Could prompt for room name:
// room = prompt('Enter room name:');
var room = 'foo';

var socket = io.connect();

if (room !== '') {
  socket.emit('create or join', room);
  console.log('Attempted to create or  join room', room);
  alert("roomID"+getParam(""));
  alert("userID"+getParam(""));
}

socket.on('created', function(room) {
  console.log('Created room ' + room);
  isInitiator = true;
});

socket.on('full', function(room) {
  console.log('Room ' + room + ' is full');
});

socket.on('join', function (room){
  console.log('Another peer made a request to join room ' + room);
  console.log('This peer is the initiator of room ' + room + '!');
  isChannelReady = true;
});

socket.on('joined', function(room) {
  console.log('joined: ' + room);
  isChannelReady = true;
});

socket.on('log', function(array) {
  console.log.apply(console, array);
});

////////////////////////////////////////////////

function sendMessage(message) {
  console.log('Client sending message: ', message);
  socket.emit('message', message);
}

// This client receives a message
socket.on('message', function(message) {
  console.log('Client received message:', message);
  if (message === 'got user media') {
    maybeStart();
  } else if (message.type === 'offer') {
    if (!isInitiator && !isStarted) {
      maybeStart();
    }
    pc.setRemoteDescription(new RTCSessionDescription(message));

    doAnswer();
  } else if (message.type === 'answer' && isStarted) {
    pc.setRemoteDescription(new RTCSessionDescription(message));
  } else if (message.type === 'candidate' && isStarted) {
    var candidate = new RTCIceCandidate({
      sdpMLineIndex: message.label,
      candidate: message.candidate
    });
    pc.addIceCandidate(candidate);
  } else if (message === 'bye' && isStarted) {
    handleRemoteHangup();
  }
});

////////////////////////////////////////////////////
var videos = document.querySelectorAll('.camera');

var localVideo = videos.item(0);
var remoteVideo = [];
remoteVideo[participant] = videos.item(participant);

var shareScreen = document.querySelector('.shareScreen');

navigator.mediaDevices.getUserMedia({
  audio: true,
  video: true
})
.then(gotStream)
.catch(function(e) {
  console.log('getUserMedia() error: ' + e.name);
});

function gotStream(stream) {
  console.log('Adding local stream.');
  localStream = stream;
  localVideo.srcObject = stream;
  shareScreen.srcObject = stream;

  sendMessage('got user media');
  if (isInitiator) {
    maybeStart();
  }
}

function maybeStart() {
  console.log('>>>>>>> maybeStart() ', isStarted, localStream, isChannelReady);
  if (!isStarted && typeof localStream !== 'undefined' && isChannelReady) {
    console.log('>>>>>> creating peer connection');
    createPeerConnection();
    pc.addStream(localStream);

    isStarted = true;
    console.log('isInitiator', isInitiator);
    if (isInitiator) {
      doCall();
    }
  }else if(isStarted && typeof localStream !== 'undefined' && isChannelReady){
    console.log('>>>>>> creating peer connection');
    createPeerConnection();
    pc.addStream(localStream);
    isStarted = true;
    console.log('isInitiator', isInitiator);
    if (isInitiator) {
      doCall();
    }
  }
}

window.onbeforeunload = function() {
  sendMessage('bye');
};

/////////////////////////////////////////////////////////

function createPeerConnection() {
  try {
    pc = new RTCPeerConnection(pcConfig);
    pc.onicecandidate = handleIceCandidate;
    pc.onaddstream = handleRemoteStreamAdded;
    pc.onremovestream = handleRemoteStreamRemoved;

    console.log('Created RTCPeerConnnection');
  } catch (e) {
    console.log('Failed to create PeerConnection, exception: ' + e.message);
    console.log('Cannot create RTCPeerConnection object.');
    return;
  }
}

function handleIceCandidate(event) {
  console.log('icecandidate event: ', event);
  if (event.candidate) {
    sendMessage({
      type: 'candidate',
      label: event.candidate.sdpMLineIndex,
      id: event.candidate.sdpMid,
      candidate: event.candidate.candidate
    });
  } else {
    console.log('End of candidates.');
  }
}

function handleCreateOfferError(event) {
  console.log('createOffer() error: ', event);
}

function doCall() {
  console.log('Sending offer to peer');
  pc.createOffer(setLocalAndSendMessage, handleCreateOfferError);
}

function doAnswer() {
  console.log('Sending answer to peer.');
  pc.createAnswer().then(
    setLocalAndSendMessage,
    onCreateSessionDescriptionError
  );
}

function setLocalAndSendMessage(sessionDescription) {
  pc.setLocalDescription(sessionDescription);
  console.log('setLocalAndSendMessage sending message', sessionDescription);
  sendMessage(sessionDescription);
}

function onCreateSessionDescriptionError(error) {
  trace('Failed to create session description: ' + error.toString());
}

function handleRemoteStreamAdded(event) {
  console.log('Remote stream added.');

  alert("현재 인원:"+participant);
  remoteVideo[participant] = videos.item(participant+1);
  remoteStream[participant] = event.stream;
  remoteVideo[participant].srcObject = event.stream;

  shareScreen.srcObject = event.stream;

  shareScreen.classList.add("shareVideoInChatting");
  localVideo.classList.add("localVideoInChatting");
  remoteVideo[participant].classList.add("remoteVideoInChatting");
  // shareScreen.classList.add("shareVideoInChatting");
  participant++;
  document.getElementById('attendCount').setAttribute('value', participant);
}

function handleRemoteStreamRemoved(event) {
  console.log('Remote stream removed. Event: ', event);
}


function handleRemoteHangup() {

  for (var i = 0; i <= participant; i++) {
    remoteVideo[i].classList.remove("remoteVideoInChatting");
  }
  localVideo.classList.remove("localVideoInChatting");
  shareScreen.classList.remove("shareVideoInChatting");
  console.log('Session terminated.');
  stop();
  isInitiator = false;

}

function stop() {
  isStarted = false;
  pc.close();
  pc = null;

}


function muteMic(){
  localStream.getAudioTracks().forEach(track => track.enabled = !track.enabled);
  return false;
}

function muteCam(){
  localStream.getVideoTracks().forEach(track => track.enabled = !track.enabled);
  return false;
}


// url 에서 parameter 추출

function getParam(sname) {

  var params = location.search.substr(location.search.indexOf("?") + 1);
  var sval = "";
  var params = params.split("&");

  for (var i = 0; i < params.length; i++) {
    var temp = params[i].split("=");

    if ([temp[0]] == sname) { sval = temp[1]; }
  }

  return sval;
}
