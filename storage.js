var MongoClient = require('mongodb').MongoClient
, ObjectID = require('mongodb').ObjectID
, crypto = require('crypto')
, format = require('util').format
, _ = require('underscore');


module.exports = function(config) {
  var storage = {
    default_users: []
  };

  MongoClient.connect(process.env.MONGOLAB_URI, function(err, db) {
    if(err) {
      console.log(err);
      return;
    }

    storage.db = db;
    storage.db.createCollection('reports', function() {

    // find all docs
    storage.all = function(callback) {
      var collection = storage.db.collection('reports');
      collection.find().toArray(function(err, arr) {
        callback(err, arr);
      });
    };

    // find specific doc
    storage.get = function(id, callback) {
      var collection = storage.db.collection('reports');
      try {
        var objectId = new ObjectID(id);
        collection.find(objectId).toArray(function(err, arr) {
          callback(err, arr);
        });
      } catch(e) {
        callback([e], {});
      }
    };    

    // insert doc
    storage.insert = function(doc, callback) {
      // use a hashed objectid to time-anonymize entries
      // doc._id = new ObjectID(crypto.createHash('md5').update(new ObjectID().toString()).digest('hex').substr(0, 24));
      // remove _id before hashing 
      delete doc._id;
      // hash and add _id
      var hash = crypto.createHash('md5').update(JSON.stringify(doc)).digest('hex');
      doc._id = new ObjectID(hash.substr(0, 24));
      var collection = storage.db.collection('reports');
      collection.insert(doc, function(err, docs) {
        if (err) console.log(err);
        callback(doc, docs);
      });
    };

    });

  });

  return storage;
};