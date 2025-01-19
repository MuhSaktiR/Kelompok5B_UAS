const request = require('supertest');
const express = require('express');
const session = require('express-session');
const path = require('path');
const { calculateTotalPrice, getPesanan, getDetailPesanan, konfirmasiPesanan, cancelPesanan} = require('../src/controllers/controller-pesanan');
const mysql = require('mysql');
const bodyParser = require('body-parser');

jest.mock('mysql', () => ({
    createPool: jest.fn().mockReturnValue({
        getConnection: jest.fn(),
        on: jest.fn()
    })
}));

const app = express();
app.use(express.json());
app.use(session({ secret: 'testsecret', resave: false, saveUninitialized: true }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


app.set('views', path.join(__dirname, '../src/views'));
app.set('view engine', 'ejs');

app.get('/pesanan', (req, res) => {
  getPesanan(req, res);
});

describe('Controller Pesanan', () => {
  let req, res, connection, pool;

  beforeEach(() => {
      req = {
          session: { userid: 1 },
          params: { id: 1 },
          body: {
              orderDate: '2023-01-01',
              checkInDate: '2023-01-02',
              checkOutDate: '2023-01-03',
              serviceType: 'Grooming',
              tipeLayanan: 'A',
              animalType: 'Dog',
              species: 'Bulldog',
              quantity: 1,
              phone: '08123456789',
              message: 'Please be careful',
              address: 'Jl. Kebon Jeruk',
              status: 'Pending',
              reason: 'Change of plans'
          }
      };
      res = {
          status: jest.fn().mockReturnThis(),
          send: jest.fn(),
          json: jest.fn(),
          render: jest.fn(),
          redirect: jest.fn(),
          sendStatus: jest.fn()
      };
      connection = {
          query: jest.fn(),
          release: jest.fn(),
          beginTransaction: jest.fn(),
          commit: jest.fn(),
          rollback: jest.fn()
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

          // Mengimplementasikan error handler pada pool MySQL
          const errorCallback = pool.on.mock.calls.find(call => call[0] === 'error')[1];
          expect(errorCallback).toBeDefined();
          errorCallback(error);

          expect(consoleErrorSpy).toHaveBeenCalledWith(error);

          consoleErrorSpy.mockRestore();
      });
  });

  describe('calculateTotalPrice', () => {
      it('harus mengembalikan harga yang benar untuk tipe layanan A', () => {
          const price = calculateTotalPrice('A');
          expect(price).toBe(750000.00);
      });

      it('harus mengembalikan harga yang benar untuk tipe layanan B', () => {
          const price = calculateTotalPrice('B');
          expect(price).toBe(500000.00);
      });

      it('harus mengembalikan harga yang benar untuk tipe layanan C', () => {
          const price = calculateTotalPrice('C');
          expect(price).toBe(250000.00);
      });

      it('harus mengembalikan 0 untuk tipe layanan yang tidak dikenal', () => {
          const price = calculateTotalPrice('D');
          expect(price).toBe(0);
      });
  });

  describe('getPesanan', () => {
      it('harus mengembalikan status 401 jika userId tidak ada di sesi', () => {
          delete req.session.userid;
          getPesanan(req, res);
          expect(res.status).toHaveBeenCalledWith(401);
          expect(res.send).toHaveBeenCalledWith('Unauthorized: User ID is missing in session');
      });

      it('harus mengembalikan status 500 jika terjadi kesalahan koneksi', () => {
          pool.getConnection.mockImplementationOnce((callback) => callback(new Error('Connection error'), null));
          getPesanan(req, res);
          expect(res.status).toHaveBeenCalledWith(500);
          expect(res.send).toHaveBeenCalledWith('Internal Server Error');
      });

      it('harus mengembalikan status 500 jika terjadi kesalahan query', () => {
          connection.query.mockImplementationOnce((query, values, callback) => callback(new Error('Query error'), null));
          getPesanan(req, res);
          expect(connection.release).toHaveBeenCalled();
          expect(res.status).toHaveBeenCalledWith(500);
          expect(res.send).toHaveBeenCalledWith('Internal Server Error');
      });

      it('harus merender halaman pesanan dengan data pesanan', () => {
          const mockResults = [{ id_pesanan: 1, total_harga: 100 }];
          connection.query.mockImplementationOnce((query, values, callback) => callback(null, mockResults));
          getPesanan(req, res);
          expect(connection.release).toHaveBeenCalled();
          expect(res.render).toHaveBeenCalledWith('pesanan', {
              url: 'http://localhost:3000/',
              pesanan: mockResults,
              showNavbar: true,
              currentPage: 'pesanan'
          });
      });
  });

  describe('getDetailPesanan', () => {
      it('harus mengembalikan status 401 jika userId tidak ada di sesi', () => {
          delete req.session.userid;
          getDetailPesanan(req, res);
          expect(res.status).toHaveBeenCalledWith(401);
          expect(res.send).toHaveBeenCalledWith('Unauthorized: User ID is missing in session');
      });

      it('harus mengembalikan status 400 jika orderId tidak ada di parameter', () => {
          delete req.params.id;
          getDetailPesanan(req, res);
          expect(res.status).toHaveBeenCalledWith(400);
          expect(res.send).toHaveBeenCalledWith('Bad Request: Order ID is missing');
      });

      it('harus mengembalikan status 500 jika terjadi kesalahan koneksi', () => {
          pool.getConnection.mockImplementationOnce((callback) => callback(new Error('Connection error'), null));
          getDetailPesanan(req, res);
          expect(res.status).toHaveBeenCalledWith(500);
          expect(res.send).toHaveBeenCalledWith('Internal Server Error');
      });

      it('harus mengembalikan status 500 jika terjadi kesalahan query', () => {
          connection.query.mockImplementationOnce((query, values, callback) => callback(new Error('Query error'), null));
          getDetailPesanan(req, res);
          expect(connection.release).toHaveBeenCalled();
          expect(res.status).toHaveBeenCalledWith(500);
          expect(res.send).toHaveBeenCalledWith('Internal Server Error');
      });

      it('harus mengembalikan status 404 jika pesanan tidak ditemukan', () => {
          connection.query.mockImplementationOnce((query, values, callback) => callback(null, []));
          getDetailPesanan(req, res);
          expect(connection.release).toHaveBeenCalled();
          expect(res.status).toHaveBeenCalledWith(404);
          expect(res.send).toHaveBeenCalledWith('Pesanan tidak ditemukan');
      });

      it('harus mengembalikan detail pesanan jika ditemukan', () => {
          const mockResult = [{ id_pesanan: 1, total_harga: 100 }];
          connection.query.mockImplementationOnce((query, values, callback) => callback(null, mockResult));
          getDetailPesanan(req, res);
          expect(connection.release).toHaveBeenCalled();
          expect(res.json).toHaveBeenCalledWith(mockResult[0]);
      });
  });

  describe('konfirmasiPesanan', () => {
    it('harus mengembalikan status 401 jika userId tidak ada di sesi', () => {
        delete req.session.userid;
        konfirmasiPesanan(req, res);
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.send).toHaveBeenCalledWith('Unauthorized: User ID is missing in session');
    });

    it('harus mengembalikan status 500 jika terjadi kesalahan koneksi', () => {
        pool.getConnection.mockImplementationOnce((callback) => callback(new Error('Connection error'), null));
        konfirmasiPesanan(req, res);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith('Internal Server Error');
    });

    it('harus mengembalikan status 500 jika terjadi kesalahan saat memulai transaksi', () => {
        connection.beginTransaction.mockImplementationOnce((callback) => callback(new Error('Transaction error')));
        konfirmasiPesanan(req, res);
        expect(connection.release).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith('Internal Server Error');
    });

    it('harus mengembalikan status 500 jika terjadi kesalahan saat memasukkan pesanan', () => {
        connection.beginTransaction.mockImplementationOnce((callback) => callback(null));
        connection.query.mockImplementationOnce((query, values, callback) => callback(new Error('Insert error')));
        connection.rollback.mockImplementationOnce((callback) => callback(null));
        konfirmasiPesanan(req, res);
        expect(connection.rollback).toHaveBeenCalled();
        expect(connection.release).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith('Internal Server Error');
    });

    it('harus mengembalikan status 500 jika terjadi kesalahan saat memasukkan detail', () => {
        connection.beginTransaction.mockImplementationOnce((callback) => callback(null));
        connection.query
            .mockImplementationOnce((query, values, callback) => callback(null, { insertId: 1 }))
            .mockImplementationOnce((query, values, callback) => callback(new Error('Insert error')));
        connection.rollback.mockImplementationOnce((callback) => callback(null));
        konfirmasiPesanan(req, res);
        expect(connection.rollback).toHaveBeenCalled();
        expect(connection.release).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith('Internal Server Error');
    });

      it('harus mengembalikan status 500 jika terjadi kesalahan saat commit transaksi', () => {
          connection.beginTransaction.mockImplementationOnce((callback) => callback(null));
          connection.query
              .mockImplementationOnce((query, values, callback) => callback(null, { insertId: 1 }))
              .mockImplementationOnce((query, values, callback) => callback(null, {}));
          connection.commit.mockImplementationOnce((callback) => callback(new Error('Commit error')));
          connection.rollback.mockImplementationOnce((callback) => callback(null));
          konfirmasiPesanan(req, res);
          expect(connection.rollback).toHaveBeenCalled();
          expect(connection.release).toHaveBeenCalled();
          expect(res.status).toHaveBeenCalledWith(500);
          expect(res.send).toHaveBeenCalledWith('Internal Server Error');
      });

      it('harus mengarahkan ke /pesanan setelah berhasil konfirmasi pesanan', () => {
          connection.beginTransaction.mockImplementationOnce((callback) => callback(null));
          connection.query
              .mockImplementationOnce((query, values, callback) => callback(null, { insertId: 1 }))
              .mockImplementationOnce((query, values, callback) => callback(null, {}));
          connection.commit.mockImplementationOnce((callback) => callback(null));
          konfirmasiPesanan(req, res);
          expect(connection.release).toHaveBeenCalled();
          expect(res.redirect).toHaveBeenCalledWith('/pesanan');
      });
  });

  describe('cancelPesanan', () => {
      it('harus mengembalikan status 401 jika userId tidak ada di sesi', () => {
          delete req.session.userid;
          cancelPesanan(req, res);
          expect(res.status).toHaveBeenCalledWith(401);
          expect(res.send).toHaveBeenCalledWith('Unauthorized: User ID is missing in session');
      });

      it('harus mengembalikan status 500 jika terjadi kesalahan koneksi', () => {
          pool.getConnection.mockImplementationOnce((callback) => callback(new Error('Connection error'), null));
          cancelPesanan(req, res);
          expect(res.status).toHaveBeenCalledWith(500);
          expect(res.send).toHaveBeenCalledWith('Internal Server Error');
      });

      it('harus mengembalikan status 500 jika terjadi kesalahan saat memulai transaksi', () => {
          connection.beginTransaction.mockImplementationOnce((callback) => callback(new Error('Transaction error')));
          cancelPesanan(req, res);
          expect(connection.release).toHaveBeenCalled();
          expect(res.status).toHaveBeenCalledWith(500);
          expect(res.send).toHaveBeenCalledWith('Internal Server Error');
      });

      it('harus mengembalikan status 500 jika terjadi kesalahan saat memperbarui pesanan', () => {
            connection.beginTransaction.mockImplementationOnce((callback) => callback(null));
            connection.query.mockImplementationOnce((query, values, callback) => callback(new Error('Update error')));
            connection.rollback.mockImplementationOnce((callback) => callback(null));
            cancelPesanan(req, res);
            expect(connection.rollback).toHaveBeenCalled();
            expect(connection.release).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith('Internal Server Error');
        });

        it('harus mengembalikan status 404 jika pesanan tidak ditemukan atau sudah dalam status pending', () => {
            connection.beginTransaction.mockImplementationOnce((callback) => callback(null));
            connection.query.mockImplementationOnce((query, values, callback) => callback(null, { affectedRows: 0 }));
            cancelPesanan(req, res);
            expect(connection.release).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.send).toHaveBeenCalledWith('Pesanan tidak ditemukan atau sudah dalam status pending');
        });

        it('harus mengembalikan status 500 jika terjadi kesalahan saat memasukkan detail', () => {
            connection.beginTransaction.mockImplementationOnce((callback) => callback(null));
            connection.query
                .mockImplementationOnce((query, values, callback) => callback(null, { affectedRows: 1 }))
                .mockImplementationOnce((query, values, callback) => callback(new Error('Insert error')));
            connection.rollback.mockImplementationOnce((callback) => callback(null));
            cancelPesanan(req, res);
            expect(connection.rollback).toHaveBeenCalled();
            expect(connection.release).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith('Internal Server Error');
        });

        it('harus mengembalikan status 500 jika terjadi kesalahan saat commit transaksi', () => {
            connection.beginTransaction.mockImplementationOnce((callback) => callback(null));
            connection.query
                .mockImplementationOnce((query, values, callback) => callback(null, { affectedRows: 1 }))
                .mockImplementationOnce((query, values, callback) => callback(null, {}));
            connection.commit.mockImplementationOnce((callback) => callback(new Error('Commit error')));
            connection.rollback.mockImplementationOnce((callback) => callback(null));
            cancelPesanan(req, res);
            expect(connection.rollback).toHaveBeenCalled();
            expect(connection.release).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith('Internal Server Error');
        });

        it('harus mengembalikan status 200 setelah berhasil membatalkan pesanan', () => {
            connection.beginTransaction.mockImplementationOnce((callback) => callback(null));
            connection.query
                .mockImplementationOnce((query, values, callback) => callback(null, { affectedRows: 1 }))
                .mockImplementationOnce((query, values, callback) => callback(null, {}));
            connection.commit.mockImplementationOnce((callback) => callback(null));
            cancelPesanan(req, res);
            expect(connection.release).toHaveBeenCalled();
            expect(res.sendStatus).toHaveBeenCalledWith(200);
        });
  });
});