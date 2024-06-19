import User from '../models/user.modules.js';
import Otp from '../models/otp.modules.js';
import GoogleUser from '../models/googleuser.modules.js';
import { uponCloudinary } from '../middleware/cloudinary.middleware.js';
import bcrypt from "bcrypt";
import sendEmail from '../middleware/mail.middleware.js';

// google atuhantication
import { OAuth2Client } from "google-auth-library";
const client = new OAuth2Client({
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  redirectUri: process.env.GOOGLE_REDIRECT_URL,
});

// Halper functions
const gen_otp = (length) => {
  let otp = '';
  for (let i = 0; i < length; i++) {
    const number = Math.floor(Math.random() * 10);
    otp += number;
  }
  return otp
};

const getGoogleAuthUrl = () => {
  const scopes = [
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/userinfo.email',
  ];
  const authUrl = client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    redirect_uri: process.env.GOOGLE_REDIRECT_URL,
  });
  return authUrl;
};

const generateTokens = async (userId, source) => {
  try {
    let data;
    if (userId && source) {
      data = await GoogleUser.findById(userId);
    } else {
      data = await User.findById(userId);
    }
    const refreshToken = await data.refreshToken();
    const accessToken = await data.accessToken();
    data.token = refreshToken;
    await data.save({ validateBeforeSave: false });
    return { refreshToken, accessToken };
  } catch (error) {
    res.status(500).error();
  }
};

// User Rout controllers
const getUser = async (_, res) => {
  try {
    res.status(200).render('userregister');
  } catch (error) {
    res.status(500).json('Error fetching register data!');
  }
}

const postUser = async (req, res) => {
  try {
    console.log("User Register Post!");
    const { name, email, password, gender } = req.body;
    const file = req.file.path;
    // console.log("User Register Body", req.body, file);

    // data from > body.
    // validate > trim and null
    // passwoerd contane AZaz09%#
    // validate email
    // validate gender
    // generate tokens.
    // store data on DB.
    // set cookies

    // chck trim and null
    if (!name || !email || !password || !gender || !file) {
      res.status(401).send("All field are required!");
      return;
    }
    if (name.trim() === "" || email.trim() === "" || password.trim() === "" || gender.trim() === "" || file.trim() === "") {
      res.status(401).send("Not any blanck field!");
      return;
    }

    // Name validation
    if (!name || name.length < 3 || name.length > 18 || name === "") {
      res.status(401).send("Name is invalid");
      return;
    }
    const nameRegex = /^[a-zA-Z ]+$/; // Only letters and spaces
    if (!nameRegex.test(name)) {
      res.status(401).send("Name is invalid");
      return;
    }

    // Email validation
    if (!email || email.length < 13 || email.length > 40 || email === "") {
      res.status(401).send("Email is invalid");
      return;
    }
    if (!email.includes("@") || !email.includes(".")) {
      res.status(401).send("Email is invalid");
      return;
    }

    // (?= ): Positive lookahead assertion.
    // .*: Matches any number of characters.
    // [a-z]: Matches any lowercase alphabet.
    // [A-Z]: Matches any uppercase alphabet.
    // \d: Matches any digit (equivalent to [0-9]).
    // [^\da-zA-Z]: Matches any character that is not a digit or an alphabet.
    // Password validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).+$/; // Minimum 8 characters, at least 1 number, lowercase, uppercase, and special character
    if (!passwordRegex.test(password)) {
      res.status(401).send("Password is invalid");
      return;
    }
    if (!password || password.length < 8 || password.length > 250 || password === "") {
      res.status(401).send("Passwrod is invalid");
      return;
    }

    // Gender validation
    if (!gender || gender !== "mail" && gender !== "femail") {
      res.status(401).send("Gender is invalid");
      return;
    }

    // File validation
    if (!file || file === "") {
      res.status(401).send("File is invalid");
      return;
    }
    // Check if user already exists
    const existUser = await User.findOne({ email });
    if (existUser) {
      res.status(401).send("User already exist");
      return;
    }
    if (!res.headersSent) {
      // console.log("User Register Body file", req.file);
      const cloudinary_responce = await uponCloudinary(file);
      const picture = cloudinary_responce.url;
      console.log("Cloudinary responce", cloudinary_responce.url);
      const user = new User({
        name,
        email,
        password,
        gender,
        picture,
      });
      const responce = await user.save();

      // const { accessToken } = await generateTokens(responce._id);
      const data = await User.findOne(responce._id)
        .select("-password -token");

      // console.log("Res: ", data);

      // Generate and save OTP
      const code = gen_otp(6);
      const savecode = new Otp({
        code,
        userId: data._id,
      })
      const otp = await savecode.save();

      // Send welcome email
      const to = data.email;
      const subject = 'Welcome to Quickbuy - Let\'s Get Started!';
      const text = `Dear  ${data.name}, We are thrilled to welcome you to <strong>Quickbuy</strong>! Thank you for choosing us as your preferred destination for all your shopping needs.`;
      const html = `<p>Dear ${data.name},</p><p>Thank you for using <strong>Quickbuy</strong>. To proceed with your request, please use the following One-Time Password (OTP):</p><p>OTP Code: <strong>${otp.code}</strong></p><p>Please enter this OTP code within the next 3 minutes to verify your identity and complete your action.</p><p><strong>Note</strong>: This OTP is valid for 3 minutes from the time of this email. If you did not request this OTP or if you encounter any issues, please contact our support team immediately].</p><p>We are committed to ensuring the security of your account. Please do not share this OTP with anyone.</p><p>Thank you for choosing Quickbuy.</p><p>Best regards,</p><p>The Quickbuy Team</p>`;
      sendEmail(to, subject, text, html);

      // const options = {
      //   httpOnly: true,
      //   secure: true,
      // };
      const mail = data.email;
      res.status(200)
        // .cookie("useracccesstoken", accessToken, options)
        .render('otp', { mail, otp });
    }
  } catch (err) {
    res.status(500).send('Error fetching register data!');
  }
};

const getuserlogin = async (_, res) => {
  try {
    res.status(200).render('userlogin', { message: "" });
  } catch (error) {
    res.status(500).json('Something went wrong')
  }
}

const postuserlogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    // check email
    // get user
    // verify password
    // gen tokens
    // set cookies
    if (!email || email === "" || !password || password === "") {
      res.status(200).render('userlogin', { message: "Please enter correct data" });
      return;
    };

    const user = await User.findOne({ email })
      .select("-name -picture -gender -token");
    const pass = await bcrypt.compare(password, user.password);
    if (!pass) {
      res.status(401).render("userlogin", { message: "You are Unauthorized" })
      return;
    }
    const { accessToken } = await generateTokens(user._id);
    const options = {
      httpOnly: true,
      secure: true,
    }
    res.status(200)
      .cookie("useracccesstoken", accessToken, options)
      .render('userlogin', { message: "Congratulations you are successfully login" });
  } catch (error) {
    res.status(500)
      .json('Something went wrong');
  }
}

//  redirect on google auth with secrits
const googleredirect = async (_, res) => {
  try {
    console.log("Redirect on google!");
    const authUrl = getGoogleAuthUrl();
    // console.log("Redirect", authUrl);
    res.status(200).redirect(authUrl);
  } catch (error) {
    res.status(500).json("Something went wrong");
  }
}

// recive user data from google
const calback = async (req, res) => {
  try {
    console.log("Google calback!");
    const code = req.query.code;

    // Exchanged authorization code for tokens.
    const { tokens } = await client.getToken(code);
    // console.log("Tokens", tokens);
    client.setCredentials(tokens);

    // Verify theID token verified by Google.
    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    // Extract user information from the payload of the ID token.
    const payload = ticket.getPayload();
    // console.log("Payload:", payload);
    const gid = payload['sub'];
    const mail = payload['email'];
    const umail = await User.findOne({ email: mail });
    const getid = await GoogleUser.findOne({ googleId: gid })
      .select("-googleID -googleaccessToken -idToken -tokenExpiryDate -token");

    if (getid && !(umail === null)) {
      res.status(409).json('User is already exist. Please try other one!');
      return;
    };
    if (getid && umail === null) {
      const { accessToken } = await generateTokens(getid._id, "google");
      // console.log("Access token", accessToken);
      const data = await GoogleUser.findOne(getid._id)
        .select("-googleID -googleaccessToken -idToken -tokenExpiryDate -token");
      const options = {
        httpOnly: true,
        secure: true,
      };

      res.status(200)
        .cookie("useracccesstoken", accessToken, options)
        .redirect('/bahadur/v1/commerce');
    } else {
      const newUser = new GoogleUser({
        googleId: payload['sub'],
        email: payload['email'],
        name: payload['name'],
        picture: payload['picture'],
        googleaccessToken: tokens.access_token,
        idToken: tokens.id_token,
        tokenExpiryDate: new Date(tokens.expiry_date)
      });
      const user = await newUser.save();
      const { accessToken } = await generateTokens(user._id, "google");
      // console.log("Access token", accessToken);
      const data = await GoogleUser.findOne(user._id)
        .select("-googleID -googleaccessToken -idToken -tokenExpiryDate -token");
      const options = {
        httpOnly: true,
        secure: true,
      };
      // You can save userId to database or use it for authentication
      res.status(200)
        .cookie("useracccesstoken", accessToken, options)
        .redirect('/bahadur/v1/commerce');
    }
  } catch (error) {
    res.status(500).json('Some one error at google authantication time');
  }
}

const get_otp_verify = async (req, res) => {
  try {
    console.log("OTP varification!");
    const { code, email } = req.body;
    // console.log("Body is:", req.body);
    const givenuser = await User.findOne({ email });
    const mail = givenuser.email;
    const opt = await Otp.findOne({ userId: givenuser._id });
    const time = new Date();

    if (!(code === opt.code)) {
      res.status(401).render("otp", {mail, message: "Incorrect OTP!"});
      return;
    }
    if (!(time < opt.expiryTime)) {
      res.status(401).render("otp", {mail, message: "OTP is expire!"});
      return;
    }
    const updateUser = await User.findByIdAndUpdate(
      { _id: givenuser._id },
      { status: true },
      { new: true }
    );

    const { accessToken } = await generateTokens(updateUser._id);

    const options = {
      httpOnly: true,
      secure: true,
    };
    
    res.status(200)
    .cookie("useracccesstoken", accessToken, options)
    .json({ message: "Successfully verified!" });
  } catch (error) {
    res.status(500).send(error);
  }
}

const get_otp_regenrete = async (req, res) => {
  try {
    const mail = req.params.mail;
    const code = gen_otp(6);
    const user = await User.findOne({ email: mail })
      .select("-password -picture -gender -token -createdAt -updatedAt");
    const exp = new Date(Date.now() + 180000);
    const otpobj = await Otp.findOneAndUpdate({ userId: user._id }, { code, expiryTime: exp }, { new: true })
      .select("-_id -userId -createdAt -updatedAt");
    // console.log("OTP is: ", otpobj);

    const to = user.email;
    const subject = 'Welcome to Quickbuy - Let\'s Get Started!';
    const text = `Dear  ${user.name}, We are thrilled to welcome you to <strong>Quickbuy</strong>! Thank you for choosing us as your preferred destination for all your shopping needs.`;
    const html = `<p>Dear ${user.name},</p><p>Thank you for using <strong>Quickbuy</strong>. To proceed with your request, please use the following One-Time Password (OTP):</p><p>OTP Code: <strong>${otpobj.code}</strong></p><p>Please enter this OTP code within the next 3 minutes to verify your identity and complete your action.</p><p><strong>Note</strong>: This OTP is valid for 3 minutes from the time of this email. If you did not request this OTP or if you encounter any issues, please contact our support team immediately].</p><p>We are committed to ensuring the security of your account. Please do not share this OTP with anyone.</p><p>Thank you for choosing Quickbuy.</p><p>Best regards,</p><p>The Quickbuy Team</p>`;
    sendEmail(to, subject, text, html);

    res.status(200).render('otp', { mail: user.email, otp: otpobj });
  } catch (error) {
    res.status(500).send(error);
  }
}

const logoutUser = async (req, res) => {
  try {
    const _id = req.user._id;
    const googleId = req.user.googleId;
    if (_id && googleId) {
      await GoogleUser.findByIdAndUpdate(_id, { $set: { token: null } });
    } else {
      await User.findByIdAndUpdate(_id, { $set: { token: null } });
    }

    res.status(200)
      .clearCookie("useracccesstoken")
      .json('You are successfuly Logout');
  } catch (error) {
    res.status(500).json('Error during logout');
  }
}


export {
  getUser,
  postUser,
  getuserlogin,
  postuserlogin,
  logoutUser,
  googleredirect,
  calback,
  get_otp_verify,
  get_otp_regenrete,
}