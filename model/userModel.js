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

userSchema.methods.passwordChecker = async function(candidatePass, userPassword) {
    return await bcrypt.compare(candidatePass, userPassword);
}

const User = mongoose.model('User', userSchema);


module.exports = User;