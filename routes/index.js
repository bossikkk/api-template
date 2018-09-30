const express = require('express');

const usersRoutes = require('../routes/users');
const authRoutes = require('../routes/auth');
const articlesRoutes = require('../routes/articles');

const config = require('../configs/config');
const jwtMiddleware = require('express-jwt')({
	secret: config.secret
});
const multer = require('multer');
const uploader = multer({
	dest: './temp/',
	fileFilter: (req, file, cb) => {
		if (file.mimetype.match('image')) {
			cb(null, true);
		} else {
			cb(new Error('Wrong file type'), false);
		}
	},
	limits: {
		fileSize: 5000000
	}
});

module.exports = {
	auth: authRoutes(express.Router(), jwtMiddleware),
	users: usersRoutes(express.Router(), uploader, jwtMiddleware),
	articles: articlesRoutes(express.Router(), uploader, jwtMiddleware)
};
