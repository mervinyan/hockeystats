var express = require('express');
var router = express.Router();

var http = require('http');

router.get('/', function (req, res, next) {
    get_team_stats_projection_result(function (data) {
        var opponent_stats = [];
        for (var opponent in data.opponents) {
            var item = {};
            item.opponent = opponent;
            item.gp = data.opponents[opponent].gp;
            item.gf = data.opponents[opponent].gf;
            item.ga = data.opponents[opponent].ga;
            item.pim = data.opponents[opponent].pim;
            item.w = data.opponents[opponent].w;
            item.l = data.opponents[opponent].l;
            item.t = data.opponents[opponent].t;
            opponent_stats.push(item);
        }
        opponent_stats.sort(function (a, b) {
            return a.opponent.localeCompare(b.opponent);
        });

        var rink_stats = [];
        for (var rink in data.rinks) {
            var item = {};
            item.rink = rink;
            item.gp = data.rinks[rink].gp;
            item.gf = data.rinks[rink].gf;
            item.ga = data.rinks[rink].ga;
            item.pim = data.rinks[rink].pim;
            item.w = data.rinks[rink].w;
            item.l = data.rinks[rink].l;
            item.t = data.rinks[rink].t;
            rink_stats.push(item);
        }
        rink_stats.sort(function (a, b) {
            return a.rink.localeCompare(b.rink);
        });

        res.render('team_stats.pug', { title: 'Team Stats', 'data': data, 'opponent_stats': opponent_stats, 'rink_stats': rink_stats });

    });

});

router.get('/wins', function (req, res, next) {
    get_team_stats_projection_result(function (data) {
        var game_wins = [];
        for (var i = 0; i < data.games.length; i++) {
            var game = data.games[i];
            if (game.wlt === 'w' || game.wlt === 'so') {
                game_wins.push(game);
            }
        }
        game_wins.sort(sort_by_date_time);
        res.render('team_stats_wins.pug', { title: 'Wins', 'game_wins': game_wins });

    });
});

router.get('/losses', function (req, res, next) {
    get_team_stats_projection_result(function (data) {
        var game_losses = [];
        for (var i = 0; i < data.games.length; i++) {
            var game = data.games[i];
            if (game.wlt === 'l') {
                game_losses.push(game);
            }
        }
        game_losses.sort(sort_by_date_time);
        res.render('team_stats_losses.pug', { title: 'Losses', 'game_losses': game_losses });

    });
});

router.get('/shutouts', function (req, res, next) {
    get_team_stats_projection_result(function (data) {
        var game_shutouts = [];
        for (var i = 0; i < data.games.length; i++) {
            var game = data.games[i];
            if (game.wlt === 'so') {
                game_shutouts.push(game);
            }
        }
        game_shutouts.sort(sort_by_date_time);
        res.render('team_stats_shutouts.pug', { title: 'Shutouts', 'game_shutouts': game_shutouts });

    });
});

router.get('/ties', function (req, res, next) {
    get_team_stats_projection_result(function (data) {
        var game_ties = [];
        for (var i = 0; i < data.games.length; i++) {
            var game = data.games[i];
            if (game.wlt === 't') {
                game_ties.push(game);
            }
        }
        game_ties.sort(sort_by_date_time);
        res.render('team_stats_ties.pug', { title: 'Ties', 'game_ties': game_ties });

    });
});

router.get('/goalfor', function (req, res, next) {
    get_team_stats_projection_result(function (data) {
        var goals_for = [];
        for (var i = 0; i < data.events.length; i++) {
            var event = data.events[i];
            if (event.type === 'gf') {
                goals_for.push(event);
            }
        }
        goals_for.sort(sort_by_date_time_period);
        res.render('team_stats_goals_for.pug', { title: 'Goals For', 'goals_for': goals_for });
    });
});

router.get('/goalagainst', function (req, res, next) {
    get_team_stats_projection_result(function (data) {
        var goals_against = [];
        for (var i = 0; i < data.events.length; i++) {
            var event = data.events[i];
            if (event.type === 'ga') {
                goals_against.push(event);
            }
        }
        goals_against.sort(sort_by_date_time_period);
        res.render('team_stats_goals_against.pug', { title: 'Goals Against', 'goals_against': goals_against });
    });
});

router.get('/penalty', function (req, res, next) {
    get_team_stats_projection_result(function (data) {
        var penalties = [];
        for (var i = 0; i < data.events.length; i++) {
            var event = data.events[i];
            if (event.type === 'p') {
                penalties.push(event);
            }
        }
        penalties.sort(sort_by_date_time_period);
        res.render('team_stats_penalties.pug', { title: 'Penalties', 'penalties': penalties });
    });
});

function get_team_stats_projection_result(result_processor) {
    var options = {
        host: 'localhost',
        port: 2113,
        path: '/projection/projection_team_stats/result',
        method: 'GET'
    }

    http.request(options, function (res1) {
        res1.setEncoding('utf8');
        var body = "";
        res1.on('data', function (chunk) {
            body += chunk;
        });
        res1.on('end', function () {
            var data = JSON.parse(body);
            result_processor(data);
        });

    }).end();
}

function sort_by_date_time_period(a, b) {
    if (b.date == a.date) {
        if (b.start == a.start) {
            if (b.period == a.period) {
                return left_pad_zero(a.time).localeCompare(left_pad_zero(b.time));
            } else {
                return b.period.localeCompare(a.period);
            }
        } else {
            return left_pad_zero(b.start).localeCompare(left_pad_zero(a.start));
        }
    } else {
        return b.date.localeCompare(a.date);
    }
}

function sort_by_date_time(a, b) {
    if (b.date == a.date) {
         return left_pad_zero(b.time).localeCompare(left_pad_zero(a.time));
    } else {
        return b.date.localeCompare(a.date);
    }
}

function left_pad_zero(time) {
    return "00000".substring(0, 5 - time.length) + time
}

module.exports = router;
