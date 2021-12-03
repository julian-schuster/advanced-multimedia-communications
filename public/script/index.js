let socket = io();
console.log("worked");

socket.on('connect', function() {
    console.log("connected");
});

socket.on('disconnect', function() {
    console.log("disconnected");
});


socket.on('newMessage', function(message){
    console.log("newMessage", message);
});