const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');

const {generateMessage} = require('./modules/message');
const {userJoin, getUser, deleteUser, getUsersInRoom, countUsersInRoom} = require('./modules/users');
const { newRoom, isNewRoom, getAllRooms, deleteRoom} = require('./modules/rooms');


const publicPath = path.join(__dirname, './public');
const port = process.env.PORT || 3000;
let app = express();
let server = http.createServer(app);
let io = socketIO(server);
let broadcaster;

app.use(express.static(publicPath));

io.on('connection', (socket) => {

    socket.on('getRooms', () => {
        console.log("Rooms requestet");
        socket.emit('giveRooms', getAllRooms());
    });

    socket.on("join room", (userName, userColor, roomName) => {
        const user = userJoin(socket.id, userName, userColor, roomName);
 
       
        socket.join(roomName);
        if(isNewRoom(roomName)){
            newRoom(roomName);
            //update all room lists
            io.emit('newRoomList', getAllRooms());
        }
        //Welcome Message to new User
        socket.emit('newMessage', generateMessage("#000000", "server", "Welcome to Jam.io"));

        //Message to all other Users that a new User joined
        socket.broadcast.to(user.room).emit('newMessage', generateMessage("#000000", "server", `User: ${userName} joined the room`));

        //Update all user lists in room
        io.to(user.room).emit('newUserList', getUsersInRoom(roomName));

    })

    //Message from User(Client), broadcasted to all users of room
    socket.on('createMessage', (message, callback) => {
        // console.log("createMessage", message);
        io.to(message.room).emit('newMessage', generateMessage(message.color, message.from, message.text, message.room));
    });

    socket.on('disconnect', () => {
        const user = getUser(socket.id);
        deleteUser(socket.id);
        if(user != undefined){
          io.to(user.room).emit('newUserList', getUsersInRoom(user.room));  
        }
        if(user != undefined){
            if(countUsersInRoom(user.room) == 0){
                deleteRoom(user.room);
                io.emit('newRoomList', getAllRooms());
            }
        }
        
        socket.broadcast.emit('delete_cursor', {delete_id: socket.id});
        socket.broadcast.emit('delete_user', {delete_id: socket.id});
    });



    //curser stuff
    socket.on('mouse_activity', function(room, data){
        socket.broadcast.to(room).emit('all_mouse_activity', {session_id: socket.id, cords: data});
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

    socket.on("broadcaster", () => {
        broadcaster = socket.id;
        socket.broadcast.emit("broadcaster");
    });

    socket.on("watcher", () => {
        socket.to(broadcaster).emit("watcher", socket.id);
    });

    socket.on("disconnectPeer", () => {
        socket.to(broadcaster).emit("peerDisconnected", socket.id);
    });

    socket.on("offer", (id, message) => {
        socket.to(id).emit("offer", socket.id, message);
    });

    socket.on("answer", (id, message) => {
        socket.to(id).emit("answer", socket.id, message);
    });

    socket.on("candidate", (id, message) => {
        socket.to(id).emit("candidate", socket.id, message);
    });

});

server.listen(port, () => {
    console.log(`Server running on Port ${port}...`);
})