const express = require('express');
const authController = require('../controllers/authController');
const commentController = require('../controllers/commentController');

const router = express.Router({ mergeParams: true });

router.use(authController.protect);

router
    .route('/')
    .get(
        commentController.getAllComments
    )
    .post(
        authController.restrictTo('user'),
        commentController.sendBlogUserIds,
        commentController.createComment
    );

router
    .route('/:id')
    .get(
        commentController.getComment
    )
    .patch(
        authController.restrictTo('user', 'admin'),
        commentController.updateComment
    )
    .delete(
        authController.restrictTo('user', 'admin'),
        commentController.deleteComment
    );

module.exports = router;