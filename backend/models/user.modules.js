import mongoose from "mongoose"
import bcrypt from "bcrypt"
import jwt from 'jsonwebtoken';

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        require: true,
        lowercase: true,
        trim: true,
    },
    email: {
        type: String,
        require: true,
        lowercase: true,
        unique: true,
        trim: true,
    },
    password: {
        type: String,
        require: true,
        unique: true
    },
    picture: {
        type: String,
        require: true
    },
    gender: {
        type: String,
        Enum: ['mail', 'femail'],
    },
    status: {
        type: String,
        Enum: [true, false],
        default: false,
        require: true,
    },
    token: {
        type: String
    }
},
    { timestamps: true }
)
// Hashing the Password using bcrypt.
UserSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    const hashpass = await bcrypt.hash(this.password, 10);
    console.log("Hashd password: ", hashpass);
    this.password = hashpass
    next();
});

UserSchema.methods.accessToken = async function () {
    const payload = {
        _id: this._id,
        name: this.name,
        email: this.email
    };
    const expiry = {
        expiresIn: process.env.USER_ACCESS_TOKEN_EXPIRY
    };
    const secret = process.env.USER_ACCESS_TOKEN_SECRET;
    const userToken = jwt.sign(payload, secret, expiry);
    // console.log("Token: ", userToken);
    return userToken;
};

UserSchema.methods.refreshToken = async function () {
    const payload = {
        _id: this._id,
        name: this.name,
        email: this.email
    };
    const expiry = {
        expiresIn: process.env.USER_REFRESH_TOKEN_EXPIRY
    };
    const secret = process.env.USER_REFRESH_TOKEN_SECRET;
    const userToken = jwt.sign(payload, secret, expiry);
    // console.log("Token: ", userToken);
    return userToken;
};

const User = mongoose.model("User", UserSchema);
export default User