const request = require('supertest');
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const flash = require('req-flash');
const path = require('path');
const loginController = require('../src/controllers/controller-login');
const mysql = require('mysql');

jest.mock('mysql', () => {
  const mockPool = {
    getConnection: jest.fn(),
    on: jest.fn()
  };
  return {
      createPool: jest.fn().mockReturnValue(mockPool)
  };
});

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(session({ secret: 'secret', resave: false, saveUninitialized: true }));
app.use(flash());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/login', loginController.login);
app.post('/login', loginController.loginAuth);
app.get('/logout', loginController.logout);

describe('Controller Login', () => {
    let req, res, connection, pool;

    beforeEach(() => {
        req = {
            session: {},
            body: {
                username: 'admin',
                pass: 'password'
            },
            flash: jest.fn((key) => {
              switch (key) {
                  case 'color':
                      return 'color';
                  case 'status':
                      return 'status';
                  case 'message':
                      return 'message';
                  default:
                      return '';
              }
          }),
          session: {}
        };
        res = {
            render: jest.fn(),
            redirect: jest.fn(),
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
            clearCookie: jest.fn()
        };
        connection = {
            query: jest.fn(),
            release: jest.fn()
        };
        pool = mysql.createPool();
        pool.getConnection.mockImplementation((callback) => callback(null, connection));
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('MySQL Pool Error Handling', () => {
        it('harus menangani error pada pool MySQL', () => {
            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
            const error = new Error('Pool error');

            // Simulate the error event
            const errorCallback = pool.on.mock.calls.find(call => call[0] === 'error')[1];
            expect(errorCallback).toBeDefined();
            errorCallback(error);

            expect(consoleErrorSpy).toHaveBeenCalledWith(error);

            consoleErrorSpy.mockRestore();
        });
    });

    describe('GET /login', () => {
        it('harus merender halaman login', async () => {
            await loginController.login(req, res);
            expect(res.render).toHaveBeenCalledWith('login', {
                url: 'http://localhost:3000/',
                colorFlash: 'color',
                statusFlash: 'status',
                pesanFlash: 'message'
            });
        });
    });

    describe('POST /login', () => {
        it('harus mengautentikasi admin dan mengarahkan ke homeadmin', async () => {
            connection.query.mockImplementation((query, values, callback) => callback(null, [{ id_admin: 1, username: 'admin', role: 'admin', nama: 'Admin' }]));

            const res = await request(app)
                .post('/login')
                .send({
                    username: 'admin',
                    pass: 'password'
                });

            expect(res.statusCode).toEqual(302);
            expect(res.header.location).toEqual('/admin/homeadmin');
        });

        it('harus menangani kesalahan koneksi', async () => {
            pool.getConnection.mockImplementation((callback) => callback(new Error('Connection error'), null));

            const res = await request(app)
                .post('/login')
                .send({
                    username: 'admin',
                    pass: 'password'
                });

            expect(res.statusCode).toEqual(302);
            expect(res.header.location).toEqual('/login');
        });

        it('harus menangani kesalahan query', async () => {
            connection.query.mockImplementation((query, values, callback) => callback(new Error('Query error'), null));

            const res = await request(app)
                .post('/login')
                .send({
                    username: 'admin',
                    pass: 'password'
                });

            expect(res.statusCode).toEqual(302);
            expect(res.header.location).toEqual('/login');
        });

        it('harus menangani kredensial yang tidak valid', async () => {
            connection.query.mockImplementation((query, values, callback) => callback(null, []));

            const res = await request(app)
                .post('/login')
                .send({
                    username: 'admin',
                    pass: 'wrongpassword'
                });

            expect(res.statusCode).toEqual(302);
            expect(res.header.location).toEqual('/login');
        });

        it('harus menangani kredensial yang hilang', async () => {
            const res = await request(app)
                .post('/login')
                .send({
                    username: '',
                    pass: ''
                });

            expect(res.statusCode).toEqual(302);
            expect(res.header.location).toEqual('/login');
        });

        it('harus mengautentikasi user dan mengarahkan ke home user', async () => {
            connection.query
                .mockImplementationOnce((query, values, callback) => callback(null, [])) // Admin query
                .mockImplementationOnce((query, values, callback) => callback(null, [{ id_user: 1, username: 'user', nama: 'User' }])); // User query

            const res = await request(app)
                .post('/login')
                .send({
                    username: 'user',
                    pass: 'password'
                });

            expect(res.statusCode).toEqual(302);
            expect(res.header.location).toEqual('/user/home');
        });

        it('harus menangani kesalahan saat mendapatkan koneksi dari pool', async () => {
            pool.getConnection.mockImplementation((callback) => callback(new Error('Connection error'), null));

            await loginController.loginAuth(req, res);

            expect(res.redirect).toHaveBeenCalledWith('/login');
            expect(req.flash).toHaveBeenCalledWith('color', 'danger');
            expect(req.flash).toHaveBeenCalledWith('status', 'Oops..');
            expect(req.flash).toHaveBeenCalledWith('message', 'Terjadi kesalahan pada server');
        });

        it('harus menangani kesalahan saat mengeksekusi query', async () => {
            connection.query.mockImplementation((query, values, callback) => callback(new Error('Query error'), null));

            await loginController.loginAuth(req, res);

            expect(res.redirect).toHaveBeenCalledWith('/login');
            expect(req.flash).toHaveBeenCalledWith('color', 'danger');
            expect(req.flash).toHaveBeenCalledWith('status', 'Oops..');
            expect(req.flash).toHaveBeenCalledWith('message', 'Terjadi kesalahan pada server');
        });

        it('harus menangani kesalahan saat mengeksekusi query pada user login', async () => {
            connection.query
                .mockImplementationOnce((query, values, callback) => callback(null, [])) // Admin query
                .mockImplementationOnce((query, values, callback) => callback(new Error('Query error'), null)); // User query

            await loginController.loginAuth(req, res);

            expect(res.redirect).toHaveBeenCalledWith('/login');
            expect(req.flash).toHaveBeenCalledWith('color', 'danger');
            expect(req.flash).toHaveBeenCalledWith('status', 'Oops..');
            expect(req.flash).toHaveBeenCalledWith('message', 'Terjadi kesalahan pada server');
        });
    });

    describe('GET /logout', () => {
        it('harus menghapus sesi dan mengarahkan ke login', async () => {
            req.session.destroy = jest.fn((callback) => callback(null));

            await loginController.logout(req, res);

            expect(req.session.destroy).toHaveBeenCalled();
            expect(res.clearCookie).toHaveBeenCalledWith('secretname');
            expect(res.redirect).toHaveBeenCalledWith('/');
        });

        it('harus menangani kesalahan saat menghapus sesi', async () => {
            req.session.destroy = jest.fn((callback) => callback(new Error('Session error')));

            await loginController.logout(req, res);
        });
    });
});