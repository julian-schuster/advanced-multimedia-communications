let socket = io();

function initUser(){
    socket.emit('newUser', {color: color, name: name});
    socket.emit('getAllUsers', {color: color, name: name});
    console.log("First List: " + name);
    addUser(socket.id, color, name)
}
socket.on('req_user', function(data){
    console.log("Data to: " + data.newUser_id);
    socket.emit('user_data', {color: color, name:name, reqID: data.newUser_id});
});

socket.on('listUser', function(data){
    // console.log(data.userId + " / " + data.user.reqID + " / " + socket.id);
    if(data.userId != data.user.reqID){
        console.log("List Old User: " + data.user.name);
        addUser(data.userId, data.user.color, data.user.name)
    }
});

socket.on('addNewUser', function(data){
    console.log("List new User: " + data.user.name);
    addUser(data.session_id, data.user.color, data.user.name)
});

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

socket.on('delete_user', function(data){
    if(document.getElementById(`${"U"+data.delete_id}`)){
        var elem = document.getElementById(`${"U"+data.delete_id}`);
        elem.parentNode.removeChild(elem);
    }
});

socket.on('connect', function () {

});

socket.on('disconnect', function () {
    console.log("disconnected");
});

//receive messages
socket.on('newMessage', function (message) {
    // console.log("newMessage", message);
    let li = document.createElement('li');
    li.classList.add("chat_msg");
    let b = document.createElement('b');
    let i = document.createElement('i');
    b.style.color= message.color;
    b.innerHTML= message.from + ": ";
    i.innerHTML= message.text;
    
    let chatList = document.getElementById("chat_list");
    chatList.appendChild(li);
     li.appendChild(b);
     li.appendChild(i);
    const chatbox = document.getElementById('chatbox'); 
    chatbox.scrollTop = chatbox.scrollHeight;
});

//send message by form input
document.querySelector('#submit-btn').addEventListener('click', function (e) {
    e.preventDefault();
    let name = params.get('name');
    socket.emit('createMessage', {
        color: color,
        from: name,
        text: document.querySelector('input[id="message-input"]').value
    }, function () {

    });
});

document.getElementById('message-form').onclick = function () {
    activateDrums = false;
    activateKeyboard = false;
};