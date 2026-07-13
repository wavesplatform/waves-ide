const Long = require('long');

module.exports = function inquire(moduleName) {
    if (moduleName === 'long') {
        return Long;
    }

    return null;
};
