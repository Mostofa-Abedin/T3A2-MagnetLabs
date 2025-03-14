/* import './setup/dbSetup.js'; // Import  DB setup */
import request from 'supertest';
import { describe, it, expect, beforeAll, afterAll, afterEach, beforeEach } from 'vitest';
import app from '../../index.js';
import User from '../models/User.js';

beforeEach(async () => {
  // Create test users
  await User.create({ name: 'Admin', email: 'adminAuth@test.com', role: 'admin', password: 'password123' });
  await User.create({ name: 'Client', email: 'clientAuth@test.com', role: 'client', password: 'password123' });
});

afterEach(async () => {
  await User.deleteMany({});
})
// ------------------------------------------------------------------------------------------------------------------//
// SECTION: POST /login/ Tests
describe('POST /login', () => {
  // Commented out test until further debugging
  it('should login a new user successfully', async () => {
    const userData = {
      email: 'clientAuth@test.com',
      password: 'password123'
    };
    const res = await request(app)
    .post('/login')
    .send(userData);
    expect(res.statusCode).toBe(200);
    expect(res.body.token.startsWith('ey')).toBe(true); //  Check JWT has been generated
  }, 10000);

  it('should fail if email does not exist', async () => {
    const userData = {
      email: 'notaregister@example.com',
      password: 'securepassword123'
    };

    // Attempt to login with incorrect email
    const res = await request(app).post('/login').send(userData);
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Invalid Credentials.');
  });

  // Commented out test until further debugging
  it('should fail if incorrect password', async () => {
    const userData = {
        email: 'clientAuth@test.com',
        password: 'wrongsecurepassword123'
      };
  
    // Attempt to login with incorrect email
    const res = await request(app).post('/login').send(userData);
  
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Wrong password.');
  });
});
