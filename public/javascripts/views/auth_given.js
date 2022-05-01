var auth;

$(document).ready(function() {
    $.ajax({
        url: '/chat/getAuthById?id=' + id,
        dataType: 'json',
        type: 'get',
        success: function(result) {
            auth = result.auth;
            if (result) {
                for (key in result.auth) {
                    $('#' + key).prop('checked', result.auth[key] == 'true');                        
                }
            }
        }
    });

    $('#send').click(function() {
        $.ajax({
            url: '/chat/giveAuth',
            dataType: 'json',
            type: 'post',
            data: {
                id: id,
                auth: auth
            },
            success: function(result) {
                alert('修改成功');
            }
        });
    });

    $('input[type="checkbox"]').change(function(){
        var key = $(this).attr('id');
        auth[key] = $(this).prop('checked') == true;
    });
});