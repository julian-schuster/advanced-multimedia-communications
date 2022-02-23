const audioContext = new AudioContext();

var dest = audioContext.createMediaStreamDestination();
var chunks = [];
var recording = false;
var someKeyIsPressed = false;

//Initialisierung von Variablen für watch video stream

var peerConnection;

var config = {
    iceServers: [{
        "urls": "stun:stun.l.google.com:19302",
    }]
};

var socketWatch = io.connect(window.location.origin);
var video = document.querySelector("video");
var toggleAudioButton = document.querySelector("#toggle-audio");
var disconnectPeerButton = document.querySelector("#disconnectPeer");


//Initialisierung von Variablen für broadcasting video stream
const peerConnections = {};
const configBroadcast = {
    iceServers: [{
        "urls": "stun:stun.l.google.com:19302",
    }]
};

var socketBroadcast = io.connect(window.location.origin);
var videoElement;
var audioSelect;
var videoSelect;


// MediaRecorder for Keyboard

mediaRecorder = new MediaRecorder(dest.stream);

mediaRecorder.ondataavailable = function (evt) {

    chunks.push(evt.data);

    if (!someKeyIsPressed) {

        let blob = new Blob(chunks);

        if (blob.size > 0) {
            socket.emit('keyboard', room, blob);
        }

        clickedKeyKeyboard = [];
        chunks = [];
    }

}

socket.on('keyboardSound', function (arrayBuffer) {
    let blob = new Blob([arrayBuffer]);

    var audio = new Audio(window.URL.createObjectURL(blob));
    audio.play();
});

socket.on('keyboardKey', function (clickedKeyKeyboard) {

    clickedKeyKeyboard.forEach(element => {
        if (!keysKeyboard[element]) {
            return;
        }

        keysKeyboard[element].element.classList.add("pressed");

    });
});

socket.on('keyboardReleasedKey', function (key) {

    if (!keysKeyboard[key]) {
        return;
    }

    keysKeyboard[key].element.classList.remove("pressed");

});

socket.on('drumKey', function (clickedKeyDrums) {
    let key = document.querySelector(`.key[data-key="${clickedKeyDrums}"]`)
    let audio = document.querySelector(`audio[data-key="${clickedKeyDrums}"]`);

    audio.currentTime = 0;
    audio.play();
    key.classList.add('playing');
});

document.addEventListener("keydown", (e) => {
    if (activateKeyboard) {
        const eventKey = e.key.toUpperCase();
        const key = eventKey === ";" ? "semicolon" : eventKey;

        if (!key || pressedNotes.get(key)) {
            return;
        }

        clickedKeyKeyboard.push(key);
        someKeyIsPressed = true;
        playKey(key);
        socket.emit('keypressedKeyboard', room, clickedKeyKeyboard);

    } else if (activateDrums) {

        if (!document.querySelector(`audio[data-key="${e.keyCode}"]`)) {
            return;
        }

        let audio = document.querySelector(`audio[data-key="${e.keyCode}"]`);
        let key = document.querySelector(`.key[data-key="${e.keyCode}"]`)
        audio.currentTime = 0;
        audio.play();
        key.classList.add('playing');
        socket.emit('keypressedDrums', room, e.keyCode);

    }
});

document.addEventListener("keyup", (e) => {
    if (activateKeyboard) {
        const eventKey = e.key.toUpperCase();
        const key = eventKey === ";" ? "semicolon" : eventKey;

        if (!key) {
            return;
        }

        someKeyIsPressed = false;
        clickedKeyKeyboard.forEach(element => {
            socket.emit('releasedKeyKeyboard', room, element);
            stopKey(element);
        });

    }
});

document.addEventListener("mouseup", () => {

    lastKey = clickedKeyKeyboard.pop();
    stopKey(lastKey);
    socket.emit('releasedKeyKeyboard', room, lastKey);
});

$("#takeSpotlight").click(function () {
    $.get("/broadcast.html", {
            room: room
        })
        .done(function (data) {
            $("#broadcasterHidden").append((data));
            $("#inSpotlight").innerHTML = data.broadcaster;
            if (window.stream) {
                window.stream.getTracks().forEach(track => {
                    track.enabled = true;
                });
            }
            $("#currentBroadcaster").html(name);
            socket.emit('setBroadcasterName', room, name);
            socket.emit('refreshStreams', room, name);
        });
});


$("#leaveSpotlight").click(function () {
    if (window.stream) {
        window.stream.getTracks().forEach(track => {
            track.enabled = false;
            socket.emit('resetStreams', room, name);
            socket.emit('getBroadcasterName', room);
        });
    }
});

setTimeout(function () {
    $.get("/watch.html", {
            room: room
        })
        .done(function (data) {
            $("#broadcaster").append((data));
            socket.emit('getBroadcasterName', room);
        });
}, 250);

socket.on('refreshStream', function (broadcaster) {
    if (window.stream) {
        window.stream.getTracks().forEach(track => {
            track.enabled = false;
        });
    }

    setTimeout(function () {
        $("#broadcaster").empty();
        $.get("/watch.html", {
                room: room
            })
            .done(function (data) {
                $("#broadcaster").append((data));
                $("#currentBroadcaster").html(broadcaster);
            });
    }, 4000);
});

socket.on('resetStream', function () {
    $("#currentBroadcaster").html("");
    if (window.stream) {
        window.stream.getTracks().forEach(track => {
            track.enabled = false;
        });
    }
});

socket.on('getBroadcaster', function (broadcaster) {
    $("#currentBroadcaster").html(broadcaster);
});