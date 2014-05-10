
/**
* Module dependencies.
*/

var express = require('express');
var expressValidator = require('express-validator');
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
app.use(express.bodyParser());
app.use(expressValidator());
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
    res.render('index', {reports: data, thanks: false, errors: {}});
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

var currencies = ['$', '€', '£'];
var jobs = ['', 'workshop', 'talk/lecture', 'teaching position', 'residency', 'grant', 'commission', 'exhibition'];
var timeUnits = ['', 'hours', 'days', 'weeks', 'months'];
var experiences = ['', 'unusually good', 'good', 'bad', 'unusually bad'];
var genders = ['', 'other', 'woman', 'man'];

app.post('/', function(req, res) {
  req.assert('fee', 'Fee is invalid.').matches(/^\d{0,6}$/);
  req.assert('currency', 'Currency must be one of: ' + currencies.join(',') + '.').isIn(currencies);
  req.assert('client', 'Client is too long.').isLength(0, 80);
  req.assert('job', 'Job must be one of: ' + jobs.join(',') + '.').isIn(jobs);
  req.assert('where', 'Where is too long.').isLength(0, 80);
  req.assert('time_amount', 'Time amount is invalid.').matches(/^\d{0,4}$/);
  req.assert('time_unit', 'Time unit must be one of: ' + timeUnits.join(',') + '.').isIn(timeUnits);
  req.assert('experience', 'Experience must be one of: ' + experiences.join(',') + '.').isIn(experiences);
  req.assert('working_years', 'Working years are invalid.').matches(/^\d{0,2}$/);
  req.assert('also', 'Also is too long.').isLength(0, 160);

  var errors = req.validationErrors();
  if( !( req.body.fee || req.body.client || req.body.job || req.body.where ) ) {
    errors = [{msg: 'Please fill out at least one field.'}];
  }

  if(errors) {
    storage.all(function(err, data) {
      res.render('index', {reports: data, thanks: false, errors: errors}); 
    })
  } else {
    var date = new Date();
    var report = {
      // generated
      time_of_month: getTimeOfMonth(date),
      month: date.getMonth(),
      year: date.getFullYear(),
      // submitted
      fee: req.body.fee,
      currency: req.body.currency,
      client: (req.body.client),
      job: req.body.job,
      where: (req.body.where),
      time_amount: req.body.time_amount,
      time_unit: req.body.time_unit,
      experience: req.body.experience,
      gender: req.body.gender,
      working_years: req.body.working_years,
      also: (req.body.also)
    };
    storage.insert(report, function() {
      storage.all(function(err, data) {
        res.render('index', {reports: data, thanks: true, errors: errors});
      });
    });
  }
});

