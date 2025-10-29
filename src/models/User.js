const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    email: {
        type: String, 
        required: true, 
        unique: true, 
        lowercase: true
    },
    password: {
        type: String, 
        required: true, 
        minlength: 8
    },
    role: {
        type: String, 
        enum: ['user', 'manager', 'admin'], 
        default: 'user'
    },
    team: {
        type: String, 
        trim: true
    } // e.g., "marketing", "engineering"
}, { timestamps: true });

UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

module.exports = mongoose.model('User', UserSchema);