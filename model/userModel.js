const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');


const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'E-mail is required, please enter it!'],
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: [true, 'Password is required, please enter it!'],
        minlength: 8,
        select: false
    },
    passwordConfirm: {
        type: String,
        required: [true, 'Password CONFIRM is required, please enter it!'],
        validate: {
            validator: function(el) {
                return el === this.password;
            },
            message: 'Passwords DO NOT match, please try again.'
        }
    },
    passwordChangedAt: {
        type: Date
    },
    articles: [{
        title: String,
        content: String
    }]

});


userSchema.pre('save', async function(next) {

    if (!this.isModified('password')) return next();

    this.password = await bcrypt.hash(this.password, 12);
    this.passwordConfirm = undefined;
    next();
});

userSchema.pre('save', function(next) {
    if (!this.isModified('password') || this.isNew) {
        return next();
    }

    this.passwordChangedAt = Date.now() - 1000;
    next();
});


userSchema.methods.passwordChanged = function(jwttimestamp) {

    if (this.passwordChangedAt) {
        const passwordChanged = parseInt(this.passwordChangedAt / 1000, 10);

        return jwttimestamp < passwordChanged; //if jwt time stamp is lower than password changed stamp, it means TOKEN is outdated
    }
    //if it returns false that means the token has been issued after password changing
    return false;
}

userSchema.methods.passwordChecker = async function(candidatePass, userPassword) {
    return await bcrypt.compare(candidatePass, userPassword);
}

const User = mongoose.model('User', userSchema);


module.exports = User;