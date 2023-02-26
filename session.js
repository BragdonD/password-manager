const session = require('express-session');
const db = require('./db');
const MongoStore = require('connect-mongo');

const oneDay = 1000 * 60 * 60 * 24;

const sessionConfig = {
    secret: process.env.SESSION_SECRET || "fBkGvQjzCEwcDztxptrk",
    saveUninitialized: false,
    cookie: { maxAge: oneDay },
    resave: false,
    store: MongoStore.create({
        mongoUrl: db.url,
        autoRemove: 'interval',
        autoRemoveInterval: 10,
        touchAfter: oneDay,
        crypto: {
            secret: process.env.SESSION_SECRET || "fBkGvQjzCEwcDztxptrk"
        }
    }),
};

if (process.env.NODE_ENV === 'production') {
    sessionConfig.cookie.secure = true // serve secure cookies
}

module.exports = session(sessionConfig);