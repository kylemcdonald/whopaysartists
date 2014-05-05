
/**
* Module dependencies.
*/

var express = require('express');
var http = require('http');
var path = require('path');
var json2csv = require('json2csv');

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

function shuffle(array) {
    var counter = array.length, temp, index;
    while (counter > 0) {
        index = Math.floor(Math.random() * counter);
        counter--;
        temp = array[counter];
        array[counter] = array[index];
        array[index] = temp;
    }
    return array;
}

app.get('/data.json', function(req, res) {
  storage.all(function(err, data) {
    shuffle(data);
    res.attachment('data.json');
    res.set('Content-type', 'application/json');
    res.send(data);
  })
})

var fields = ["time_of_month", "month", "year", "fee", "currency", "client", "where", "job", "time_amount", "time_unit", "experience", "gender", "working_years", "also"];
var fieldNames = ["Time of month", "Month", "Year", "Fee", "Currency", "Client", "Where", "Job", "Time amount", "Time unit", "Experience", "Gender", "Working years", "Also"];
app.get('/data.csv', function(req, res) {
  storage.all(function(err, data) {
    shuffle(data);
    json2csv({data: data, fields: fields, fieldNames: fieldNames}, function(err, csv) {
      res.attachment('data.csv');
      res.set('Content-Type', 'text/csv');
      res.send(csv);
    })
  })
})

function getTimeOfMonth(date) {
  var day = date.getDate();
  if(day < 10) {
    return "early";
  } else if(day < 20) {
    return "mid";
  } else {
    return "late";
  }
}
app.post('/', function(req, res) {
  var date = new Date();
  var report = {
    // generated
    time_of_month: getTimeOfMonth(date),
    month: date.getMonth(),
    year: date.getFullYear(),
    // submitted
    fee: req.body.fee,
    currency: req.body.currency,
    client: req.body.client,
    where: req.body.where,
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

