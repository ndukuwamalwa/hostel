const http = require('http');

const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const flash = require('connect-flash');
const helmet = require('helmet');
const compression = require('compression');

const app = express();
app.set('views', 'view');
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static('public'));
app.use(session({secret: 'I am not a complete idiot some parts are missing', resave: false, saveUninitialized: false}));
app.use(flash());
app.use(helmet());
app.use(compression());

const auth = require('./middleware/auth');

const publicRoutes = require('./route/public.js');
const userRoutes = require('./route/users');
const hostelRoutes = require('./route/hostels');
const residentRoutes = require('./route/residents');
const bookingRoutes = require('./route/booking');

app.use('/', publicRoutes);
app.use('/users', auth.auth, userRoutes);
app.use('/hostels', auth.auth, hostelRoutes);
app.use('/residents', auth.auth, residentRoutes);
app.use('/booking', auth.auth, bookingRoutes);

const server = http.createServer(app);
server.listen(3000, () => {
    console.log('Server running.');
});