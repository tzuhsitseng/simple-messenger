$(document).ready(function () {
    $("#btn_bulletins").click(function () {
        $(location).attr('href', '/chat/bulletins');
    });

    $("#btn_app_bulletins").click(function () {
        $(location).attr('href', '/chat/appBulletins');
    });
});