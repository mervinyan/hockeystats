var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');
var team_stats = require('./routes/team_stats');
var player_stats = require('./routes/player_stats');
var game_entry = require('./routes/game_entry');
// var todos = require('./routes/todos');

// var mongoose = require('mongoose');
// mongoose.connect('mongodb://localhost/todoApp', function(err) {
//     if(err) {
//         console.log('connection error', err);
//     } else {
//         console.log('connection successful');
//     }
// });

var app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// view engine setup
// var engines = require('consolidate');
// app.engine('pug', engines.pug);
// app.engine('ejs', engines.ejs);


// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);
app.use('/teamstats', team_stats);
app.use('/playerstats', player_stats);
app.use('/gameentry', game_entry);
// app.use('/todos', todos);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error.pug', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error.pug', {
    message: err.message,
    error: {}
  });
});

app.listen(3000, function() {
   console.log('listening on port 3000!') 
});

module.exports = app;
