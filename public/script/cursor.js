console.log(document.documentElement.clientWidth);

document.addEventListener('mousemove', function(event) {
    var width = document.documentElement.clientWidth;
    var height = document.documentElement.clientHeight;
    socket.emit('mouse_activity',room, {color: color, x: event.pageX, y: event.pageY, width: width, height: height})
});

socket.on('all_mouse_activity', function(data){
    var pointers = document.getElementsByClassName("pointer")
    //if new connection, create cursor 
    if(!document.getElementById(`${data.session_id}`)){
        var pointer = document.createElement('div');
        pointer.setAttribute("class", "pointer");
        pointer.setAttribute("id", data.session_id);
        pointer.setAttribute("session_id", data.session_id);
        document.body.appendChild(pointer);
    }
    //Update position
    pointer = document.getElementById(`${data.session_id}`);
    pointer.style.background = `${data.cords.color}`;
    var divX = document.documentElement.clientWidth/data.cords.width;
    var divY = document.documentElement.clientHeight/data.cords.height;
    var x = data.cords.x*divX;
    var y = data.cords.y*divY;


    pointer.style.left = `${x}px`;
    pointer.style.top = `${y}px`;
    // pointer.style.left = `${data.cords.x}px`;
    // pointer.style.top = `${data.cords.y}px`;
});

//delete cursor on disconnect
socket.on('delete_cursor', function(data){
    if(document.getElementById(`${data.delete_id}`)){
        var elem = document.getElementById(`${data.delete_id}`);
        elem.parentNode.removeChild(elem);
    }
});

