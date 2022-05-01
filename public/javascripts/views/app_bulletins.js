$(document).ready(function () {
    $.ajax({
        url: '/getAllDepartmentList',
        type: 'get',
        dataType: 'json',
        success: function(result) {
            for (var i = 0; i < result.departmentList.length; i++) {
                var dep = result.departmentList[i].name;
                var newOpt = $('<option>').text(dep).val(dep);
                $('#department').append(newOpt);
            }
        }
    });


    $('#btn_send').click(function() {
        var title = $('#title').val();
        var content = $('#content').val();

        if (title && content) {
            $.ajax({
                url: '/chat/modifyAppBulletins',
                type: 'post',
                data: {
                    title: $('#title').val(),
                    content: $('#content').val(),
                    department: $('#department').val()
                },
                success: function (result) {
                    $('#title').val('');
                    $('#content').val('');
                    alert('修改成功');
                }
            });
        } else {
            alert('請輸入標題/內容');
        }
    });
});