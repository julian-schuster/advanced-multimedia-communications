const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');

const {generateMessage} = require('./modules/message');
const {userJoin, getUser, deleteUser, getUsersInRoom, countUsersInRoom} = require('./modules/users');
const { newRoom, isNewRoom, getAllRooms, deleteRoom} = require('./modules/rooms');
const { log } = require('console');


const publicPath = path.join(__dirname, './public');
const port = process.env.PORT || 3000;
let app = express();
let server = http.createServer(app);
let io = socketIO(server);
let broadcaster;
const broadcasterMap = new Map();

app.use(express.static(publicPath));

io.on('connection', (socket) => {

    socket.on('getRooms', () => {
        socket.emit('newRoomList', getAllRooms());
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
        io.emit('newRoomList', getAllRooms());
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
        socket.broadcast.emit('delete_cursor', {delete_id: socket.id});
        socket.broadcast.emit('delete_user', {delete_id: socket.id});  
        io.emit('newRoomList', getAllRooms());
        if(user != undefined){
            setTimeout(function () {
                if(countUsersInRoom(user.room) == 0){
                    deleteRoom(user.room);
                    io.emit('newRoomList', getAllRooms());
                }
            }, 10000);
        }

    });



    //curser stuff
    socket.on('mouse_activity', function(room, data){
        socket.broadcast.to(room).emit('all_mouse_activity', {session_id: socket.id, cords: data});
    });

    socket.on('keyboard', function (room, blob) {
        // can choose to broadcast it to whoever you want
        socket.broadcast.to(room).emit('keyboardSound', blob);
    });

    socket.on('drums', function (room, blob) {
        // can choose to broadcast it to whoever you want
        socket.broadcast.to(room).emit('drumSound', blob);
    });

    socket.on('keypressedKeyboard', (room, clickedKeyKeyboard) => {
        socket.broadcast.to(room).emit('keyboardKey', clickedKeyKeyboard);
    });

    socket.on('releasedKeyKeyboard', (room, key) => {

        socket.broadcast.to(room).emit('keyboardReleasedKey', key);
    });

    socket.on('keypressedDrums', (room, clickedKeyDrums) => {

        socket.broadcast.to(room).emit('drumKey', clickedKeyDrums);
    });

    socket.on("broadcaster", (room) => {
        broadcasterMap.set(room, socket.id);
        console.log(broadcasterMap);
        console.log(broadcasterMap.get(room) + " started a broadcast in room " + room);
        socket.broadcast.to(room).emit("broadcaster");
        socket.emit("broadcaster", socket.id);
    });

    socket.on("watcher", (room) => {
        if (broadcasterMap.get(room) != undefined) {
            console.log("new Watcher sees: " + broadcasterMap.get(room) + " in room " + room);
            socket.to(room).to(broadcasterMap.get(room)).emit("watcher", socket.id);
        }
        socket.emit("watcher", socket.id);
    });

    socket.on("disconnectPeer", (room) => {
        socket.to(room).to(broadcasterMap.get(room)).emit("peerDisconnected", socket.id);
    });

    socket.on("offer", (room, id, message) => {
        socket.to(room).to(id).emit("offer", socket.id, message);
    });

    socket.on("answer", (room, id, message) => {
        socket.to(room).to(id).emit("answer", socket.id, message);
    });

    socket.on("candidate", (room, id, message) => {
        socket.to(room).to(id).emit("candidate", socket.id, message);
    });

    socket.on("refreshStreams", (room, broadcaster) => {
        socket.to(room).emit("refreshStream", broadcaster);
    });

});

server.listen(port, () => {
    console.log(`Server running on Port ${port}...`);
})