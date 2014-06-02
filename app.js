
/**
* Module dependencies.
*/

var express = require('express');
var expressValidator = require('express-validator');
var http = require('http');
var path = require('path');
var json2csv = require('json2csv');
var fs = require('fs');

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
    shuffle(data);
    res.render('index', {reports: data, thanks: false, errors: {}});
  })
})

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

var fields = ["time_of_month", "month", "year", "fee", "currency", "client", "where", "job", "time_amount", "time_unit", "medium", "experience", "gender", "working_years", "also"];
var fieldNames = ["Time of month", "Month", "Year", "Fee", "Currency", "Client", "Where", "Job", "Time amount", "Time unit", "Medium", "Experience", "Gender", "Working years", "Also"];

app.get('/data.csv', function(req, res) {
  storage.all(function(err, data) {
    shuffle(data);
    json2csv({data: data, fields: fields, fieldNames: fieldNames}, function(err, csv) {
      res.attachment('data.csv');
      res.set('Content-type', 'text/csv');
      res.send(csv);
    })
  })
})

app.get('/data.json', function(req, res) {
  storage.all(function(err, data) {
    shuffle(data);
    res.attachment('data.json');
    res.set('Content-type', 'application/json');
    res.send(data);
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

var currencies = ['USD', 'EUR', 'GBP', 'JPY'];
var jobs = ['', 'workshop', 'talk/lecture', 'panel', 'teaching position', 'residency', 'grant', 'commission', 'exhibition', 'performance'];
var timeUnits = ['minutes', 'hours', 'days', 'weeks', 'months'];
var experiences = ['', 'unusually good', 'good', 'bad', 'unusually bad'];
var genders = ['person', 'woman', 'man'];

expressValidator.validator.extend('isPositiveOptional', function (str) {
  if(str && str.length > 0) {
    return parseInt(str) >= 0;
  } else {
    return true;
  }
});

app.post('/', function(req, res) {
  req.assert('fee', 'Fee is too long or contains non-digits. Try rounding the value.').matches(/^\d{0,8}$/);
  req.assert('currency', 'Currency must be one of: ' + currencies.join(',') + '.').isIn(currencies);
  req.assert('client', 'Client is too long.').isLength(0, 80);
  req.assert('job', 'Job must be one of: ' + jobs.join(',') + '.').isIn(jobs);
  req.assert('where', 'Where is too long.').isLength(0, 80);
  req.assert('time_amount', 'Time amount is invalid.').matches(/^\d{0,4}$/);
  req.assert('time_unit', 'Time unit must be one of: ' + timeUnits.join(',') + '.').isIn(timeUnits);
  req.assert('medium', 'Medium is too long.').isLength(0, 80);
  req.assert('experience', 'Experience must be one of: ' + experiences.join(',') + '.').isIn(experiences);
  req.assert('gender', 'Gender must be one of: ' + genders.join(',') + '.').isIn(genders);
  req.assert('working_years', 'Working years are invalid.').matches(/^\d{0,2}$/);
  req.assert('also', 'Also is too long.').isLength(0, 500);

  var errors = req.validationErrors();
  if( !( req.body.fee || req.body.client || req.body.job || req.body.where ) ) {
    errors = [{msg: 'Please fill out at least one field.'}];
  }

  if(errors) {
    storage.all(function(err, data) {
      shuffle(data);
      res.render('index', {reports: data, thanks: false, errors: errors}); 
    })
  } else {
    var date = new Date();
    var report = {
      // generated
      time_of_month: getTimeOfMonth(date),
      month: date.getMonth(),
      year: date.getFullYear()
    };
    // submitted
    if(req.body.fee || req.body.fee == '0') {
      report.fee = parseInt(req.body.fee);
      report.currency = req.body.currency;
    }
    addField(report, 'client', (req.body.client));
    addField(report, 'job', req.body.job);
    addField(report, 'where', (req.body.where));
    if(req.body.time_amount) {
      report.time_amount = parseInt(req.body.time_amount);
      report.time_unit = req.body.time_unit;
    }
    addField(report, 'experience', req.body.experience);
    addField(report, 'gender', req.body.gender);
    addField(report, 'medium', req.body.medium);
    addField(report, 'working_years', parseInt(req.body.working_years));
    addField(report, 'also', (req.body.also));

    // ignore a few things
    ignoreField(report, 'medium', 'art');
    ignoreField(report, 'medium', 'this');

    storage.insert(report, function(doc) {
      storage.all(function(err, data) {
        shuffle(data);
        res.render('index', {reports: data, thanks: true, reportId: doc._id, errors: errors});
      });
    });
  }
});

function addField(object, field, data) {
  // a string with length > 0
  // or a number that is 0 or greater
  if((typeof data == 'string' && data.length > 0) ||
    (typeof data == 'number' && data >= 0)) {
    object[field] = data;
  }
}

function ignoreField(object, field, data) {
  if(object[field] && object[field] == data) {
    delete object[field];
  }
}

app.get('/:id', function(req, res) {
  storage.get(req.params.id, function(err, data) {
    res.render('item', {report: data.length ? data[0] : {}, err: err});
  })
})
