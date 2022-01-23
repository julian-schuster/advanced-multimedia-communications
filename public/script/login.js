let socket = io();
var colorWell;

socket.emit("getRooms");

socket.on('giveRooms', function(data){
    renderRoomList(data)
});

function renderRoomList(data){
    data.forEach(room => {
        addRoom(room);
    })
}
function addRoom(room){
    let option = document.createElement('option');
    option.classList.add("room_name");
    option.innerHTML= room;
    option.setAttribute('id', room)
    option.setAttribute('value', room)
    let roomList = document.getElementById("roomSelect");
    roomList.appendChild(option);
}

window.addEventListener("load", startup, false);

function startup() {
    colorWell = document.querySelector("#colorWell");
    colorWell.addEventListener("input", setValue, false);
    colorWell.addEventListener("change", setValue, false);
}

function setValue(event){
    document.getElementById("colorWell").value = event.target.value;
}

function openInput(){
    var open = document.getElementById("open");
    var close = document.getElementById("close");
    var input = document.getElementById("roomInput");

    open.style.display= "none";
    close.style.display= "inline";
    input.style.display= "flex";
}
function closeInput(){
    var open = document.getElementById("open");
    var close = document.getElementById("close");
    var input = document.getElementById("roomInput");
    
    open.style.display= "inline";
    close.style.display= "none";
    input.style.display= "none";
}
function next(){
    var input = document.getElementById("newRoom").value;
    var name = document.getElementById("name").value;
    if (input == ""){
        input = "General"
    }
    if (name == ""){
        name = "Anonymous"
    }
}
function changeRoom(){
    
    var room = document.getElementById("roomSelect").value;
    var input = document.getElementById("newRoom").value;
    input = "";
    input = room;
}