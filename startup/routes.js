const express = require('express');
const path = require('path');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');

// const faker = require('faker');

const AppError = require('../utils/appError');
const globalErrorHandler = require('../controllers/errorController');
const blogRoute = require('../routes/blog');
const userRoute = require('../routes/users');
const commentRoute = require('../routes/comments');
const viewRoute = require('../routes/view');

module.exports = app => {
    app.set('view engine', 'pug');
    app.set('views', path.join(`${__dirname}/../views`));

    // console.log(`${faker.name.firstName()} ${faker.name.lastName()}`);

    // GLOBAL MIDDLEWARE

    // Serving static files
    app.use(express.static(path.join(`${__dirname}/../public`)));

    // Set security HTTP headers
    app.use(helmet());

    // Development logging
    if (process.env.NODE_ENV === 'development') {
        app.use(morgan('dev'));
    }

    // Limit request from same API
    const limiter = rateLimit({
        max: 100,
        windowMs: 60 * 60 * 1000, // 1 Hour
        message: 'Too many requests from this IP, Please try again in an hour!'
    });

    app.use('/api', limiter);

    // Express body parser
    app.use(express.json({ limit: '10kb' }));
    app.use(express.urlencoded({ extended: true, limit: '10kb' }));

    // Cookie parser middleware
    app.use(cookieParser());

    // Data sanitization against NoSQL query injection
    app.use(mongoSanitize());

    // Data sanitization against XSS
    app.use(xss());

    // Prevent parameter pollution
    app.use(hpp({
        whitelist: [
            'title',
            'description',
            'tags',
            'slug'
        ]
    }));

    app.use((req, res, next) => {
        res.locals.page = req.originalUrl;
        next();
    });

    // Test middleware
    app.use((req, res, next) => {
        req.requestTime = new Date().toISOString();
        // console.log(req.headers);
        // console.log(req.cookies);
        next();
    });

    app.use('/', viewRoute);
    app.use('/api/v1/blogs', blogRoute);
    app.use('/api/v1/users', userRoute);
    app.use('/api/v1/comments', commentRoute);

    app.all('*', (req, res, next) => {
        return next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
    });

    app.use(globalErrorHandler);
};