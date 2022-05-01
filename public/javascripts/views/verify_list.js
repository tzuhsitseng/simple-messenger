$(document).ready(function () {
    // 按下通過
    $('.table').on('click', '.btn-success', function () {
        var id = $(this).parent().find('input[type="hidden"]').val();
        updateTable('approve', id);
    });

    // 按下駁回
    $('.table').on('click', '.btn-danger', function () {
        var id = $(this).parent().find('input[type="hidden"]').val();
        updateTable('reject', id);
    });

    // 製作table
    function createTable(result) {
        $('#verifyList').empty();

        $.ajax({
            url: '/chat/getVerifyList',
            type: 'get',
            dataType: 'json',
            success: function (result) {
                if (result.list && result.list.length > 0) {
                    var list = result.list;

                    for (var i = 0; i < list.length; i++) {
                        var row = $('<tr>');
                        var operation = $('<td>');
                        var account = $('<td>').html(list[i].account);
                        var sex = $('<td>').html(list[i].sex);
                        var name = $('<td>').html(list[i].name);
                        var birth = $('<td>').html(list[i].birth);
                        var department = $('<td>').html(list[i].department);
                        var division = $('<td>').html(list[i].division);
                        var level = $('<td>').html(list[i].level);
                        var IMEI = $('<td>').html(list[i].IMEI);
                        var hiddenId = $('<input type="hidden">').val(list[i]._id);
                        var btnSuccess = $('<input type="button">').addClass('btn btn-success').val('同意');
                        var btnFail = $('<input type="button">').addClass('btn btn-danger').val('駁回').css('margin-left', 5);

                        operation.append(hiddenId);
                        operation.append(btnSuccess);
                        operation.append(btnFail);
                        row.append(operation);
                        row.append(account);
                        row.append(sex);
                        row.append(name);
                        row.append(birth);
                        row.append(department);
                        row.append(division);
                        row.append(level);
                        row.append(IMEI);
                        row.appendTo('#verifyList');
                    }
                } else {
                    alert('人員審核完畢!!');
                }
            }
        });
    }

    // 更新table
    function updateTable(action, id) {
        var url;

        if (action == 'reject') {
            url = '/chat/rejectUser/' + id;
        }
        else {
            url = '/chat/approveUser/' + id;
        }

        $.ajax({
            url: url,
            tpye: 'get',
            success: function (result) {
                createTable();
            }
        });
    }

    // 初始化table
    createTable();
});