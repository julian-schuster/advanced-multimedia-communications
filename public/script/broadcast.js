socketBroadcast = io.connect(window.location.origin);

socketBroadcast.on("answer", (id, description) => {
  peerConnections[id].setRemoteDescription(description);
});

socketBroadcast.on("watcher", id => {
  //console.log("New Watcher with id:"  + id);
  const peerConnection = new RTCPeerConnection(configBroadcast);
  peerConnections[id] = peerConnection;

  let stream = videoElement.srcObject;
  stream.getTracks().forEach(track => peerConnection.addTrack(track, stream));

  peerConnection.onicecandidate = event => {
    if (event.candidate) {
      socketBroadcast.emit("candidate", getUrlVars()["room"], id, event.candidate);
    }
  };

  peerConnection
    .createOffer()
    .then(sdp => peerConnection.setLocalDescription(sdp))
    .then(() => {
      socketBroadcast.emit("offer", getUrlVars()["room"], id, peerConnection.localDescription);
    });
});

socketBroadcast.on("candidate", (id, candidate) => {
  peerConnections[id].addIceCandidate(new RTCIceCandidate(candidate));
  //console.log(peerConnections);
});

socketBroadcast.on("peerDisconnected", id => {

  //console.log("Watcher with id: " + id + " disconnected");
  peerConnections[id].close();
  delete peerConnections[id];

});

window.onunload = window.onbeforeunload = () => {
  socketBroadcast.close();
};

// Get camera and microphone
videoElement = document.querySelector("video");
audioSelect = document.querySelector("select#audioSource");
videoSelect = document.querySelector("select#videoSource");

audioSelect.onchange = getStream;
videoSelect.onchange = getStream;

getStream()
  .then(getDevices)
  .then(gotDevices);

function getDevices() {
  return navigator.mediaDevices.enumerateDevices();
}

function gotDevices(deviceInfos) {
  window.deviceInfos = deviceInfos;
  for (const deviceInfo of deviceInfos) {
    const option = document.createElement("option");
    option.value = deviceInfo.deviceId;
    if (deviceInfo.kind === "audioinput") {
      option.text = deviceInfo.label || `Microphone ${audioSelect.length + 1}`;
      audioSelect.appendChild(option);
    } else if (deviceInfo.kind === "videoinput") {
      option.text = deviceInfo.label || `Camera ${videoSelect.length + 1}`;
      videoSelect.appendChild(option);
    }
  }
}

function getStream() {
  if (window.stream) {
    window.stream.getTracks().forEach(track => {
      track.stop();
    });
  }
  const audioSource = audioSelect.value;
  const videoSource = videoSelect.value;
  const constraints = {
    audio: {
      deviceId: audioSource ? {
        exact: audioSource
      } : undefined
    },
    video: {
      deviceId: videoSource ? {
        exact: videoSource
      } : undefined
    }
  };
  return navigator.mediaDevices
    .getUserMedia(constraints)
    .then(gotStream)
    .catch(handleError);
}

function gotStream(stream) {
  window.stream = stream;
  audioSelect.selectedIndex = [...audioSelect.options].findIndex(
    option => option.text === stream.getAudioTracks()[0].label
  );
  videoSelect.selectedIndex = [...videoSelect.options].findIndex(
    option => option.text === stream.getVideoTracks()[0].label
  );
  videoElement.srcObject = stream;
  socketBroadcast.emit("broadcaster", getUrlVars()["room"]);
}

function handleError(error) {
  console.error("Error: ", error);
}

// Read a page's GET URL variables and return them as an associative array.
function getUrlVars() {
  var vars = [],
    hash;
  var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
  for (var i = 0; i < hashes.length; i++) {
    hash = hashes[i].split('=');
    vars.push(hash[0]);
    vars[hash[0]] = hash[1];
  }
  return vars;
}