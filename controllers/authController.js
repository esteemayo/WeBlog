const multer = require('multer');
const sharp = require('sharp');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const crypto = require('crypto');
const User = require('../models/User');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/sendEmail');
// const sendEmail = require('../utils/email');

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        return cb(null, true);
    }
    return cb(new AppError('Not an image! Please upload only images', 400), false);
};

const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
});

exports.uploadUserPhoto = upload.single('photo');

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
    if (!req.file) return next();

    req.file.filename = `user-${Date.now()}.jpeg`;

    await sharp(req.file.buffer)
        .resize(500, 500)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/images/users/${req.file.filename}`);

    next();
});

const signToken = id => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
};

const cookieOptions = {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
    httpOnly: true
};

if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);

    res.cookie('jwt', token, cookieOptions);

    user.password = undefined;

    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user
        }
    });
};

exports.signup = catchAsync(async (req, res, next) => {
    let photo;
    if (req.file) photo = req.file.filename;

    const user = await User.create({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        role: req.body.role,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
        passwordChangedAt: req.body.passwordChangedAt,
        photo
    });

    const url = `${req.protocol}://${req.get('host')}/me`;
    await new sendEmail(user, url).sendWelcome();

    createSendToken(user, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    // Check if email and password exist
    if (!email || !password) {
        return next(new AppError('Please provide email and password', 400));
    }

    // Check if user exists and password is correct
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError('Incorrect email or password', 401));
    }

    // If everything's okay, send token to client
    createSendToken(user, 200, res);
});

exports.logout = (req, res) => {
    res.cookie('jwt', 'loggedout', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });

    res.status(200).json({ status: 'success' });
};

exports.protect = catchAsync(async (req, res, next) => {
    // Get token and check if it's there
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.jwt) {
        token = req.cookies.jwt;
    }

    if (!token) {
        return next(new AppError('You are not logged in! Please log in to get access.', 401));
    }

    // Verify token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    // console.log(decoded);

    // Check if user's still there
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
        return next(new AppError('The user belonging to this token does no longer exist.', 404));
    }

    // Check if user changed passwordafter the token was issued
    if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next(new AppError('User recently changed password! Please log in again.', 401));
    }

    // Grant access to protected routes
    req.user = currentUser;
    res.locals.user = currentUser;
    next();
});

exports.isLoggedIn = catchAsync(async (req, res, next) => {
    if (req.cookies.jwt) {
        try {
            // Verify token
            const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);
            // console.log(decoded);

            // Check if user's still there
            const currentUser = await User.findById(decoded.id);
            if (!currentUser) {
                return next();
            }

            // Check if user changed passwordafter the token was issued
            if (currentUser.changedPasswordAfter(decoded.iat)) {
                return next();
            }

            // There's a logged in user
            res.locals.user = currentUser;
            return next();
        } catch (err) {
            return next();
        }
    }
    next();
});

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new AppError('You do not have permission to perform this action!', 403));
        }
        next();
    };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
    // Get user based on email posted
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        return next(new AppError('There is no user with email address', 404));
    }

    // Generate the random reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // Send it to user's email

    /*
    const message = `Forgot your password? Submit a PATCH request with your new password and 
    passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, 
    please ignore this email!`;
    
    await sendEmail({
        email: user.email,
        subject: 'Your password reset token (valid for 10 minutes)',
        message
    });
    */
    try {
        const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;

        await new sendEmail(user, resetURL).sendPasswordReset();

        res.status(200).json({
            status: 'success',
            message: 'Token sent to email'
        });
    } catch (err) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save({ validateBeforeSave: false });

        return next(new AppError('There was an error sending the email. Try again later!', 500));
    }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
    // Get user based on the reset token
    const hashedToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');

    const user = await User.findOne({ resetPasswordToken: hashedToken, resetPasswordExpires: { $gt: Date.now() } });

    // If token has not expired, and there is user, set the new password
    if (!user) {
        return next(new AppError('Token invalid or has expired', 400));
    }

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    // Update changedPasswordAt property for the user
    // Log the user in, send JWT
    createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
    // Get users from collection
    const user = await User.findById(req.user.id).select('+password');

    // Check if posted current password is correct
    if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
        return next(new AppError('Your current password is wrong.', 401));
    }

    // If true, then update password
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();

    // Log user in, send JWT
    createSendToken(user, 200, res);
});