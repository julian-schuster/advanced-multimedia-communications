let peerConnection;
const config = {
  iceServers: [
      { 
        "urls": "stun:stun.l.google.com:19302",
      },
      // { 
      //   "urls": "turn:TURN_IP?transport=tcp",
      //   "username": "TURN_USERNAME",
      //   "credential": "TURN_CREDENTIALS"
      // }
  ]
};

const socketWatch = io.connect(window.location.origin);
const video = document.querySelector("video");
const enableAudioButton = document.querySelector("#enable-audio");

enableAudioButton.addEventListener("click", enableAudio)

socketWatch.on("offer", (id, description) => {
  peerConnection = new RTCPeerConnection(config);
  peerConnection
    .setRemoteDescription(description)
    .then(() => peerConnection.createAnswer())
    .then(sdp => peerConnection.setLocalDescription(sdp))
    .then(() => {
      socketWatch.emit("answer", id, peerConnection.localDescription);
    });
  peerConnection.ontrack = event => {
    video.srcObject = event.streams[0];
  };
  peerConnection.onicecandidate = event => {
    if (event.candidate) {
      socketWatch.emit("candidate", id, event.candidate);
    }
  };
});


socketWatch.on("candidate", (id, candidate) => {
  peerConnection
    .addIceCandidate(new RTCIceCandidate(candidate))
    .catch(e => console.error(e));
});

socketWatch.on("connect", () => {
  socketWatch.emit("watcher");
});

socketWatch.on("broadcaster", () => {
  socketWatch.emit("watcher");
});

window.onunload = window.onbeforeunload = () => {
  socketWatch.close();
  peerConnection.close();
};

function enableAudio() {
  console.log("Enabling audio")
  video.muted = false;
}