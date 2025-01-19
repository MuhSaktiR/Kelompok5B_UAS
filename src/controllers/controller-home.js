module.exports = {
    home(req, res) {
        res.render('homepage', {
            url: 'http://localhost:3000/',
            showNavbar: true,
            currentPage: 'home'
        });
    }
};