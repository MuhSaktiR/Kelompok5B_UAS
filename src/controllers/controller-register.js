const config = require('../configs/database');
let mysql = require('mysql');
let pool = mysql.createPool(config);

pool.on('error', (err) => {
    console.error(err);
});

module.exports = {
    formRegister(req, res) {
        console.log('Rendering register page'); // Add this line
        res.render("register", {
            url: 'http://localhost:3000/',
        });
    },
    saveRegister(req, res) {
        let name = req.body.name;
        let username = req.body.username;
        let password = req.body.pass;
        console.log(`Received data: name=${name}, username=${username}, password=${password}`); // Add this line
        if (name && username && password) {
            pool.getConnection(function (err, connection) {
                connection.query(
                    `INSERT INTO users (nama, username, password) VALUES (?, ?, ?);`
                    , [name, username, password], function (error, results) {
                        console.log('Setting flash messages'); // Add this line
                        req.flash('color', 'success');
                        req.flash('status', 'Yes..');
                        req.flash('message', 'Registrasi berhasil');
                        res.redirect('/login');
                    });
                connection.release();
            })
        } else {
            console.log('Missing data, redirecting to /register'); // Add this line
            res.redirect('/register');
            res.end();
        }
    }
}