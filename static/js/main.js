function create_table(data, user_name) {
    var item = [];
    $.each(data, function (index, planet) {
        item.push(
            '<tr>' +
            '<td>' + planet['name'] + '</td>' +
            '<td>' + formattedDiameter(planet['diameter']) + '</td>' +
            '<td>' + planet['climate'] + '</td>' +
            '<td>' + planet['terrain'] + '</td>' +
            '<td>' + formattedWaterSurface(planet['surface_water']) + '</td>' +
            '<td>' + formattedPeople(planet['population']) + '</td>' +
            '<td>' + residentsButton(planet['residents'].length, index) + '</td>' +
            voteButton(user_name, planet) +
            '</tr>'
        );
    });
    $("#table_body").append(item);
    $(".btn-resident-detail").click(function (clicked_button) {
        let clicked_button_id = clicked_button.target.getAttribute('id').substring(16);
        showResidentsDetails(clicked_button_id, data);
    });
    $(".btn-vote-planet").click(function (clicked_button) {
        let api_url = clicked_button.target.dataset.url;
        $.getJSON(api_url, function (response) {
            let planet_id = response['url'].slice(0, -1);
            planet_id = planet_id.substring(planet_id.lastIndexOf('/') + 1);
            let planet_name = response['name'];
            let planet_data = {'planet_id': planet_id, 'planet_name': planet_name};
            $.post("/vote-planet", planet_data, function () {
                alert('Thank you for voting!')
            })
        })
    })

};

function voteButton(user_name, planet_data) {
    if (user_name != "Guest") {
        let url = planet_data['url'];
        return '<td><button class=\"btn-vote-planet btn btn-warning\" type=\"button\" data-url=\"' + url + '\">Button</button></td>'
    } else {
        return ""
    }
}


function formattedPeople(evalString) {
    if (evalString != 'unknown') {
        return formatNumber(evalString) + ' people'
    } else {
        return evalString
    }
}


function formattedWaterSurface(evalString) {
    if (evalString != 'unknown') {
        return evalString + '%'
    } else {
        return evalString
    }
}


function formattedDiameter(diameter) {
    if (diameter === 'unknown') {
        return 'unknown'
    } else {
        return formatNumber(diameter) + ' km'
    }
}

function formatNumber(n) {
    return n.replace(/./g, function (c, i, a) {
        return i > 0 && c !== "." && (a.length - i) % 3 === 0 ? "," + c : c;
    });
}


function showVoteStats(vote_data) {
    $.each(vote_data, function (index) {
        let planet = vote_data[index].planet_name;
        let count = vote_data[index].count;
        let row =
            '<tr>' +
            '<td>' + planet + '</td>' +
            '<td>' + count + '</td>' +
            '</tr>';
        $('#vote_detail_modal').append(row);
    })
    $('#voteModal').modal('show');
};

function showResidentsDetails(clicked_button_id, data) {
    let residents = data[clicked_button_id]['residents'];
    console.log(data);
    $.each(residents, function (index) {
        let resident_data_url = residents[index];
        $.getJSON(resident_data_url, function (response) {
            let row =
                '<tr>' +
                '<td>' + response['name'] + '</td>' +
                '<td>' + response['height'] + '</td>' +
                '<td>' + response['mass'] + '</td>' +
                '<td>' + response['hair_color'] + '</td>' +
                '<td>' + response['skin_color'] + '</td>' +
                '<td>' + response['eye_color'] + '</td>' +
                '<td>' + response['birth_year'] + '</td>' +
                '<td>' + response['gender'] + '</td>' +
                '</tr>';
            $('#residents_detail_modal').append(row);
        })
    })
    $('.modal-title').html('Residents of ' + data[clicked_button_id]['name']);
    $('#residentsModal').modal('show');
    $(".modal").on("hidden.bs.modal", function () {
        $("#residents_detail_modal").html("");
    });
}

function residentsButton(eval_number, index) {
    if (eval_number !== 0) {
        let id_tag = "\'" + 'residents_button' + index + "\'";
        return '<button id=' + id_tag + 'class=\'btn-resident-detail btn btn-default\'' + '>' + eval_number + ' Resident(s)' + '</button>';
    } else {
        return "No known residents"
    }
};


function main() {
    let default_url = 'https://swapi.co/api/planets/?page=1';
    $('#btn_prev').click(function () {
        createWebpage(sessionStorage.getItem(['prev_url']));
    });
    $('#btn_next').click(function () {
        createWebpage(sessionStorage.getItem(['next_url']));
    });
    $('#show_stats').click(function () {
        $('#vote_detail_modal').empty();
        $.getJSON('http://0.0.0.0:8000/vote-stats', function (response) {
            showVoteStats(response);
        })
    })
    createWebpage(default_url);
}


function createWebpage(api_url) {
    $('#btn_prev').prop('disabled', false);
    $('#btn_next').prop('disabled', false);
    $('#table_body').empty();
    $('#table_head').empty();
    $.getJSON(api_url, function (response) {
            var prev_url = response['previous'];
            sessionStorage.setItem(['prev_url'], prev_url);
            if (prev_url === null) {
                $('#btn_prev').prop('disabled', true);
            }
            var next_url = response['next'];
            sessionStorage.setItem(['next_url'], next_url);
            if (next_url === null) {
                $('#btn_next').prop('disabled', true);
            }
            var data = response['results'];
            $('#residentsModal').modal({show: false});
            $('#voteModal').modal({show: false});
            let username = $('.username').text();
            create_table(data, username);
        }
    )
}

main();
