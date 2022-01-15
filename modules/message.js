let generateMessage = (color, from, text) => {
    return {color, from, text, createdAt: new Date().getTime()};
};

module.exports = {generateMessage}