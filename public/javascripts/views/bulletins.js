$(document).ready(function () {
    $('#btn_send').click(function() {
        var content = $('#content').val();
        
        if (content) {
            $.ajax({
                url: '/chat/modifyBulletins',
                type: 'post',
                data: {
                    data: content
                },
                success: function (result) {
                    $('#content').val('');
                    alert('修改成功');
                }
            });
        } else {
            alert('請輸入內容');
        }
    });
});