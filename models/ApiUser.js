const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const message = 'field missed!';

let UserSchema = new mongoose.Schema({
	name: String,
	email: { type: String, required: message },
	password: { type: String, required: message },
	provider: String,
	provider_id: String,
	resetToken: String,
	provider_pic: {
		type: String,
		default: 'https://res.cloudinary.com/djzo4v3do/image/upload/v1537289791/ki5bow7wnixpyyttterp.jpg'
	},
	createdAt: {
		type: Date,
		default: Date.now
	}
});

UserSchema.pre('save', async function(next) {
	if (this.isModified('password')) {
		let hash = await bcrypt.hash(this.password, 10);
		this.password = hash;
		next();
	}
});



UserSchema.methods.checkPassword = async function(password) {
	return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('ApiUser', UserSchema);
