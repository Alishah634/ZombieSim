const path = require("path");

const resolvePath = (...args) => {
    return path.resolve(__dirname, "../../", ...args);
};

module.exports = { resolvePath };
