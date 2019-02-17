const path = require('path');
const fs = require('fs');
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const LokiStore = require('connect-loki')(session);
const mysql = require('mysql');

var config = fs.readFileSync(path.join(__dirname, 'config.json'), 'utf8');
config = JSON.parse(config);
global.config = config;

const app = express();

/* -------- DataBase -------- */
// ToDo: Move to separate file

var connection = mysql.createConnection({
    host     : config.db.host,
	port     : (config.db.port !== undefined ? config.db.port : 3306),
    user     : config.db.user,
    password : config.db.password,
    database : config.db.database,
    multipleStatements: true
});

connection.connect((err) => {
    if (err) {
        console.error('An error has occured while connecting to the DataBase: ' + err.stack);
        return;
    }

    console.log('Successfully connected to the DataBase on ' + config.db.host);
});

global.connection = connection;

/* -------- Express App -------- */

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(helmet())
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
    store: new LokiStore, // ToDo: Find an appropriate store
    secret: config.session.secret,
    name: 'sessionID',
    resave: false,
    saveUninitialized: false,
    cookie: {
//      maxAge: 60000,
        httpOnly: true
    }
}));
app.use('/static', express.static(path.join(__dirname, 'public')));

/* -------- Routing -------- */
require(path.join(__dirname, 'routes'))(app);

/* -------- Start the App -------- */
app.listen(config.express.port, () => {
    console.log('Started the application on port ' + config.express.port);
});