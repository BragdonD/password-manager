/**
 * The file contains tests for the User model using Jest and Mongoose. 
 * It tests the creation of a new user with valid and invalid fields 
 * such as email, name, and password. It also tests if the password 
 * is hashed before being saved and if the email field is unique. The 
 * file sets up a test database, creates and deletes user instances, 
 * and closes the database connection after the tests are completed.
 */
const mongoose = require('mongoose');
const bcrypt = require("bcrypt");
if (process.env.NODE_ENV!== 'production') {
    require('dotenv').config({ path: `.env.dev`, override: true });
}
const User = require('./User');



// Test User model
describe('User model', () => {
  // Connect to test database before running tests
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URL_TEST || 'mongodb://localhost/testdb', { useNewUrlParser: true });
  });

  // Remove all users from the database after each test
  afterEach(async () => {
    await User.deleteMany();
  });

  // Close database connection after running all tests
  afterAll(async () => {
    await mongoose.connection.close();
  });

  // Test saving a new user to the database
  it('should save a new user to the database', async () => {
    const user = new User({
      email: 'test1@example.com',
      name: 'Test User',
      password: 'password'
    });
    const savedUser = await user.save();
    expect(savedUser._id).toBeDefined();
    expect(savedUser.email).toBe('test1@example.com');
    expect(savedUser.password).not.toBe('password');
  });
  
  // Test hashing the password before saving the user to the database
  it('should hash the password before saving the user to the database', async () => {
    const user = new User({
      email: 'test2@example.com',
      name: 'Test User',
      password: 'password'
    });
    const savedUser = await user.save();
    expect(savedUser.password).not.toBe('password');
  });

  // Test not saving a user with a duplicate email address
  it('should not save a user with a duplicate email address', async () => {
    const user1 = new User({
      email: 'test3@example.com',
      name: 'Test User 1',
      password: 'password1'
    });
    const user2 = new User({
      email: 'test3@example.com',
      name: 'Test User 2',
      password: 'password2'
    });

    await user1.save();
    await expect(user2.save()).rejects.toThrow(mongoose.Error.ValidationError);
  });

  // Test not saving a user without an email address
  it('should not save a user without an email address', async () => {
    const user = new User({
      name: 'Test User',
      password: 'password'
    });

    await expect(user.save()).rejects.toThrow(mongoose.Error.ValidationError);
  });

  // Test not saving a user without a name
  it('should not save a user without a name', async () => {
    const user = new User({
      email: 'test4@example.com',
      password: 'password'
    });

    await expect(user.save()).rejects.toThrow(mongoose.Error.ValidationError);
  });

  // Test not saving a user without a password
  it('should not save a user without a password', async () => {
    const user = new User({
      email: 'test5@example.com',
      name: 'Test User'
    });

    await expect(user.save()).rejects.toThrow(mongoose.Error.ValidationError);
  });

  // test authenticate the user
  it('should authenticate the user', async () => {
    const user = new User({
      email: 'test6@example.com',
      password: 'password',
      name: 'Test User',
    });

    await user.save();
    const auth = await user.authenticate("password");
    expect(auth).toBe(true);
  });

  // test not authenticate the user
  it('should not authenticate the user', async () => {
    const user = new User({
      email: 'test7@example.com',
      password: 'password',
      name: 'Test User',
    });

    await user.save();
    const auth = await user.authenticate("test");
    expect(auth).toBe(false);
  })

  it('should update the user password', async () => {
    const user = new User({
      email: 'test8@example.com',
      name: 'Test User',
      password: 'password123',
    });
    const newPassword = 'newPassword123';
    const currentHashedPassword = user.password;
    await user.updatePassword(newPassword);
    expect(user.password).not.toBe(currentHashedPassword);
    expect(user.password).not.toBe(newPassword);
  });

  it('should hash the password field before saving', async () => {
    const user = new User({
      name: 'John Doe',
      email: 'john.doe@example.com',
      password: 'password123'
    });
    await user.save();
    expect(user.password).not.toBe('password123');
    const passwordMatch = await bcrypt.compare('password123', user.password);
    expect(passwordMatch).toBe(true);
  });

  it('should not hash the password field if it is not modified', async () => {
    const user = new User({
      name: 'John Doe',
      email: 'john.doe2@example.com',
      password: 'password123'
    });
    await user.save();
    const originalPassword = user.password;
    user.name = 'Jane Doe';
    await user.save();
    expect(user.password).toBe(originalPassword);
  });
});