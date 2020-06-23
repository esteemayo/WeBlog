const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
// const faker = require('faker');

const Blog = require('../../models/Blog');
const User = require('../../models/User');
const Comment = require('../../models/Comment');

dotenv.config({ path: './config.env' });

/*
const DB = process.env.DATABASE_LOCAL;

mongoose.connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
})
    .then(con => {
        // console.log(con.connections);
        console.log('MongoDB Connected...');
    })
    .catch(err => console.log(`COULD NOT CONNECT TO MONGODB: ${err}`));

*/

require('../../startup/db')();

const blogs = JSON.parse(fs.readFileSync(`${__dirname}/blogs.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const comments = JSON.parse(fs.readFileSync(`${__dirname}/comments.json`, 'utf-8'));

const importData = async () => {
    try {
        await Blog.create(blogs);
        await User.create(users, { validateBeforeSave: false });
        await Comment.create(comments);
        console.log('Data successfully loaded!');
        process.exit();
    } catch (err) {
        console.log(err);
    }
};

const deleteData = async () => {
    try {
        await Blog.deleteMany();
        await User.deleteMany();
        await Comment.deleteMany();
        console.log('Data successfully deleted!');
    } catch (err) {
        console.log(err);
    }
    process.exit();
};

if (process.argv[2] === '--import') {
    importData();
} else if (process.argv[2] === '--delete') {
    deleteData();
}

console.log(process.argv);