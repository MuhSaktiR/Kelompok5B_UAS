const config = require('../configs/database');
let mysql = require('mysql');
let pool = mysql.createPool(config);

pool.on('error', (err) => {
    console.error(err);
});

module.exports = {
    login(req, res) {
        res.render("login", {
            url: 'http://localhost:3000/',
            colorFlash: req.flash('color'),
            statusFlash: req.flash('status'),
            pesanFlash: req.flash('message'),
        });
    },
    loginAuth(req, res) {
        let username = req.body.username;
        let password = req.body.pass;
        if (username && password) {
            pool.getConnection(function (err, connection) {
                if (err) {
                    console.error('Error getting connection from pool:', err);
                    req.flash('color', 'danger');
                    req.flash('status', 'Oops..');
                    req.flash('message', 'Terjadi kesalahan pada server');
                    res.redirect('/login');
                    return;
                }
                // Periksa apakah pengguna adalah admin
                connection.query(
                    `SELECT * FROM admin WHERE username = ? AND password = ?`,
                    [username, password],
                    function (error, results) {
                        if (error) {
                            console.error('Error executing query:', error);
                            req.flash('color', 'danger');
                            req.flash('status', 'Oops..');
                            req.flash('message', 'Terjadi kesalahan pada server');
                            res.redirect('/login');
                            return;
                        }
                        if (results.length > 0) {
                            req.session.loggedin = true;
                            req.session.adminid = results[0].id_admin;
                            req.session.username = results[0].username;
                            req.session.role = results[0].role; // Simpan peran pengguna di sesi
                            req.session.name = results[0].nama; // Simpan nama pengguna di sesi
                            console.log('Session username:', req.session.username);
                            res.redirect('/admin/homeadmin');
                        } else {
                            // Jika bukan admin, periksa apakah pengguna adalah user
                            connection.query(
                                `SELECT * FROM users WHERE username = ? AND password = ?`,
                                [username, password],
                                function (error, results) {
                                    if (error) {
                                        console.error('Error executing query:', error);
                                        req.flash('color', 'danger');
                                        req.flash('status', 'Oops..');
                                        req.flash('message', 'Terjadi kesalahan pada server');
                                        res.redirect('/login');
                                        return;
                                    }
                                    if (results.length > 0) {
                                        req.session.loggedin = true;
                                        req.session.userid = results[0].id_user;
                                        req.session.username = results[0].username;
                                        req.session.name = results[0].nama; // Simpan nama pengguna di sesi
                                        req.session.role = 'user'; // Simpan peran pengguna di sesi
                                        console.log('Session username:', req.session.username);
                                        res.redirect('/user/home');
                                    } else {
                                        req.flash('color', 'danger');
                                        req.flash('status', 'Oops..');
                                        req.flash('message', 'Akun tidak ditemukan');
                                        res.redirect('/login');
                                    }
                                }
                            );
                        }
                    }
                );
                connection.release();
            });
        } else {
            req.flash('color', 'danger');
            req.flash('status', 'Oops..');
            req.flash('message', 'Username dan password harus diisi');
            res.redirect('/login');
        }
    },
    logout(req, res) {
        req.session.destroy((err) => {
            if (err) {
                console.log('Error destroying session:', err);
                req.flash('color', 'danger');
                req.flash('status', 'Oops..');
                req.flash('message', 'Terjadi kesalahan pada server');
                res.redirect('/');
                return;
            }
            res.clearCookie('secretname');
            res.redirect('/');
        });
    },
};