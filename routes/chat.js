var db = require('../db_mongo.js').mongodb;
var daoUser = new db('User');
var daoRoom = new db('Room');
var daoPersonalRoom = new db('PersonalRoom');
var daoMessage = new db('Message');
var daoDepartment = new db('Department');
var daoNoticeShortList = new db('NoticeShortList');
var nodeCryptoJS = require('node-cryptojs-aes');
var cryptoJS = nodeCryptoJS.CryptoJS;
var jsonFormatter = nodeCryptoJS.JsonFormatter;
var fs = require('fs');
var mime = require('mime');
var imageAPI = require('./image.js');

function updateUserLatestTime(account, room, rooms, isPersonal) {
    var now = new Date();
    var data = {
        account: account
    };

    if (!isPersonal) {
        if (rooms) {
            for (var i = 0; i < rooms.length; i++) {
                if (rooms[i].id == room) {
                    rooms[i].timestamp = now;
                } else {
                    rooms[i].timestamp = new Date(rooms[i].timestamp);
                }
            }
        }

        data.rooms = rooms;
    } else {
        var isExist = false;

        if (rooms) {
            for (var i = 0; i < rooms.length; i++) {
                if (rooms[i].name == room) {
                    rooms[i].timestamp = now;
                    isExist = true;
                } else {
                    rooms[i].timestamp = new Date(rooms[i].timestamp);
                }
            }
        } else {
            rooms = [];
        }

        if (!isExist) {
            rooms.push({
                name: room,
                timestamp: now
            });
        }

        data.personalRooms = rooms;
    }

    daoUser.updateByParam({ account: data.account }, data, function(result) {
        if (result) {
            console.log('更新timestamp成功(user)');
        } else {
            console.log('更新timestamp錯誤(user)');
        }
    });
}

// 首頁
exports.index = function(req, res) {
    if (req.session.user) {
        res.render('index');
    } else {
        res.render('login');
    }
};

// 聊天室主頁面
exports.room = function(req, res) {
    var chatTo = req.query.chatTo;
    var roomId = req.query.id;
    var roomName = req.query.name;
    var query = {};

    if (chatTo) {
        updateUserLatestTime(req.session.user.account, roomId, req.session.user.personalRooms, true);
        req.session.room = roomId;
        req.session.chatTo = chatTo;
        res.render('chat');
    } else {
        daoUser.findOne({ account: req.session.user.account }, function(result) {
            if (result) {
                console.log(result.rooms);
                updateUserLatestTime(req.session.user.account, roomId, result.rooms, false);
                req.session.room = roomId;
                req.session.roomName = roomName;
                delete req.session.chatTo;
            }
            res.render('chat');
        });
    }
};

// 聊天管理頁面請求
exports.chatManage = function(req, res) {
    res.render('chat_manage');
}

// 取得該user所屬的room
exports.getRoomList = function(req, res) {
    var roomList = [];
    var output;

    daoUser.findOne({
        account: req.session.user.account
    }, function(result) {
        if (result) {
            for (var i = 0; i < result.rooms.length; i++) {
                roomList.push(result.rooms[i]);
            }

            output = {
                roomList: roomList
            };

            res.json(output);
        } else {
            console.log('找不到該user(getRoomList)');
            res.json(null);
        }
    });
};

// 取得全部department
exports.getAllDepartmentList = function(req, res) {
    daoDepartment.find({}, function(result) {
        if (result) {
            var output = {
                departmentList: result
            };

            res.json(output);
        } else {
            res.json(null);
        }
    });
}

// 取得該room所屬的user
exports.getPeopleList = function(req, res) {
    var department = req.params.department;
    var query = {
        department: department,
        account: {
            $ne: req.session.user.account
        }
    };

    daoUser.find(query, function(result) {
        if (result) {
            var output = {
                peopleList: result
            };

            res.json(output);
        } else {
            res.json(null);
        }
    });
}

// 更新該user最晚在聊天室的時間
exports.updateUserLatestTime = function(req, res) {
    daoUser.findOne({ account: req.session.user.account }, function(result) {
        if (result) {
            updateUserLatestTime(req.session.user.account, req.params.room, result.rooms);
        }
        res.end();
    });
}

// 更新聊天室最新發話時間
exports.updateRoomLatestTime = function(req, res) {
    var chatTo = req.body.chatTo;
    var data;
    var query;

    if (chatTo) {
        query = {
            name: req.body.room
        };

        data = {
            latestTime: new Date(),
            latestUser: {
                id: req.session.user._id,
                name: req.session.user.name
            }
        };

        daoPersonalRoom.saveByParam(query, data, function(result) {
            if (result) {
                console.log('更新timestamp成功(personalRoom)');
            } else {
                console.log('更新timestamp錯誤(personalRoom)');
            }
        });
    } else {
        query = {
            _id: req.body.room,
            latestTime: new Date()
        };

        daoRoom.save(query, function(result) {
            if (result) {
                console.log('更新timestamp成功(room)');
            } else {
                console.log('更新timestamp錯誤(room)');
            }
        });
    }

    res.end();
}

// 儲存訊息內容
exports.saveMessage = function(req, res) {
    var room = req.body.room;
    var userAccount = req.body.userAccount;
    var userName = req.body.userName;
    var text = req.body.text;
    var timestamp = new Date();
    var encryptedMsg;
    var filename = req.body.filename;
    var data = {
        room: room,
        userAccount: userAccount,
        userName: userName,
        timestamp: timestamp
    };

    if (filename) {
        var base64Data;
        var extension;
        var dir = 'public/upload/' + room;
        var path = 'public/upload/' + room + '/' + filename;

        data.filename = filename;
        base64Data = text.replace(/^data:image\/(jpeg|png|gif);base64,/, "");
        extension = filename.substr(filename.length - 3, filename.length);
        fs.exists(dir, function(exists) {
            if (exists) {
                fs.writeFile(path, base64Data, 'base64', function(err) {
                    if (err) {
                        console.log(err);
                    } else {
                        imageAPI.resize(dir, dir, filename, 70, 70);
                    }
                });
            } else {
                fs.mkdir(dir, function() {
                    fs.writeFile(path, base64Data, 'base64', function(err) {
                        if (err) {
                            console.log(err);
                        } else {
                            imageAPI.resize(dir, dir, filename, 70, 70);
                        }
                    });
                });
            }
        });
    } else {
        encryptedMsg = cryptoJS.AES.encrypt(text, 'somekey', {
            format: jsonFormatter
        });
        data.text = encryptedMsg.toString();
    }

    daoMessage.insert(data, function(result) {
        if (result) {
            res.send(200);
        } else {
            console.log('訊息儲存錯誤(saveMessage)');
        }
    });
}

// 取得該room所有的訊息
exports.loadAllMessage = function(req, res) {
    var room = req.body.room;
    var query = {
        room: room
    };

    daoMessage.findAndSort(query, {
        timestamp: 1
    }, function(result) {
        if (result) {
            for (var i = 0; i < result.length; i++) {
                if (!result[i].filename) {
                    var decrypted = cryptoJS.AES.decrypt(result[i].text, 'somekey', {
                        format: jsonFormatter
                    });

                    result[i].text = cryptoJS.enc.Utf8.stringify(decrypted);
                }
            }

            res.json({
                list: result
            });
        } else {
            res.json(null);
        }
    });
}

// 取得該room部分的訊息
exports.loadSomeMessage = function(req, res) {
    var room = req.body.room;
    var latestTime = req.body.latestTime;
    var query = {
        room: room,
        timestamp: {
            $lt: new Date(latestTime)
        }
    };

    daoMessage.findAndSortAndLimit(query, [
            ['timestamp', 'desc']
        ], 20,
        function(result) {
            if (result) {
                for (var i = 0; i < result.length; i++) {
                    if (!result[i].filename) {
                        var decrypted = cryptoJS.AES.decrypt(result[i].text, 'somekey', {
                            format: jsonFormatter
                        });

                        result[i].text = cryptoJS.enc.Utf8.stringify(decrypted);
                    }
                }

                res.json({
                    list: result
                });
            } else {
                res.json(null);
            }
        });
}

// 取得該user含有未讀訊息的room
exports.getUnreadRoom = function(req, res) {
    var IMEI = req.params.IMEI;
    var query = {
        IMEI: IMEI
    };

    daoUser.findOne(query, function(result) {
        if (result) {
            var outputArr = [];

             // 尋找是否有未讀群組聊天室
            var searchRoom = function(i) {
                if (result.rooms && result.rooms.length > 0) {
                    if (i < result.rooms.length) {
                        daoRoom.findOne({
                            _id: result.rooms[i].id,
                            latestTime: {
                                $gt: result.rooms[i].timestamp
                            }
                        }, function(result) {
                            if (result) {
                                outputArr.push(result.name);
                            }
                            searchRoom(i + 1);
                        });
                    } else {
                        // 尋找是否有未讀個人聊天室
                        var searchPersonalRoom = function(j) {
                            if (result.personalRooms && result.personalRooms.length > 0) {
                                if (j < result.personalRooms.length) {
                                    daoPersonalRoom.findOne({
                                        name: result.personalRooms[j].name,
                                        latestTime: {
                                            $gt: result.personalRooms[j].timestamp
                                        }
                                    }, function(result) {
                                        if (result) {
                                            outputArr.push(result.latestUser.name);
                                        }
                                        searchPersonalRoom(j + 1);
                                    });
                                } else {
                                    res.json({
                                        outputArr: outputArr
                                    });
                                }
                            } else {
                                res.json({
                                    outputArr: outputArr
                                });
                            }
                        }
                        searchPersonalRoom(0);
                    }
                }

            }
            searchRoom(0);
        } else {
            res.json(null);
        }
    });
}

// 下載圖片 
exports.downloadPicture = function(req, res) {
    var room = req.params.room;
    var filename = req.params.filename;

    if (filename) {
        var mimeType;
        var extension = filename.substr(filename.length - 3, filename.length);

        fs.exists('public/upload/' + room + '/' + filename, function(exists) {
            if (exists) {
                res.download('public/upload/' + room + '/' + filename);
            } else {
                res.send(404);
            }
        });


    }
}

// 新增單位頁面請求
exports.createDepartment = function(req, res) {
    res.render('department_create');
}

exports.submitCreateDepartment = function(req, res) {
    var department = req.body.department;
    var division = req.body.division;
    var isExist = false;

    daoDepartment.findOne({
        name: department
    }, function(result) {
        if (result) {
            if (result.divisions && result.divisions.length > 0) {
                for (var i = 0; i < result.divisions.length; i++) {
                    if (result.divisions[i].name == division) {
                        isExist = true;
                    }
                }

                if (!isExist) {
                    result.divisions.push({
                        name: division,
                        jobTitles: []
                    });
                }
            } else {
                result.divisions = [{
                    name: division,
                    jobTitles: []
                }];
            }

            daoDepartment.saveByParam({
                name: department
            }, result, function(saveResult) {
                if (!saveResult) {
                    console.log('新增單位失敗');
                    res.send(false);
                } else {
                    console.log('新增單位成功');
                    res.send(true);
                }

            });
        } else {
            daoDepartment.save({
                name: department,
                divisions: [{
                    name: division,
                    jobTitles: []
                }]
            }, function(result) {
                if (!result) {
                    console.log('新增單位失敗');
                    res.send(false);
                } else {
                    console.log('新增單位成功');
                    res.send(true);
                }
            })
        }
    });
}

// 新增聊天室頁面請求
exports.createRoom = function(req, res) {
    res.render('room_create');
}

// 新增聊天室請求
exports.submitCreateRoom = function(req, res) {
    var belong = req.body.option;
    var room = req.body.room;
    var query = {
        belong: belong,
        name: room
    };

    daoRoom.saveByParam(query, query, function(result) {
        if (result) {
            daoRoom.findOne(query, function(roomResult) {
                // 若新增的是共用的聊天室，則將全部的會員都加入此聊天室
                if (belong == 'all') {
                    daoUser.find({}, function(allUsers) {
                        if (allUsers && allUsers.length > 0) {
                            var updateAllUser = function(i) {
                                if (i < allUsers.length) {
                                    allUsers[i].rooms.push({
                                        id: roomResult._id,
                                        name: room,
                                        timestamp: new Date()
                                    });

                                    daoUser.update(allUsers[i], function(updateUser) {
                                        updateAllUser(i + 1);
                                    });
                                } else {
                                    res.send(200);
                                }
                            }
                            updateAllUser(0);
                        }
                    });
                }
                // 若新增的是某處室的聊天室，則將該處室的會員都加入此聊天室 
                else {
                    daoUser.find({
                        department: belong
                    }, function(belongUsers) {
                        if (belongUsers && belongUsers.length > 0) {
                            var updateBelongUser = function(i) {
                                if (i < belongUsers.length) {
                                    belongUsers[i].rooms.push({
                                        id: roomResult._id,
                                        name: room,
                                        timestamp: new Date()
                                    });

                                    daoUser.update(belongUsers[i], function(updateUser) {
                                        updateBelongUser(i + 1);
                                    });
                                } else {
                                    res.send(200);
                                }
                            }
                            updateBelongUser(0);
                        }

                    });
                }
            });
        } else {
            console.log('新增聊天室失敗');
            res.send(false);
        }
    });
}

// 取得該department的所有division
exports.getDivisionsByDep = function(req, res) {
    var dep = req.query.dep;
    var query = {};

    // 把該department放入查詢中即可
    query.name = dep;

    daoDepartment.findOne(query, function(result) {
        if (result) {
            if (result.divisions && result.divisions.length > 0) {
                res.json({
                    divisions: result.divisions
                });
            } else {
                res.json(null);
            }
        } else {
            res.json(null);
        }
    });
}

// 取得該division(department)的所有職稱 (註: 有些department沒有division，所以會直接取該department的所有職稱)
exports.getJobTitlesByDepAndDiv = function(req, res) {
    var dep = req.query.dep;
    var div = req.query.div;
    var query = {};

    query.name = dep;

    daoDepartment.findOne(query, function(result) {
        if (result) {
            // 先判斷請求有無division，若有，則取該division的職稱
            if (div) {
                for (var i = 0; i < result.divisions.length; i++) {
                    if (result.divisions[i].name == div) {
                        res.json({
                            jobTitiles: result.divisions[i].jobTitles
                        });
                    }
                }
            }
            // 若無，則取該department的職稱
            else {
                if (result.jobTitles && result.jobTitles.length > 0) {
                    res.json({
                        jobTitiles: result.jobTitles
                    });
                } else {
                    res.json(null);
                }
            }
        } else {
            res.json(null);
        }
    });
}

// 新增聊天室時，判斷此聊天室是否已存在
exports.isHasSameRoom = function(req, res) {
    var belong = req.body.option;
    var room = req.body.room;
    var query = {
        belong: belong,
        name: room
    };

    daoRoom.findOne(query, function(result) {
        if (result) {
            res.send(true);
        } else {
            res.send(false);
        }
    });
}

exports.isHasSameDepartment = function(req, res) {
    var department = req.body.dep;
    var division = req.body.div;
    var isExist = false;

    daoDepartment.findOne({
        name: department
    }, function(result) {
        if (result) {
            if (result.divisions && result.divisions.length > 0) {
                var searchDiv = function(i) {
                    if (i < result.divisions.length) {
                        if (result.divisions[i].name == division) {

                            res.send(true);

                        } else {
                            searchDiv(i + 1);
                        }
                    } else {
                        res.send(false);
                    }
                };

                searchDiv(0);
            } else {
                res.send(false);
            }
        } else {
            res.send(false);
        }
    });
}

exports.rtc = function(req, res) {
    res.render('rtc');
}