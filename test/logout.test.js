const request = require('supertest');
const express = require('express');
const session = require('express-session');
const app = express();

// Mock session middleware
app.use(session({ secret: 'test', resave: false, saveUninitialized: true }));

// Mock logout route
app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send('Failed to logout');
    }
    res.redirect('/login');
  });
});

describe('Logout Route', () => {
  it('should destroy session and redirect to login', async () => {
    const response = await request(app)
      .get('/logout')
      .expect('Location', '/login')
      .expect(302);

    expect(response.status).toBe(302);
  });

  it('should handle session destruction error', async () => {
    // Create a new app instance to avoid middleware conflicts
    const appWithError = express();
    appWithError.use(session({ secret: 'test', resave: false, saveUninitialized: true }));

    // Mock session destroy to throw an error
    appWithError.use((req, res, next) => {
      req.session.destroy = (callback) => {
        callback(new Error('Destroy error'));
      };
      next();
    });

    // Mock logout route
    appWithError.get('/logout', (req, res) => {
      req.session.destroy((err) => {
        if (err) {
          return res.status(500).send('Failed to logout');
        }
        res.redirect('/login');
      });
    });

    const response = await request(appWithError)
      .get('/logout')
      .expect(500);

    expect(response.text).toBe('Failed to logout');
  });
});