import jwt from 'jsonwebtoken';
import User from '../models/user.modules.js';
import GoogleUser from '../models/googleuser.modules.js';
const userAuthantice = async (req, res, next) => {
        try {
                let user;
                const token = req.cookies.useracccesstoken;
                // console.log("User Auth is:",token);
                if (!token) {
                        res.status(401).json('You must be Login');
                }
                const payload = await jwt.verify(token, process.env.USER_ACCESS_TOKEN_SECRET);
                if (!payload.sign_in_provider) {
                        user = await User.findOne({ _id: payload._id }).select("-password -token");
                } else {
                        user = await GoogleUser.findOne({ _id: payload._id })
                                .select(" -googleaccessToken -idToken -tokenExpiryDate -token");
                }
                req.user = user;
                next();
        } catch (error) {
                res.status(500).json('First login Now');
        }
};

const userFlexibleAuthentication = async (req, res, next) => {
        try {
                let user;
                let payload;
                const token = req.cookies.useracccesstoken;
                if (!token) return next();
                const decoded = jwt.decode(token);
                const currentTime = Math.floor(Date.now() / 1000);
                if(decoded.exp > currentTime) {
                        payload = jwt.verify(token, process.env.USER_ACCESS_TOKEN_SECRET);
                } else {
                return next();
                }

                // console.log("3", payload);
                if (!payload.sign_in_provider) {
                        user = await User.findOne({ _id: payload._id }).select("picture");
                } else {
                        user = await GoogleUser.findOne({ _id: payload._id })
                        .select("picture");
                }
                req.user = user;
                next();
        } catch (error) {
                res.status(500).json('Some one error!');
        }
}

export {
        userAuthantice,
        userFlexibleAuthentication
};