var MongoClient = require('mongodb').MongoClient
, format = require('util').format
, _ = require('underscore');


module.exports = function(config) {
  var storage = {
    default_users: []
  };


  var mongoConnect;
  if(process.env.HEROKU) {
    mongoConnect = format("mongodb://%s:%s@%s:%s/whopaysartists",
      process.env.MONGO_USERNAME,
      process.env.MONGO_PASSWORD,
      process.env.MONGO_HOST,
      process.env.MONGO_PORT);
  } else {
    var host = 'localhost';
    var port = 27017;
    mongoConnect = format("mongodb://%s:%s/whopaysartists", host, port);
  }

  MongoClient.connect(mongoConnect, function(err, db) {
    storage.db = db;
    storage.db.createCollection('reports', function() {

    //find all people
    storage.all = function(callback) {
      var collection = storage.db.collection('reports');
      collection.find().toArray(function(err, arr) {
        callback(err, arr);
      });
    };

    //insert person
    storage.insert = function(doc, callback) {
      var collection = storage.db.collection('reports');
      collection.insert(doc, function(err, docs) {
        if (err) console.log(err);
        callback(docs);
      });
    };

    // //insert person
    // storage.reset = function(callback) {
    //   storage.db.dropCollection('people', callback);
    // };

    // storage.updateDefaultUsers = function() {
    //   // initialize default options
    //   storage.all(function(err, data) {
    //     storage.default_users = _.map(data, function(obj) { return obj.user; });
    //   });
    // };

    //      storage.updateDefaultUsers();
    });

  });


  return storage;
};