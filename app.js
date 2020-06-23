const express = require('express');

// const faker = require('faker');

const app = express();

require('./startup/routes')(app);

// console.log(`${faker.name.firstName()} ${faker.name.lastName()}`);

module.exports = app;