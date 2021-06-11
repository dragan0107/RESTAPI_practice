const jwt = require('jsonwebtoken');
const User = require('../model/userModel');
const { promisify } = require('util');
const AppError = require('../utilities/AppError');
const transporter = require('../utilities/sendEmail');
const crypto = require('crypto');

//Token generator function that takes the user ID as a parameter.
const generateToken = id => {
    return jwt.sign({ id: id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
}


//Function that creates the token and sends it along with the user as a response.
const createSendToken = (user, statusCode, res) => {

    const token = generateToken(user._id);


    res.status(statusCode).json({
        status: "success",
        token
    });
}


//User register handler.
exports.registerUser = async(req, res) => {

    const { email, password, passwordConfirm } = req.body;
    try {
        const newUser = await User.create({
            email: email,
            password: password,
            passwordConfirm: passwordConfirm
        });


        createSendToken(newUser, 200, res);


    } catch (err) {
        res.status(400).json({
            status: "fail",
            message: err
        });
    }

}

//User Login handler
exports.login = async(req, res, next) => {

    const { email, password } = req.body;

    if (!email || !password) {
        return next(new AppError('Please enter both email and password', 400));
    }

    const user = await User.findOne({ email }).select('+password');

    if (!await user.passwordChecker(password, user.password)) {
        return res.status(200).json({
            status: 'fail'
        });
    }

    user.password = undefined;

    createSendToken(user, 200, res);

}

//Route protect middleware that verifies the token before allowing the user to access a certain route.
exports.protect = async(req, res, next) => {

    let token;

    //Checks if there is an auth header and if it starts with bearer, and tries to obtain the token
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    //If no token, asks user to login again and provide a new token
    if (!token) {
        return next(new AppError('You are not logged in, please try again', 401))
    }

    //token verification 
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);


    const userFound = await User.findById(decoded.id);

    //checks if user with the provided token still exists

    if (!userFound) {
        return next(new AppError('The user with provided token no longer exists', 401));
    }

    //Checking whether password had been changed after issued token
    if (userFound.passwordChanged(decoded.iat)) {
        return next(new AppError('Password has been changed recently, please login with new password', 401));
    }

    req.user = userFound;

    next();
}


// exports.forgotPassword.


exports.forgotPassword = async(req, res) => {

    //user enters an email and we query if there's such a user.

    const { email } = req.body;

    if (!email) {
        return next(new AppError('Please, enter the email with the forgotten password', 400));
    }

    const user = await User.findOne({ email: email });

    if (!user) {
        return next(new AppError('Wrong email or user doesnt exist in the database', 401));
    }


    //If there's user, we will send them a token with expiration time of 10 minutes.

    let resetToken = user.createResetToken();

    await user.save({ validateBeforeSave: false })

    let message = {
        from: '"Fred Foo 👻" <foo@example.com>', // sender address
        to: "bar@example.com, baz@example.com", // list of receivers
        subject: "Hello ✔", // Subject line
        text: `Forgot your password huh? Theres your reset token: ${resetToken}`, // plain text body
    };


    let mail = await transporter.sendMail(message);

    res.status(200).json({
        status: "sucess",
        mail
    });

}


exports.updatePassword = async(req, res, next) => {

    const { password, newPass, newPassConfirm } = req.body;

    let user = await User.findById(req.user.id).select('+password');

    if (!await user.passwordChecker(password, user.password)) {
        return next(new AppError('Wrong password, try again', 401));
    }

    user.password = newPass;
    user.passwordConfirm = newPassConfirm;
    await user.save();


    createSendToken(user, 200, res);

}