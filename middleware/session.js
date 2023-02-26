function generateSession(req, res, next) {
    req.session.ip_address = req.connection.remoteAddress;
    req.session.user_agent = req.headers['user-agent'];
    req.session.last_activity = Date.now();
    next();
}

function checkSession(req, res, next) {
    const { ip_address, user_agent, last_activity } = req.session;
    const current_ip_address = req.connection.remoteAddress;
    const current_user_agent = req.headers['user-agent'];
    const current_last_activity = Date.now();
  
    // Check if any of the session parameters are missing or invalid
    if (!ip_address || ip_address !== current_ip_address ||
        !user_agent || user_agent !== current_user_agent ||
        !last_activity || current_last_activity - last_activity > (process.env.SESSION_TIMEOUT || 86400000)) {
      // Invalid session
      return res.status(401).send('Invalid session');
    }
  
    // Session is valid
    next();
}

module.exports = {
    generateSession: generateSession,
    checkSession: checkSession
};