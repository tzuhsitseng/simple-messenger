$(document).ready(function () {
    $.ajax({
        url: '/getAllDepartmentList',
        type: 'get',
        dataType: 'json',
        success: function(result) {
            if (result) {
                var dep = department;
                var div = division;

                for (var i = 0; i < result.departmentList.length; i++) {
                    var newOption = $('<option>');
                    newOption.text(result.departmentList[i].name);
                    newOption.appendTo($('#department'));
                }

                $('#department').val(dep);

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
                            if (div) {
                                $('#division').show();
                                $('#division').val(div);
                            }
                            else {
                                $('#division').hide();
                            }
                        } else {
                            $('#division').hide();
                        }


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

                                    $('#jobTitle').val(jobTitle);
                                }
                            }
                        });
                    }
                });
            }
        }
    });

    $('#identity').val(account);
    $('input[value="' + sex + '"]').attr('checked', true);
    $('#name').val(name);
    $('#birth').val(birth);
    $('#level').val(level);
    $('#jobTitle').val(jobTitle);
    
    $('form').validate({
        rules: {
            'data[identity]': {
                required: true,
                identityFormat: true,
                remote: {
                    url: '/checkIdentity',
                    type: 'post',
                    data: {
                        account: function () {
                            return $('#identity').val();
                        }
                    }
                }
            },
            'data[birth]': {
                dateISO: true
            },
            'data[name]': {
                required: true
            },
        },
        messages: {
            'data[identity]': {
                remote: '此帳號已存在',
                required: '請輸入身分證字號'
            },
            'data[birth]': {
                dateISO: '日期格式錯誤'
            },
            'data[name]': {
                required: '請輸入姓名'
            }
        },
        submitHandler: function (form) {
            alert('修改成功');
            form.submit();
        }
    });

    $('#birth').datepicker({
        autoclose: true,
        format: 'yyyy/mm/dd',
        defaultViewDate: {
            year: '1990'
        }
    });

    $('#department').change(function () {
        var dep = $(this).val();
        var div = "";

        $('#division').empty();
        $('#jobTitle').empty();

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
        var div = $(this).val();
        var dep = $('#department').val();

        $('#jobTitle').empty();

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
});