$(document).ready(function () {
  // 按下駁回
    $('.table').on('click', '.btn-danger', function () {
        if (confirm('確認刪除?')) {
            var id = $(this).parent().find('input[type="hidden"]').val();
            updateTable('remove', id);
        }
    });

    // 製作table
    function createTable(result) {
        $('#approvedList').empty();

        $.ajax({
            url: '/chat/getApprovedList/' + dep,
            type: 'get',
            dataType: 'json',
            success: function (result) {
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
                    var jobTitle = $('<td>').html(list[i].jobTitle);
                    var IMEI = $('<td>').html(list[i].IMEI);
                    var hiddenId = $('<input type="hidden">').val(list[i]._id);
                    var btnRemove = $('<input type="button">').addClass('btn btn-danger').val('刪除').css('margin-left', 5);

                    operation.append(hiddenId);
                    operation.append(btnRemove);
                    row.append(operation);
                    row.append(account);
                    row.append(sex);
                    row.append(name);
                    row.append(birth);
                    row.append(department);
                    row.append(division);
                    row.append(level);
                    row.append(jobTitle);
                    row.append(IMEI);
                    row.appendTo('#approvedList');
                }
            }
        });
    }

    // 更新table
    function updateTable(action, id) {
        var url;

        if (action == 'remove') {
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