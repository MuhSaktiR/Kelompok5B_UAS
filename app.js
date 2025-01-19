const express = require("express");
const path = require("path");
const session = require("express-session");
const bodyParser = require("body-parser");
const flash = require("req-flash");

const app = express();

app.use(
  session({
    resave: false,
    saveUninitialized: false,
    secret: "t@1k0ch3ng",
    name: "secretName",
    cookie: {
      sameSite: true,
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(flash());

app.use(function (req, res, next) {
  res.setHeader(
    "Cache-Control",
    "no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0"
  );
  res.setHeader("Pragma", "no-cache");
  next();
});

app.set("views", path.join(__dirname, "src", "views"));
app.set("view engine", "ejs");

app.use('/public', express.static(path.join(__dirname, 'src', 'public')));

const managePesananRoutes = require('./src/routes/router-adminPesanan');
const manageLaporanRoutes = require('./src/routes/router-adminLaporan');
const loginRoutes = require("./src/routes/router-login");
const registerRoutes = require("./src/routes/router-register");
const pesananRoutes = require("./src/routes/router-pesanan");
const manageAdminRoutes = require('./src/routes/router-admin');
const appRoutes = require("./src/routes/router-app");
const userRoutes = require("./src/routes/router-user");

app.use("/", appRoutes);

app.get('/', (req, res) => {
    if (req.session.loggedin) {
        if (req.session.role === 'admin') {
            res.render('homeadmin', { 
                name: req.session.name,
                showNavbar: true,
                currentPage: 'dashboard',
                url: 'http://localhost:3000/'
            });
        } else {
            res.render('homeuser', { 
                name: req.session.name,
                showNavbar: true,
                currentPage: 'home',
                url: 'http://localhost:3000/'
            });
        }
    } else {
        res.redirect('/login');
    }
});

app.get('/about', (req, res) => {
    res.render('about', {
        showNavbar: true,
        currentPage: 'about',
        url: 'http://localhost:3000/'
    });
});

app.get('/aboutpage', (req, res) => {
  res.render('aboutpage', {
      showNavbar: true,
      currentPage: 'aboutpage',
      url: 'http://localhost:3000/'
  });
});
app.use("/login", loginRoutes);
app.use('/admin', manageAdminRoutes);
app.use("/user", userRoutes);
app.use('/admin/managePesanan', managePesananRoutes);
app.use('/admin/manageLaporan', manageLaporanRoutes);
app.use("/register", registerRoutes);
app.use("/pesanan", pesananRoutes);

app.listen(3000, () => {
  console.log(`Server running at http://localhost:3000`);
});

module.exports = app;