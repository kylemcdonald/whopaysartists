
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
app.use(express.static(path.join(__dirname, 'public')));

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});


app.get('/', function(req, res) {
  var data = storage.reports;
  shuffle(data);
  res.render('index', {reports: data, thanks: false, errors: {}});
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
  var data = storage.reports;
  shuffle(data);
  json2csv({data: data, fields: fields, fieldNames: fieldNames}, function(err, csv) {
    res.attachment('data.csv');
    res.set('Content-type', 'text/csv');
    res.send(csv);
  })
})

app.get('/data.json', function(req, res) {
  var data = storage.reports;
  shuffle(data);
  res.attachment('data.json');
  res.set('Content-type', 'application/json');
  res.send(data);
})

app.get('/:id', function(req, res) {
  var data = storage.get(req.params.id);
  if (data !== undefined) {
    res.render('item', {report: data, err: null});
  } else {
    res.render('item', {report: {}, err: 'not found'});
  }
})
