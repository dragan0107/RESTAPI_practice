const jwt = require('jsonwebtoken');
const User = require('../model/userModel');
const { promisify } = require('util');
const AppError = require('../utilities/AppError');
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
exports.login = async(req, res) => {

    const { email, password } = req.body;

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

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);


    const userFound = await User.findById(decoded.id);

    req.user = userFound;

    next();
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