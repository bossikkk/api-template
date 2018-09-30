const authController = require('../controllers/Auth.ctrl');

module.exports = (router, jwtMiddleware) => {
	router
		.route('/login')
		/** POST /api/auth/login - User login */
		.post(authController.login);

	router
		.route('/refresh')
		/** POST /api/auth/login - Refresh access token */
		.post(authController.refresh);

	router
		.route('/logout')
		/** POST /api/auth/logout - User logout */
		.post(jwtMiddleware, authController.logout);

	return router;
};
