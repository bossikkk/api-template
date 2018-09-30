module.exports = {
	smtp: {
		host: 'smtp.gmail.com',
		port: 465,
		secure: true, // true for 465, false for other ports
		user: 'YOUR_EMAIL',
		pass: 'YOUR_PASSWORD'
	},
	mailOpt: {
		site_name: 'STIE_NAME',
		url: `http://localhost:${process.env.PORT || 3000}`
	}
};