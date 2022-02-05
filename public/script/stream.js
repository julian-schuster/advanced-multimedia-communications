const audioContext = new AudioContext();

var dest = audioContext.createMediaStreamDestination();
var chunks = [];
var recording = false;
var someKeyIsPressed = false;

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

// MediaRecorder for Keyboard

mediaRecorder = new MediaRecorder(dest.stream);

mediaRecorder.ondataavailable = function (evt) {

    chunks.push(evt.data);

    if (!someKeyIsPressed) {

        let blob = new Blob(chunks, {
            'type': 'audio/wav'
        });

        if (blob.size > 0) {
            socket.emit('keyboard', room, blob);
        }

        clickedKeyKeyboard = [];
        chunks = [];
    }

}

// When the client receives a audio it will play the sound
socket.on('keyboardSound', function (arrayBuffer) {
    let blob = new Blob([arrayBuffer], {
        'type': 'audio/ogg; codecs=opus'
    });

    var audio = new Audio(window.URL.createObjectURL(blob));
    audio.play();
});

// When the client receives a key it will trigger the key
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

// When the client receives a audio it will play the sound
socket.on('drumSound', function (arrayBuffer) {

    let blob = new Blob([arrayBuffer], {
        'type': 'audio/wav; codecs=opus'
    });
    var audio = new Audio(window.URL.createObjectURL(blob));
    audio.play();

});

// When the client receives a audio it will play the sound
socket.on('drumKey', function (clickedKeyDrums) {

    clickedKeyDrums.forEach(element => {
        switch (element) {
            case "A":
                keyCode = 65;
                break;
            case "S":
                keyCode = 83;
                break;
            case "D":
                keyCode = 68;
                break;
            case "F":
                keyCode = 70;
                break;
            case "G":
                keyCode = 71;
                break;
            case "H":
                keyCode = 72;
                break;
            case "J":
                keyCode = 74;
                break;
            case "K":
                keyCode = 75;
                break;
            case "L":
                keyCode = 76;
                break;
            default:
                return;
        }

        let key = document.querySelector(`.key[data-key="${keyCode}"]`)

        key.classList.add('playing');
    });


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

        clickedKeyDrums.push(key.querySelector('div').innerHTML);

        fetch(audio.src, {
            method: "GET"
        }).then((response) => {
            response.blob().then(function (blob) {
                socket.emit('drums', room, blob);
                socket.emit('keypressedDrums', room, clickedKeyDrums);
                clickedKeyDrums = [];
            });
        });
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
            if (window.stream) {
                window.stream.getTracks().forEach(track => {
                    track.enabled = true;
                });
            }
            socket.emit('refreshStreams', room);
        });
});


$("#leaveSpotlight").click(function () {
    if (window.stream) {
        window.stream.getTracks().forEach(track => {
            track.enabled = false;
        });
    }
});

setTimeout(function () {
    $.get("/watch.html", {
            room: room
        })
        .done(function (data) {
            $("#broadcaster").append((data));
        });
}, 250);


socket.on('refreshStream', function () {
    //console.log("New Broadcaster detected -> restart stream");

    setTimeout(function () {
        $("#broadcaster").empty();
        $.get("/watch.html", {
                room: room
            })
            .done(function (data) {
                $("#broadcaster").append((data));
            });
    }, 5000);

});