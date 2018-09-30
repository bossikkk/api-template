const userController = require('../controllers/Users.ctrl');

module.exports = (router, uploader, jwtMiddleware) => {
	router
		.route('/')
		/** GET /api/users - Get list of users */
		.get(jwtMiddleware, userController.getAll)
		/** POST /api/users - Create new user */
		.post(uploader.single('image'), userController.create);

	router
		.route('/:id')
		/** GET /api/users/:id - Get user */
		.get(jwtMiddleware, userController.get)
		/* PUT /api/users/:id - Update user */
		.patch(jwtMiddleware, uploader.single('image'), userController.update)
		/* DELETE /api/users/:id - Delete user */
		.delete(jwtMiddleware, userController.remove);

	router
		.route('/send-reset-password')
		/** POST /api/users/send-reset-password - Send reset url to user */
		.post(userController.sendResetPasswordEmail);

	router
		.route('/reset-password/:resetToken')
		/** GET /api/users/reset-password?resetToken=TOKEN - User recives new password */
		.get(userController.resetPassword);

	return router;
};
