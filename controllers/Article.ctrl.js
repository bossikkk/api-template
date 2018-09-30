const Article = require('../models/Article');
const cloudinary = require('cloudinary');
const apiError = require('../helpers/apiErrors');
const fs = require('fs');
const { promisify } = require('util');
const unlinkAsync = promisify(fs.unlink);

module.exports = {
	/**
	 * Required: params > id
	 */
	get: async ({ params }, res, next) => {
		try {
			let article = await Article.findById(params.id)
				.populate('author')
				.populate('comments.author');
			if (!article) throw new apiError('Article not found', 404, true);

			res.json(article);
		} catch (error) {
			next(error);
		}
	},
	/**
	 * Required: params > id
	 */
	update: async ({ params, body, user, file }, res, next) => {
		try {
			let article = await Article.findById(params.id).populate('author');
			if (!article) throw new apiError('Article not found', 404, true);

			if (String(article.author._id) === user.id) {
				if (file) {
					let cloudImage = await cloudinary.v2.uploader.upload(file.path, {
						resource_type: 'image',
						eager: [{ effect: 'sepia' }]
					});
					body.image = cloudImage.url;
				}
				await article.updateOne(body);
			} else {
				throw new apiError('You don\'t have permission', 403, true);
			}

			res.json({ message: 'success' });
		} catch (error) {
			next(error);
		}
	},
	/**
	 * Required: params > id
	 */
	remove: async ({ params, user }, res, next) => {
		try {
			let article = await Article.findById(params.id).populate('author');
			if (!article) throw new apiError('Article not found', 404, true);

			if (String(article.author._id) === user.id) {
				await article.remove();
			} else {
				throw new apiError('You don\'t have permission', 403, true);
			}

			res.json({ message: 'success' });
		} catch (error) {
			next(error);
		}
	},
	/**
	 * Required: body > text, title
	 */
	create: async ({ body, file, user }, res, next) => {
		try {
			body.author = user.id;
			let articleModel = new Article(body);
			await articleModel.validate();

			if (file) {
				let cloudImage = await cloudinary.v2.uploader.upload(file.path, {
					resource_type: 'image',
					eager: [{ effect: 'sepia' }]
				});
				articleModel.image = cloudImage.url;
			}

			let newArticle = await articleModel.save();
			res.json({ article: newArticle });
		} catch (error) {
			if (error.name === 'ValidationError') error.status = 400;
			next(error);
		}
		if (file) await unlinkAsync(file.path);
	},
	getAll: async (req, res, next) => {
		try {
			let articles = await Article.find({})
				.sort({ createdAt: -1 })
				.populate('author')
				.populate('comments.author');
			if (articles.length === 0) throw new apiError('Articles not found', 404, true);

			res.json(articles);
		} catch (error) {
			next(error);
		}
	},
	/**
	 * Required: params > id
	 */
	like: async ({ params, user }, res, next) => {
		try {
			let article = await Article.findById(params.id);
			if (!article) throw new apiError('Article not found', 404, true);

			await article.like(user.id);
			res.json({ message: 'success' });
		} catch (error) {
			next(error);
		}
	},
	/**
	 * Required: params > id; body > comment
	 */
	comment: async ({ params, body, user }, res, next) => {
		try {
			if (!body.comment) {
				throw new apiError('Missed some field', 400, true);
			}

			let article = await Article.findById(params.id);
			if (!article) throw new apiError('Article not found', 404, true);

			await article.comment({
				author: user.id,
				text: body.comment
			});
			res.json({ message: 'success' });
		} catch (error) {
			next(error);
		}
	}
};
