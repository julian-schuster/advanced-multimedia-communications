const audioContext = new AudioContext();

var dest = audioContext.createMediaStreamDestination();
var chunks = [];
var recording = false;

mediaRecorder = new MediaRecorder(dest.stream);

mediaRecorder.onstop = function (evt) {
    let blob = new Blob(chunks, {
        'type': 'audio/wav'
    });

    chunks = [];

    if (blob.size > 0) {
        //document.querySelector("audio").src = URL.createObjectURL(blob);
        socket.emit('keyboard', blob);
        socket.emit('keypressedKeyboard', clickedKeyKeyboard);
    };

};

mediaRecorder.ondataavailable = function (evt) {
    chunks.push(evt.data);
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


    if (!keysKeyboard[clickedKeyKeyboard]) {
        return;
    }

    keysKeyboard[clickedKeyKeyboard].element.classList.add("pressed");

    setTimeout(() => {
        keysKeyboard[clickedKeyKeyboard].element.classList.remove("pressed");
    }, 200);

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

    switch (clickedKeyDrums) {
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

document.addEventListener("keydown", (e) => {
    if (activateKeyboard) {
        const eventKey = e.key.toUpperCase();
        const key = eventKey === ";" ? "semicolon" : eventKey;

        if (!key || pressedNotes.get(key)) {
            return;
        }

        playKey(key);
        clickedKeyKeyboard = key;
    } else if (activateDrums) {

        if (!document.querySelector(`audio[data-key="${e.keyCode}"]`)) {
            return;
        }

        let audio = document.querySelector(`audio[data-key="${e.keyCode}"]`);
        let key = document.querySelector(`.key[data-key="${e.keyCode}"]`)
        audio.currentTime = 0;
        audio.play();
        key.classList.add('playing');

        clickedKeyDrums = key.querySelector('div').innerHTML;

        fetch(audio.src, {
            method: "GET"
        }).then((response) => {
            response.blob().then(function (blob) {
                socket.emit('drums', blob);
                socket.emit('keypressedDrums', clickedKeyDrums);
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
        stopKey(key);
    }
});

document.addEventListener("mouseup", () => {
    stopKey(clickedKeyKeyboard);
});

/*
function startRecording() {

    if (mediaRecorder.state == "recording") {
        mediaRecorder.stop();
        mediaRecorder.start();
    } else {
        recording = true;
        mediaRecorder.start();

        console.log("started Recording");
    }

}

function stopRecording() {

    if (mediaRecorder.state == "recording") {

        mediaRecorder.stop();
        chunks = [];
        recording = false;
        console.log("stopped Recording");
    }

}
*/