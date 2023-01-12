const peerConnections = {};
const config = {
  "iceServers": [

    {
      "urls": "stun:stun.96.126.120.235:3478",
    },

    {
      url: 'turn:96.126.120.235:3478',
      credential: '123123',
      username: 'tablebrains'
    },

  ]
};


const socket = io.connect(window.location.origin);

socket.on("answer", (id, description) => {

  peerConnections[id].setRemoteDescription(description);
});

socket.on("watcher", id => {
  const peerConnection = new RTCPeerConnection(config);
  peerConnections[id] = peerConnection;

  let stream = videoElement.srcObject;

  stream.getTracks().forEach(track => peerConnection.addTrack(track, stream));

  peerConnection.onicecandidate = event => {

    if (event.candidate) {
      socket.emit("candidate", id, event.candidate);

    }
  };

  peerConnection
    .createOffer()
    .then(sdp => peerConnection.setLocalDescription(sdp))
    .then(() => {
      socket.emit("offer", id, peerConnection.localDescription);
    });
});

socket.on("candidate", (id, candidate) => {
  peerConnections[id].addIceCandidate(new RTCIceCandidate(candidate));
});

socket.on("disconnectPeer", id => {

  peerConnections[id].close();
  delete peerConnections[id];

});

window.onunload = window.onbeforeunload = () => {

  socket.close();
};

// Get camera 
const videoElement = document.querySelector("video");

const videoSelect = document.querySelector("select#videoSource");

videoSelect.onchange = getStream;

getStream()
  .then(getDevices)
  .then(gotDevices);


function getDevices() {

  return navigator.mediaDevices.enumerateDevices();
}

function gotDevices(deviceInfos) {
  console.log(socket.id)
  //window.location.href= "?UID=" + socket.id;
  window.deviceInfos = deviceInfos;

  for (const deviceInfo of deviceInfos) {
    const option = document.createElement("option");
    option.value = deviceInfo.deviceId;
    if (deviceInfo.kind === "videoinput") {
      option.text = deviceInfo.label || `Camera ${videoSelect.length + 1}`;
      videoSelect.appendChild(option);

    }
  }

videoSelect.selectedIndex = 1;
getStream();


}

function getStream() {

  if (window.stream) {
    window.stream.getTracks().forEach(track => {
      track.stop();
    });
  }

  const videoSource = videoSelect.value;
  const constraints = {

    video: { deviceId: videoSource ? { exact: videoSource } : undefined }
  };
  console.log(navigator.mediaDevices);
  return navigator.mediaDevices
    .getUserMedia(constraints)
    .then(gotStream)
    .catch(handleError);
}

function gotStream(stream) {

  window.stream = stream;

  videoSelect.selectedIndex = [...videoSelect.options].findIndex(
    option => option.text === stream.getVideoTracks()[0].label
  );

  videoElement.srcObject = stream;
  document.getElementById('uniq').innerHTML = socket.id;
  var refresh = window.location.protocol + "//" + window.location.host + window.location.pathname + '?UID=' + socket.id;
  window.history.pushState({ path: refresh }, '', refresh);

  socket.emit("broadcaster");

}


function handleError(error) {
  console.error("Error: ", error);
}

/*

start = stream/broadcast.html?UID=123123 
view - stream/?UID=123123 

SHOULD NOT WORK - stream/?UID=345345


*/

