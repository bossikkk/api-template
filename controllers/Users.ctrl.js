const User = require('../models/ApiUser');
const cloudinary = require('cloudinary');
const apiError = require('../helpers/apiErrors');
const fs = require('fs');
const { promisify } = require('util');
const unlinkAsync = promisify(fs.unlink);
const mailer = require('../helpers/mailer');
const uuid = require('uuid/v4');
const _ = require('lodash');

module.exports = {
	/**
	 * Required: body > email, password
	 */
	create: async ({ body, file }, res, next) => {
		try {
			let user = await User.findOne({ email: body.email });
			if (user) throw new apiError('User already exist', 400, true);

			let userModel = new User(body);

			if (file) {
				let cloudImage = await cloudinary.v2.uploader.upload(file.path, {
					resource_type: 'image',
					eager: [{ effect: 'sepia' }]
				});
				userModel.provider_pic = cloudImage.url;
			}

			let newUser = await userModel.save();
			res.json({ user: newUser });
		} catch (error) {
			if (error.name === 'ValidationError') error.status = 400;
			next(error);
		}
		if (file) await unlinkAsync(file.path);
	},
	getAll: async (req, res, next) => {
		try {
			let users = await User.find({})
				.sort({ createdAt: -1 })
				.select(['-password', '-resetToken']);
			res.json(users);
		} catch (error) {
			next(error);
		}
	},
	/**
	 * Required: params > id
	 */
	get: async ({ params }, res, next) => {
		try {
			let user = await User.findById(params.id).select(['-password', '-resetToken']);
			if (!user) throw new apiError('User not found', 404, true);
			res.json(user);
		} catch (error) {
			next(error);
		}
	},
	/**
	 * Required: params > id
	 */
	update: async ({ params, body, file, user: reqUser }, res, next) => {
		try {
			let user = await User.findById(params.id);
			if (!user) throw new apiError('User not found', 404, true);

			if (String(user._id) === reqUser.id) {
				if (file) {
					let cloudImage = await cloudinary.v2.uploader.upload(file.path, {
						resource_type: 'image',
						eager: [{ effect: 'sepia' }]
					});
					body.provider_pic = cloudImage.url;
				}

				let filtered = _.pickBy(body, function(value, key) {
					return ['name', 'password', 'provider_pic'].indexOf(key) >= 0;
				});

				user = Object.assign(user, filtered);
				await user.save();

				res.json({ message: 'success' });
			} else {
				throw new apiError('You don\'t have permission', 403, true);
			}
		} catch (error) {
			next(error);
		}
		if (file) await unlinkAsync(file.path);
	},
	/**
	 * Required: params > id
	 */
	remove: async ({ params, user: reqUser }, res, next) => {
		try {
			let user = await User.findById(params.id);
			if (!user) throw new apiError('User not found', 404, true);

			if (String(user._id) === reqUser.id) {
				await user.remove();
			} else {
				throw new apiError('You don\'t have permission', 403, true);
			}
			res.json({ message: 'success' });
		} catch (error) {
			next(error);
		}
	},
	/**
	 * Required: body > email
	 */
	sendResetPasswordEmail: async ({ body }, res, next) => {
		try {
			let user = await User.findOne({ email: body.email });
			if (!user) throw new apiError('User not found', 404, true);

			let resetToken = uuid();
			await mailer.sendMail(body.email, resetToken, 'resetPassword');
			await user.updateOne({ resetToken: resetToken });

			res.json({ message: 'Sent reset url on your mail' });
		} catch (error) {
			next(error);
		}
	},
	/**
	 * Required: params > resetToken
	 */
	resetPassword: async ({ params }, res, next) => {
		try {
			let user = await User.findOne({ resetToken: params.resetToken });
			if (!user) throw new apiError('Reset token not valid', 403, true);

			let newPassword = [...Array(13)].map(() => (~~(Math.random() * 36)).toString(36)).join('');
			user = Object.assign(user, { resetToken: uuid(), password: newPassword });
			await user.save();

			res.json({ message: 'success', password: newPassword });
		} catch (error) {
			next(error);
		}
	}
};
