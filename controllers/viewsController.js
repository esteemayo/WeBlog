const nodemailer = require('nodemailer');
const Blog = require('../models/Blog');
const Comment = require('../models/Comment');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getOverview = catchAsync(async (req, res, next) => {
    if (req.query.search) {
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        const blogs = await Blog.find({ 'name': regex }).limit(4);
        const recentBlogs = await Blog.find().sort({ createdAt: 'desc' }).limit(6);

        if (blogs.length < 1) {
            return next(new AppError('No request match that search query! Please try again later', 404));
        }

        res.status(200).render('overview', {
            title: 'Overview',
            blogs,
            recentBlogs
        });
    } else {
        const blogs = await Blog.find().limit(4);
        const recentBlogs = await Blog.find().sort({ createdAt: 'desc' }).limit(6);

        res.status(200).render('overview', {
            title: 'Overview',
            blogs,
            recentBlogs
        });
    }
});

exports.getBlogOverview = catchAsync(async (req, res, next) => {
    if (req.query.search) {
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        const blogs = await Blog.find({ 'name': regex }).populate({
            path: 'comments',
            fields: 'comment user blog'
        });

        if (blogs.length < 1) {
            return next(new AppError('No request match that query! Please try again later', 404));
        }

        res.status(200).render('blogOverview', {
            title: 'Blog Post',
            blogs
        });
    } else {
        const blogs = await Blog.find().populate({
            path: 'comments',
            fields: 'comment user blog'
        });
        res.status(200).render('blogOverview', {
            title: 'Blog Post',
            blogs
        });
    }
});

exports.blog = catchAsync(async (req, res, next) => {
    const blog = await Blog.findOne({ slug: req.params.slug })
        .populate({
            path: 'comments',
            fields: 'comment user blog'
        });

    const blogs = await Blog.aggregate([
        {
            $sample: { size: 5 }
        }
    ]);

    if (!blog) {
        return next(new AppError('There is no blog with that title', 404));
    }

    res.status(200).render('blog', {
        title: blog.title,
        blogs,
        blog
    });
});

exports.getBlogTags = catchAsync(async (req, res, next) => {
    const blogs = await Blog.find({ tags: req.params.tag })
        .populate({
            path: 'comments',
            fields: 'comment user blog'
        });

    res.status(200).render('blogOverview', {
        title: 'Tags',
        blogs
    });
});

exports.createComment = catchAsync(async (req, res, next) => {
    await Comment.create({
        comment: req.body.comment,
        user: req.user.id,
        blog: req.params.id
    });

    res.status(201).redirect('back');
});

exports.getComments = catchAsync(async (req, res, next) => {
    const comments = await Comment.find({ blog: req.params.id });

    res.status(200).render('comments', {
        title: '',
        comments
    });
});

exports.addBlog = catchAsync(async (req, res, next) => {
    let image;
    if (req.file) image = req.file.filename;

    const blog = await Blog.create({
        title: req.body.title,
        description: req.body.description,
        tags: req.body.tags,
        users: req.user.id,
        image
    });

    res.status(201).redirect('/blogs');
});

exports.postContactForm = catchAsync(async (req, res, next) => {
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    const mailOptions = {
        from: `${req.body.name} <${req.body.email}>`,
        to: 'support@weblog.io',
        subject: req.body.subject,
        message: `${req.body.email} says: ${req.body.message}`
    };

    await transporter.sendMail(mailOptions);

    res.status(200).redirect('/contact');
});

/*
exports.topStories = catchAsync(async (req, res, next) => {
    const blogs = await Blog.aggregate([
        {
            $sample: { size: 3 }
        }
    ]);

    res.status(200).render('blog', {
        title: '',
        blogs
    });
});
*/

exports.addBlog = (req, res) => {
    res.status(200).render('addBlog', {
        title: 'Create a new post'
    });
};

exports.signup = (req, res) => {
    res.status(200).render('signup', {
        title: 'Create your account!'
    });
};

exports.login = (req, res) => {
    res.status(200).render('login', {
        title: 'Log into your account'
    });
};

exports.contact = (req, res) => {
    res.status(200).render('contact', {
        title: 'Contact Us'
    });
};

exports.about = (req, res) => {
    res.status(200).render('about', {
        title: 'About Us'
    });
};

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};