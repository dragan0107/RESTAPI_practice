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


exports.forgotPassword = async(req, res, next) => {

    //user enters an email and we query if there's such a user.

    const { email } = req.body;

    if (!email) {
        return next(new AppError(`Please, enter the email you're registered with`, 400));
    }

    const user = await User.findOne({ email: email });

    if (!user) {
        return next(new AppError('Wrong email or user doesnt exist in the database', 401));
    }


    //If there's user, we will send them a token with expiration time of 10 minutes.

    let resetToken = user.createResetToken();

    await user.save({ validateBeforeSave: false })

    let message = {
        from: '"restful_api_service" <restful_api_service@drip.com>', // sender address
        to: `${user.email}`, // list of receivers
        subject: "Password reset token!", // Subject line
        text: `Forgot your password huh? Theres your reset token: ${resetToken}`, // plain text body
    };


    let mail = await transporter.sendMail(message);

    res.status(200).json({
        status: "success",
        mail
    });

}


exports.resetPassword = async(req, res, next) => {

    //parse the password and password confirm

    const { password, passwordConfirm } = req.body;
    //1) pass the token in req params and hash it for comparison in DB

    const token = crypto.createHash('sha256').update(req.params.token).digest('hex');


    //2)query in db for the user and at the same time check if token has expired

    const user = await User.findOne({ passwordResetToken: token, passwordResetExpires: { $gt: Date.now() } });

    if (!user) {
        return next(new AppError(`Bad token or it has already expired, please try again..`, 401));
    }

    //3) if it finds the user, then allow it to update the password and save


    user.password = password;
    user.passwordConfirm = passwordConfirm;

    //removing the token and its expiration date from the document and finally saving it
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();


    res.status(200).json({
        status: 'success',
        user
    });


}


exports.updatePassword = async(req, res, next) => {

    //destructuring the body
    const { password, newPass, newPassConfirm } = req.body;


    //querying for user and reincluding password for comparison
    let user = await User.findById(req.user.id).select('+password');


    //if password is wrong, return the error
    if (!await user.passwordChecker(password, user.password)) {
        return next(new AppError('Wrong password, try again', 401));
    }

    //if its correct, allow for pass update and save
    user.password = newPass;
    user.passwordConfirm = newPassConfirm;
    await user.save();



    //after that, send new token
    createSendToken(user, 200, res);

}