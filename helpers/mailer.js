const nodemailer = require('nodemailer');
const config = require('../configs/mailConf');

const transporter = nodemailer.createTransport({
	host: config.smtp.host,
	port: config.smtp.port,
	secure: config.smtp.secure,
	auth: {
		user: config.smtp.user,
		pass: config.smtp.pass
	}
});

module.exports.sendMail = async (toEmail, resetToken, type) => {
	let html,
		subject = '';

	if (type === 'resetPassword') {
		subject = 'New password ✔';
		html = `<b>Hello, click to reset password: </b><a href="${
			config.mailOpt.url
		}/api/users/reset-password/${resetToken}">reset</a>`;
	}

	const mailOptions = {
		from: `"${config.mailOpt.site_name}" <${config.smtp.user}>`,
		to: toEmail,
		subject: subject,
		text: subject,
		html: html
	};

	return await transporter.sendMail(mailOptions);
};
