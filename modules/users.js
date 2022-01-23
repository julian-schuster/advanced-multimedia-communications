let users = [];

function userJoin(id, userName, color, room){
    const user = {id, userName, color, room};
    users.push(user);
    return user;
};

function getUser(id){
    return users.find(user => user.id === id);
}

function getUsersInRoom(room){
    return users.filter(user => user.room == room);
}

function deleteUser(id){
    users = users.filter(user => user.id != id);
}

function countUsersInRoom(roomName){
    var count = 0
    for( var i = 0; i < users.length; i++){ 
        if ( users[i].room == roomName) { 
            count++; 
        }
    };
    return count;
}

module.exports = {
    userJoin, getUser, deleteUser, getUsersInRoom, countUsersInRoom
}