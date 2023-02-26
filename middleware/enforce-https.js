function requireHTTPS(req, res, next) {
    // Check if the request was made over HTTPS

    if (!req.secure) {
      // Redirect the request to the same URL but over HTTPS
      return res.redirect(`https://${req.hostname}${req.originalUrl}`);
    }
    next();
}
  
module.exports = requireHTTPS;