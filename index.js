const express = require("express");
const hbs = require("express-handlebars");

const app = express();
const session = require("express-session");
const path = require("path");
const config = require("./config/config");
const Handlebars =require('handlebars') 

const nocache = require('nocache')  // cache blocking



app.use(nocache())


const userRoute = require("./routes/userRoute");
const adminRoute = require("./routes/adminRoute");


app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use('/', userRoute);
app.use('/admin', adminRoute);


const db = require('./config/config');
db.connectDb();


app.use(express.static('public'));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.engine('hbs', hbs.engine({
    extname: 'hbs',
    defaultLayout: 'layout',
    runtimeOptions: {
        allowProtoPropertiesByDefault: true,
        allowProtoMethodsByDefault: true,
    },
    layoutsDir: __dirname + '/views/layout/',
    partialsDir: __dirname + '/views/partials'
}));

Handlebars.registerHelper('ifeq', function (a, b, options) {
    if (a == b) { return options.fn(this); }
    return options.inverse(this);
});

Handlebars.registerHelper('ifnoteq', function (a, b, options) {
    if (a != b) { return options.fn(this); }
    return options.inverse(this);
});


app.listen(3000, () => {
    console.log("server is running");
});
