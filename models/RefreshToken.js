const mongoose = require('mongoose');

const message = 'field missed!';

module.exports = mongoose.model('RefreshToken', {
	userId: { type: String, require: message },
	token: {type: String, require: message }
});
