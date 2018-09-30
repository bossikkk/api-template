const mongoose = require('mongoose');

const message = 'field missed!';

let ArticleSchema = new mongoose.Schema({
	text: { type: String, required: message },
	title: { type: String, required: message },
	image: { type: String, default: 'http://res.cloudinary.com/djzo4v3do/image/upload/v1538141375/dnfai11ulhmlnqrp3jwe.jpg' },
	createdAt: { type: Date, default: Date.now },
	likes: {
		count: { type: Number, default: 0 },
		users: [{ type: mongoose.Schema.Types.ObjectId }]
	},
	author: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'ApiUser',
		required: message
	},
	comments: [
		{
			author: {
				type: mongoose.Schema.Types.ObjectId,
				ref: 'ApiUser'
			},
			text: String
		}
	]
});


ArticleSchema.methods.like = function(user_id) {
	let index = this.likes.users.indexOf(user_id);
	if (index < 0) {
		this.likes.count++;
		this.likes.users.push(user_id);
	} else if (this.likes.count > 0) {
		this.likes.count--;
		this.likes.users.splice(index, 1);
	}
	return this.save();
};

ArticleSchema.methods.comment = function(c) {
	this.comments.push(c);
	return this.save();
};

module.exports = mongoose.model('Article', ArticleSchema);
