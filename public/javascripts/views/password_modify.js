$(document).ready(function () {
    $('form').validate({
        rules: {
            'data[password]': {
                required: true,
                minlength: 8
            },
            'confirmPassword': {
                required: true,
                equalTo: '#password'
            }
        },
        messages: {
            'data[password]': {
                required: '請輸入密碼',
                'minlength': '請至少輸入八個字元'
            },
            'confirmPassword': {
                required: '請輸入確認密碼',
                'equalTo': '密碼與確認密碼不符'
            }
        },
        submitHandler: function (form) {
            alert('修改成功');
            form.submit();
        }
    });
});