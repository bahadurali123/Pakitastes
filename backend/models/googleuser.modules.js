import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

const gUserSchema = new mongoose.Schema({
    googleId: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    picture: {
        type: String
    },
    googleaccessToken: {
        type: String,
        required: true
    },
    idToken: {
        type: String,
        required: true
    },
    tokenExpiryDate: {
        type: Date,
    },
    token: {
        type: String
    }
},
    { timestamps: true }
);
gUserSchema.methods.accessToken = async function () {
    const payload = {
        _id: this._id,
        sub: this.googleId,
        name: this.name,
        email: this.email,
        picture: this.picture,
        sign_in_provider: "google.com"
    };
    const expiry = {
        expiresIn: process.env.USER_ACCESS_TOKEN_EXPIRY
    };
    const secret = process.env.USER_ACCESS_TOKEN_SECRET;
    const userToken = jwt.sign(payload, secret, expiry);
    // console.log("Token: ", userToken);
    return userToken;
};

gUserSchema.methods.refreshToken = async function () {
    const payload = {
        _id: this._id,
        sub: this.googleId,
        name: this.name,
        email: this.email,
        picture: this.picture,
        sign_in_provider: "google.com"
    };
    const expiry = {
        expiresIn: process.env.USER_REFRESH_TOKEN_EXPIRY
    };
    const secret = process.env.USER_REFRESH_TOKEN_SECRET;
    const userToken = jwt.sign(payload, secret, expiry);
    // console.log("Token: ", userToken);
    return userToken;
};

const GoogleUser = mongoose.model('GoogleUser', gUserSchema);

export default GoogleUser;