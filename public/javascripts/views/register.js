// 台灣身份證檢查簡短版 for Javascript (網路上現成的，直接COPY來用)
function checkTwID(id) {
    //建立字母分數陣列(A~Z)
    var city = new Array(
        1, 10, 19, 28, 37, 46, 55, 64, 39, 73, 82, 2, 11,
        20, 48, 29, 38, 47, 56, 65, 74, 83, 21, 3, 12, 30
    )
    id = id.toUpperCase();
    // 使用「正規表達式」檢驗格式
    if (id.search(/^[A-Z](1|2)\d{8}$/i) == -1) {
        return false;
    } else {
        //將字串分割為陣列(IE必需這麼做才不會出錯)
        id = id.split('');
        //計算總分
        var total = city[id[0].charCodeAt(0) - 65];
        for (var i = 1; i <= 8; i++) {
            total += eval(id[i]) * (9 - i);
        }
        //補上檢查碼(最後一碼)
        total += eval(id[9]);
        //檢查比對碼(餘數應為0);
        return ((total % 10 == 0));
    }
}

$(document).ready(function() {
    // 設定日曆初始值
    $('#birth').val('1990/01/01');

    // 加入一個驗證規則 [驗證身分證格式]
    jQuery.validator.addMethod("identityFormat", function(value, element) {
        var isValid = checkTwID(value);

        return this.optional(element) || isValid;
    }, "身分證字號格式錯誤");

    // 表單前端驗證
    $('form').validate({
        // 各驗證規則
        rules: {
            'data[identity]': {
                required: true,
                identityFormat: true,
                remote: {
                    url: '/checkIdentity',
                    type: 'post',
                    data: {
                        account: function() {
                            return $('#identity').val();
                        }
                    }
                }
            },
            'data[password]': {
                required: true,
                minlength: 8
            },
            'confirmPassword': {
                required: true,
                equalTo: '#password'
            },
            'data[birth]': {
                dateISO: true
            },
            'data[name]': {
                required: true
            },
        },
        // 各錯誤訊息
        messages: {
            'data[identity]': {
                remote: '此帳號已存在',
                required: '請輸入身分證字號'
            },
            'data[password]': {
                required: '請輸入密碼',
                'minlength': '請至少輸入八個字元'
            },
            'confirmPassword': {
                required: '請輸入確認密碼',
                'equalTo': '密碼與確認密碼不符'
            },
            'data[birth]': {
                dateISO: '日期格式錯誤'
            },
            'data[name]': {
                required: '請輸入姓名'
            }
        },
        submitHandler: function(form) {
            alert('審核已送出，請耐心等候!!');
            form.submit();
        }
    });

    // 日曆初始設定
    $('#birth').datepicker({
        autoclose: true,
        format: 'yyyy/mm/dd',
        defaultViewDate: {
            year: '1990'
        }
    });

    $('#department').change(function() {
        var dep = $(this).val(); // department值
        var div = ""; // division值，預設值空

        // 先清空division與jobtitle的選項
        $('#division').empty();
        $('#jobTitle').empty();

        // 重新取得該department的所有division
        $.ajax({
            url: '/getDivisionsByDep?dep=' + dep,
            type: 'get',
            dataType: 'json',
            success: function(result) {
                if (result) {
                    $('#division').show();

                    for (var i = 0; i < result.divisions.length; i++) {
                        var newOption = $('<option>');
                        newOption.text(result.divisions[i].name);
                        newOption.appendTo($('#division'));
                    }

                    $('#division')[0].selectedIndex = 0;
                    div = $('#division').val();
                } else {
                    $('#division').hide();
                }

                // 重新取得該division(department)的所有jobtitle
                $.ajax({
                    url: '/getJobTitlesByDepAndDiv?dep=' + dep + '&div=' + div,
                    type: 'get',
                    dataType: 'json',
                    success: function(result) {
                        if (result) {
                            for (var i = 0; i < result.jobTitiles.length; i++) {
                                var newOption = $('<option>');
                                newOption.text(result.jobTitiles[i]);
                                newOption.appendTo($('#jobTitle'));
                            }

                            $('#jobTitle')[0].selectedIndex = 0;
                        }
                    }
                });
            }
        });
    });

    $('#division').change(function() {
        var div = $(this).val(); // division值
        var dep = $('#department').val(); // department值

        // 先清空jobtitle的選項
        $('#jobTitle').empty();

        // 重新取得該division的所有jobtitle
        $.ajax({
            url: '/getJobTitlesByDepAndDiv?dep=' + dep + '&div=' + div,
            type: 'get',
            dataType: 'json',
            success: function(result) {
                if (result) {
                    for (var i = 0; i < result.jobTitiles.length; i++) {
                        var newOption = $('<option>');
                        newOption.text(result.jobTitiles[i]);
                        newOption.appendTo($('#jobTitle'));
                    }

                    $('#jobTitle')[0].selectedIndex = 0;
                }
            }
        });
    });

    // 取得所有department
    $.ajax({
        url: '/getAllDepartmentList',
        type: 'get',
        dataType: 'json',
        success: function(result) {
            if (result) {
                for (var i = 0; i < result.departmentList.length; i++) {
                    var newOption = $('<option>');
                    newOption.text(result.departmentList[i].name);
                    newOption.appendTo($('#department'));
                }

                // 預設值為第0個選項，並先觸發change事件，才能有division / jobtitle的選項
                $('#department')[0].selectedIndex = 0;
                $('#department').trigger('change');
            }
        }
    });
});
