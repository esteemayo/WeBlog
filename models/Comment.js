const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    comment: {
        type: String
    },
    created_at: {
        type: Date,
        default: Date.now()
    },
    blog: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Blog'
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

commentSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'user',
        select: 'firstName lastName photo'
    });

    /*
    this.populate({
        path: 'blog',
        select: 'title'
    }).populate({
        path: 'user',
        select: 'firstName lastName photo'
    });
    */

    next();
});

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;