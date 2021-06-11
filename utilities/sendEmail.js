const nodemailer = require('nodemailer');


const options = {
    host: "smtp.mailtrap.io",
    port: 2525,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
}


const transporter = nodemailer.createTransport(options);


module.exports = transporter;