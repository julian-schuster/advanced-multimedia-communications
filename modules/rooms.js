let rooms = [];

function newRoom(roomName){
    if(roomName != "General"){
        rooms.push(roomName); 
    }
    return roomName; 
};

function isNewRoom(roomName){
    var r = rooms.find(room => room == roomName);
    if(r == undefined){
        return true; 
    }else{
        return false;
    }
};

function getAllRooms(){
    return rooms;
}

function deleteRoom(roomName){
    for( var i = 0; i < rooms.length; i++){ 
        if ( rooms[i] == roomName) { 
            rooms.splice(i, 1); 
        }
    }
}

module.exports = {
    newRoom, isNewRoom, getAllRooms, deleteRoom
}