/**
 * Assignment 2: Backend Unit Testing Integration
 * Student ID: 22201269
 * Feature: Payment Gateway & Billing Tests
 * Framework: Jest + Supertest
 */

const request = require('supertest');
const app = require('../server');
const mongoose = require('mongoose');

describe('22201269 - Payment Gateway & Billing Tests', () => {
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
    test('A1: Process payment successfully with valid card', async () => {
      const response = await request(app)
        .post('/api/billing/payment')
        .send({
          amount: 100.00,
          currency: 'USD',
          cardNumber: '4111111111111111',
          expiryMonth: 12,
          expiryYear: 2025,
          cvv: '123',
          patientId: '507f1f77bcf86cd799439011'
        })
        .expect(200);

      expect(response.body).toHaveProperty('transactionId');
      expect(response.body).toHaveProperty('status');
      expect(response.body.status).toBe('success');
    });

    test('A2: Generate billing invoice', async () => {
      const response = await request(app)
        .post('/api/billing/invoice')
        .send({
          patientId: '507f1f77bcf86cd799439011',
          consultationId: '507f1f77bcf86cd799439012',
          amount: 50.00,
          description: 'Consultation Fee'
        })
        .expect(201);

      expect(response.body).toHaveProperty('invoiceId');
      expect(response.body).toHaveProperty('amount');
      expect(response.body.amount).toBe(50.00);
    });

    test('A3: Process refund for completed payment', async () => {
      // First process a payment
      const paymentResponse = await request(app)
        .post('/api/billing/payment')
        .send({
          amount: 75.00,
          currency: 'USD',
          cardNumber: '4111111111111111',
          expiryMonth: 12,
          expiryYear: 2025,
          cvv: '123',
          patientId: '507f1f77bcf86cd799439011'
        });

      // Then refund it
      const response = await request(app)
        .post('/api/billing/refund')
        .send({
          transactionId: paymentResponse.body.transactionId,
          amount: 75.00
        })
        .expect(200);

      expect(response.body).toHaveProperty('refundId');
      expect(response.body).toHaveProperty('status');
      expect(response.body.status).toBe('refunded');
    });

    test('A4: Retrieve billing history for patient', async () => {
      const response = await request(app)
        .get('/api/billing/history/507f1f77bcf86cd799439011')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      response.body.forEach(transaction => {
        expect(transaction).toHaveProperty('transactionId');
        expect(transaction).toHaveProperty('amount');
        expect(transaction).toHaveProperty('date');
      });
    });

    test('A5: Get invoice details', async () => {
      const response = await request(app)
        .get('/api/billing/invoice/507f1f77bcf86cd799439012')
        .expect(200);

      expect(response.body).toHaveProperty('invoiceId');
      expect(response.body).toHaveProperty('patientId');
      expect(response.body).toHaveProperty('amount');
      expect(response.body).toHaveProperty('status');
    });

    test('A6: Apply discount code to billing', async () => {
      const response = await request(app)
        .post('/api/billing/discount')
        .send({
          invoiceId: '507f1f77bcf86cd799439012',
          discountCode: 'SAVE10',
          discountPercentage: 10
        })
        .expect(200);

      expect(response.body).toHaveProperty('originalAmount');
      expect(response.body).toHaveProperty('discountedAmount');
      expect(response.body.discountedAmount).toBeLessThan(response.body.originalAmount);
    });
  });

  // ========================================
  // CASE B: Negative Flow Tests (Error Handling)
  // ========================================

  describe('Case B: Negative Flow Tests', () => {
    test('B1: Payment fails with invalid card number', async () => {
      const response = await request(app)
        .post('/api/billing/payment')
        .send({
          amount: 100.00,
          currency: 'USD',
          cardNumber: '1234567890123456',
          expiryMonth: 12,
          expiryYear: 2025,
          cvv: '123'
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    test('B2: Payment fails with expired card', async () => {
      const response = await request(app)
        .post('/api/billing/payment')
        .send({
          amount: 100.00,
          currency: 'USD',
          cardNumber: '4111111111111111',
          expiryMonth: 12,
          expiryYear: 2020,
          cvv: '123'
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    test('B3: Payment fails with invalid CVV', async () => {
      const response = await request(app)
        .post('/api/billing/payment')
        .send({
          amount: 100.00,
          currency: 'USD',
          cardNumber: '4111111111111111',
          expiryMonth: 12,
          expiryYear: 2025,
          cvv: '99'
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    test('B4: Payment fails with insufficient funds', async () => {
      const response = await request(app)
        .post('/api/billing/payment')
        .send({
          amount: 50000.00,
          currency: 'USD',
          cardNumber: '4111111111111111',
          expiryMonth: 12,
          expiryYear: 2025,
          cvv: '123'
        })
        .expect(402);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('insufficient');
    });

    test('B5: Refund fails with invalid transaction ID', async () => {
      const response = await request(app)
        .post('/api/billing/refund')
        .send({
          transactionId: 'invalid_transaction_id',
          amount: 100.00
        })
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });

    test('B6: Refund fails when refund amount exceeds original amount', async () => {
      const paymentResponse = await request(app)
        .post('/api/billing/payment')
        .send({
          amount: 50.00,
          currency: 'USD',
          cardNumber: '4111111111111111',
          expiryMonth: 12,
          expiryYear: 2025,
          cvv: '123'
        });

      const response = await request(app)
        .post('/api/billing/refund')
        .send({
          transactionId: paymentResponse.body.transactionId,
          amount: 100.00
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    test('B7: Create invoice with missing required fields', async () => {
      const response = await request(app)
        .post('/api/billing/invoice')
        .send({
          patientId: '507f1f77bcf86cd799439011'
          // Missing other required fields
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    test('B8: Get billing history for non-existent patient', async () => {
      const response = await request(app)
        .get('/api/billing/history/507f1f77bcf86cd799439999')
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });

    test('B9: Get invoice for non-existent invoice', async () => {
      const response = await request(app)
        .get('/api/billing/invoice/507f1f77bcf86cd799439999')
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });

    test('B10: Apply invalid discount code', async () => {
      const response = await request(app)
        .post('/api/billing/discount')
        .send({
          invoiceId: '507f1f77bcf86cd799439012',
          discountCode: 'INVALID_CODE',
          discountPercentage: 10
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });
});
