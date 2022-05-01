$(document).ready(function () {
    $.ajax({
        url: "/getAllDepartmentList",
        type: "get",
        dataType: "json",
        success: function (result) {
            for (var i = 0; i < result.departmentList.length; i++) {
                var departmentName = result.departmentList[i].name;
                var department = $('<a href="#" class="list-group-item">').text(departmentName);

                $('#selectAllDepartmentList').append(department);
            };
        }
    });

    $("#btn_selectRoom").click(function () {
        $('#selectRoomList').find('a').remove();
        
        $('#selectRoomList').on('click', 'a', function () {
            location.href = '/chat/room?id=' + $(this).next().val() + '&name=' + $(this).text();
        });

        $.ajax({
            url: "/chat/getRoomList",
            type: "get",
            dataType: "json",
            success: function (result) {
                for (var i = 0; i < result.roomList.length; i++) {
                    var roomName = result.roomList[i].name;
                    var roomId = result.roomList[i].id;
                    var room = $('<a href="#" class="list-group-item">').text(roomName);
                    var hiddenRoomId = $('<input type="hidden">').val(roomId);

                    $('#selectRoomList').append(room);
                    $('#selectRoomList').append(hiddenRoomId);
                };
            }
        });
    });

    $('#selectAllDepartmentList').on('click', 'a', function () {
        var department = $(this).text();

        $.ajax({
            url: "/chat/getPeopleList/" + department,
            type: "get",
            dataType: "json",
            success: function (result) {
                $('#selectPeopleList').find('a').remove();
                for (var i = 0; i < result.peopleList.length; i++) {
                    var peopleName = result.peopleList[i].name;
                    var peopleId = result.peopleList[i]._id;
                    var people = $('<a href="#" class="list-group-item">').text(peopleName);
                    var hiddenPeopleId = $('<input type="hidden">').val(peopleId);

                    $('#selectPeopleList').append(people);
                    $('#selectPeopleList').append(hiddenPeopleId);
                };

                $('#selectAllDepartment').modal('hide');
                $('#selectPeople').modal('show');

                $('#selectPeople').on('click', 'a', function () {
                    var selfId = id;
                    var otherId = $(this).next().val();
                    var combineId = selfId > otherId ? selfId + otherId : otherId + selfId; // 一對一聊天的聊天室名稱為兩個id字串相加
                    var chatTo = $(this).text();
                    
                    location.href = '/chat/room?id=' + combineId + '&chatTo=' + chatTo;
                });

            }
        });
    });

    $("#createRoom").click(function(){
        $(location).attr('href', '/chat/createRoom');
    });
});