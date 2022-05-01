var db = require('../db_mongo.js').mongodb;
var daoUser = new db('User');
var daoRoom = new db('Room');
var crypto = require('crypto');

// 將明文hash成密文
function hash(plainText) {
    var hashedText;
    var query;
    var md5 = crypto.createHash('md5');

    md5.update(plainText, 'utf8');
    hashedText = md5.digest('hex');

    return hashedText;
}

// 登入頁面請求
exports.form = function(req, res) {
    var user = req.session.user;
    var IMEI = req.query.IMEI;

    if (user) {
        res.redirect('/');
    } else {
        if (IMEI) {
            console.log('手機版user: ' + IMEI + '登入');
            req.IMEI = IMEI;
            req.session.IMEI = IMEI;
        } else {
            console.log('PC版user登入');
        }

        res.render('login', {
            errMsg: ''
        });
    }
}

// 登入請求
exports.submit = function(req, res) {
    var user = req.body.user;
    var hashedPass = hash(user.pass);
    var IMEI = req.session.IMEI;
    var query = {
        account: user.name.toUpperCase()
    };

    daoUser.findOne(query, function(result) {
        if (result) {
            if (result.status != 'approved') {
                res.render('login', {
                    errMsg: '帳號審核中!!'
                });
            } else if (result.password != hashedPass) {
                res.render('login', {
                    errMsg: '密碼錯誤!!'
                });
            } else {
                if (result.IMEI) {
                    if (result.IMEI == IMEI || !IMEI) {
                        var day = 24 * 60 * 60 * 1000;

                        req.session.cookie.expires = new Date(Date.now() + day);
                        req.session.user = result;
                        res.render('index');
                    } else {
                        res.render('login', {
                            errMsg: '此行動裝置與申請帳號的行動裝置不符!!'
                        });
                    }
                } else {
                    result.IMEI = IMEI;
                    daoUser.save(result, function(saveResult) {
                        if (saveResult) {
                            var day = 24 * 60 * 60 * 1000;

                            req.session.cookie.expires = new Date(Date.now() + day);
                            req.session.user = result;
                            res.render('index');
                        }
                    })
                }
            } 
        } else {
            res.render('login', {
                errMsg: '此帳號尚未申請!!'
            });
        }
    });
}

// 登出請求
exports.logout = function(req, res) {
    delete req.session.user;
    res.redirect('/login');
}

// 註冊頁面請求
exports.register = function(req, res) {
    res.render('register');
}

// 確認是否有重複身分證號碼
exports.checkIdentity = function(req, res) {
    var query = {
        account: req.body.account
    };

    daoUser.findOne(query, function(result) {
        if (result) {
            res.end('false');
        } else {
            res.end('true');
        }
    });
}

// 註冊請求
exports.submitRegister = function(req, res) {
    var data = req.body.data;
    var hashedPass = hash(data.password);
    var now = new Date();
    var userData;
    var findRoomQuery;
    var rooms = [];

    // 共用或是該user所屬處組的聊天室
    findRoomQuery = {
        $or: [
            { belong: 'all' },
            { name: data.department }
        ]
    };

    // 該user所填寫的個資
    userData = {
        account: data.identity.toUpperCase(),
        password: hashedPass,
        sex: data.sex,
        name: data.name,
        birth: data.birth,
        department: data.department, // 某某處 ex.後勤處
        division: data.division, // 某某科 ex.軍醫科
        level: data.level, // 級職
        status: 'verifying',
        IMEI: req.session.IMEI,
        auth: {
            isAdmin: "false",
            canBrowseUser: "false",
            canCreateDepartment: "false",
            canCreateRoom: "false",
            canModifyBulletins: "false",
            canVerifyUser: "false"
        },
        jobTitle: data.jobTitle
    };

    // 共用或是該user所屬處組的聊天室
    daoRoom.find(findRoomQuery, function(roomResult) {
        var pushRoom = function(i) {
            if (i < roomResult.length) {
                rooms.push({
                    id: roomResult[i]._id,
                    name: roomResult[i].name,
                    timestamp: now
                });

                pushRoom(i + 1);
            }
            else {
                userData.rooms = rooms;

                daoUser.save(userData, function(result) {
                    if (result) {
                        res.render('login', {
                            errMsg: ''
                        });
                    } else {
                        console.log('註冊使用者失敗(submitRegister)');
                    }
                });
            }
        };

        pushRoom(0);
    })
}
