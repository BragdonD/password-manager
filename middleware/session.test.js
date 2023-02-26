/**
 * In this example, we're testing the behavior of the generateSession
 * and checkSession middleware functions using Jest. We're setting up 
 * mock request, response, and next objects to pass to the middleware 
 * functions
 */
const { generateSession, checkSession } = require('./session');

describe('Session Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      connection: {
        remoteAddress: '127.0.0.1'
      },
      headers: {
        'user-agent': 'Test User Agent'
      },
      session: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn()
    };
    next = jest.fn();
  });

  describe('generateSession', () => {
    test('should set session properties', () => {
      generateSession(req, res, next);

      expect(req.session.ip_address).toEqual('127.0.0.1');
      expect(req.session.user_agent).toEqual('Test User Agent');
      expect(typeof req.session.last_activity).toBe('number');
      expect(next).toHaveBeenCalled();
    });
  });

  describe('checkSession', () => {
    test('should call next when session is valid', () => {
      req.session = {
        ip_address: '127.0.0.1',
        user_agent: 'Test User Agent',
        last_activity: Date.now()
      };

      checkSession(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    test('should return 401 when ip_address is missing or invalid', () => {
      req.session = {
        user_agent: 'Test User Agent',
        last_activity: Date.now()
      };

      checkSession(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.send).toHaveBeenCalledWith('Invalid session');
    });

    test('should return 401 when user_agent is missing or invalid', () => {
      req.session = {
        ip_address: '127.0.0.1',
        last_activity: Date.now()
      };

      checkSession(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.send).toHaveBeenCalledWith('Invalid session');
    });

    test('should return 401 when last_activity is missing or older than SESSION_TIMEOUT', () => {
      req.session = {
        ip_address: '127.0.0.1',
        user_agent: 'Test User Agent',
        last_activity: Date.now() - 86400001 // SESSION_TIMEOUT + 1
      };

      checkSession(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.send).toHaveBeenCalledWith('Invalid session');
    });
  });
});