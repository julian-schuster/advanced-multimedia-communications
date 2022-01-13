const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');

const {
    generateMessage
} = require('./modules/message');
const publicPath = path.join(__dirname, './public');
const port = process.env.PORT || 3000;
let app = express();
let server = http.createServer(app);
let io = socketIO(server);

app.use(express.static(publicPath));

io.on('connection', (socket) => {
    console.log("new User connected");

    socket.on('disconnect', () => {
        console.log("User was disconnected");
    });

    //Welcome Message to new User
    socket.emit('newMessage', generateMessage("server", "Welcome to Jam.io"));

    //Message to all other Users that a new User joined
    socket.broadcast.emit('newMessage', generateMessage("server", "New User Joined"));

    //Message from User(Client), broadcasted to all users
    socket.on('createMessage', (message, callback) => {
        console.log("createMessage", message);
        io.emit('newMessage', generateMessage(message.from, message.text));
        callback("This is Server");
    });

    socket.on('keyboard', function (blob) {
        // can choose to broadcast it to whoever you want
        socket.broadcast.emit('keyboardSound', blob);
    });

    socket.on('drums', function (blob) {
        // can choose to broadcast it to whoever you want
        socket.broadcast.emit('drumSound', blob);
    });

    socket.on('keypressedKeyboard', (clickedKeyKeyboard) => {

        socket.broadcast.emit('keyboardKey', clickedKeyKeyboard);
    });

    socket.on('keypressedDrums', (clickedKeyDrums) => {

        socket.broadcast.emit('drumKey', clickedKeyDrums);
    });
});

server.listen(port, () => {
    console.log(`Server running on Port ${port}...`);
})