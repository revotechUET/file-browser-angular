const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

const routes = require("./routes");

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(express.static(path.join(__dirname, '../bower_components')));
app.use(express.static(path.join(__dirname, '../client')));
app.use(express.static(path.join(__dirname, '../public')));

app.use('/', routes);

app.set('port', 3000);

const server = app.listen(app.get('port'), () => {
    console.log(`Listening on port ${server.address().port}`);
});

module.exports = app;