let peerConnection;
const config = {
  iceServers: [
    {
      "urls": "stun:stun.96.126.120.235:3478",
    },

    {
      urls: 'turn:96.126.120.235:3478',
      credential: '123123',
      username: 'tablebrains'
    },
  ]
};


const socket = io.connect(window.location.origin);
const video = document.querySelector("video");


socket.on("offer", (id, description) => {
  peerConnection = new RTCPeerConnection(config);
  peerConnection
    .setRemoteDescription(description)
    .then(() => peerConnection.createAnswer())
    .then(sdp => peerConnection.setLocalDescription(sdp))
    .then(() => {
      socket.emit("answer", id, peerConnection.localDescription);

    })

  peerConnection.ontrack = event => {

    var url = window.location.href;
    for (i = 4006; i <= 4006; i++) {

      //var xpectUrl = 'https://stream.tablebrains.com:' + i + '/index.html?UID=' + id;
      var xpectUrl = 'http://localhost:' + i + '/index.html?UID=' + id;
      console.log(xpectUrl.length);
      if (url.indexOf(id) > -1) {
        if (xpectUrl == url) {
          video.srcObject = event.streams[0];
         
        }
      }
    }

    console.log(id);
  };

  peerConnection.oniceconnectionstatechange  = event => {
    if (peerConnection.iceConnectionState == 'disconnected') {
      console.log('Disconnected');
       video.style.display = "none"
       document.getElementById("streamdone").style.display="block"
    
    }
  }

  peerConnection.onicecandidate = event => {
    if (event.candidate) {
      socket.emit("candidate", id, event.candidate);

    }
  };
});
socket.on("candidate", (id, candidate) => {
  peerConnection
    .addIceCandidate(new RTCIceCandidate(candidate))
    .catch(e => console.error(e));
});

socket.on("connect", () => {

  socket.emit("watcher");

});

socket.on("broadcaster", () => {

  socket.emit("watcher");
});

window.onunload = window.onbeforeunload = () => {

  socket.close();

  peerConnection.close();

};