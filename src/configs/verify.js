module.exports = {
    isLogin(req, res, next){
        if(req.session.loggedin === true){
            next();
            return;
        } else {
            req.session.destroy(function(err) {
                res.redirect('/login');
            })
        }
    },
    isLogout(req, res, next){
        if(req.session.loggedin !== true){
            next();
            return;
        }
        res.redirect('/');
    },
    isAdmin(req, res, next) {
        if (req.session.loggedin && req.session.role === 'admin') {
            next();
        } else {
            req.flash('color', 'danger');
            req.flash('status', 'Oops..');
            req.flash('message', 'Anda tidak memiliki akses');
            res.redirect('/login');
        }
    },
    isUser(req, res, next) {
        if (req.session.loggedin && req.session.role === 'user') {
            return next();
        } else {
            req.flash('color', 'danger');
            req.flash('status', 'Oops..');
            req.flash('message', 'Anda tidak memiliki akses');
            res.redirect('/login');
        }
    }
};