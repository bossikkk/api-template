const jwt = require('jsonwebtoken');

module.exports = (data, opt = {}) => jwt.sign(data, 'TEST', opt);