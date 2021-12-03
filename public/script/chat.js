let socket = io();
console.log("worked");

socket.on('connect', function() {
    
});

socket.on('disconnect', function() {
    console.log("disconnected");
});

//receive messages
socket.on('newMessage', function(message){
    console.log("newMessage", message);
    let li = document.createElement('li');
    li.innerText = `${message.from}: ${message.text}`;
    document.querySelector('body').appendChild(li);
});

//send message by form input
document.querySelector('#submit-btn').addEventListener('click', function(e){
    e.preventDefault();
    let name = window.location.search.replace(new RegExp('.*' + "name="), '');
    socket.emit('createMessage', {
        from: name,
        text: document.querySelector('input[id="message-input"]').value          
    }, function(){

    });
});

