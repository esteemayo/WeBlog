const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE_LOCAL;

module.exports = () => {
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
};