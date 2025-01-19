const config = require('../configs/database');
let mysql = require('mysql');
let pool = mysql.createPool(config);

pool.on('error', (err) => {
    console.error(err);
});

module.exports = {
    getHomeAdmin(req, res) {
        res.render('homeadmin', {
            showNavbar: true,
            currentPage: 'homeadmin',
            url: 'http://localhost:3000/',
            name: req.session.name
        });
    },

    getManagePesanan(req, res) {
        pool.getConnection(function (err, connection) {
            if (err) {
                console.error('Error getting connection:', err);
                return res.status(500).send('Internal Server Error');
            }
    
            // Gunakan COALESCE untuk menghindari NULL
            const query = `
                SELECT 
                    p.id_pesanan, 
                    p.tgl_pesanan, 
                    p.jenis_pelayanan, 
                    p.status, 
                    COALESCE(d.alasan_batal, '') AS alasan_batal, 
                    COALESCE(d.total_harga, 0) AS total_harga, 
                    u.username, 
                    u.nama
                FROM pesanan p
                LEFT JOIN detail d ON p.id_pesanan = d.id_pesanan
                JOIN users u ON p.id_user = u.id_user
            `;
    
            connection.query(query, function (error, results) {
                connection.release();
                if (error) {
                    console.error('Error fetching orders:', error);
                    return res.status(500).send('Internal Server Error');
                }
    
                // Debugging hasil query
                console.log('Results:', results);
                results.forEach(result => {
                    console.log('Total Harga:', result.total_harga);
                });
    
                // Render view dengan data
                res.render('managePesanan', {
                    pesanan: results,
                    showNavbar: true,
                    currentPage: 'managePesanan',
                    url: 'http://localhost:3000/'
                });
            });
        });
    },

    deletePesanan(req, res) {
        const orderId = req.params.id;
        pool.getConnection(function (err, connection) {
            if (err) {
                console.error('Error getting connection:', err);
                return res.status(500).send('Internal Server Error');
            }
            connection.beginTransaction(function (err) {
                if (err) {
                    console.error('Error starting transaction:', err);
                    connection.release();
                    return res.status(500).send('Internal Server Error');
                }
                connection.query('DELETE FROM detail WHERE id_pesanan = ?', [orderId], function (error, results) {
                    if (error) {
                        console.error('Error deleting from detail:', error);
                        return connection.rollback(function () {
                            connection.release();
                            return res.status(500).send('Internal Server Error');
                        });
                    }
                    connection.query('DELETE FROM pesanan WHERE id_pesanan = ?', [orderId], function (error, results) {
                        if (error) {
                            console.error('Error deleting from pesanan:', error);
                            return connection.rollback(function () {
                                connection.release();
                                return res.status(500).send('Internal Server Error');
                            });
                        }
                        connection.commit(function (err) {
                            if (err) {
                                console.error('Error committing transaction:', err);
                                return connection.rollback(function () {
                                    connection.release();
                                    return res.status(500).send('Internal Server Error');
                                });
                            }
                            connection.release();
                            res.sendStatus(200);
                        });
                    });
                });
            });
        });
    },

    getDetailPesanan(req, res) {
        const orderId = req.params.id;
        pool.getConnection(function (err, connection) {
            if (err) {
                console.error('Error getting connection:', err);
                return res.status(500).send('Internal Server Error');
            }
            connection.query(`
                SELECT p.*, d.alasan_batal, d.total_harga, u.username, u.nama
                FROM pesanan p
                LEFT JOIN detail d ON p.id_pesanan = d.id_pesanan
                JOIN users u ON p.id_user = u.id_user
                WHERE p.id_pesanan = ?
            `, [orderId], function (error, results) {
                connection.release();
                if (error) {
                    console.error('Error fetching order details:', error);
                    return res.status(500).send('Internal Server Error');
                }
                if (results.length > 0) {
                    res.json(results[0]);
                } else {
                    res.status(404).send('Pesanan tidak ditemukan');
                }
            });
        });
    },

    editPesanan(req, res) {
        const orderId = req.params.id;
        console.log('Received orderId:', orderId); // Log the received orderId
        const { tgl_pesanan, tgl_masuk, tgl_keluar, jenis_pelayanan, tipe_layanan, jenis_hewan, spesies, jumlah, no_telp, pesan, alamat, status } = req.body;
        const fieldsToUpdate = {};
        if (tgl_pesanan) fieldsToUpdate.tgl_pesanan = tgl_pesanan;
        if (tgl_masuk) fieldsToUpdate.tgl_masuk = tgl_masuk;
        if (tgl_keluar) fieldsToUpdate.tgl_keluar = tgl_keluar;
        if (jenis_pelayanan) fieldsToUpdate.jenis_pelayanan = jenis_pelayanan;
        if (tipe_layanan) fieldsToUpdate.tipe_layanan = tipe_layanan;
        if (jenis_hewan) fieldsToUpdate.jenis_hewan = jenis_hewan;
        if (spesies) fieldsToUpdate.spesies = spesies;
        if (jumlah) fieldsToUpdate.jumlah = jumlah;
        if (no_telp) fieldsToUpdate.no_telp = no_telp;
        if (pesan) fieldsToUpdate.pesan = pesan;
        if (alamat) fieldsToUpdate.alamat = alamat;
        if (status) fieldsToUpdate.status = status;

        const setClause = Object.keys(fieldsToUpdate).map(field => `${field} = ?`).join(', ');
        const values = Object.values(fieldsToUpdate);

        if (setClause.length === 0) {
            return res.status(400).send('No fields to update');
        }

        const query = `UPDATE pesanan SET ${setClause} WHERE id_pesanan = ?`;
        values.push(orderId);

        console.log('Executing query:', query);
        console.log('With values:', values);

        pool.getConnection((err, connection) => {
            if (err) {
                console.error('Error getting connection:', err);
                return res.status(500).send('Internal Server Error');
            }

            connection.beginTransaction(err => {
                if (err) {
                    connection.release();
                    console.error('Error starting transaction:', err);
                    return res.status(500).send('Internal Server Error');
                }

                connection.query(query, values, (error, results) => {
                    if (error) {
                        return connection.rollback(() => {
                            connection.release();
                            console.error('Error executing query:', error);
                            return res.status(500).send('Internal Server Error');
                        });
                    }

                    if (status === 'success') {
                        const detailQuery = `UPDATE detail SET alasan_batal = '' WHERE id_pesanan = ?`;
                        connection.query(detailQuery, [orderId], (error, results) => {
                            if (error) {
                                return connection.rollback(() => {
                                    connection.release();
                                    console.error('Error executing detail query:', error);
                                    return res.status(500).send('Internal Server Error');
                                });
                            }

                            connection.commit(err => {
                                if (err) {
                                    return connection.rollback(() => {
                                        connection.release();
                                        console.error('Error committing transaction:', err);
                                        return res.status(500).send('Internal Server Error');
                                    });
                                }

                                connection.release();
                                res.send('Pesanan berhasil diupdate');
                            });
                        });
                    } else {
                        connection.commit(err => {
                            if (err) {
                                return connection.rollback(() => {
                                    connection.release();
                                    console.error('Error committing transaction:', err);
                                    return res.status(500).send('Internal Server Error');
                                });
                            }

                            connection.release();
                            res.send('Pesanan berhasil diupdate');
                        });
                    }
                });
            });
        });
    },

    getManageLaporan(req, res) {
        pool.getConnection((err, connection) => {
            if (err) {
                console.error('Error getting connection from pool:', err);
                res.status(500).send('Internal Server Error');
                return;
            }

            const queries = {
                totalOrders: 'SELECT COUNT(*) AS count FROM pesanan',
                totalRevenue: `
                    SELECT SUM(d.total_harga) AS total 
                    FROM pesanan p
                    JOIN detail d ON p.id_pesanan = d.id_pesanan
                    WHERE p.status = "success"
                `,
                successfulOrders: 'SELECT COUNT(*) AS count FROM pesanan WHERE status = "success"',
                pendingOrders: 'SELECT COUNT(*) AS count FROM pesanan WHERE status = "pending"',
                cancelledOrders: 'SELECT COUNT(*) AS count FROM pesanan WHERE status = "cancelled"'
            };

            const results = {};

            connection.query(queries.totalOrders, (error, totalOrdersResult) => {
                if (error) {
                    console.error('Error executing query:', error);
                    res.status(500).send('Internal Server Error');
                    return;
                }
                results.totalOrders = totalOrdersResult[0].count;

                connection.query(queries.totalRevenue, (error, totalRevenueResult) => {
                    if (error) {
                        console.error('Error executing query:', error);
                        res.status(500).send('Internal Server Error');
                        return;
                    }
                    results.totalRevenue = totalRevenueResult[0].total || 0;

                    connection.query(queries.successfulOrders, (error, successfulOrdersResult) => {
                        if (error) {
                            console.error('Error executing query:', error);
                            res.status(500).send('Internal Server Error');
                            return;
                        }
                        results.successfulOrders = successfulOrdersResult[0].count;

                        connection.query(queries.pendingOrders, (error, pendingOrdersResult) => {
                            if (error) {
                                console.error('Error executing query:', error);
                                res.status(500).send('Internal Server Error');
                                return;
                            }
                            results.pendingOrders = pendingOrdersResult[0].count;

                            connection.query(queries.cancelledOrders, (error, cancelledOrdersResult) => {
                                connection.release();
                                if (error) {
                                    console.error('Error executing query:', error);
                                    res.status(500).send('Internal Server Error');
                                    return;
                                }
                                results.cancelledOrders = cancelledOrdersResult[0].count;

                                res.render('manageLaporan', {
                                    totalOrders: results.totalOrders,
                                    totalRevenue: results.totalRevenue,
                                    successfulOrders: results.successfulOrders,
                                    pendingOrders: results.pendingOrders,
                                    cancelledOrders: results.cancelledOrders,
                                    showNavbar: true,
                                    currentPage: 'manageLaporan',
                                    url: 'http://localhost:3000/' // Tambahkan variabel url di sini
                                });
                            });
                        });
                    });
                });
            });
        });
    }
};