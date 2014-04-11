var MongoClient = require('mongodb').MongoClient
  , format = require('util').format
  , _ = require('underscore');


module.exports = function(config) {
  var storage = {
    default_users: []
  };


  var host = process.env['MONGO_NODE_DRIVER_HOST'] != null ? process.env['MONGO_NODE_DRIVER_HOST'] : 'localhost';
  var port = process.env['MONGO_NODE_DRIVER_PORT'] != null ? process.env['MONGO_NODE_DRIVER_PORT'] : 27017;


  //mongodb://<dbuser>:<dbpassword>@ds053688.mongolab.com:53688/whopaysartists
  MongoClient.connect(format("mongodb://%s:%s/TED?w=1", host, port), function(err, db) {
    storage.db = db;
    storage.db.createCollection('people', function() {

      //find all people
      storage.all = function(callback) {
        var collection = storage.db.collection('people');
        collection.find().toArray(function(err, arr) {
          callback(err, arr);
        });
      };

      //insert person
      storage.insert = function(doc) {
        var collection = storage.db.collection('people');
        collection.update({user: doc.user}, {$set: doc}, {upsert: true}, function(err) {
          if (err) console.log(err);
        });
      };

      //insert person
      storage.reset = function(callback) {
        storage.db.dropCollection('people', callback);
      };

      storage.updateDefaultUsers = function() {
        // initialize default options
        storage.all(function(err, data) {
          storage.default_users = _.map(data, function(obj) { return obj.user; });
        });
      };

      storage.updateDefaultUsers();
    });


  });


  return storage;
};