var express = require('express');
var http = require('http');
var path = require('path');
var https = require('https');
var ssl = require('./sslLicense');
var chatServer = require('./routes/chat_server.js');
var login = require('./routes/login.js');
var chat = require('./routes/chat.js');
var member = require('./routes/member.js');
var bulletins = require('./routes/bulletins.js');
var authorize = require('./middleware/authorize.js');
var app = express();

// 初始設定
app.configure(function() {
    app.set('port', 3030);
    app.set('httpsport', 3000);
    app.set('views', __dirname + '/views');
    app.set('view engine', 'ejs');
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.cookieParser());
    app.use(express.session({
        secret: 'chat',
        cookie: {
            maxAge: 24 * 60 * 60 * 1000
        }
    }));
    app.use(function(req, res, next) {
        res.locals.session = req.session;
        next();
    });
    app.use('/chat', authorize);
    app.use(app.router);
    app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function() {
    app.use(express.errorHandler());
});

// 首頁 
app.get('/', chat.index);

// 取得首頁公告 
app.get('/getBulletins', bulletins.getBulletins);

// 登入頁面請求 
app.get('/login', login.form);

// 登入請求 
app.post('/login', login.submit);

// 登出請求 
app.get('/logout', login.logout);

// 註冊頁面請求 
app.get('/register', login.register);

// 註冊請求 
app.post('/register', login.submitRegister);

// 取得該user含有未讀訊息的room 
app.get('/getUnreadRoom/:IMEI', chat.getUnreadRoom);

// 用IMEI取得公布欄資料 
app.get('/getBulletinsByIMEI/:IMEI', bulletins.getBulletinsByIMEI);

// 聊天室主頁面 
app.get('/chat/room', chat.room);

// 聊天管理頁面請求 
app.get('/chat/chatManage', chat.chatManage);

// 取得該user所屬的room 
app.get('/chat/getRoomList', chat.getRoomList);

// 取得全部department 
app.get('/getAllDepartmentList', chat.getAllDepartmentList);

// 取得該room所屬的user 
app.get('/chat/getPeopleList/:department', chat.getPeopleList);

// 會員管理頁面請求 
app.get('/chat/memberManage', member.memberManage);

// 修改會員頁面請求 
app.get('/chat/memberModify', member.memberModify);

// 修改會員請求 
app.post('/chat/memberModify', member.submitMemberModify);

// 修改密碼頁面請求 
app.get('/chat/passwordModify', member.passwordModify);

// 修改密碼請求 
app.post('/chat/submitPasswordModify', member.submitPasswordModify);

// 驗證身分證有無重複 
app.post('/checkIdentity', login.checkIdentity);

// 儲存訊息內容 
app.post('/chat/saveMessage', chat.saveMessage);

// 取得該room所有的訊息 (暫時沒用到)
app.post('/chat/loadAllMessage', chat.loadAllMessage);

// 取得該room部分的訊息 
app.post('/chat/loadSomeMessage', chat.loadSomeMessage);

// 下載圖片 
app.get('/download/:room/:filename', chat.downloadPicture);

// 更新該user最晚在聊天室的時間
app.get('/chat/updateUserLatestTime/:room', chat.updateUserLatestTime); 

// 更新聊天室最新發話時間
app.post('/chat/updateRoomLatestTime', chat.updateRoomLatestTime);

// 新增聊天室頁面請求 
app.get('/chat/createRoom', chat.createRoom);

// 新增聊天室請求 
app.post('/chat/createRoom', chat.submitCreateRoom);

// 取得該department的所有division 
app.get('/getDivisionsByDep', chat.getDivisionsByDep);

// 取得該division(department)的所有職稱 (註: 有些department沒有division，所以會直接取該department的所有職稱) 
app.get('/getJobTitlesByDepAndDiv', chat.getJobTitlesByDepAndDiv);

// 賦予權限頁面請求 
app.get('/chat/giveAuth', member.giveAuth);

// 賦予權限請求  
app.post('/chat/giveAuth', member.submitGiveAuth);

// 取得該user的權限 
app.get('/chat/getAuthById', member.getAuthById);

// 公告管理頁面請求 
app.get('/chat/bulletinsManage', bulletins.bulletinsManage);

// 行動公告頁面請求 
app.get('/chat/appBulletins', bulletins.appBulletins);

// 公告頁面請求 
app.get('/chat/bulletins', bulletins.bulletins);

// 調整app公佈欄內容 
app.post('/chat/modifyAppBulletins', bulletins.modifyAppBulletins);

// 調整公佈欄內容 
app.post('/chat/modifyBulletins', bulletins.modifyBulletins);

// 審核名單頁面請求 
app.get('/chat/verifyList', member.verifyList);

// 取得待審核人員清單 
app.get('/chat/getVerifyList', member.getVerifyList);

// 駁回該user 
app.get('/chat/rejectUser/:id', member.rejectUser);

// 通過該user 
app.get('/chat/approveUser/:id', member.approveUser);

// 會員列表頁面請求 
app.get('/chat/approvedList/:department', member.approvedList);

// 取得會員列表 
app.get('/chat/getApprovedList/:department', member.getApprovedList);

// 新增聊天室時，判斷此聊天室是否已存在 
app.post('/chat/isHasSameRoom', chat.isHasSameRoom);  //end

// 取得該處組的會員
app.get('/chat/getUserByDep', member.getUserByDep);

// 將user加入聊天室
app.post('/chat/addUserToRoom', member.addUserToRoom);

// 視訊頁面請求
app.get('/chat/rtc', chat.rtc);

// 新增單位頁面請求 (暫時沒用到) 
app.get('/chat/createDepartment', chat.createDepartment);

// 新增單位請求 (暫時沒用到)
app.post('/chat/createDepartment', chat.submitCreateDepartment);

// 判斷該處組是否已存在 (暫時沒用到)
app.post('/chat/isHasSameDepartment', chat.isHasSameDepartment);

var httpsServer = https.createServer(ssl.options, app).listen(app.get('httpsport'), function() {
    console.log("Express server listening on port " + app.get('httpsport'));
});

var server = http.createServer(app).listen(app.get('port'), function() {
    console.log("Express server listening on port " + app.get('port'));
});

chatServer.listen(httpsServer);
chatServer.listen(server);
