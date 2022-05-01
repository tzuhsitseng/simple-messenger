$(document).ready(function () {
    $('#register').click(function () {
        location.href = '/register';
    });

    $('form').submit(function () {
        var name = $('#name').val();
        var password = $('#password').val();

        if (!name || !password) {
            $('#errMsg').text('帳號/密碼不可空白!!');
            return false;
        }
    });
});