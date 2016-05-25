var express = require('express');
var router = express.Router();

var http = require('http');

router.get('/', function (req, res, next) {
    var options1 = {
        host: 'localhost',
        port: 2113,
        path: '/projection/projection_team_stats/result',
        method: 'GET'
    }

    http.request(options1, function (res1) {
        res1.setEncoding('utf8');
        var body = "";
        res1.on('data', function (chunk) {
            body += chunk;
        });
        res1.on('end', function () {
            var data = JSON.parse(body);

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

    }).end();
});

router.get('/wins', function (req, res, next) {
    var options1 = {
        host: 'localhost',
        port: 2113,
        path: '/projection/projection_team_stats/result',
        method: 'GET'
    }

    http.request(options1, function (res1) {
        res1.setEncoding('utf8');
        var body = "";
        res1.on('data', function (chunk) {
            body += chunk;
        });
        res1.on('end', function () {
            var data = JSON.parse(body);
            var game_wins = [];
            for (var i = 0; i < data.games.length; i++) {
                var game = data.games[i];
                if (game.wlt === 'w' || game.wlt === 'so') {
                    game_wins.push(game);
                }
            }
            game_wins.sort(function (a, b) {
                return b.date.localeCompare(a.date);
            });
            res.render('team_stats_wins.pug', { title: 'Wins', 'game_wins': game_wins });
        });

    }).end();
});

router.get('/losses', function (req, res, next) {
    var options1 = {
        host: 'localhost',
        port: 2113,
        path: '/projection/projection_team_stats/result',
        method: 'GET'
    }

    http.request(options1, function (res1) {
        res1.setEncoding('utf8');
        var body = "";
        res1.on('data', function (chunk) {
            body += chunk;
        });
        res1.on('end', function () {
            var data = JSON.parse(body);
            var game_losses = [];
            for (var i = 0; i < data.games.length; i++) {
                var game = data.games[i];
                if (game.wlt === 'l') {
                    game_losses.push(game);
                }
            }
            game_losses.sort(function (a, b) {
                return b.date.localeCompare(a.date);
            });
            res.render('team_stats_losses.pug', { title: 'Losses', 'game_losses': game_losses });
        });

    }).end();
});

router.get('/shutouts', function (req, res, next) {
    var options1 = {
        host: 'localhost',
        port: 2113,
        path: '/projection/projection_team_stats/result',
        method: 'GET'
    }

    http.request(options1, function (res1) {
        res1.setEncoding('utf8');
        var body = "";
        res1.on('data', function (chunk) {
            body += chunk;
        });
        res1.on('end', function () {
            var data = JSON.parse(body);
            var game_shutouts = [];
            for (var i = 0; i < data.games.length; i++) {
                var game = data.games[i];
                if (game.wlt === 'so') {
                    game_shutouts.push(game);
                }
            }
            game_shutouts.sort(function (a, b) {
                return b.date.localeCompare(a.date);
            });
            res.render('team_stats_shutouts.pug', { title: 'Shutouts', 'game_shutouts': game_shutouts });
        });

    }).end();
});

router.get('/ties', function (req, res, next) {
    var options1 = {
        host: 'localhost',
        port: 2113,
        path: '/projection/projection_team_stats/result',
        method: 'GET'
    }

    http.request(options1, function (res1) {
        res1.setEncoding('utf8');
        var body = "";
        res1.on('data', function (chunk) {
            body += chunk;
        });
        res1.on('end', function () {
            var data = JSON.parse(body);
            var game_ties = [];
            for (var i = 0; i < data.games.length; i++) {
                var game = data.games[i];
                if (game.wlt === 't') {
                    game_ties.push(game);
                }
            }
            game_ties.sort(function (a, b) {
                return b.date.localeCompare(a.date);
            });
            res.render('team_stats_ties.pug', { title: 'Ties', 'game_ties': game_ties });
        });

    }).end();
});

router.get('/goalfor', function (req, res, next) {
    var options1 = {
        host: 'localhost',
        port: 2113,
        path: '/projection/projection_team_stats/result',
        method: 'GET'
    }

    http.request(options1, function (res1) {
        res1.setEncoding('utf8');
        var body = "";
        res1.on('data', function (chunk) {
            body += chunk;
        });
        res1.on('end', function () {
            var data = JSON.parse(body);
            var goals_for = [];
            for (var i = 0; i < data.events.length; i++) {
                var event = data.events[i];
                if (event.type === 'gf') {
                    goals_for.push(event);
                }
            }
            goals_for.sort(function (a, b) {
                return b.date.localeCompare(a.date);
            });
            res.render('team_stats_goals_for.pug', { title: 'Goals For', 'goals_for': goals_for });
        });

    }).end();
});

router.get('/goalagainst', function (req, res, next) {
    var options1 = {
        host: 'localhost',
        port: 2113,
        path: '/projection/projection_team_stats/result',
        method: 'GET'
    }

    http.request(options1, function (res1) {
        res1.setEncoding('utf8');
        var body = "";
        res1.on('data', function (chunk) {
            body += chunk;
        });
        res1.on('end', function () {
            var data = JSON.parse(body);
            var goals_against = [];
            for (var i = 0; i < data.events.length; i++) {
                var event = data.events[i];
                if (event.type === 'ga') {
                    goals_against.push(event);
                }
            }
            goals_against.sort(function (a, b) {
                return b.date.localeCompare(a.date);
            });
            res.render('team_stats_goals_against.pug', { title: 'Goals Against', 'goals_against': goals_against });
        });

    }).end();
});

router.get('/penalty', function (req, res, next) {
    var options1 = {
        host: 'localhost',
        port: 2113,
        path: '/projection/projection_team_stats/result',
        method: 'GET'
    }

    http.request(options1, function (res1) {
        res1.setEncoding('utf8');
        var body = "";
        res1.on('data', function (chunk) {
            body += chunk;
        });
        res1.on('end', function () {
            var data = JSON.parse(body);
            var penalties = [];
            for (var i = 0; i < data.events.length; i++) {
                var event = data.events[i];
                if (event.type === 'p') {
                    penalties.push(event);
                }
            }
            penalties.sort(function (a, b) {
                return b.date.localeCompare(a.date);
            });
            res.render('team_stats_penalties.pug', { title: 'Penalties', 'penalties': penalties });
        });

    }).end();
});

module.exports = router;
