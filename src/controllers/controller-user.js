const config = require('../configs/database');
let mysql = require('mysql');
let pool = mysql.createPool(config);

pool.on('error', (err) => {
    console.error(err);
});

module.exports = {
    getHomeUser(req, res) {
        res.render('homeuser', {
            showNavbar: true,
            currentPage: 'homeuser',
            url: 'http://localhost:3000/',
            name: req.session.name
        });
    }
};