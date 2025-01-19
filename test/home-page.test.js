const request = require('supertest');
const express = require('express');
const path = require('path');
const homeController = require('../src/controllers/controller-home'); // Sesuaikan path jika diperlukan

const app = express();

// Middleware setup
app.set('views', path.join(__dirname, '../src/views'));
app.set('view engine', 'ejs');

// Routes
app.get('/home', homeController.home);

describe('Home Controller', () => {
    // Test untuk menampilkan halaman home (home)
    test('GET /home - should render homepage with correct parameters', async () => {
        const response = await request(app).get('/home');

        expect(response.status).toBe(200);
        expect(response.text).toContain('http://localhost:3000/');
        expect(response.text).toContain('nav-link active');
    });
});