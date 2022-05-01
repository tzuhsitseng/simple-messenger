var db = require('../db_mongo.js').mongodb;
var daoUser = new db('User');
var crypto = require('crypto');

function hash(plainText) {
    var hashedText;
    var query;
    var md5 = crypto.createHash('md5');

    md5.update(plainText, 'utf8');
    hashedText = md5.digest('hex');

    return hashedText;
}

// 會員管理頁面請求
exports.memberManage = function(req, res) {
    res.render('member_manage');
}

// 修改會員頁面請求
exports.memberModify = function(req, res) {
    res.render('member_modify', {
        user: req.session.user
    });

}

// 修改密碼頁面請求
exports.passwordModify = function(req, res) {
    res.render('password_modify', {
        user: req.session.user
    });

}

// 修改會員請求
exports.submitMemberModify = function(req, res) {
    var user = req.body.data;
    var data = {
        _id: req.session.user._id,
        sex: user.sex,
        name: user.name,
        birth: user.birth,
        department: user.department,
        division: user.division,
        level: user.level,
        jobTitle: user.jobTitle
    };

    daoUser.update(data, function(result) {
        if (result) {
            res.redirect('/');
        } else {
            console.log('修改會員失敗(submitMemberModify)');
        }
    });

}

// 修改密碼請求
exports.submitPasswordModify = function(req, res) {
    var user = req.body.data;
    var hashedPass = hash(user.password);
    var data = {
        _id: req.session.user._id,
        password: hashedPass
    };

    daoUser.update(data, function(result) {
        if (result) {
            res.redirect('/');
        } else {
            console.log('修改密碼失敗(submitMemberModify)');
        }
    });

}

// 賦予權限頁面請求
exports.giveAuth = function(req, res) {
    var id = req.query.id;
    var query = {};

    res.render('auth_given', {
        id: id
    });
}

// 賦予權限請求
exports.submitGiveAuth = function(req, res) {
    var auth = req.body.auth;
    var id = req.body.id;
    var query = {};

    query._id = id;
    query.auth = auth;

    daoUser.update(query, function(result) {
        if (result) {
            res.send(true);
        } else {
            res.send(false);
        }
    });
}

// 取得該user的權限
exports.getAuthById = function(req, res) {
    var id = req.query.id;
    var query = {};

    query._id = id;

    daoUser.findOne(query, function(result) {
        if (result) {
            res.json({
                auth: result.auth
            });
        } else {
            res.json(null);
        }
    });
}

// 審核名單頁面請求
exports.verifyList = function(req, res) {
    res.render('verify_list');
};

// 取得待審核人員清單
exports.getVerifyList = function(req, res) {
    var query = {
        status: 'verifying'
    };

    daoUser.find(query, function(result) {
        if (result) {
            res.json({
                list: result
            });
        } else {
            res.json(null);
        }
    });
};

// 駁回該user
exports.rejectUser = function(req, res) {
    var query = {
        _id: req.params.id
    };

    daoUser.remove(query, function(result) {
        if (result) {
            res.send(200);
        }
    });
}

// 通過該user
exports.approveUser = function(req, res) {
    var query = {
        _id: req.params.id,
        status: 'approved'
    };

    daoUser.update(query, function(result) {
        if (result) {
            res.send(200);
        }
    });
}

// 會員列表頁面請求
exports.approvedList = function(req, res) {
    res.render('approved_list', {
        department: req.params.department
    });
}

// 取得會員列表
exports.getApprovedList = function(req, res) {
    var query = {
        status: 'approved',
        department: req.params.department
    };

    daoUser.find(query, function(result) {
        if (result) {
            res.json({
                list: result
            });
        } else {
            res.json(null);
        }
    });
}

exports.getUserByDep = function(req, res) {
    var dep = req.query.dep;
    var query = {};

    query.department = dep;

    daoUser.find(query, function(result) {
        if (result && result.length > 0) {
            res.json({
                users: result
            });
        } else {
            res.json(null);
        }
    });
}

exports.addUserToRoom = function(req, res) {
    var userIdArr = req.body.userIdArr;
    var room = req.session.room;
    var roomName = req.session.roomName;

    researchUser = function(i) {
        if (i < userIdArr.length) {
            var query = {};

            query._id = userIdArr[i];

            daoUser.findOne(query, function(result) {
                if (result) {
                    var roomList = result.rooms;
                    var isExist = false;

                    if (roomList && roomList.length > 0) {
                        for (var j = 0; j < roomList.length; j++) {
                            if (room == roomList[j].id) {
                                isExist = true;
                            }
                        }

                        if (!isExist) {
                            result.rooms.push({
                                id: room,
                                name: roomName,
                                timestamp: new Date()
                            });
                        }
                    } else {
                        result.rooms = [{
                            id: room,
                            name: roomName,
                            timestamp: new Date()
                        }];
                    }

                    daoUser.save(result, function(saveResult) {
                        if (saveResult) {
                            console.log('使用者加入聊天室成功');
                        }
                        researchUser(i + 1);
                    })
                }
            });
        } else {
            res.send(true);
        }
    }

    researchUser(0);
}