/**
 * this example, we're testing whether the authNeeded middleware 
 * properly redirects to the /login page if the req.session.user
 * property is not defined. We're also testing whether it calls 
 * the next() middleware function if the req.session.user 
 * property exists.
 */
const authNeeded = require('./auth');

describe('authNeeded middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      session: {
        user: 'testUser'
      }
    };
    res = {
      redirect: jest.fn()
    };
    next = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should call next() if session and user exist', () => {
    authNeeded(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.redirect).not.toHaveBeenCalled();
  });

  it('should redirect to /login if session and user do not exist', () => {
    req.session.user = null;

    authNeeded(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.redirect).toHaveBeenCalledWith('/login');
  });
});