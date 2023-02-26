const mongoose = require('mongoose').set('strictQuery', false);

let dbUrl = process.env.MONGODB_URL || 'mongodb://127.0.0.1:27017';

mongoose.connect( dbUrl , {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

module.exports = dbUrl