const request = require('supertest');
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const flash = require('req-flash');
const path = require('path');
const userController = require('../src/controllers/controller-register'); // Sesuaikan path jika diperlukan

// Mocking koneksi database
jest.mock('mysql', () => {
  const mockPool = {
    getConnection: jest.fn().mockImplementation((callback) => {
      callback(null, {
        query: jest.fn((sql, params, callback) => callback(null, { affectedRows: 1 })),
        release: jest.fn(),
      });
    }),
    on: jest.fn()
  };
  return {
    createPool: jest.fn().mockReturnValue(mockPool),
  };
});

const app = express();

// Setup Middleware
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
app.use(flash());

app.use(function (req, res, next) {
  res.setHeader(
    'Cache-Control',
    'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0'
  );
  res.setHeader('Pragma', 'no-cache');
  next();
});

app.set('views', path.join(__dirname, '../src/views'));
app.set('view engine', 'ejs');

app.use('/public', express.static(path.join(__dirname, '../src/public')));

// Routes
app.get('/register', userController.formRegister);
app.post('/register/save', userController.saveRegister);

describe('User Controller - Register', () => {
  // Test untuk menampilkan halaman registrasi (formRegister)
  test('GET /register - harus merender halaman register dengan URL yang benar', async () => {
    const response = await request(app).get('/register');

    console.log(response.text); // Tambahkan baris ini untuk debug teks respons
    expect(response.status).toBe(200);
    expect(response.text).toContain('url: "http://localhost:3000/"');
  });

  // Test untuk menangani proses registrasi (saveRegister)
  test('POST /register/save - harus memasukkan pengguna baru dan mengarahkan ke login dengan pesan flash sukses', async () => {
    const agent = request.agent(app); // Gunakan agen untuk mempertahankan cookie
    const response = await agent
      .post('/register/save')
      .send({
        name: 'Test User',
        username: 'testuser',
        pass: 'password123',
      });

    console.log(response.headers); // Tambahkan baris ini untuk debug header respons
    // Cek apakah respons mengarah ke halaman login setelah registrasi berhasil
    expect(response.status).toBe(302); // 302 menunjukkan redirect
    expect(response.headers.location).toBe('/login'); // Pastikan redirect ke halaman login
  });

  // Test jika data kurang dan registrasi gagal
  test('POST /register/save - harus mengarahkan ke halaman register jika data kurang', async () => {
    const response = await request(app).post('/register/save').send({
      name: '',
      username: 'testuser',
      pass: 'password123',
    });

    // Cek apakah redirect terjadi karena data kurang
    expect(response.status).toBe(302);
    expect(response.headers.location).toBe('/register');
  });

  // Test untuk menangani error saat koneksi database gagal
  test('POST /register/save - harus menangani kesalahan koneksi database', async () => {
    jest.mock('mysql', () => {
      return {
        createPool: jest.fn().mockReturnValue({
          getConnection: jest.fn().mockImplementation((callback) => {
            callback(new Error('Database connection error'), null);
          }),
          on: jest.fn(), // Mock metode 'on'
        }),
      };
    });

    const agent = request.agent(app); // Gunakan agen untuk mempertahankan cookie
    const response = await agent
      .post('/register/save')
      .send({
        name: 'Test User',
        username: 'testuser',
        pass: 'password123',
      });
  });

  // Test untuk menangani error saat query database gagal
  test('POST /register/save - harus menangani kesalahan query database', async () => {
    jest.mock('mysql', () => {
      return {
        createPool: jest.fn().mockReturnValue({
          getConnection: jest.fn().mockImplementation((callback) => {
            callback(null, {
              query: jest.fn((sql, params, callback) => callback(new Error('Database query error'), null)),
              release: jest.fn(),
            });
          }),
          on: jest.fn(), // Mock metode 'on'
        }),
      };
    });

    const agent = request.agent(app); // Gunakan agen untuk mempertahankan cookie
    const response = await agent
      .post('/register/save')
      .send({
        name: 'Test User',
        username: 'testuser',
        pass: 'password123',
      });
  });

  // Test untuk menangani error pada pool
  test('harus menangani event error pada pool', async () => {
    const mockPool = require('mysql').createPool();
    const errorCallback = mockPool.on.mock.calls.find(call => call[0] === 'error')[1];
    expect(errorCallback).toBeDefined();

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    errorCallback(new Error('Mock pool error'));
    expect(consoleErrorSpy).toHaveBeenCalledWith(new Error('Mock pool error'));
    consoleErrorSpy.mockRestore();
  });
});