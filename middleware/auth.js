function authNeeded(req, res, next) {
    console.log(req.session);
    if (req.session && req.session.user) {
        
        next();
    } else {
        res.redirect('/login');
    }
};

module.exports = authNeeded;