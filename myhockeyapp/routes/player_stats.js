var express = require('express');
var router = express.Router();

var http = require('http');

router.get('/', function (req, res, next) {
    var options1 = {
        host: 'localhost',
        port: 2113,
        path: '/projection/projection_dashboard/result',
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
            var players_stats = [];
            for (var player in data.players) {
                var item = {};
                item.no = player;
                item.g = data.players[player].g;
                item.ppg = data.players[player].ppg;
                item.shg = data.players[player].shg;
                item.eng = data.players[player].eng;
                item.a = data.players[player].a;
                item.pts = data.players[player].pts;
                item.pim = data.players[player].pim;
                players_stats.push(item);
            }
            res.render('players_stats.pug', { title: 'Skater Stats', 'players_stats': players_stats });
        });
    }).end();
});

router.get('/:player_number', function (req, res, next) {
    var player_number = req.params.player_number;

    var options1 = {
        host: 'localhost',
        port: 2113,
        path: '/projection/projection_player_stats/result',
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
            var player_stats = data[player_number];

            var game_stats = [];
            for (var game in player_stats.games) {
                var item = {};
                item.datetime = game;
                item.date = player_stats.games[game].date;
                item.time = player_stats.games[game].time;
                item.g = player_stats.games[game].g;
                item.ppg = player_stats.games[game].ppg;
                item.shg = player_stats.games[game].shg;
                item.eng = player_stats.games[game].eng;
                item.a = player_stats.games[game].a;
                item.pts = player_stats.games[game].pts;
                item.pim = player_stats.games[game].pim;
                game_stats.push(item);
            }

            var opponent_stats = [];
            for (var opponent in player_stats.opponents) {
                var item = {};
                item.opponent = opponent;
                item.g = player_stats.opponents[opponent].g;
                item.ppg = player_stats.opponents[opponent].ppg;
                item.shg = player_stats.opponents[opponent].shg;
                item.eng = player_stats.opponents[opponent].eng;
                item.a = player_stats.opponents[opponent].a;
                item.pts = player_stats.opponents[opponent].pts;
                item.pim = player_stats.opponents[opponent].pim;
                opponent_stats.push(item);
            }
            opponent_stats.sort(function (a, b) {
                return a.opponent.localeCompare(b.opponent);
            });

            var rink_stats = [];
            for (var rink in player_stats.rinks) {
                var item = {};
                item.rink = rink;
                item.g = player_stats.rinks[rink].g;
                item.ppg = player_stats.rinks[rink].ppg;
                item.shg = player_stats.rinks[rink].shg;
                item.eng = player_stats.rinks[rink].eng;
                item.a = player_stats.rinks[rink].a;
                item.pts = player_stats.rinks[rink].pts;
                item.pim = player_stats.rinks[rink].pim;
                rink_stats.push(item);
            }
            rink_stats.sort(function (a, b) {
                return a.rink.localeCompare(b.rink);
            });

            res.render('player_stats.pug', { 'title': 'Stats for Player #' + player_number, 'player_id': player_number, 'player_stats': player_stats, 'game_stats': game_stats, 'opponent_stats': opponent_stats, 'rink_stats': rink_stats });
        });
    }).end();
});


module.exports = router;
