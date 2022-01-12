const drumsFrame = document.getElementById('drums');
var activateDrums = false;

const getElementByDataId = (datakey) => datakey && document.querySelector(`[data-key="${datakey}"]`);

const keysDrums = {
    A: { element: getElementByDataId("65")},
    S: { element: getElementByDataId("83")},
    D: { element: getElementByDataId("68")},
    F: { element: getElementByDataId("70")},
    G: { element: getElementByDataId("71")},
    H: { element: getElementByDataId("72")},
    J: { element: getElementByDataId("74")},
    K: { element: getElementByDataId("75")},
    L: { element: getElementByDataId("76")}
  };

document.getElementById('drumkitFrame').onclick = function () {
    activateKeyboard = false;
    activateDrums = true;
};

window.addEventListener('keydown',function(e){
    if(activateDrums){

        if(!document.querySelector(`audio[data-key="${e.keyCode}"]`)){
            return;
        }
        
       
        let audio = document.querySelector(`audio[data-key="${e.keyCode}"]`);
        let key = document.querySelector(`.key[data-key="${e.keyCode}"]`)
        audio.currentTime = 0;
        audio.play();
        key.classList.add('playing');
        let aud = document.getElementById('sound_boom');
        /*fetch(aud.src)
        .then(response => response.blob())
        .then(console.log);
          */
       
       // 


        fetch(aud.src, {
          method: "GET"
        }).then((response) => {
          response.blob().then(function (blob) {

              console.log(blob);
              socket.emit('drums', blob);
             });
           });
    }
})
    
let keypressed = document.querySelectorAll('.key');

keypressed.forEach((key)=>{
    key.addEventListener('transitionend',function(){
        this.classList.remove('playing');


    })

})
    
for (const [key, { element }] of Object.entries(keysDrums)) {

    element.addEventListener("mousedown", (e) => {

        switch (e.currentTarget.querySelector('div').innerHTML) {
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

        if(!document.querySelector(`audio[data-key="${keyCode}"]`)){
            return;
        }
  
        
        let audio = document.querySelector(`audio[data-key="${keyCode}"]`);
        let key = document.querySelector(`.key[data-key="${keyCode}"]`)
        audio.currentTime = 0;
        audio.play();
        key.classList.add('playing');

        let aud = document.getElementById('sound_boom');
        /*fetch(aud.src)
        .then(response => response.blob())
        .then(console.log);
          */
       
       // 


        fetch(aud.src, {
          method: "GET"
        }).then((response) => {
          response.blob().then(function (blob) {

              console.log(blob);
              socket.emit('drums', blob);
             });
           });

    });
  }

  // When the client receives a audio it will play the sound
socket.on('drumSound', function(arrayBuffer) {
  
    let blob = new Blob([arrayBuffer], { 'type' : 'audio/wav; codecs=opus' });
    var audio = new Audio(window.URL.createObjectURL(blob));
    audio.play();
  });