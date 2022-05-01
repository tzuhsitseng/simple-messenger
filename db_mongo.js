var db = require('./connection_mongo.js').db;
var objectID = require('./connection_mongo.js').objectID;
var dao = function(collection) {
    this.collection = collection;
}

// 從collection中尋找第一筆符合的資料
dao.prototype.findOne = function(query, callback) {
    if (query._id && query._id.length == 24) {
        query._id = objectID.createFromHexString(query._id);
    }

    db.collection(this.collection).findOne(query, function(err, result) {
        if (err) {
            console.log('Error DB.findOne:' + err);
        } else if (callback) {
            callback(result);
        }
    });
}

// 從collection中尋找符合的資料
dao.prototype.find = function(query, callback) {
    if (query._id && query._id.length == 24) {
        query._id = objectID.createFromHexString(query._id);
    }

    db.collection(this.collection).find(query).toArray(function(err, result) {
        if (err) {
            console.log('Error DB.find:' + err);
        } else if (callback) {
            callback(result);
        }
    });
}

// 從collection中尋找符合的資料並排序
dao.prototype.findAndSort = function(query, sortQuery, callback) {
    if (query._id && query._id.length == 24) {
        query._id = objectID.createFromHexString(query._id);
    }

    db.collection(this.collection).find(query).sort(sortQuery).toArray(function(err, result) {
        if (err) {
            console.log('Error DB.find:' + err);
        } else if (callback) {
            callback(result);
        }
    });
}

// 從collection中尋找符合的資料並排序且限制回傳資料數量
dao.prototype.findAndSortAndLimit = function(query, sortQuery, limitCount, callback) {

    if (query._id && query._id.length == 24) {
        query._id = objectID.createFromHexString(query._id);
    }

    db.collection(this.collection).find(query, {}, { sort: sortQuery, limit: limitCount }).toArray(function(err, result) {
        if (err) {
            console.log('Error DB.find:' + err);
        } else if (callback) {
            callback(result);
        }
    });
}

// 從collection中刪除資料
dao.prototype.remove = function(data, callback) {

    if (data._id && data._id.length == 24) {
        data._id = objectID.createFromHexString(data._id);
    }

    db.collection(this.collection).remove(data, true, function(err, result) {
        if (err) {
            console.log('Error DB.Remove:' + err + ' data: ' + JSON.stringify(data));
        } else if (callback) {
            callback(result);
        }
    });
};

// 更新資料(若無符合不會新增資料)
dao.prototype.update = function(data, callback) {
    var query = {};

    if (data._id) {
        query._id = data._id;
        if (query._id.length == 24) {
            query._id = objectID.createFromHexString(query._id);
        }
    } else {
        query = {
            _id: new objectID()
        };
    }

    delete data._id;

    db.collection(this.collection).update(query, {
        $set: data
    }, {
        upsert: false
    }, function(err, result) {
        if (err) {
            console.log('Error DB.Update (update):' + err + ' Query: ' + JSON.stringify(query) + ' Data: ' + JSON.stringify(data));
        } else if (callback) {
            callback(result);
        }
    });
};

// 更新資料以其他欄位作為主key(若無符合不會新增資料)
dao.prototype.updateByParam = function(query, dataSet, callback) {
    db.collection(this.collection).update(query, {
        $set: dataSet
    }, {
        upsert: false
    }, function(err, result) {
        if (err) {
            console.log('Error DB.Update (updateByParam):' + err + ' Query: ' + JSON.stringify(query));
        } else if (callback) {
            callback(result);
        }
    });
};

// 更新資料以其他欄位作為主key(若無符合會新增資料)
dao.prototype.saveByParam = function(query, dataSet, callback) {
    db.collection(this.collection).update(query, {
        $set: dataSet
    }, {
        upsert: true
    }, function(err, result) {
        if (err) {
            console.log('Error DB.Update (updateByParam):' + err + ' Query: ' + JSON.stringify(query));
        } else if (callback) {
            callback(result);
        }
    });
};

// 更新資料(若無符合會新增資料)
dao.prototype.save = function(data, callback) {
    var query = {};

    if (data._id) {
        query._id = data._id;
        if (query._id.length == 24) {
            query._id = objectID.createFromHexString(query._id);
        }
    } else {
        query = {
            _id: objectID()
        };
    }

    delete data._id;

    db.collection(this.collection).update(query, {
        $set: data
    }, {
        upsert: true
    }, function(err, result) {

        if (err) {
            console.log('Error DB.Update (save):' + err + ' Query: ' + JSON.stringify(query) + ' Data: ' + JSON.stringify(data));
            // throw err;
        } else if (callback) {
            callback(result);
        }

    });
};

// 新增資料
dao.prototype.insert = function(data, callback) {
    data._id = objectID();
    db.collection(this.collection).insert(data, {
        ordered: true
    }, function(err, result) {

        if (err) {
            console.log('Error DB.Update (save):' + err + ' Query: ' + JSON.stringify(query) + ' Data: ' + JSON.stringify(data));
            // throw err;
        } else if (callback) {
            callback(result);
        }

    });
};

exports.mongodb = dao;
