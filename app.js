process.env.NODE_ENV = 'production';
const express = require('express');
const logger = require('morgan');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const mongoose = require('mongoose');
const config = require('./configs/config');
const apiError = require('./helpers/apiErrors');

const routes = require('./routes');

const app = express();

mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.connect(
	config.mongo,
	err => {
		if (err) throw err;
		console.log('Mongoose connected');
	}
);

/** middlewares */
app.use(compression());
app.use(helmet()); // secure your Express apps by setting various HTTP headers
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors()); // cross-origin resourse sharing


/** set up routes {API Endpoints} */
app.use('/api/auth', routes.auth);
app.use('/api/users', routes.users);
app.use('/api/articles', routes.articles);
app.get('/favicon.ico', (req, res) => res.status(204));

/* catch 404 and forward to error handler */
app.use((req, res, next) => {
	return next(new apiError('Endpoint not found', 404, true));
});

/* error handler */
app.use(function(err, req, res, next) {
	let status = err.status || 500;
	let errorObj = {
		status: status,
		message: err.message
	};
	if (req.app.get('env') === 'development') {
		errorObj.stack = err.stack;
	}
	res.status(status).json(errorObj);
});

module.exports = app;
