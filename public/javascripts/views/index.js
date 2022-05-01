$(document).ready(function () {
    $.ajax({
        url: '/getBulletins',
        dataType: 'json',
        type: 'get',
        success: function (result) {
            $('<p>').html($('<strong>').text(result.text)).appendTo($('#dialog'));
        }
    });
});