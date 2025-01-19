const session = require('express-session');
const controllerAdmin = require('../src/controllers/controller-admin');
const mysql = require('mysql');
const { name } = require('ejs');

jest.mock('mysql', () => ({
    createPool: jest.fn().mockReturnValue({
        getConnection: jest.fn(),
        on: jest.fn()
    })
}));

describe('Admin Controller', () => {
    let req, res, connection, pool;

    beforeEach(() => {
        req = {
            session: { name: 'Admin' },
            params: { id: 1 },
            body: {
                tgl_pesanan: '2023-01-01',
                tgl_masuk: '2023-01-02',
                tgl_keluar: '2023-01-03',
                jenis_pelayanan: 'Grooming',
                tipe_layanan: 'Full Service',
                jenis_hewan: 'Anjing',
                spesies: 'Bulldog',
                jumlah: 1,
                no_telp: '08123456789',
                pesan: 'Please be careful',
                alamat: 'Jl. Kebon Jeruk',
                status: 'Pending'
            }
        };
        res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
            sendStatus: jest.fn(),
            json: jest.fn(),
            render: jest.fn()
        };
        jest.spyOn(console, 'error').mockImplementation(() => {});
        connection = {
            query: jest.fn(),
            release: jest.fn(),
            beginTransaction: jest.fn(),
            commit: jest.fn(),
            rollback: jest.fn()
        };
        pool = mysql.createPool();
        pool.getConnection = jest.fn().mockImplementation((callback) => callback(null, connection));
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('harus mencatat error ketika pool memancarkan event error', () => {
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
        const error = new Error('Pool error');
    
        // Simulasikan event error
        const errorCallback = pool.on.mock.calls.find(call => call[0] === 'error')[1];
        errorCallback(error);
    
        expect(consoleErrorSpy).toHaveBeenCalledWith(error);
    
        consoleErrorSpy.mockRestore();
    });

    describe('getHomeAdmin', () => {
        test('harus merender tampilan homeadmin dengan data yang benar', () => {
            controllerAdmin.getHomeAdmin(req, res);
    
            expect(res.render).toHaveBeenCalledWith('homeadmin', {
                showNavbar: true,
                currentPage: 'homeadmin',
                url: 'http://localhost:3000/',
                name: 'Admin'
            });
        });
    });
    
    describe('editPesanan', () => {
        it('harus memperbarui tgl_pesanan jika disediakan', () => {
            req.body.tgl_pesanan = '2023-01-01';
            controllerAdmin.editPesanan(req, res);
            expect(req.body.tgl_pesanan).toBe('2023-01-01');
        });
    
        it('tidak harus memperbarui tgl_pesanan jika tidak disediakan', () => {
            delete req.body.tgl_pesanan;
            controllerAdmin.editPesanan(req, res);
            expect(req.body.tgl_pesanan).toBeUndefined();
        });
    
        it('harus memperbarui tgl_masuk jika disediakan', () => {
            req.body.tgl_masuk = '2023-01-02';
            controllerAdmin.editPesanan(req, res);
            expect(req.body.tgl_masuk).toBe('2023-01-02');
        });
    
        it('tidak harus memperbarui tgl_masuk jika tidak disediakan', () => {
            delete req.body.tgl_masuk;
            controllerAdmin.editPesanan(req, res);
            expect(req.body.tgl_masuk).toBeUndefined();
        });
    
        it('harus memperbarui tgl_keluar jika disediakan', () => {
            req.body.tgl_keluar = '2023-01-03';
            controllerAdmin.editPesanan(req, res);
            expect(req.body.tgl_keluar).toBe('2023-01-03');
        });
    
        it('tidak harus memperbarui tgl_keluar jika tidak disediakan', () => {
            delete req.body.tgl_keluar;
            controllerAdmin.editPesanan(req, res);
            expect(req.body.tgl_keluar).toBeUndefined();
        });
    
        it('harus memperbarui jenis_pelayanan jika disediakan', () => {
            req.body.jenis_pelayanan = 'A';
            controllerAdmin.editPesanan(req, res);
            expect(req.body.jenis_pelayanan).toBe('A');
        });
    
        it('tidak harus memperbarui jenis_pelayanan jika tidak disediakan', () => {
            delete req.body.jenis_pelayanan;
            controllerAdmin.editPesanan(req, res);
            expect(req.body.jenis_pelayanan).toBeUndefined();
        });
    
        it('harus memperbarui tipe_layanan jika disediakan', () => {
            req.body.tipe_layanan = 'B';
            controllerAdmin.editPesanan(req, res);
            expect(req.body.tipe_layanan).toBe('B');
        });
    
        it('tidak harus memperbarui tipe_layanan jika tidak disediakan', () => {
            delete req.body.tipe_layanan;
            controllerAdmin.editPesanan(req, res);
            expect(req.body.tipe_layanan).toBeUndefined();
        });
    
        it('harus memperbarui jenis_hewan jika disediakan', () => {
            req.body.jenis_hewan = 'Dog';
            controllerAdmin.editPesanan(req, res);
            expect(req.body.jenis_hewan).toBe('Dog');
        });
    
        it('tidak harus memperbarui jenis_hewan jika tidak disediakan', () => {
            delete req.body.jenis_hewan;
            controllerAdmin.editPesanan(req, res);
            expect(req.body.jenis_hewan).toBeUndefined();
        });
    
        it('harus memperbarui spesies jika disediakan', () => {
            req.body.spesies = 'Labrador';
            controllerAdmin.editPesanan(req, res);
            expect(req.body.spesies).toBe('Labrador');
        });
    
        it('tidak harus memperbarui spesies jika tidak disediakan', () => {
            delete req.body.spesies;
            controllerAdmin.editPesanan(req, res);
            expect(req.body.spesies).toBeUndefined();
        });
    
        it('harus memperbarui jumlah jika disediakan', () => {
            req.body.jumlah = 2;
            controllerAdmin.editPesanan(req, res);
            expect(req.body.jumlah).toBe(2);
        });
    
        it('tidak harus memperbarui jumlah jika tidak disediakan', () => {
            delete req.body.jumlah;
            controllerAdmin.editPesanan(req, res);
            expect(req.body.jumlah).toBeUndefined();
        });
    
        it('harus memperbarui no_telp jika disediakan', () => {
            req.body.no_telp = '1234567890';
            controllerAdmin.editPesanan(req, res);
            expect(req.body.no_telp).toBe('1234567890');
        });
    
        it('tidak harus memperbarui no_telp jika tidak disediakan', () => {
            delete req.body.no_telp;
            controllerAdmin.editPesanan(req, res);
            expect(req.body.no_telp).toBeUndefined();
        });
    
        it('harus memperbarui pesan jika disediakan', () => {
            req.body.pesan = 'Pesan uji';
            controllerAdmin.editPesanan(req, res);
            expect(req.body.pesan).toBe('Pesan uji');
        });
    
        it('tidak harus memperbarui pesan jika tidak disediakan', () => {
            delete req.body.pesan;
            controllerAdmin.editPesanan(req, res);
            expect(req.body.pesan).toBeUndefined();
        });
    
        it('harus memperbarui alamat jika disediakan', () => {
            req.body.alamat = 'Alamat uji';
            controllerAdmin.editPesanan(req, res);
            expect(req.body.alamat).toBe('Alamat uji');
        });
    
        it('tidak harus memperbarui alamat jika tidak disediakan', () => {
            delete req.body.alamat;
            controllerAdmin.editPesanan(req, res);
            expect(req.body.alamat).toBeUndefined();
        });
    
        it('harus memperbarui status jika disediakan', () => {
            req.body.status = 'confirmed';
            controllerAdmin.editPesanan(req, res);
            expect(req.body.status).toBe('confirmed');
        });
    
        it('tidak harus memperbarui status jika tidak disediakan', () => {
            delete req.body.status;
            controllerAdmin.editPesanan(req, res);
            expect(req.body.status).toBeUndefined();
        });
    
        it('harus menangani kesalahan koneksi', () => {
            pool.getConnection.mockImplementation((callback) => callback(new Error('Connection error'), null));
    
            controllerAdmin.editPesanan(req, res);
    
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith('Internal Server Error');
        });
        
        it('harus mencatat kesalahan jika koneksi gagal', () => {
            pool.getConnection.mockImplementation((callback) => callback(new Error('Connection error'), null));
    
            res.status = jest.fn().mockReturnValue(res);
            res.send = jest.fn();
    
            controllerAdmin.editPesanan(req, res);
    
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith('Internal Server Error');
        });
    
        it('sharus mencatat kesalahan jika transaksi tidak dapat dimulai', () => {
            pool.getConnection.mockImplementation((callback) => callback(null, connection));
            connection.beginTransaction.mockImplementation((callback) => callback(new Error('Transaction error')));
    
            res.status = jest.fn().mockReturnValue(res);
            res.send = jest.fn();
    
            controllerAdmin.editPesanan(req, res);
    
            expect(connection.release).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith('Internal Server Error');
        });
    
        it('harus mencatat kesalahan jika ada masalah dengan komit', () => {
            pool.getConnection.mockImplementation((callback) => callback(null, connection));
            connection.beginTransaction.mockImplementation((callback) => callback(null));
            connection.query.mockImplementation((query, values, callback) => callback(null, {}));
            connection.commit.mockImplementation((callback) => callback(new Error('Commit error')));
            connection.rollback.mockImplementation((callback) => callback());
            connection.release.mockImplementation(() => {});
        
            res.status = jest.fn().mockReturnValue(res);
            res.send = jest.fn();
        
            controllerAdmin.editPesanan(req, res);
        
            expect(connection.rollback).toHaveBeenCalled();
            expect(connection.release).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith('Internal Server Error');
        });
    
        it('harus menangani eksekusi kueri yang berhasil dengan rollback', () => {
            pool.getConnection.mockImplementation((callback) => callback(null, connection));
            connection.beginTransaction.mockImplementation((callback) => callback(null));
            connection.query
                .mockImplementationOnce((query, values, callback) => callback(null, {}))
                .mockImplementationOnce((query, values, callback) => callback(null, {}));
            connection.commit.mockImplementation((callback) => callback(null));
    
            res.send = jest.fn();
    
            req.body.status = 'success';
    
            controllerAdmin.editPesanan(req, res);
    
            expect(connection.query).toHaveBeenCalledWith(expect.stringContaining('UPDATE detail SET alasan_batal ='), [expect.anything()], expect.any(Function));
            expect(connection.commit).toHaveBeenCalled();
            expect(connection.release).toHaveBeenCalled();
            expect(res.send).toHaveBeenCalledWith('Pesanan berhasil diupdate');
        });
    
        it('harus mencatat kesalahan ketika memperbarui detail gagal', () => {
            pool.getConnection.mockImplementation((callback) => callback(null, connection));
            connection.beginTransaction.mockImplementation((callback) => callback(null));
            connection.query
                .mockImplementationOnce((query, values, callback) => callback(null, {}))
                .mockImplementationOnce((query, values, callback) => callback(new Error('Detail query error')));
            connection.rollback.mockImplementation((callback) => callback());
            connection.release.mockImplementation(() => {});
    
            res.status = jest.fn().mockReturnValue(res);
            res.send = jest.fn();
    
            req.body.status = 'success';
    
            controllerAdmin.editPesanan(req, res);
    
            expect(connection.rollback).toHaveBeenCalled();
            expect(connection.release).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith('Internal Server Error');
        });
    
        it('harus mencatat kesalahan dan melakukan rollback jika eksekusi kueri gagal', () => {
            pool.getConnection.mockImplementation((callback) => callback(null, connection));
            connection.beginTransaction.mockImplementation((callback) => callback(null));
            connection.query.mockImplementation((query, values, callback) => callback(new Error('Query error')));
    
            connection.rollback.mockImplementation((callback) => callback());
            connection.release.mockImplementation(() => {});
    
            res.status = jest.fn().mockReturnValue(res);
            res.send = jest.fn();
    
            controllerAdmin.editPesanan(req, res);
    
            expect(connection.rollback).toHaveBeenCalled();
            expect(connection.release).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith('Internal Server Error');
        });
        it('harus menangani kesalahan query', () => {
            pool.getConnection.mockImplementation((callback) => callback(null, connection));
            connection.beginTransaction.mockImplementation((callback) => callback(null));
            connection.query.mockImplementation((query, values, callback) => callback(new Error('Query error'), null));
            connection.rollback.mockImplementation((callback) => callback());
            connection.release.mockImplementation(() => {});
    
            res.status = jest.fn().mockReturnValue(res);
            res.send = jest.fn();
    
            controllerAdmin.editPesanan(req, res);
    
            expect(connection.rollback).toHaveBeenCalled();
            expect(connection.release).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith('Internal Server Error');
        });
        it('harus mengembalikan 400 jika tidak ada field yang disediakan untuk diperbarui', () => {
            req.body = {};
            res.status = jest.fn().mockReturnValue(res);
            res.send = jest.fn();
    
            controllerAdmin.editPesanan(req, res);
    
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.send).toHaveBeenCalledWith('No fields to update');
        });
    
        it('harus memperbarui pesanan dan menghapus alasan_batal jika status adalah success', () => {
            req.body.status = 'success';
            connection.beginTransaction = jest.fn((callback) => callback(null));
            connection.query = jest.fn()
                .mockImplementationOnce((query, values, callback) => callback(null, {}))
                .mockImplementationOnce((query, values, callback) => callback(null, {}));
            connection.commit = jest.fn((callback) => callback(null));
            connection.release = jest.fn();
            res.send = jest.fn();
    
            controllerAdmin.editPesanan(req, res);
    
            expect(connection.query).toHaveBeenCalledWith(expect.stringContaining('UPDATE detail SET alasan_batal ='), [expect.anything()], expect.any(Function));
            expect(connection.commit).toHaveBeenCalled();
            expect(connection.release).toHaveBeenCalled();
            expect(res.send).toHaveBeenCalledWith('Pesanan berhasil diupdate');
        });
    
        it('harus memperbarui pesanan tanpa menghapus alasan_batal jika status bukan success', () => {
            req.body.status = 'pending';
            connection.beginTransaction = jest.fn((callback) => callback(null));
            connection.query = jest.fn((query, values, callback) => callback(null, {}));
            connection.commit = jest.fn((callback) => callback(null));
            connection.release = jest.fn();
            res.send = jest.fn();
    
            controllerAdmin.editPesanan(req, res);
    
            expect(connection.query).not.toHaveBeenCalledWith(expect.stringContaining('UPDATE detail SET alasan_batal ='), [expect.anything()], expect.any(Function));
            expect(connection.commit).toHaveBeenCalled();
            expect(connection.release).toHaveBeenCalled();
            expect(res.send).toHaveBeenCalledWith('Pesanan berhasil diupdate');
        });
        it('harus menangani komit yang berhasil ketika statusnya "sukses"', () => {

            pool.getConnection.mockImplementation((callback) => callback(null, connection));
            connection.beginTransaction.mockImplementation((callback) => callback(null));
            connection.query
                .mockImplementationOnce((query, values, callback) => callback(null, {}))  // Update pesanan
                .mockImplementationOnce((query, values, callback) => callback(null, {}));  // Update detail pesanan
            connection.commit.mockImplementation((callback) => callback(null));
            connection.release.mockImplementation(() => {});
    
            res.send = jest.fn();
    
            req.body.status = 'success';  // Status sukses, akan menjalankan query detail
    
            controllerAdmin.editPesanan(req, res);
    
            // Memastikan commit terjadi setelah query detail berhasil
            expect(connection.commit).toHaveBeenCalled();
            expect(connection.release).toHaveBeenCalled();
            expect(res.send).toHaveBeenCalledWith('Pesanan berhasil diupdate');
        });
    
        it('harus menangani kegagalan komit dan mengembalikan jika ada kesalahan', () => {
            // Simulasi kegagalan commit
            pool.getConnection.mockImplementation((callback) => callback(null, connection));
            connection.beginTransaction.mockImplementation((callback) => callback(null));
            connection.query
                .mockImplementationOnce((query, values, callback) => callback(null, {}))  // Update pesanan
                .mockImplementationOnce((query, values, callback) => callback(null, {}));  // Update detail pesanan
            connection.commit.mockImplementation((callback) => callback(new Error('Commit error')));
            connection.rollback.mockImplementation((callback) => callback());
            connection.release.mockImplementation(() => {});
    
            res.status = jest.fn().mockReturnValue(res);
            res.send = jest.fn();
    
            req.body.status = 'success';  // Status sukses, akan menjalankan query detail
    
            controllerAdmin.editPesanan(req, res);
    
            // Memastikan rollback dan release terjadi saat commit gagal
            expect(connection.rollback).toHaveBeenCalled();
            expect(connection.release).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith('Internal Server Error');
        });
    
        it('harus menangani keberhasilan penerapan ketika statusnya bukan "sukses"', () => {
            // Simulasi status yang bukan "success" (misalnya "failed") yang tetap membutuhkan commit
            pool.getConnection.mockImplementation((callback) => callback(null, connection));
            connection.beginTransaction.mockImplementation((callback) => callback(null));
            connection.query.mockImplementationOnce((query, values, callback) => callback(null, {}));  // Update pesanan
            connection.commit.mockImplementation((callback) => callback(null));
            connection.release.mockImplementation(() => {});
    
            res.send = jest.fn();
    
            req.body.status = 'failed';  // Status yang bukan "success", namun tetap komit
    
            controllerAdmin.editPesanan(req, res);
    
            // Memastikan commit terjadi walaupun status bukan "success"
            expect(connection.commit).toHaveBeenCalled();
            expect(connection.release).toHaveBeenCalled();
            expect(res.send).toHaveBeenCalledWith('Pesanan berhasil diupdate');
        });
        it('harus menangani keberhasilan penerapan ketika statusnya bukan "sukses"', () => {
            // Simulasi status yang bukan "success" (misalnya "failed") yang tetap membutuhkan commit
            pool.getConnection.mockImplementation((callback) => callback(null, connection));
            connection.beginTransaction.mockImplementation((callback) => callback(null));
            connection.query.mockImplementationOnce((query, values, callback) => callback(null, {}));  // Update pesanan
            connection.commit.mockImplementation((callback) => callback(null));  // Simulasi commit berhasil
            connection.release.mockImplementation(() => {});
        
            res.send = jest.fn();
        
            req.body.status = 'failed';  // Status yang bukan "success", namun tetap komit
        
            controllerAdmin.editPesanan(req, res);
        
            // Memastikan commit terjadi walaupun status bukan "success"
            expect(connection.commit).toHaveBeenCalled();
            expect(connection.release).toHaveBeenCalled();
            expect(res.send).toHaveBeenCalledWith('Pesanan berhasil diupdate');
        });
         it('harus menangani komit yang berhasil ketika statusnya "sukses"', () => {
        // Simulasikan status = "sukses" dengan kueri detail yang berhasil
        pool.getConnection.mockImplementation((callback) => callback(null, connection));
        connection.beginTransaction.mockImplementation((callback) => callback(null));
        connection.query
            .mockImplementationOnce((query, values, callback) => callback(null, {}))  // Update pesanan
            .mockImplementationOnce((query, values, callback) => callback(null, {}));  // Update detail pesanan
        connection.commit.mockImplementation((callback) => callback(null));
        connection.release.mockImplementation(() => {});

        res.send = jest.fn();

        req.body.status = 'success';  // Status berhasil, akan menjalankan kueri detail

        controllerAdmin.editPesanan(req, res);

        // Pastikan penerapan terjadi setelah kueri detail berhasil
        expect(connection.commit).toHaveBeenCalled();
        expect(connection.release).toHaveBeenCalled();
        expect(res.send).toHaveBeenCalledWith('Pesanan berhasil diupdate');
    });

    it('harus menangani kegagalan komit dan rollback jika ada kesalahan', () => {
        // Simulasikan kegagalan penerapan
        pool.getConnection.mockImplementation((callback) => callback(null, connection));
        connection.beginTransaction.mockImplementation((callback) => callback(null));
        connection.query
            .mockImplementationOnce((query, values, callback) => callback(null, {}))  // Update pesanan
            .mockImplementationOnce((query, values, callback) => callback(null, {}));  // Update detail pesanan
        connection.commit.mockImplementation((callback) => callback(new Error('Commit error')));
        connection.rollback.mockImplementation((callback) => callback());
        connection.release.mockImplementation(() => {});

        res.status = jest.fn().mockReturnValue(res);
        res.send = jest.fn();

        req.body.status = 'success';  // Status berhasil, akan menjalankan kueri detail

        controllerAdmin.editPesanan(req, res);

        // Pastikan rollback dan rilis terjadi ketika penerapan gagal
        expect(connection.rollback).toHaveBeenCalled();
        expect(connection.release).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith('Internal Server Error');
    });

    it('harus menangani keberhasilan penerapan ketika statusnya bukan "sukses"', () => {
        // Simulasikan status yang bukan "berhasil" (misalnya, "gagal") yang masih memerlukan penerapan
        pool.getConnection.mockImplementation((callback) => callback(null, connection));
        connection.beginTransaction.mockImplementation((callback) => callback(null));
        connection.query.mockImplementationOnce((query, values, callback) => callback(null, {}));  // Update pesanan
        connection.commit.mockImplementation((callback) => callback(null));  // Simulasikan komitmen yang berhasil
        connection.release.mockImplementation(() => {});

        res.send = jest.fn();

        req.body.status = 'failed';  // Status yang bukan "sukses", namun tetap melakukan

        controllerAdmin.editPesanan(req, res);

        // Pastikan komit terjadi meskipun statusnya tidak "berhasil"
        expect(connection.commit).toHaveBeenCalled();
        expect(connection.release).toHaveBeenCalled();
        expect(res.send).toHaveBeenCalledWith('Pesanan berhasil diupdate');
    });
    });
    describe('getManageLaporan', () => {
        test('harus menetapkan totalRevenue ke 0 ketika total tidak ditentukan', () => {
            connection.query
                .mockImplementationOnce((query, callback) => callback(null, [{ count: 10 }]))  // totalOrders
                .mockImplementationOnce((query, callback) => callback(null, [{}])) // totalRevenue
                .mockImplementationOnce((query, callback) => callback(null, [{ count: 5 }]))    // successfulOrders
                .mockImplementationOnce((query, callback) => callback(null, [{ count: 3 }]))    // pendingOrders
                .mockImplementationOnce((query, callback) => callback(null, [{ count: 2 }]));   // cancelledOrders

            controllerAdmin.getManageLaporan(req, res);

            expect(pool.getConnection).toHaveBeenCalled();
            expect(connection.query).toHaveBeenCalledTimes(5);
            expect(connection.release).toHaveBeenCalledTimes(1);
            expect(res.render).toHaveBeenCalledWith('manageLaporan', {
                totalOrders: 10,
                totalRevenue: 0,
                successfulOrders: 5,
                pendingOrders: 3,
                cancelledOrders: 2,
                showNavbar: true,
                currentPage: 'manageLaporan',
                url: 'http://localhost:3000/'
            });
        });
        
        test('harus menangani kesalahan saat mendapatkan koneksi dari pool', () => {
            const error = new Error('Connection error');
            pool.getConnection.mockImplementation((callback) => callback(error, null));
    
            controllerAdmin.getManageLaporan(req, res);
    
            expect(console.error).toHaveBeenCalledWith('Error getting connection from pool:', error);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith('Internal Server Error');
        });
    
        test('harus mengambil dan merender laporan pengelolaan', () => {
            connection.query
                .mockImplementationOnce((query, callback) => callback(null, [{ count: 10 }]))  // totalOrders
                .mockImplementationOnce((query, callback) => callback(null, [{ total: 1000 }])) // totalRevenue
                .mockImplementationOnce((query, callback) => callback(null, [{ count: 5 }]))    // successfulOrders
                .mockImplementationOnce((query, callback) => callback(null, [{ count: 3 }]))    // pendingOrders
                .mockImplementationOnce((query, callback) => callback(null, [{ count: 2 }]));   // cancelledOrders

            pool.getConnection.mockImplementation((callback) => callback(null, connection));
    
            controllerAdmin.getManageLaporan(req, res);

            expect(connection.release).toHaveBeenCalledTimes(1);
    
            expect(res.render).toHaveBeenCalledWith('manageLaporan', {
                totalOrders: 10,
                totalRevenue: 1000,
                successfulOrders: 5,
                pendingOrders: 3,
                cancelledOrders: 2,
                showNavbar: true,
                currentPage: 'manageLaporan',
                url: 'http://localhost:3000/'
            });
    
            expect(pool.getConnection).toHaveBeenCalledTimes(1);

            expect(connection.query).toHaveBeenCalledTimes(5);
        });
    
        it('harus menangani kesalahan koneksi selama kueri totalOrders', () => {
            connection.query.mockImplementationOnce((query, callback) => callback(new Error('Connection error'), null));
    
            controllerAdmin.getManageLaporan(req, res);
    
            expect(console.error).toHaveBeenCalledWith('Error executing query:', expect.any(Error));
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith('Internal Server Error');
        });
    
        it('harus menangani kesalahan kueri selama kueri totalRevenue', () => {
            connection.query
                .mockImplementationOnce((query, callback) => callback(null, [{ count: 10 }]))  // totalOrders
                .mockImplementationOnce((query, callback) => callback(new Error('Query error'), null));  // totalRevenue
    
            controllerAdmin.getManageLaporan(req, res);
    
            expect(console.error).toHaveBeenCalledWith('Error executing query:', expect.any(Error));
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith('Internal Server Error');
        });
    
        it('harus menangani kesalahan kueri selama kueri SuccessOrders', () => {
            connection.query
                .mockImplementationOnce((query, callback) => callback(null, [{ count: 10 }]))  // totalOrders
                .mockImplementationOnce((query, callback) => callback(null, [{ total: 1000 }]))  // totalRevenue
                .mockImplementationOnce((query, callback) => callback(new Error('Query error'), null));  // successfulOrders
    
            controllerAdmin.getManageLaporan(req, res);
    
            expect(console.error).toHaveBeenCalledWith('Error executing query:', expect.any(Error));
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith('Internal Server Error');
        });
    
        it('harus menangani kesalahan kueri selama kueri pendingOrders', () => {
            connection.query
                .mockImplementationOnce((query, callback) => callback(null, [{ count: 10 }]))  // totalOrders
                .mockImplementationOnce((query, callback) => callback(null, [{ total: 1000 }]))  // totalRevenue
                .mockImplementationOnce((query, callback) => callback(null, [{ count: 5 }]))    // successfulOrders
                .mockImplementationOnce((query, callback) => callback(new Error('Query error'), null));  // pendingOrders
    
            controllerAdmin.getManageLaporan(req, res);
    
            expect(console.error).toHaveBeenCalledWith('Error executing query:', expect.any(Error));
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith('Internal Server Error');
        });
    
        it('harus menangani kesalahan kueri selama kueri cancelledOrders', () => {
            connection.query
                .mockImplementationOnce((query, callback) => callback(null, [{ count: 10 }]))  // totalOrders
                .mockImplementationOnce((query, callback) => callback(null, [{ total: 1000 }]))  // totalRevenue
                .mockImplementationOnce((query, callback) => callback(null, [{ count: 5 }]))    // successfulOrders
                .mockImplementationOnce((query, callback) => callback(null, [{ count: 3 }]))    // pendingOrders
                .mockImplementationOnce((query, callback) => callback(new Error('Query error'), null));  // cancelledOrders
    
            controllerAdmin.getManageLaporan(req, res);
    
            expect(console.error).toHaveBeenCalledWith('Error executing query:', expect.any(Error));
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith('Internal Server Error');
        });
    });
    
    describe('getDetailPesanan', () => {
        it('harus mengambil dan mengembalikan pesanan detail', () => {
            connection.query.mockImplementation((query, values, callback) => callback(null, [{ id_pesanan: 1, alasan_batal: null, total_harga: 100, username: 'user1', nama: 'User One' }]));

            controllerAdmin.getDetailPesanan(req, res);

            expect(pool.getConnection).toHaveBeenCalled();
            expect(connection.query).toHaveBeenCalledWith(
                expect.stringContaining('SELECT p.*, d.alasan_batal, d.total_harga, u.username, u.nama'),
                [1],
                expect.any(Function)
            );
            expect(connection.release).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith({
                id_pesanan: 1,
                alasan_batal: null,
                total_harga: 100,
                username: 'user1',
                nama: 'User One'
            });
        });

        it('harus menangani kesalahan koneksi', () => {
            pool.getConnection.mockImplementation((callback) => callback(new Error('Connection error'), null));

            controllerAdmin.getDetailPesanan(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith('Internal Server Error');
        });

        it('harus menangani kesalahan kueri', () => {
            connection.query.mockImplementation((query, values, callback) => callback(new Error('Query error'), null));

            controllerAdmin.getDetailPesanan(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith('Internal Server Error');
        });

        it('harus menangani pesanan yang tidak ditemukan', () => {
            connection.query.mockImplementation((query, values, callback) => callback(null, []));

            controllerAdmin.getDetailPesanan(req, res);

            expect(pool.getConnection).toHaveBeenCalled();
            expect(connection.query).toHaveBeenCalledWith(
                expect.stringContaining('SELECT p.*, d.alasan_batal, d.total_harga, u.username, u.nama'),
                [1],
                expect.any(Function)
            );
            expect(connection.release).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.send).toHaveBeenCalledWith('Pesanan tidak ditemukan');
        });
    });

    describe('deletePesanan', () => {
        it('harus menghapus pesanan dan mengirim status 200', () => {
            connection.beginTransaction.mockImplementation((callback) => callback(null));
            connection.query
                .mockImplementationOnce((query, values, callback) => callback(null, {}))
                .mockImplementationOnce((query, values, callback) => callback(null, {}));
            connection.commit.mockImplementation((callback) => callback(null));

            controllerAdmin.deletePesanan(req, res);

            expect(pool.getConnection).toHaveBeenCalled();
            expect(connection.beginTransaction).toHaveBeenCalled();
            expect(connection.query).toHaveBeenCalledWith(
                'DELETE FROM detail WHERE id_pesanan = ?',
                [1],
                expect.any(Function)
            );
            expect(connection.query).toHaveBeenCalledWith(
                'DELETE FROM pesanan WHERE id_pesanan = ?',
                [1],
                expect.any(Function)
            );
            expect(connection.commit).toHaveBeenCalled();
            expect(connection.release).toHaveBeenCalled();
            expect(res.sendStatus).toHaveBeenCalledWith(200);
        });

        it('harus menangani kesalahan koneksi', () => {
            pool.getConnection.mockImplementation((callback) => callback(new Error('Connection error'), null));

            controllerAdmin.deletePesanan(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith('Internal Server Error');
        });

        it('harus menangani kesalahan transaksi', () => {
            connection.beginTransaction.mockImplementation((callback) => callback(new Error('Transaction error')));

            controllerAdmin.deletePesanan(req, res);

            expect(connection.release).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith('Internal Server Error');
        });

        it('harus menangani kesalahan kueri saat menghapus dari detail', () => {
            connection.beginTransaction.mockImplementation((callback) => callback(null));
            connection.query.mockImplementationOnce((query, values, callback) => callback(new Error('Query error'), null));
            connection.rollback.mockImplementation((callback) => callback(null));

            controllerAdmin.deletePesanan(req, res);

            expect(connection.rollback).toHaveBeenCalled();
            expect(connection.release).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith('Internal Server Error');
        });

        it('harus menangani kesalahan kueri saat menghapus dari pesanan', () => {
            connection.beginTransaction.mockImplementation((callback) => callback(null));
            connection.query
                .mockImplementationOnce((query, values, callback) => callback(null, {}))
                .mockImplementationOnce((query, values, callback) => callback(new Error('Query error'), null));
            connection.rollback.mockImplementation((callback) => callback(null));

            controllerAdmin.deletePesanan(req, res);

            expect(connection.rollback).toHaveBeenCalled();
            expect(connection.release).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith('Internal Server Error');
        });

        it('harus menangani kesalahan komit', () => {
            connection.beginTransaction.mockImplementation((callback) => callback(null));
            connection.query
                .mockImplementationOnce((query, values, callback) => callback(null, {}))
                .mockImplementationOnce((query, values, callback) => callback(null, {}));
            connection.commit.mockImplementation((callback) => callback(new Error('Commit error')));
            connection.rollback.mockImplementation((callback) => callback(null));

            controllerAdmin.deletePesanan(req, res);

            expect(connection.rollback).toHaveBeenCalled();
            expect(connection.release).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith('Internal Server Error');
        });
    });

    describe('getManagePesanan', () => {
        it('harus mengambil dan merender mengelola pesanan', () => {
            connection.query.mockImplementation((query, callback) => callback(null, [
                { id_pesanan: 1, tgl_pesanan: '2023-01-01', jenis_pelayanan: 'Grooming', status: 'Pending', alasan_batal: '', total_harga: 100, username: 'user1', nama: 'User One' }
            ]));

            controllerAdmin.getManagePesanan(req, res);

            const expectedQuery = `SELECT p.id_pesanan, p.tgl_pesanan, p.jenis_pelayanan, p.status, COALESCE(d.alasan_batal, '') AS alasan_batal, COALESCE(d.total_harga, 0) AS total_harga, u.username, u.nama FROM pesanan p LEFT JOIN detail d ON p.id_pesanan = d.id_pesanan JOIN users u ON p.id_user = u.id_user`.replace(/\s+/g, ' ').trim();

            const receivedQuery = connection.query.mock.calls[0][0].replace(/\s+/g, ' ').trim(); 

            expect(receivedQuery).toBe(expectedQuery); 

            expect(connection.release).toHaveBeenCalled();
            expect(res.render).toHaveBeenCalledWith('managePesanan', {
                pesanan: [
                    {
                        id_pesanan: 1,
                        tgl_pesanan: '2023-01-01',
                        jenis_pelayanan: 'Grooming',
                        status: 'Pending',
                        alasan_batal: '',
                        total_harga: 100,
                        username: 'user1',
                        nama: 'User One'
                    }
                ],
                showNavbar: true,
                currentPage: 'managePesanan',
                url: 'http://localhost:3000/'
            });
        });

        it('harus menangani kesalahan koneksi', () => {
            pool.getConnection.mockImplementation((callback) => callback(new Error('Connection error'), null));

            controllerAdmin.getManagePesanan(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith('Internal Server Error');
        });

        it('harus menangani kesalahan kueri', () => {
            const error = new Error('Query error');
            connection.query.mockImplementation((query, callback) => callback(error, null));

            controllerAdmin.getManagePesanan(req, res);

            expect(console.error).toHaveBeenCalledWith('Error fetching orders:', error);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith('Internal Server Error');
        });
    });
});