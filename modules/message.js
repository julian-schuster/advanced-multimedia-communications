let generateMessage = (color, from, text, room) => {
    return {color, from, text, room, createdAt: new Date().getTime()};
};

module.exports = {generateMessage}