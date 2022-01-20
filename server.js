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
        // console.log(socket.id + ": connected");
        // for(let s of io.of('/').sockets){
        //     console.log(s[1].id);
        // }
        // console.log(io.of('/').sockets[0]);

    socket.on('disconnect', function(data){
        // console.log(io.sockets.adapter.rooms);
        // console.log(socket.id + ": was disconnected");
        socket.broadcast.emit('delete_cursor', {delete_id: socket.id});
        socket.broadcast.emit('delete_user', {delete_id: socket.id});

    });

    //New Client wants all Users --> broadcast to all for req info
    socket.on('getAllUsers', function(){
        socket.broadcast.emit('req_user', {newUser_id: socket.id});
    });
    //get user Data for new User
    socket.on('user_data', function(data){
        socket.to(data.reqID).emit('listUser', {userId: socket.id, user: data});
    });

    //curser stuff
    socket.on('mouse_activity', function(data){
        socket.broadcast.emit('all_mouse_activity', {session_id: socket.id, cords: data});
    });

    //Welcome Message to new User
    socket.emit('newMessage', generateMessage("#000000", "server", "Welcome to Jam.io"));

    //Message to all other Users that a new User joined
    socket.broadcast.emit('newMessage', generateMessage("#000000", "server", "New User Joined"));

    //add new User to list on connect
    socket.on('newUser', function(data){
        socket.broadcast.emit('addNewUser', {session_id: socket.id, user: data});
    });

    //Message from User(Client), broadcasted to all users
    socket.on('createMessage', (message, callback) => {
        // console.log("createMessage", message);
        io.emit('newMessage', generateMessage(message.color, message.from, message.text));
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

    socket.on('releasedKeyKeyboard', (key) => {

        socket.broadcast.emit('keyboardReleasedKey', key);
    });

    socket.on('keypressedDrums', (clickedKeyDrums) => {

        socket.broadcast.emit('drumKey', clickedKeyDrums);
    });
});

server.listen(port, () => {
    console.log(`Server running on Port ${port}...`);
})