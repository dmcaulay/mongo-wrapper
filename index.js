
var async = require('async');
var mongo = require('mongodb')
var MongoClient = mongo.MongoClient;
var collectionMethods = Object.keys(require('mongodb').Collection.prototype);
var getResource = require('async-resource').get
var _ = require('underscore')

function CollectionWrapper(name, getConnectedDb) {
  this.name = name;
  this.getConnectedDb = getConnectedDb;
}

collectionMethods.forEach(function(method) {
  CollectionWrapper.prototype[method] = function() {
    var callback = _.last(arguments);
    var args = arguments;
    var name = this.name;
    this.getConnectedDb(function(err, db) {
      if (err) return callback(err);
      var collection = db.collection(name);
      collection[method].apply(collection, args);
    });
  }
})

CollectionWrapper.prototype.bind = function() {
  var args = Array.prototype.slice.call(arguments);
  var self = this;
  var method = self[args.shift()];
  return function() {
    args.push.apply(args, arguments);
    method.apply(self, args);
  }
};

CollectionWrapper.prototype.findArray = function() {
  var args = Array.prototype.slice.call(arguments)
  var callback = args.pop()
  var toArray = function(err, result) {
    if (err) return callback(err)
    result.toArray(callback)
  }
  args.push(toArray)
  this.find.apply(this, args)
}

var addIdQuery = function(args) {
  args = Array.prototype.slice.call(args)
  var id = args.shift()
  if (_.isString(id)) id = new mongo.ObjectID(id)
  args.unshift({_id: id})
  return args
}

CollectionWrapper.prototype.findById = function() {
  var args = addIdQuery(arguments)
  this.findOne.apply(this, args)
}

CollectionWrapper.prototype.findAndModifyById = function() {
  var args = addIdQuery(arguments)
  this.findAndModify.apply(this, args)
}

CollectionWrapper.prototype.updateById = function() {
  var args = addIdQuery(arguments)
  this.update.apply(this, args)
}

// sets up simple indexes based on the config object.
var setupIndexes = function(db, indexes, callback) {
  var collections = Object.keys(indexes);
  async.each(collections, function(col, collectionDone) {
    async.each(indexes[col], function(index, indexDone) {
      db.ensureIndex(col, index.index, index.options || {}, indexDone);
    }, collectionDone);
  }, callback);
};

function DbWrapper(url, config) {
  var wrapper = this;
  this.getConnectedDb = getResource(function(callback) {
    MongoClient.connect(url, function(err, db) {
      if (err) return callback(err)
      wrapper.db = db;
      if (!config.indexes) return callback(null, db);
      setupIndexes(db, config.indexes, function(err) {
        callback(err, db);
      });
    });
  })
};

DbWrapper.prototype.add = function(collection, alias) {
  alias = alias || collection
  if (this[alias]) return this
  this[alias] = new CollectionWrapper(collection, this.getConnectedDb.bind(this));
  return this
}

DbWrapper.prototype.id = function(_id) {
  try {
    return new mongo.ObjectID(_id);
  } catch(err) {
    this.lastErr = err;
    return false;
  }
};

DbWrapper.prototype.close = function() {
  this.getConnectedDb(function(err, db) {
    db.close();
  });
};

var setup = function(config) {
  var url = 'mongodb://';
  if (config.username) url += config.username + ':' + config.password + '@';
  if (config.hosts) {
    config.hosts.forEach(function(host, i) {
      if (i != 0) url += ',';
      url += host.name + ':' + (host.port || 27017);
    });
  } else {
    url += 'localhost';
  }
  url += '/' + (config.database + '');
  if (config.options) {
    Object.keys(config.options).forEach(function(option, i) {
      url += i == 0 ? '?' : '&';
      url += option + '=' + config.options[option];
    });
  };
  wrapper.db = new DbWrapper(url, config);
  return wrapper.db;
};

var wrapper = module.exports = {
  setup: setup,
  errorCodes: {
    dupKey: 11000
  }
}
