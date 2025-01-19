const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const userController = require('../src/controllers/controller-user'); // Sesuaikan path jika diperlukan

// Mocking database connection
jest.mock('mysql', () => {
  const mockPool = {
    getConnection: jest.fn().mockImplementation((callback) => {
      callback(null, {
        query: jest.fn((sql, params, callback) => callback(null, { affectedRows: 1 })),
        release: jest.fn(),
      });
    }),
    on: jest.fn((event, callback) => {
      if (event === 'error') {
        callback(new Error('Mock pool error'));
      }
    }),
  };
  return {
    createPool: jest.fn().mockReturnValue(mockPool),
  };
});

const app = express();

// Middleware setup
app.use(
  session({
    resave: false,
    saveUninitialized: false,
    secret: 't@1k0ch3ng',
    name: 'secretName',
    cookie: {
      sameSite: true,
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.set('views', path.join(__dirname, '../src/views'));
app.set('view engine', 'ejs');

app.use('/public', express.static(path.join(__dirname, '../src/public')));

// Routes
app.get('/homeuser', userController.getHomeUser);

describe('User Controller - Home User', () => {
  // Test untuk menampilkan halaman home user (getHomeUser)
  test('GET /homeuser - should render home user page with correct URL and session name', async () => {
    const req = {
      session: {
        name: 'Test User'
      }
    };
    const res = {
      render: jest.fn()
    };

    userController.getHomeUser(req, res);

    // Assertions
    expect(res.render).toHaveBeenCalledWith('homeuser', {
      showNavbar: true,
      currentPage: 'homeuser',
      url: 'http://localhost:3000/',
      name: 'Test User'
    });
  });

  test('GET /homeuser - should render home user page with undefined name if no session name is present', async () => {
    const req = {
      session: {}
    };
    const res = {
      render: jest.fn()
    };

    userController.getHomeUser(req, res);

    // Assertions
    expect(res.render).toHaveBeenCalledWith('homeuser', {
      showNavbar: true,
      currentPage: 'homeuser',
      url: 'http://localhost:3000/',
      name: undefined // If no session name is present, it should render as undefined
    });
  });

  // Test untuk menangani error pada pool
  test('should handle pool error event', async () => {
    const mockPool = require('mysql').createPool();
    const errorCallback = mockPool.on.mock.calls.find(call => call[0] === 'error')[1];
    expect(errorCallback).toBeDefined();

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    errorCallback(new Error('Mock pool error'));
    expect(consoleErrorSpy).toHaveBeenCalledWith(new Error('Mock pool error'));
    consoleErrorSpy.mockRestore();
  });
});