/**
 * Assignment 2: Backend Unit Testing Integration
 * Student ID: 22201269
 * Feature: Authentication System Tests
 * Framework: Jest + Supertest
 */

const request = require('supertest');
const app = require('../server');
const mongoose = require('mongoose');

describe('22201269 - Authentication System Tests', () => {
  // Setup
  beforeAll(async () => {
    // Connect to test database if needed
  });

  afterAll(async () => {
    // Cleanup
    await mongoose.connection.close();
  });

  // ========================================
  // CASE A: Positive Flow Tests (Happy Path)
  // ========================================

  describe('Case A: Positive Flow Tests', () => {
    test('A1: User can register with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'testuser@example.com',
          password: 'TestPassword123!',
          name: 'Test User',
          role: 'patient'
        })
        .expect(201);

      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe('testuser@example.com');
    });

    test('A2: User can login with correct credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'testuser@example.com',
          password: 'TestPassword123!'
        })
        .expect(200);

      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe('testuser@example.com');
    });

    test('A3: User can validate token and retrieve user profile', async () => {
      // First login to get token
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'testuser@example.com',
          password: 'TestPassword123!'
        });

      const token = loginResponse.body.token;

      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('email');
      expect(response.body.email).toBe('testuser@example.com');
    });

    test('A4: User can refresh authentication token', async () => {
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'testuser@example.com',
          password: 'TestPassword123!'
        });

      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ token: loginResponse.body.token })
        .expect(200);

      expect(response.body).toHaveProperty('token');
      expect(response.body.token).not.toBe(loginResponse.body.token);
    });

    test('A5: User can logout successfully', async () => {
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'testuser@example.com',
          password: 'TestPassword123!'
        });

      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${loginResponse.body.token}`)
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('successfully');
    });
  });

  // ========================================
  // CASE B: Negative Flow Tests (Error Handling)
  // ========================================

  describe('Case B: Negative Flow Tests', () => {
    test('B1: Registration fails with invalid email format', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'invalid-email',
          password: 'TestPassword123!',
          name: 'Test User',
          role: 'patient'
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    test('B2: Registration fails with weak password', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'newuser@example.com',
          password: '123',
          name: 'Test User',
          role: 'patient'
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    test('B3: Registration fails with duplicate email', async () => {
      // Register first time
      await request(app)
        .post('/api/auth/register')
        .send({
          email: 'duplicate@example.com',
          password: 'TestPassword123!',
          name: 'Test User',
          role: 'patient'
        });

      // Try to register with same email
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'duplicate@example.com',
          password: 'TestPassword123!',
          name: 'Another User',
          role: 'patient'
        })
        .expect(409);

      expect(response.body).toHaveProperty('error');
    });

    test('B4: Login fails with incorrect password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'testuser@example.com',
          password: 'WrongPassword123!'
        })
        .expect(401);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Invalid');
    });

    test('B5: Login fails with non-existent user', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'TestPassword123!'
        })
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });

    test('B6: Profile access fails without token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });

    test('B7: Profile access fails with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer invalid_token_here')
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });

    test('B8: Profile access fails with expired token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c')
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });

    test('B9: Refresh fails with invalid token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ token: 'invalid_token' })
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });

    test('B10: Missing required fields in registration', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com'
          // Missing password and name
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });
});
