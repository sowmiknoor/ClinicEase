/**
 * Assignment 2: Backend Unit Testing Integration
 * Student ID: 22201269
 * Feature: Product Catalog (Medicines) Tests
 * Framework: Jest + Supertest
 */

const request = require('supertest');
const app = require('../server');
const mongoose = require('mongoose');

describe('22201269 - Product Catalog (Medicines) Tests', () => {
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
    test('A1: Get all medicines with pagination', async () => {
      const response = await request(app)
        .get('/api/medications?page=1&limit=10')
        .expect(200);

      expect(Array.isArray(response.body.medicines)).toBe(true);
      expect(response.body).toHaveProperty('totalCount');
      expect(response.body).toHaveProperty('totalPages');
    });

    test('A2: Get single medicine by ID', async () => {
      const response = await request(app)
        .get('/api/medications/507f1f77bcf86cd799439011')
        .expect(200);

      expect(response.body).toHaveProperty('name');
      expect(response.body).toHaveProperty('genericName');
      expect(response.body).toHaveProperty('price');
    });

    test('A3: Create new medicine with valid data', async () => {
      const response = await request(app)
        .post('/api/medications')
        .send({
          name: 'Aspirin',
          genericName: 'Acetylsalicylic Acid',
          manufacturer: 'Bayer',
          price: 5.99,
          quantity: 1000,
          dosage: '500mg',
          description: 'Pain reliever'
        })
        .expect(201);

      expect(response.body).toHaveProperty('_id');
      expect(response.body.name).toBe('Aspirin');
    });

    test('A4: Update medicine details', async () => {
      const response = await request(app)
        .put('/api/medications/507f1f77bcf86cd799439011')
        .send({
          price: 6.99,
          quantity: 500
        })
        .expect(200);

      expect(response.body.price).toBe(6.99);
      expect(response.body.quantity).toBe(500);
    });

    test('A5: Delete medicine', async () => {
      const response = await request(app)
        .delete('/api/medications/507f1f77bcf86cd799439011')
        .expect(200);

      expect(response.body).toHaveProperty('message');
    });

    test('A6: Search medicines by name', async () => {
      const response = await request(app)
        .get('/api/medications/search?q=paracetamol')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    test('A7: Filter medicines by price range', async () => {
      const response = await request(app)
        .get('/api/medications/filter?minPrice=5&maxPrice=50')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      response.body.forEach(medicine => {
        expect(medicine.price).toBeGreaterThanOrEqual(5);
        expect(medicine.price).toBeLessThanOrEqual(50);
      });
    });
  });

  // ========================================
  // CASE B: Negative Flow Tests (Error Handling)
  // ========================================

  describe('Case B: Negative Flow Tests', () => {
    test('B1: Get medicine with invalid ID format', async () => {
      const response = await request(app)
        .get('/api/medications/invalid_id')
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    test('B2: Get non-existent medicine', async () => {
      const response = await request(app)
        .get('/api/medications/507f1f77bcf86cd799439999')
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });

    test('B3: Create medicine with missing required fields', async () => {
      const response = await request(app)
        .post('/api/medications')
        .send({
          name: 'Aspirin'
          // Missing other required fields
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    test('B4: Create medicine with invalid price', async () => {
      const response = await request(app)
        .post('/api/medications')
        .send({
          name: 'Aspirin',
          genericName: 'Acetylsalicylic Acid',
          price: -10,
          quantity: 100
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    test('B5: Create medicine with duplicate name', async () => {
      // Create first medicine
      await request(app)
        .post('/api/medications')
        .send({
          name: 'Unique Medicine',
          genericName: 'Generic Name',
          price: 10.00,
          quantity: 100
        });

      // Try to create duplicate
      const response = await request(app)
        .post('/api/medications')
        .send({
          name: 'Unique Medicine',
          genericName: 'Another Generic',
          price: 15.00,
          quantity: 200
        })
        .expect(409);

      expect(response.body).toHaveProperty('error');
    });

    test('B6: Update non-existent medicine', async () => {
      const response = await request(app)
        .put('/api/medications/507f1f77bcf86cd799439999')
        .send({ price: 20.00 })
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });

    test('B7: Update with invalid data', async () => {
      const response = await request(app)
        .put('/api/medications/507f1f77bcf86cd799439011')
        .send({ price: 'invalid_price' })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    test('B8: Delete non-existent medicine', async () => {
      const response = await request(app)
        .delete('/api/medications/507f1f77bcf86cd799439999')
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });

    test('B9: Search with empty query', async () => {
      const response = await request(app)
        .get('/api/medications/search?q=')
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    test('B10: Filter with invalid price range', async () => {
      const response = await request(app)
        .get('/api/medications/filter?minPrice=100&maxPrice=10')
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });
});
