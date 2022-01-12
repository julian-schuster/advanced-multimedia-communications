
const audioContext = new AudioContext();

var dest = audioContext.createMediaStreamDestination();

mediaRecorder = new MediaRecorder(dest.stream);

var chunks = [];
var recording = false;
var activateKeyboard = false;

document.getElementById('keyboardFrame').onclick = function () {
  activateDrums = false;
  activateKeyboard = true;
};

const getElementByNote = (note) => note && document.querySelector(`[note="${note}"]`);

const keysKeyboard = {
  A: { element: getElementByNote("C"), note: "C", octaveOffset: 0 },
  W: { element: getElementByNote("C#"), note: "C#", octaveOffset: 0 },
  S: { element: getElementByNote("D"), note: "D", octaveOffset: 0 },
  E: { element: getElementByNote("D#"), note: "D#", octaveOffset: 0 },
  D: { element: getElementByNote("E"), note: "E", octaveOffset: 0 },
  F: { element: getElementByNote("F"), note: "F", octaveOffset: 0 },
  T: { element: getElementByNote("F#"), note: "F#", octaveOffset: 0 },
  G: { element: getElementByNote("G"), note: "G", octaveOffset: 0 },
  Y: { element: getElementByNote("G#"), note: "G#", octaveOffset: 0 },
  H: { element: getElementByNote("A"), note: "A", octaveOffset: 1 },
  U: { element: getElementByNote("A#"), note: "A#", octaveOffset: 1 },
  J: { element: getElementByNote("B"), note: "B", octaveOffset: 1 },
  K: { element: getElementByNote("C2"), note: "C", octaveOffset: 1 },
  O: { element: getElementByNote("C#2"), note: "C#", octaveOffset: 1 },
  L: { element: getElementByNote("D2"), note: "D", octaveOffset: 1 },
  P: { element: getElementByNote("D#2"), note: "D#", octaveOffset: 1 },
  semicolon: { element: getElementByNote("E2"), note: "E", octaveOffset: 1 }
};

const getHz = (note = "A", octave = 4) => {
  const A4 = 440;
  let N = 0;
  switch (note) {
    default:
    case "A":
      N = 0;
      break;
    case "A#":
    case "Bb":
      N = 1;
      break;
    case "B":
      N = 2;
      break;
    case "C":
      N = 3;
      break;
    case "C#":
    case "Db":
      N = 4;
      break;
    case "D":
      N = 5;
      break;
    case "D#":
    case "Eb":
      N = 6;
      break;
    case "E":
      N = 7;
      break;
    case "F":
      N = 8;
      break;
    case "F#":
    case "Gb":
      N = 9;
      break;
    case "G":
      N = 10;
      break;
    case "G#":
    case "Ab":
      N = 11;
      break;
  }
  N += 12 * (octave - 4);
  return A4 * Math.pow(2, N / 12);
};

const pressedNotes = new Map();
let clickedKey = "";

const playKey = (key) => {

  if (!keysKeyboard[key]) {
    return;
  }

  if(!recording){
    if(mediaRecorder.state == "recording"){
      mediaRecorder.stop();
    } else {
      mediaRecorder.start();
    }
  }

  const osc = audioContext.createOscillator();

  const noteGainNode = audioContext.createGain();
  noteGainNode.connect(audioContext.destination);
  
  const zeroGain = 0.00001;
  const maxGain = 0.5;
  const sustainedGain = 0.001;

  noteGainNode.gain.value = zeroGain;

  const setAttack = () =>
    noteGainNode.gain.exponentialRampToValueAtTime(
      maxGain,
      audioContext.currentTime + 0.01
    );
  const setDecay = () =>
    noteGainNode.gain.exponentialRampToValueAtTime(
      sustainedGain,
      audioContext.currentTime + 1
    );
  const setRelease = () =>
    noteGainNode.gain.exponentialRampToValueAtTime(
      zeroGain,
      audioContext.currentTime + 2
    );

  setAttack();
  setDecay();
  setRelease();

  osc.connect(noteGainNode);
  noteGainNode.connect(dest);

  osc.type = "triangle";

  const freq = getHz(keysKeyboard[key].note, (keysKeyboard[key].octaveOffset || 0) + 3);

  if (Number.isFinite(freq)) {
    osc.frequency.value = freq;
  }

  keysKeyboard[key].element.classList.add("pressed");
  pressedNotes.set(key, osc);
  pressedNotes.get(key).start();
  
};

const stopKey = (key) => {
  
  if (!keysKeyboard[key]) {
    return;
  }

  keysKeyboard[key].element.classList.remove("pressed");
  const osc = pressedNotes.get(key);

  if (osc) {
    
    osc.stop();
    if(((mediaRecorder.state == "recording" || mediaRecorder.state != "inactive") && !recording)){
      mediaRecorder.stop();
    }
  
    pressedNotes.delete(key);
  } 
};

document.addEventListener("keydown", (e) => {
  if(activateKeyboard){
    const eventKey = e.key.toUpperCase();
    const key = eventKey === ";" ? "semicolon" : eventKey;
    
    if (!key || pressedNotes.get(key)) {
      return;
    }

    playKey(key);
    clickedKey = key;
  }
});

document.addEventListener("keyup", (e) => {
  if(activateKeyboard){
    const eventKey = e.key.toUpperCase();
    const key = eventKey === ";" ? "semicolon" : eventKey;
    
    if (!key) {
      return;
    }
    stopKey(key);
  }
});

for (const [key, { element }] of Object.entries(keysKeyboard)) {
  element.addEventListener("mousedown", () => {
    playKey(key);
    clickedKey = key;
  });
}

document.addEventListener("mouseup", () => {
  if(activateKeyboard){
    stopKey(clickedKey);
  }
});

mediaRecorder.onstop = function(evt) {
  let blob = new Blob(chunks, { 'type' : 'audio/wav' });

  chunks.pop();

  document.querySelector("audio").src = URL.createObjectURL(blob);
  
  if(blob.size > 0){
    socket.emit('keyboard', blob);
    socket.emit('keypressed', clickedKey);
};


};

mediaRecorder.ondataavailable = function(evt) {
  chunks.push(evt.data);
  }

function startRecording(){
  
  if(mediaRecorder.state == "recording"){
    mediaRecorder.stop();
    mediaRecorder.start();
  } else {
    recording = true;
    mediaRecorder.start();
    
    console.log("started Recording");
  }

}

function stopRecording(){
 
  if(mediaRecorder.state == "recording"){
    
    mediaRecorder.stop();
    chunks = [];
    recording = false; 
    console.log("stopped Recording");
  }
  
}

// When the client receives a audio it will play the sound
socket.on('sound', function(arrayBuffer) {
  let blob = new Blob([arrayBuffer], { 'type' : 'audio/ogg; codecs=opus' });
  var audio = new Audio(window.URL.createObjectURL(blob));
  audio.play();
});

// When the client receives a key it will trigger the key
socket.on('key', function(clickedKey) {

  if (!keysKeyboard[clickedKey]) {
    return;
  }

  keysKeyboard[clickedKey].element.classList.add("pressed");

  setTimeout(() => {
    keysKeyboard[clickedKey].element.classList.remove("pressed");
  }, 200);

});
