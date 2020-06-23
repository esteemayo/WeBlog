const express = require('express');
const authController = require('../controllers/authController');
const usersController = require('../controllers/usersController');

const router = express.Router();

router.post('/signup',
    authController.uploadUserPhoto,
    authController.resizeUserPhoto,
    authController.signup
);

router.post('/login', authController.isLoggedIn, authController.login);

router.get('/logout', authController.logout);

router.post('/forgotPassword', authController.forgotPassword);

router.post('/resetPassword/:token', authController.resetPassword);

// Protect all routes after this middleware
router.use(authController.protect);

router.patch('/updatePassword', authController.updatePassword);

router.patch('/updateMe',
    usersController.uploadUserPhoto,
    usersController.resizeUserPhoto,
    usersController.updateMe
);

router.delete('/deleteMe', usersController.deleteMe);

router.get('/me', usersController.getMe, usersController.getUser);

router.use(authController.restrictTo('admin'));

router
    .route('/')
    .get(usersController.getAllUsers)
    .post(usersController.createUser)

router
    .route('/:id')
    .get(usersController.getUser)
    .patch(usersController.updateUser)
    .delete(usersController.deleteUser);

module.exports = router;