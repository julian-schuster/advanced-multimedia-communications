const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');

const publicPath = path.join(__dirname, './public');
const port = process.env.PORT || 3000;
let app = express();
let server = http.createServer(app);
let io = socketIO(server);

app.use(express.static(publicPath));

io.on('connection', (socket) =>{
    console.log("new User connected");

    socket.on('disconnect', () =>{
        console.log("User was disconnected");
    });

    socket.emit('newMessage', {
            from: "Website",
            text: "Welcome to Jam.io",
            createdAt: new Date().getTime()
        
    });

    socket.broadcast.emit('newMessage', {
        from: "Website",
        text: "New User joined",
        createdAt: new Date().getTime()
    
    });

    socket.on('createMessage', (message) => {
        console.log("createMessage", message);
        io.emit('newMessage', {
            from: message.from,
            text: message.text,
            createdAt: new Date().getTime()
        })     
    });
});

server.listen(port, ()=>{
    console.log(`Server running on Port ${port}...`);
})