//var mongo = require('mongoskin');
//var config = require('./config.json');
//exports.db = mongo.db(config.mongodb_connection, config.mongo_options);

var db = require('mongoskin').db('mongodb://localhost:27017/Chat');
var objectID = require('mongoskin').ObjectID;

exports.db = db;
exports.objectID = objectID;
