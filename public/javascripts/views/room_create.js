$(document).ready(function () {
    $('#submit').click(function() {
        var room = $('#room').val();
        var belong = $('.radio :checked').val();

        if (room) {
            $.ajax({
                url: '/chat/isHasSameRoom',
                type: 'post',
                data: {
                    option: belong,
                    room: room
                },
                success: function(isHasSameRoom) {
                    if (isHasSameRoom) {
                        alert('此聊天室已存在');
                    } else {
                        $.ajax({
                            url: '/chat/createRoom',
                            type: 'post',
                            data: {
                                option: belong,
                                room: room
                            },
                            success: function(result) {
                                if (result) {
                                    alert('新增成功');
                                    $('form')[0].reset();
                                }
                            }
                        });
                    }
                }
            });
        }               
    });
});