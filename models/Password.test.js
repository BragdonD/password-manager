/**
 * This test suite checks that the Password model can correctly 
 * save passwords to the database, enforce unique appnames per 
 * user, and validate that appname,
 */
const mongoose = require('mongoose');
if (process.env.NODE_ENV!== 'production') {
    require('dotenv').config({ path: `.env.dev`, override: true });
}
const User = require('./User');
const Password = require('./Password');

describe('Password model', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URL_TEST || 'mongodb://localhost/testdb', { useNewUrlParser: true });
    await User.deleteMany();
    await Password.deleteMany();
});

  afterEach(async () => {
    await Password.deleteMany();
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('should save a new password to the database', async () => {
    const user = new User({
      email: 'password@example.com',
      name: 'Test User',
      password: 'password'
    });
    const savedUser = await user.save();

    const password = new Password({
      appname: 'Test App',
      id: 'testid',
      password: 'testpassword',
      user: savedUser._id
    });

    const savedPassword = await password.save();
    expect(savedPassword._id).toBeDefined();
    expect(savedPassword.appname).toBe('Test App');
    expect(savedPassword.password).not.toBe('testpassword');
    expect(savedPassword.user).toEqual(savedUser._id);
  });

  it('should not save a password with a duplicate appname for the same user', async () => {
    const user = new User({
      email: 'password2@example.com',
      name: 'Test User',
      password: 'password'
    });
    const savedUser = await user.save();

    const password1 = new Password({
      appname: 'Test App',
      id: 'testid1',
      password: 'testpassword1',
      user: savedUser._id
    });

    const password2 = new Password({
      appname: 'Test App',
      id: 'testid2',
      password: 'testpassword2',
      user: savedUser._id
    });

    await password1.save();
    await expect(password2.save()).rejects.toThrow(mongoose.Error.ValidationError);
  });

  it('should not save a password without an appname', async () => {
    const user = new User({
      email: 'password3@example.com',
      name: 'Test User',
      password: 'password'
    });
    const savedUser = await user.save();

    const password = new Password({
      id: 'testid',
      password: 'testpassword',
      user: savedUser._id
    });

    await expect(password.save()).rejects.toThrow(mongoose.Error.ValidationError);
  });

  it('should not save a password without an id', async () => {
    const user = new User({
      email: 'password4@example.com',
      name: 'Test User',
      password: 'password'
    });
    const savedUser = await user.save();

    const password = new Password({
      appname: 'Test App',
      password: 'testpassword',
      user: savedUser._id
    });

    await expect(password.save()).rejects.toThrow(mongoose.Error.ValidationError);
  });

  it('should not save a password without a password', async () => {
    const user = new User({
      email: 'password5@example.com',
      name: 'Test User',
      password: 'password'
    });
    const savedUser = await user.save();

    const password = new Password({
      appname: 'Test App',
      id: 'testid',
      user: savedUser._id
    });

    await expect(password.save()).rejects.toThrow(mongoose.Error.ValidationError);
  });
});