const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const flash = require('req-flash');
const path = require('path');
const adminController = require('../src/controllers/controller-admin');

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(session({ secret: 'secret', resave: false, saveUninitialized: true }));
app.use(flash());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/admin/homeadmin', adminController.getHomeAdmin);

describe('Controller Admin', () => {
    let req, res;

    beforeEach(() => {
        req = {
            session: {
                name: 'Admin'
            }
        };
        res = {
            render: jest.fn(),
            redirect: jest.fn(),
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
            clearCookie: jest.fn()
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /admin/homeadmin', () => {
        it('harus merender halaman homeadmin', async () => {
            await adminController.getHomeAdmin(req, res);
            expect(res.render).toHaveBeenCalledWith('homeadmin', {
                showNavbar: true,
                currentPage: 'homeadmin',
                url: 'http://localhost:3000/',
                name: 'Admin'
            });
        });
    });
});