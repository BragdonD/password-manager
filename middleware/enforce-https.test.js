const requireHTTPS = require('./enforce-https');

describe('requireHTTPS middleware', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = {
      secure: false,
      hostname: 'example.com',
      originalUrl: '/path/to/resource'
    };
    res = {
      redirect: jest.fn()
    };
    next = jest.fn();
  });

  it('should redirect to HTTPS if request is not secure', () => {
    requireHTTPS(req, res, next);
    expect(res.redirect).toHaveBeenCalledWith('https://example.com/path/to/resource');
  });

  it('should call next middleware if request is secure', () => {
    req.secure = true;
    requireHTTPS(req, res, next);
    expect(next).toHaveBeenCalled();
  });
});