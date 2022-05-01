var fs = require('fs');
var db = require('../db_mongo.js').mongodb;
var daoNoticeShortList = new db('NoticeShortList');
var daoUser = new db('User');

// 取得首頁公告
exports.getBulletins = function(req, res) {
    var text = '';

    fs.readFile('./bulletins.txt', function(err, data) {
        if (data) {
            text = data.toString();
        }

        res.json({
            text: text
        });
    });
}

// 公告管理頁面請求
exports.bulletinsManage = function (req, res) {
	res.render('bulletins_manage');
}

// 行動公告頁面請求
exports.appBulletins = function (req, res) {
	res.render('app_bulletins');
}

// 公告頁面請求
exports.bulletins = function (req, res) {
	res.render('bulletins');
}

// 調整app公佈欄內容
exports.modifyAppBulletins = function (req, res) {
	var data = req.body;
	var arrIMEI = [];

	// 選擇多個處組
	if (data.department.length) {
		var searchDep = function(i) {
			if (i < data.department.length) {
				var query = {};

				query.department = data.department[i];

				daoUser.find(query, function(result) {
					if (result) {
						var searchUser = function(j) {
							if (j < result.length) {
								if (result[j].IMEI) {
									arrIMEI.push(result[j].IMEI);
								}
								searchUser(j + 1);
							} else {
								researchUser(i + 1);
							}
						};
						searchUser(0);
					}
				});
			} else {
				daoNoticeShortList.insert({
					title: data.title,
					article: data.content,
					IMEI: arrIMEI,
					timestamp: new Date()
				}, function(insertResult) {
					if (insertResult) {
						res.send(true);
					} else {
						res.send(false);
					}
				});
			}
		}

		searchDep(0);
	} 
	// 選擇單一處組
	else {
		var query = {};

		query.department = data.department;

		daoUser.find(query, function(result) {
			if (result) {
				var searchUser = function(i) {
					if (i < result.length) {
						if (result[i].IMEI) {
							arrIMEI.push(result[i].IMEI);
						}
						searchUser(i + 1);
					} else {
						daoNoticeShortList.insert({
							title: data.title,
							article: data.content,
							IMEI: arrIMEI,
							timestamp: new Date()
						}, function(insertResult) {
							if (insertResult) {
								res.send(true);
							} else {
								res.send(false);
							}
						});
					}
				};

				searchUser(0);
			}
		});
	}
}

// 調整公佈欄內容
exports.modifyBulletins = function (req, res) {
	var data = req.body.data;

	fs.writeFile('bulletins.txt', data, function (err) {
		if (err) {
			console.log(err);
		}
		res.send(200);
	});
}

// 取得首頁公告
exports.getBulletins = function(req, res) {
    fs.readFile('../chat/bulletins.txt', function (err, data) {
        res.json({
            text: data.toString()
        });
    });
}

// 用IMEI取得公布欄資料
exports.getBulletinsByIMEI = function(req, res) {
    var IMEI = req.params.IMEI;
    var query = {
        IMEI: {
            $in: [IMEI]
        }
    };

    if (IMEI) {
        daoNoticeShortList.findAndSortAndLimit(query, [
            ['timestamp', 'desc']
        ], 1, function(result) {
            if (result && result.length > 0) {
                res.json({
                    title: result[0].title,
                    article: result[0].article
                });
            } else {
                res.json(null);
            }
        });
    }
}