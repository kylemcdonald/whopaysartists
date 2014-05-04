
/**
* Module dependencies.
*/

var express = require('express');
var http = require('http');
var path = require('path');

var app = express();
var storage = require('./storage')();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});


app.get('/', function(req, res) {
  storage.all(function(err, data) {
    res.render('index', {reports: data, thanks: false});
  })
});

app.post('/', function(req, res) {
  console.log(res.body);
  var report = {
    timestamp: Date.now(),
    fee: req.body.fee,
    currency: req.body.currency,
    client: req.body.client,
    job: req.body.job,
    time_amount: req.body.time_amount,
    time_unit: req.body.time_unit,
    experience: req.body.experience,
    gender: req.body.gender,
    working_years: req.body.working_years,
    also: req.body.also
  };
  storage.insert(report, function() {
    storage.all(function(err, data) {
      res.render('index', {reports: data, thanks: true});
    });
  });
});

