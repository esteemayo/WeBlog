const express = require('express');
const authController = require('../controllers/authController');
const blogController = require('../controllers/blogController');
const viewsController = require('../controllers/viewsController');

const router = express.Router();

router.get('/', authController.isLoggedIn, viewsController.getOverview);

router.get('/signup', viewsController.signup);

router.get('/login', authController.isLoggedIn, viewsController.login);

router.get('/contact', authController.isLoggedIn, viewsController.contact);

router.post('/contact', viewsController.postContactForm);

router.get('/blogs', authController.isLoggedIn, viewsController.getBlogOverview);

router.get('/blogs/add',
    authController.protect,
    authController.restrictTo('admin'),
    authController.isLoggedIn,
    viewsController.addBlog
);

router.post('/blogs/add',
    authController.protect,
    authController.restrictTo('admin'),
    blogController.uploadBlogImage,
    blogController.resizeBlogImage,
    viewsController.addBlog
);

router.get('/blogs/:id/comments', viewsController.getComments);

router.get('/blogs/:slug', authController.isLoggedIn, viewsController.blog);

router.get('/blogs/:slug/:tag', authController.isLoggedIn, viewsController.getBlogTags);

router.post('/blogs/:id/comments', authController.protect, authController.restrictTo('user'), viewsController.createComment);

router.get('/about', viewsController.about);

module.exports = router;