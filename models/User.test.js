const mongoose = require('mongoose');
if (process.env.NODE_ENV!== 'production') {
    require('dotenv').config({ path: `.env.dev`, override: true });
}
const fieldEncryption = require('mongoose-field-encryption');
const User = require('./User');

describe('User model', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URL_TEST || 'mongodb://localhost/testdb', { useNewUrlParser: true });
  });

  afterEach(async () => {
    await User.deleteMany();
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('should save a new user to the database', async () => {
    const user = new User({
      email: 'test@example.com',
      name: 'Test User',
      password: 'password'
    });
    const savedUser = await user.save();
    expect(savedUser._id).toBeDefined();
    expect(savedUser.email).toBe('test@example.com');
    expect(savedUser.password).not.toBe('password');
  });

  it('should hash the password before saving the user to the database', async () => {
    const user = new User({
      email: 'test@example.com',
      name: 'Test User',
      password: 'password'
    });
    const savedUser = await user.save();
    expect(savedUser.password).not.toBe('password');
  });

  it('should not save a user with a duplicate email address', async () => {
    const user1 = new User({
      email: 'test@example.com',
      name: 'Test User 1',
      password: 'password1'
    });
    const user2 = new User({
      email: 'test@example.com',
      name: 'Test User 2',
      password: 'password2'
    });

    await user1.save();
    await expect(user2.save()).rejects.toThrow(mongoose.Error.ValidationError);
  });

  it('should not save a user without an email address', async () => {
    const user = new User({
      name: 'Test User',
      password: 'password'
    });

    await expect(user.save()).rejects.toThrow(mongoose.Error.ValidationError);
  });

  it('should not save a user without a name', async () => {
    const user = new User({
      email: 'test@example.com',
      password: 'password'
    });

    await expect(user.save()).rejects.toThrow(mongoose.Error.ValidationError);
  });

  it('should not save a user without a password', async () => {
    const user = new User({
      email: 'test@example.com',
      name: 'Test User'
    });

    await expect(user.save()).rejects.toThrow(mongoose.Error.ValidationError);
  });
});