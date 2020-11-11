var _ = require("lodash");

module.exports = function (config) {
  var storage = {
    default_users: [],
    reports: require("./data.json")
  };

  // find specific doc
  storage.get = function (id) {
    return _.find(storage.reports, { _id: id });
  };

  return storage;
};
