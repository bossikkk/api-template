const articleController = require('../controllers/Article.ctrl');

module.exports = (router, uploader, jwtMiddleware) => {
	router.use(jwtMiddleware);

	router
		.route('/')
		/** GET /api/articles - Get all articles */
		.get(articleController.getAll)
		/** POST /api/articles - Create new article */
		.post(uploader.single('image'), articleController.create);

	router
		.route('/:id/comment')
		/** POST /api/articles/:id/comment - Add new comment to article */
		.post(articleController.comment);

	router
		.route('/:id')
		/** GET /api/articles/:id - Get article by id */
		.get(articleController.get)
		/** PATCH /api/articles/:id - Update article by id */
		.patch(articleController.update)
		/** DELETE /api/articles/:id - Remove article by id */
		.delete(articleController.remove);
	
	router
		.route('/:id/like')
		/** POST /api/articles/:id/like - Like article */
		.post(articleController.like);

	return router;
};
