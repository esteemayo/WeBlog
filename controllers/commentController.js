const Comment = require('../models/Comment');
const factory = require('../controllers/handlerFactory');
// const catchAsync = require('../utils/catchAsync');
// const AppError = require('../utils/appError');

exports.sendBlogUserIds = (req, res, next) => {
    if (!req.body.blog) req.body.blog = req.params.blogId;
    if (!req.body.user) req.body.user = req.user.id;
    next();
};

exports.getAllComments = factory.getAll(Comment);
exports.getComment = factory.getOne(Comment);
exports.createComment = factory.createOne(Comment);
exports.updateComment = factory.updateOne(Comment);
exports.deleteComment = factory.deleteOne(Comment);