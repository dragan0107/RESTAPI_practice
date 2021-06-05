const jwt = require('jsonwebtoken');
const User = require('../model/userModel');


const generateToken = id => {
    return jwt.sign({ id: id }, 'testing_secret_homie', {
        expiresIn: "60d"
    })
}


const createSendToken = (user, statusCode, res) => {

    const token = generateToken(user._id);


    res.status(statusCode).json({
        status: "success",
        results: {
            data: user
        },
        token
    });
}

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


exports.protect = async(req, res, next) => {
    console.log(req.headers.authorization);

    next();
}