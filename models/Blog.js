const mongoose = require('mongoose');
const slugify = require('slugify');

const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'A blog must have a title'],
        unique: true,
        trim: true,
        maxlength: [100, 'A blog title must have less or equal than 100 characters'],
        minlength: [4, 'A blog title must have more or less than 4 characters']
    },
    description: {
        type: String,
        required: [true, 'A blog must have a description'],
        trim: true
    },
    slug: String,
    image: String,
    tags: [String],
    createdAt: {
        type: Date,
        default: Date.now()
    },
    users: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ]
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

blogSchema.index({ title: 1, slug: 1 });

// Virtual populate comments
blogSchema.virtual('comments', {
    ref: 'Comment',
    foreignField: 'blog',
    localField: '_id'
});

// Document midddleware
blogSchema.pre('save', function (next) {
    this.slug = slugify(this.title, { lower: true });
    next();
});

const Blog = mongoose.model('Blog', blogSchema);

module.exports = Blog;