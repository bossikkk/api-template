const User = require('../models/ApiUser');
const RefreshTokenDB = require('../models/RefreshToken');

const apiError = require('../helpers/apiErrors');
const jwt = require('jsonwebtoken');
const uuid = require('uuid/v4');
const config = require('../configs/config');

async function issueTokenPair(userId) {
	const newRefToken = uuid();
	await RefreshTokenDB.create({ userId, token: newRefToken });
	return {
		token: jwt.sign({ id: userId }, config.secret, { expiresIn: config.access_tokens_exp }),
		refreshToken: newRefToken
	};
}

module.exports = {
	/**
	 * Required: body > email, password
	 */
	login: async ({ body }, res, next) => {
		try {
			if (!body.email || !body.password) {
				throw new apiError('Missed some field', 401, true);
			}
			let user = await User.findOne({ email: body.email });
			if (!user) throw new apiError('User not found', 404, true);

			const result = await user.checkPassword(body.password);
			if (!result) throw new apiError('Invalid credentials', 401, true);

			const newTokens = await issueTokenPair(user._id);
			res.json(newTokens);
		} catch (error) {
			next(error);
		}
	},
	/**
	 * Required: body > refreshToken
	 */
	refresh: async ({ body }, res, next) => {
		try {
			let dbToken = await RefreshTokenDB.findOneAndRemove({ token: body.refreshToken });
			if (!dbToken) throw new apiError('Token invalid', 404, true);

			const newTokens = await issueTokenPair(dbToken.userId);
			res.json(newTokens);
		} catch (error) {
			next(error);
		}
	},
	logout: async ({ user }, res, next) => {
		try {
			await RefreshTokenDB.findOneAndRemove({ userId: user.id });
			res.json({ message: 'success' });
		} catch (error) {
			next(error);
		}
	}
};
