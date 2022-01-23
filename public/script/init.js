const params = new URLSearchParams(window.location.search)
var name =params.get('name');
var color =params.get('color').replace("%23", "#");
var room =params.get('room');

socket.emit("join room", name, color, room);

socket.on('disconnect', function () {
    console.log("disconnected");
});

socket.on('newUserList', function(data){
'    console.log(JSON.stringify(data));'
    renderUserList(data);
});

socket.on('newRoomList', function(data){
'    console.log(JSON.stringify(data));'
    renderRoomList(data);
});

function renderUserList(data){
    clearUserList();
    data.forEach(user => {
        addUser(user.id, user.color, user.userName);
    })
}
function renderRoomList(data){
    clearRoomList();
    data.forEach(room => {
        addRoom(room);
    })
    document.getElementById("roomSelect").value = room;
}

function clearUserList(){
    const elements = document.getElementsByClassName("user_name");
    while(elements.length > 0){
        elements[0].parentNode.removeChild(elements[0]);
    }
}
function clearRoomList(){
    const elements = document.getElementsByClassName("room_name");
    while(elements.length > 0){
        elements[0].parentNode.removeChild(elements[0]);
    }
}

function addUser(id, color, name){
    let li = document.createElement('li');
    li.classList.add("user_name");
    li.setAttribute('id', "U"+id)
    let b = document.createElement('b');
    b.style.color= color;
    b.innerHTML= name;

    let userList = document.getElementById("user_list");
    userList.appendChild(li);
    li.appendChild(b);
    const userbox = document.getElementById('userbox'); 
    userbox.scrollTop = userbox.scrollHeight; 
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

socket.on('connect', function () {

});

function changeRoom(){
    newRoom = document.getElementById("roomSelect").value;
    url = window.location.href
    newUrl = url.substr(0, url.indexOf(room)) + newRoom; 

    alert("changing Room to: " + newRoom);
    window.location.href = newUrl;
}

function goBack(){
    url = window.location.href;
    newUrl = url.substr(0, url.indexOf("/home"));
    window.location.href = newUrl;
}

