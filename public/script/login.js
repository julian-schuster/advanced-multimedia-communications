let socket = io();
var colorWell;

var room = document.getElementById("roomSelect").value = "General";
var name = document.getElementById("name").value;
var color = document.getElementById("colorWell").value = "#69ce36" ;

socket.emit("getRooms");

socket.on('newRoomList', function(data){
    renderRoomList(data)
});

function renderRoomList(data){
    clearRoomList();
    data.forEach(room => {
        addRoom(room);
    })
}
function clearRoomList(){
    const elements = document.getElementsByClassName("room_name");
    while(elements.length > 0){
        elements[0].parentNode.removeChild(elements[0]);
    }
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
function goNext(){
    color = document.getElementById("colorWell").value.replace("#","%23");
    if(name==""){
        alert("Bitte Name eingeben")
    }else{
        newUrl = "/home.html?name=" + name +"&color=" + color + "&room=" +room;
        window.location.href = newUrl;
    }
}

function changeRoom(){
    room = document.getElementById("roomSelect").value;
    document.getElementById("newRoom").value = room;
    // alert(room);
}
function updateNewRoom(){
    room = document.getElementById("newRoom").value;
    // alert(room);
}
function updateName(){
    name = document.getElementById("name").value;
    // alert(name);
}
function updateColor(){
    color = document.getElementById("colorWell").value
    // alert(color);
}