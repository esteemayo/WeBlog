const express = require('express');
const authController = require('../controllers/authController');
const blogController = require('../controllers/blogController');
const commentRouter = require('./comments');

const router = express.Router();

router.use('/:blogId/comments', commentRouter);

router
    .route('/')
    .get(blogController.getAllBlogs)
    .post(
        authController.protect,
        authController.restrictTo('admin'),
        blogController.uploadBlogImage,
        blogController.resizeBlogImage,
        blogController.createBlog
    );

router
    .route('/:id')
    .get(blogController.getBlog)
    .patch(
        authController.protect,
        authController.restrictTo('admin'),
        blogController.uploadBlogImage,
        blogController.resizeBlogImage,
        blogController.updateBlog
    )
    .delete(
        authController.protect,
        authController.restrictTo('admin'),
        blogController.deleteBlog
    );

module.exports = router;