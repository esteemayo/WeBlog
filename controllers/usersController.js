const multer = require('multer');
const sharp = require('sharp');
const _ = require('lodash');
const User = require('../models/User');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('../controllers/handlerFactory');

/*
const multerStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images/users');
    },
    filename: (req, file, cb) => {
        const ext = file.mimetype.split('/')[1];
        cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
    }
});
*/

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

    req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

    await sharp(req.file.buffer)
        .resize(500, 500)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/images/users/${req.file.filename}`);

    next();
});

exports.updateMe = catchAsync(async (req, res, next) => {
    // Create error if user posts password data
    // console.log(req.file);
    // console.log(req.body);
    if (req.body.password || req.body.passwordConfirm) {
        return next(new AppError(`This route is not defined! Please use ${req.protocol}://${req.get('host')}/api/v1/signup instead`, 400));
    }

    // Filtered out unwanted fields name that are not allowed to be updated
    let filterBody = _.pick(req.body, 'firstName', 'lastName', 'email');
    if (req.file) filterBody.photo = req.file.filename;

    // Update user document
    const updatedUser = await User.findByIdAndUpdate(req.user.id, filterBody, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        status: 'success',
        data: {
            user: updatedUser
        }
    });
});

exports.getMe = (req, res, next) => {
    req.params.id = req.user.id;
    next();
};

exports.deleteMe = catchAsync(async (req, res, next) => {
    await User.findByIdAndUpdate(req.user.id, { active: false });

    res.status(204).json({
        status: 'success',
        data: null
    });
});

exports.createUser = (req, res) => {
    res.status(500).json({
        status: 'fail',
        message: `This route is not defined! Please use ${req.protocol}://${req.get('host')}/api/v1/users/signup instead`
    });
};

exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);
// Don't update password with this
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);