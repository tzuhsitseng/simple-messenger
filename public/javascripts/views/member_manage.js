$(document).ready(function () {
    $.ajax({
        url: "/getAllDepartmentList",
        type: "get",
        dataType: "json",
        success: function (result) {
            for (var i = 0; i < result.departmentList.length; i++) {
                var departmentName = result.departmentList[i].name;
                var department = $('<a href="#" class="list-group-item">').text(departmentName);
                var cloneDepartment = department.clone();

                $('#selectAllGroupList').append(department);
                $('#selectAllDepartmentList').append(cloneDepartment);
            };
        }
    });
    
    $("#memberModify").click(function(){
        $(location).attr('href', '/chat/memberModify');
    });

    $("#passwordModify").click(function(){
        $(location).attr('href', '/chat/passwordModify');
    });

    $("#createDepartment").click(function(){
        $(location).attr('href', '/chat/createDepartment');
    });

    $("#createRoom").click(function(){
        $(location).attr('href', '/chat/createRoom');
    });

    $("#giveAuth").click(function(){
        $(location).attr('href', '/chat/giveAuth');
    });

    $("#btn_verifyList").click(function () {
        $(location).attr('href', '/chat/verifyList');
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
                    var peopleId = $(this).next().val();
                    
                    location.href = '/chat/giveAuth?id=' + peopleId;
                });

            }
        });
    });
    
    $('#selectAllGroupList').on('click', 'a', function () {
        var department = $(this).text();
        var url = '/chat/approvedList/' + department;

        $(location).attr('href', url);
    });
});