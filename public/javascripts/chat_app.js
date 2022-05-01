var socket = io.connect();

// 製作訊息
function messageDivFactory(isMe, messageJson, isImmediate, isSomeLoad) {
    var messageUserName = messageJson.userName;
    var filename = messageJson.filename;
    var message = messageJson.text;
    var room = messageJson.room;
    var divMessage = $('<div>');
    var timestamp = new Date(messageJson.timestamp);

    divMessage.css('background-color', '#eee'); // 訊息背景顏色
    divMessage.css('word-wrap', 'break-word'); // 自動斷行
    divMessage.css('margin-bottom', '5px'); // 下間距
    divMessage.addClass('col-xs-8'); 

    // 是否是自己發出的訊息
    if (isMe) {
        divMessage.addClass('col-xs-offset-4');
        divMessage.addClass('text-right');
        divMessage.prop('align', 'right');
    } else {
        divMessage.append($('<strong>').text(messageUserName + ': '));
        divMessage.addClass('text-left');
        divMessage.prop('align', 'left');
    }

    // 判斷訊息是否為圖片
    if (filename) {
        var img = new Image();

        img.onload = function() {
            var imgLink = $('<a>');
            var downloadWord = $('<a>');
            var triggerLink = $('<a>');

            // 若非重新讀取的圖片，則調整圖片大小
            if (isImmediate) {
                img = scaleImg(img, 70, 70);
            }

            // 下載動作
            downloadWord.prop('href', 'javascript:void(0)');    
            downloadWord.click(function() {
                $.ajax({
                    url: '/download/' + room + '/' + filename,
                    type: 'get',
                    success: function(result) {
                        location.href = '/download/' + room + '/' + filename;
                    },
                    error: function(xhr, status, error) {
                        alert('圖片尚未上傳完成，請稍候再下載');
                    }
                });
            });

            // 下載小圖示
            downloadWord.html('<span class="glyphicon glyphicon-download-alt" aria-hidden="true">');

            // 幫縮圖加入圓角
            $(img).addClass('img-rounded');

            // 將縮圖加入連結，讓使用者可點擊，點擊後會出現fancy img
            imgLink.prop('id', 'imga' + count);
            imgLink.prop('href', 'javascript:void(0)');
            imgLink.html(img);
            imgLink.addClass('trigger');

            // 觸發用連結
            triggerLink.prop('id', 'trigger' + count)
            triggerLink.prop('href', '#img' + count++);
            triggerLink.addClass('fancy');

            // fancy box設定
            $('.fancy').fancybox({
                padding: 0,
                margin: 0
            });

            divMessage.append(imgLink);
            divMessage.append(downloadWord);
            divMessage.append(triggerLink);
            divMessage.append($('<p style="font-size:xx-small;color:Maroon">').text(timestamp.toLocaleString()));

            // 判斷是否部分讀取狀態
            if (!isSomeLoad) {
                $('#messages').scrollTop($('#messages').prop('scrollHeight'));
            } else {
                currentScrollTop += divMessage.height();
                $('#messages').scrollTop(currentScrollTop);
            }
        };

        // 如果不是立即傳送的訊息，則照路徑讀取圖片
        if (!isImmediate) {
            img.src = '/upload/' + room + '/' + 'thumb_' + filename;
        } else {
            img.src = message;
        }

    } 
    // 非圖片訊息
    else {    
        divMessage.append(filterXSS(message));
        divMessage.append($('<p style="font-size:xx-small;color:Maroon">').text(timestamp.toLocaleString()));

        if (!isSomeLoad) {
            $('#messages').scrollTop($('#messages').prop('scrollHeight'));
        } else {
            currentScrollTop += divMessage.height();
            $('#messages').scrollTop(currentScrollTop);
        }
    }

    return divMessage;
}

// 儲存訊息
function saveMsgByAjax(data) {
    $.ajax({
        url: '/chat/saveMessage',
        type: 'POST',
        data: data,
        success: function(result) {
            // success handle
        },
        error: function(xhr, status, error) {
            console.log(error);
        }
    });
}

// 更新user在此聊天室的最新時間
function updateUserLatestTimeByAjax(room) {
    $.ajax({
        url: '/chat/updateUserLatestTime/' + room,
        type: 'get',
        success: function(result) {
            // success handle
        },
        error: function(xhr, status, error) {
            console(error);
        }
    });
}

// 更新此聊天室的最新發話時間
function updateRoomLatestTimeByAjax(room) {
    var data = {};
    var url;

    data.room = room;

    if (chatTo) {
        data.chatTo = chatTo;
    }

    $.ajax({
        url: '/chat/updateRoomLatestTime',
        type: 'post',
        data: data,
        success: function(result) {
            updateUserLatestTimeByAjax(room);
        },
        error: function(xhr, status, error) {
            console(error);
        }
    });
}

// 調整圖片大小
function scaleImg(image, maxWidth, maxHeight) {
    var oldWidth = image.width;
    var oldHeight = image.height;
    var ratio = oldWidth / oldHeight;
    var maxRatio = maxWidth / maxHeight;
    var width;
    var height;

    if (oldWidth < maxWidth && oldHeight < maxHeight) {
        width = oldWidth;
        height = oldHeight;
    } else if (ratio > maxRatio) {
        width = oldWidth * maxHeight / oldHeight;
        height = maxHeight;

    } else {
        width = maxWidth;
        height = oldHeight * maxWidth / oldWidth;
    }

    image.width = width;
    image.height = height;

    return image;
}

// 使用者輸入文字
function processUserInput() {
    var sendMessage = $('#send-message').val();

    if (sendMessage != '') {
        var divMessage;
        var message = {
            room: room,
            text: sendMessage,
            userAccount: userAccount,
            userName: userName,
            timestamp: new Date()
        };
        socket.emit('message', message);

        saveMsgByAjax({
            room: room,
            userAccount: userAccount,
            userName: userName,
            text: sendMessage
        });

        divMessage = messageDivFactory(true, message, true, false);

        $('#messages').append(divMessage);
        $('#messages').scrollTop($('#messages').prop('scrollHeight'));

        updateRoomLatestTimeByAjax(room);
    }
}

$(document).ready(function() {
    $('#send-message').focus();

    // 加入房間
    socket.emit('join', {
        name: room
    });

    // 取得所有處組
    $.ajax({
        url:'/getAllDepartmentList',
        type: 'get',
        dataType: 'json',
        success: function(result) {
            if (result.departmentList && result.departmentList.length > 0) {
                for (var i = 0; i < result.departmentList.length; i++) {
                    var dep = result.departmentList[i].name;
                    var depOpt = $('<option>').val(dep).text(dep);
                    
                    depOpt.appendTo('#select_dep');
                }

                $('#select_dep')[0].selectedIndex = 0;
                $('#select_dep').trigger('change');

            }
        }
    });

    // 當成功進入房間時
    socket.on('joinResult', function(result) {
        var divSystemMessage;

        if (chatTo) {
            divSystemMessage = $('<div>').html(' 已成功進入房間 [ 與' + chatTo + '的對話 ] ');
        } else {
            divSystemMessage = $('<div>').html(' 已成功進入房間 [ ' + roomName + ' ] ');
        }

        $('#roomMessage').append(divSystemMessage);

        $.ajax({
            url: '/chat/loadSomeMessage',
            type: 'post',
            dataType: 'json',
            data: {
                room: room,
                latestTime: latestTime
            },
            success: function(result) {
                for (var i = 0; i < result.list.length; i++) {
                    var messageUser = result.list[i].userAccount;
                    var divMessage = messageDivFactory(messageUser == userAccount, result.list[i], false, false);
                    divMessage.insertAfter('.fancyImg');
                    latestTime = result.list[i].timestamp;
                }
            }
        });
    });

    // 當接受到訊息時
    socket.on('message', function(message) {
        var divMessage = messageDivFactory(false, message, true, false);

        updateUserLatestTimeByAjax(message.room);

        $('#messages').append(divMessage);
        $('#messages').scrollTop($('#messages').prop('scrollHeight'));
    });

    // 按下[加入朋友]
    $("#btn_add_user").click(function() {
        $.ajax({
            url: '/chat/addUserToRoom',
            type: 'post',
            data: {
                userIdArr: $("#select_user").val()
            },
            success: function(result) {
                alert('加入成功');
                $('#add_user_dialog').modal('hide');
            }
        });
    });

    // 加入朋友中的處組改變時
    $('#select_dep').change(function() {
        $('#select_user').empty();

        $('#select_user').multiselect({
            enableFiltering: true,
            enableClickableOptGroups: true,
            disableIfEmpty: true,
            filterPlaceholder: '搜尋',
            nonSelectedText: '未選取',
            allSelectedText: '全部選取'
        });

        $.ajax({
            url:'/chat/getUserByDep',
            type: 'get',
            dataType: 'json',
            data: {
                dep: $(this).val()
            },
            success: function(result) {
                if (result) {
                    for (var i = 0; i < result.users.length; i++) {
                        var optgroup = $("<optgroup>").attr('label', result.users[i].division);
                        var option = $("<option>").val(result.users[i]._id).text(result.users[i].jobTitle + " " + result.users[i].name);

                        if ($("optgroup[label='"+ result.users[i].division +"']").size() == 0) {
                            optgroup.appendTo("#select_user");
                            option.appendTo("#select_user");
                        } else {
                            option.insertAfter($("optgroup[label='"+ result.users[i].division +"']"));
                        }
                    }
                } 
                $("#select_user").multiselect('rebuild');
            }
        });
    });
    
    // 訊息捲軸滾動時
    $('#messages').on('scroll', function() {
        if ($(this).scrollTop() < 10) {
            currentScrollTop = 0;
            $.ajax({
                url: '/chat/loadSomeMessage',
                type: 'post',
                dataType: 'json',
                data: {
                    room: room,
                    latestTime: latestTime
                },
                success: function(result) {
                    for (var i = 0; i < result.list.length; i++) {
                        var messageUser = result.list[i].userAccount;
                        var divMessage = messageDivFactory(messageUser == userAccount, result.list[i], false, true);

                        divMessage.insertAfter('.fancyImg');
                        latestTime = result.list[i].timestamp;
                    }
                }
            });
        }
    });

    // 點擊fancy圖片
    $('.fancyImg').click(function() {
        $.fancybox.close();
    });

    // 點擊縮圖
    $('body').on('click', '.trigger', function() {
        var id = $(this).prop('id');
        var triggerId = id.replace('imga', 'trigger');
        var src = $(this).find('img').prop('src');
        var fancyImgId = id.replace('imga', 'img');
        var fancyImgSrc = src.replace('thumb_', '');

        $('#loading').show();
        $('.fancyImg').prop('id', id.replace('imga', 'img'));

        $('#' + fancyImgId).load(function() {
            $('#' + triggerId).trigger('click');
            $('#loading').hide();
        })

        $('.fancyImg').prop('src', fancyImgSrc);
    });

    // 送出訊息
    $('#send-form').submit(function() {
        processUserInput();
        $('#send-message').val('');
        return false;
    });

    // 按下[圖片]按鈕
    $('#btn_uploadFile').click(function() {
        $('#uploadFile').trigger('click');

        try{
            Android.inUploadFile();
        } catch(err){
            console.log(err);
        }
    });

    // 當使用者選擇圖片上傳
    $('#uploadFile').change(function() {
        var reg = /\.(jpg|gif|png)$/i;
        var filename = $(this).val();
        var lastIndex = filename.lastIndexOf("\\");
        var divMessage = $('<div>');
        var now = new Date().getTime();

        if (lastIndex >= 0) {
            filename = filename.substring(lastIndex + 1);
        }

        if (reg.test(filename)) {
            var reader = new FileReader();

            reader.onload = function(e) {
                var base64Img = e.target.result;
                var img = new Image();
                var fancyImg = new Image();
                var extension = filename.substr(filename.length - 3, filename.length);
                var message = {
                    room: room,
                    text: base64Img,
                    userAccount: userAccount,
                    userName: userName,
                    filename: now + '.' + extension,
                    timestamp: new Date()
                };
                var divMessage = messageDivFactory(true, message, true, false);

                divMessage.appendTo('#messages');
                $('#messages').scrollTop($('#messages').prop('scrollHeight'));
                socket.emit('message', message);
                saveMsgByAjax(message);
                updateRoomLatestTimeByAjax(room);
            }

            reader.readAsDataURL(this.files[0]);
        }
    });
});
