const config = require('../configs/database');
let mysql = require('mysql');
let pool = mysql.createPool(config);

pool.on('error', (err) => {
    console.error(err);
});

const calculateTotalPrice = (tipeLayanan) => {
    // Implement your logic to calculate total price based on tipe_layanan
    const prices = {
        'A': 750000.00,
        'B': 500000.00,
        'C': 250000.00
    };
    return prices[tipeLayanan] || 0;
};

module.exports = {
    calculateTotalPrice,
    getPesanan (req, res) {
        const userId = req.session.userid; // Pastikan ID pengguna disimpan dalam sesi
        if (!userId) {
            return res.status(401).send('Unauthorized: User ID is missing in session');
        }
        pool.getConnection(function (err, connection) {
            if (err) {
                console.error('Error getting connection:', err);
                return res.status(500).send('Internal Server Error');
            }
            const query = `
                SELECT p.*, d.total_harga
                FROM pesanan p
                LEFT JOIN detail d ON p.id_pesanan = d.id_pesanan
                WHERE p.id_user = ?
            `;
            connection.query(query, [userId], function (error, results) {
                connection.release();
                if (error) {
                    console.error('Error fetching pesanan:', error);
                    return res.status(500).send('Internal Server Error');
                }
                res.render('pesanan', {
                    url: 'http://localhost:3000/',
                    pesanan: results,
                    showNavbar: true,
                    currentPage: 'pesanan'
                });
            });
        });
    },

    getDetailPesanan(req, res) {
        const userId = req.session.userid; // ID pengguna dari sesi
        const orderId = req.params.id; // ID pesanan dari parameter URL
    
        if (!userId) {
            return res.status(401).send('Unauthorized: User ID is missing in session');
        }
    
        if (!orderId) {
            return res.status(400).send('Bad Request: Order ID is missing');
        }
    
        pool.getConnection(function (err, connection) {
            if (err) {
                console.error('Error getting connection:', err);
                return res.status(500).send('Internal Server Error');
            }
    
            const query = `
                SELECT p.*, d.total_harga
                FROM pesanan p
                LEFT JOIN detail d ON p.id_pesanan = d.id_pesanan
                WHERE p.id_pesanan = ? AND p.id_user = ?;
            `;
    
            connection.query(query, [orderId, userId], function (error, results) {
                connection.release(); // Pastikan koneksi dilepaskan di sini
    
                if (error) {
                    console.error('Error fetching detail pesanan:', error);
                    return res.status(500).send('Internal Server Error');
                }
    
                if (results.length > 0) {
                    res.json(results[0]); // Kirim data pesanan dan total_harga
                } else {
                    res.status(404).send('Pesanan tidak ditemukan');
                }
            });
        });
    },
    
    konfirmasiPesanan(req, res) {
        const userId = req.session.userid; // Pastikan ID pengguna disimpan dalam sesi
        if (!userId) {
            return res.status(401).send('Unauthorized: User ID is missing in session');
        }
        const { orderDate, checkInDate, checkOutDate, serviceType, tipeLayanan, animalType, species, quantity, phone, message, address, status } = req.body;
        const totalPrice = calculateTotalPrice(tipeLayanan);
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
                connection.query(
                    `INSERT INTO pesanan (tgl_pesanan, tgl_masuk, tgl_keluar, jenis_pelayanan, tipe_layanan, jenis_hewan, spesies, jumlah, no_telp, pesan, alamat, status, id_user) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [orderDate, checkInDate, checkOutDate, serviceType, tipeLayanan, animalType, species, quantity, phone, message, address, status, userId],
                    function (error, results) {
                        if (error) {
                            console.error('Error inserting into pesanan:', error);
                            return connection.rollback(function () {
                                connection.release();
                                res.status(500).send('Internal Server Error');
                            });
                        }
                        const orderId = results.insertId;
                        connection.query(
                            `INSERT INTO detail (id_pesanan, total_harga) VALUES (?, ?)`,
                            [orderId, totalPrice],
                            function (error, results) {
                                if (error) {
                                    console.error('Error inserting into detail:', error);
                                    return connection.rollback(function () {
                                        connection.release();
                                        res.status(500).send('Internal Server Error');
                                    });
                                }
                                connection.commit(function (err) {
                                    if (err) {
                                        console.error('Error committing transaction:', err);
                                        return connection.rollback(function () {
                                            connection.release();
                                            res.status(500).send('Internal Server Error');
                                        });
                                    }
                                    connection.release();
                                    res.redirect('/pesanan');
                                });
                            }
                        );
                    }
                );
            });
        });
    },

    cancelPesanan(req, res) {
        const userId = req.session.userid;
        const orderId = req.params.id;
        const reason = req.body.reason;

        if (!userId) {
            return res.status(401).send('Unauthorized: User ID is missing in session');
        }

        pool.getConnection((err, connection) => {
            if (err) {
                console.error('Error getting connection:', err);
                return res.status(500).send('Internal Server Error');
            }

            connection.beginTransaction((err) => {
                if (err) {
                    console.error('Error starting transaction:', err);
                    connection.release();
                    return res.status(500).send('Internal Server Error');
                }

                connection.query(
                    `UPDATE pesanan SET status = 'pending' WHERE id_pesanan = ? AND id_user = ? AND status = 'success'`,
                    [orderId, userId],
                    (error, results) => {
                        if (error) {
                            console.error('Error updating pesanan:', error);
                            return connection.rollback(() => {
                                connection.release();
                                return res.status(500).send('Internal Server Error');
                            });
                        }

                        if (results.affectedRows === 0) {
                            connection.release();
                            return res.status(404).send('Pesanan tidak ditemukan atau sudah dalam status pending');
                        }

                        connection.query(
                            `UPDATE detail SET alasan_batal = ? WHERE id_pesanan = ?`,
                            [reason, orderId],
                            (error, results) => {
                                if (error) {
                                    console.error('Error updating detail:', error);
                                    return connection.rollback(() => {
                                        connection.release();
                                        return res.status(500).send('Internal Server Error');
                                    });
                                }

                                if (results.affectedRows === 0) {
                                    connection.query(
                                        `INSERT INTO detail (id_pesanan, alasan_batal) VALUES (?, ?)`,
                                        [orderId, reason],
                                        (error, results) => {
                                            if (error) {
                                                console.error('Error inserting into detail:', error);
                                                return connection.rollback(() => {
                                                    connection.release();
                                                    return res.status(500).send('Internal Server Error');
                                                });
                                            }

                                            connection.commit((err) => {
                                                if (err) {
                                                    console.error('Error committing transaction:', err);
                                                    return connection.rollback(() => {
                                                        connection.release();
                                                        return res.status(500).send('Internal Server Error');
                                                    });
                                                }

                                                connection.release();
                                                return res.sendStatus(200);
                                            });
                                        }
                                    );
                                } else {
                                    connection.commit((err) => {
                                        if (err) {
                                            console.error('Error committing transaction:', err);
                                            return connection.rollback(() => {
                                                connection.release();
                                                return res.status(500).send('Internal Server Error');
                                            });
                                        }

                                        connection.release();
                                        return res.sendStatus(200);
                                    });
                                }
                            }
                        );
                    }
                );
            });
        });
    }
};