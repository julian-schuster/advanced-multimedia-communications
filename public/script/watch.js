config = {
  iceServers: [{
    "urls": "stun:stun.l.google.com:19302",
  }]
};

socketWatch = io.connect(window.location.origin);
video = document.querySelector("video");
toggleAudioButton = document.querySelector("#toggle-audio");
disconnectPeerButton = document.querySelector("#disconnectPeer");
toggleAudioButton.addEventListener("click", toggleAudio)
disconnectPeerButton.addEventListener("click", disconnectPeer)

socketWatch.on("offer", (id, description) => {
  peerConnection = new RTCPeerConnection(config);
  peerConnection
    .setRemoteDescription(description)
    .then(() => peerConnection.createAnswer())
    .then(sdp => peerConnection.setLocalDescription(sdp))
    .then(() => {
      socketWatch.emit("answer", getUrlVars()["room"], id, peerConnection.localDescription);
    });
  peerConnection.ontrack = event => {
    video.srcObject = event.streams[0];
  };
  peerConnection.onicecandidate = event => {
    if (event.candidate) {
      socketWatch.emit("candidate", getUrlVars()["room"], id, event.candidate);
    }
  };
});

socketWatch.on("candidate", (id, candidate) => {
  peerConnection
    .addIceCandidate(new RTCIceCandidate(candidate))
    .catch(e => console.error(e));
});

socketWatch.on("connect", () => {
  socketWatch.emit("watcher", getUrlVars()["room"]);
});

socketWatch.on("broadcaster", () => {
  socketWatch.emit("watcher", getUrlVars()["room"], name);
});

function toggleAudio() {
  if (video.muted) {
    video.muted = false;
  } else {
    video.muted = true;
  }

}

function disconnectPeer() {
  socketWatch.emit("disconnectPeer", getUrlVars()["room"]);
}

window.onunload = window.onbeforeunload = () => {
  socketWatch.close();
  peerConnection.close();
};

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