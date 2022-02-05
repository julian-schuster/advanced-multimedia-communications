let socket = io();

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
        text: document.querySelector('input[id="message-input"]').value,
        room: room
    });
    document.getElementById("message-input").value = "";
    
});

document.getElementById('message-form').onclick = function () {
    activateDrums = false;
    activateKeyboard = false;
};