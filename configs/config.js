const cloudinary = require('cloudinary');
const rc = require('rc');

cloudinary.config({
	cloud_name: 'YOUR_NAME',
	api_key: 'YOUR_API_KEY',
	api_secret: 'YOUR_SECRET'
});

module.exports = rc('config', {
	mongo: 'YOUR_MONGO_URL',
	secret: 'SECRET',
	access_tokens_exp: '15m', // https://www.npmjs.com/package/ms
});
