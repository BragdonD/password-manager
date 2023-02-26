const mongoose = require('mongoose').set('strictQuery', false);

let db = null;
const dbUrl = process.env.MONGODB_URL || 'mongodb://127.0.0.1:27017';

try {
    db = mongoose.connect( dbUrl , {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
} catch (error) {
    console.error(error);
}

module.exports = db