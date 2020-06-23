const multer = require('multer');
const sharp = require('sharp');
const Blog = require('../models/Blog');
const factory = require('../controllers/handlerFactory');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
// const APIFeatures = require('../utils/apiFeatures');

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

exports.uploadBlogImage = upload.single('image');

exports.resizeBlogImage = catchAsync(async (req, res, next) => {
    if (!req.file) return next();

    const id = !req.params.id ? req.user.id : req.params.id;

    req.file.filename = `blog-${id}-${Date.now()}.jpeg`;

    await sharp(req.file.buffer)
        .resize(2000, 1330)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/images/blogs/${req.file.filename}`);

    next();
});

exports.createBlog = catchAsync(async (req, res, next) => {
    let image;
    if (req.file) image = req.file.filename;
    const blog = await Blog.create({
        title: req.body.title,
        description: req.body.description,
        tags: req.body.tags,
        users: req.user.id,
        image
    });

    res.status(201).json({
        status: 'success',
        data: {
            blog
        }
    });
});

exports.updateBlog = catchAsync(async (req, res, next) => {
    let image;
    if (req.file) image = req.file.filename;

    const blog = await Blog.findByIdAndUpdate(req.params.id, {
        title: req.body.title,
        description: req.body.description,
        tags: req.body.tags,
        user: req.user.id,
        image
    }, {
        new: true,
        runValidators: true
    });

    if (!blog) {
        return next(new AppError('No blog found with that ID', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            blog
        }
    });
});

exports.getAllBlogs = factory.getAll(Blog);
exports.getBlog = factory.getOne(Blog, 'comments');
// exports.createBlog = factory.createOne(Blog);
// exports.updateBlog = factory.updateOne(Blog);
exports.deleteBlog = factory.deleteOne(Blog);