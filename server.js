const express = require("express");
const bodyParser = require("body-parser");
const { JSONRPCServer, JSONRPCClient } = require("json-rpc-2.0");
const createError = require('http-errors');
const path = require('path');
const ethers = require('ethers');
const providers = require('ethers').providers;
const hbs = require('express-handlebars');
const config = require("./config");
const index = require('./routes/index');
const { toUnicode } = require("punycode");



const app =   express();

// view engine setup
app.engine('hbs', hbs({extname: 'hbs', defaultLayout: 'layout', layoutsDir: __dirname + '/views/'}));
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'hbs');

//TODO: remove
// app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/', index);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.listen(config.port);

module.exports = app;
