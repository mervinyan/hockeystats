var express = require('express');
var router = express.Router();

var ges = require('ges-client');
var util = require('./util.js');

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

            res.render('team_stats.pug', { title: 'Team Stats', 'data': data, 'opponent_stats': opponent_stats, 'rink_stats': rink_stats  });
        });

    }).end();
});

router.get('/wins', function (req, res, next) {
    var wins = {};
    var connection = ges({ host: '127.0.0.1' });
    connection.on('connect', function () {
        console.log('connecting to geteventstore...');
        connection.readStreamEventsBackward('gamestats', { start: -1, count: 1000 }, function (err, readResult) {
            if (err) return console.log('Ooops!', err);
            for (var i = 0; i < readResult.Events.length; i++) {
                console.log(readResult.Events[i].Event.EventType);
                if (readResult.Events[i].Event.EventType == 'Win') {
                    var eventDataStr = util.bin2String(readResult.Events[i].Event.Data.toJSON().data);
                    var eventDataJson = JSON.parse(eventDataStr);
                    wins[i] = eventDataJson;
                }
            }
            res.render('team_stats_wins.pug', { title: 'Wins', 'game_wins': wins });
        });
    });
});

router.get('/losses', function (req, res, next) {
    var losses = {};
    var connection = ges({ host: '127.0.0.1' });
    connection.on('connect', function () {
        console.log('connecting to geteventstore...');
        connection.readStreamEventsBackward('gamestats', { start: -1, count: 1000 }, function (err, readResult) {
            if (err) return console.log('Ooops!', err);
            for (var i = 0; i < readResult.Events.length; i++) {
                console.log(readResult.Events[i].Event.EventType);
                if (readResult.Events[i].Event.EventType == 'Loss') {
                    var eventDataStr = util.bin2String(readResult.Events[i].Event.Data.toJSON().data);
                    var eventDataJson = JSON.parse(eventDataStr);
                    losses[i] = eventDataJson;
                }
            }
            res.render('team_stats_losses.pug', { title: 'Losses', 'game_losses': losses });
        });
    });
});

router.get('/shutouts', function (req, res, next) {
    var shutouts = {};
    var connection = ges({ host: '127.0.0.1' });
    connection.on('connect', function () {
        console.log('connecting to geteventstore...');
        connection.readStreamEventsBackward('gamestats', { start: -1, count: 1000 }, function (err, readResult) {
            if (err) return console.log('Ooops!', err);
            for (var i = 0; i < readResult.Events.length; i++) {
                console.log(readResult.Events[i].Event.EventType);
                if (readResult.Events[i].Event.EventType == 'Win') {
                    var eventDataStr = util.bin2String(readResult.Events[i].Event.Data.toJSON().data);
                    var eventDataJson = JSON.parse(eventDataStr);
                    if (eventDataJson.ga == 0) {
                        shutouts[i] = eventDataJson;
                    }
                }
            }
            res.render('team_stats_shutouts.pug', { title: 'Shutouts', 'game_shutouts': shutouts });
        });
    });
});

router.get('/ties', function (req, res, next) {
    var ties = {};
    var connection = ges({ host: '127.0.0.1' });
    connection.on('connect', function () {
        console.log('connecting to geteventstore...');
        connection.readStreamEventsBackward('gamestats', { start: -1, count: 1000 }, function (err, readResult) {
            if (err) return console.log('Ooops!', err);
            for (var i = 0; i < readResult.Events.length; i++) {
                console.log(readResult.Events[i].Event.EventType);
                if (readResult.Events[i].Event.EventType == 'Tie') {
                    var eventDataStr = util.bin2String(readResult.Events[i].Event.Data.toJSON().data);
                    var eventDataJson = JSON.parse(eventDataStr);
                    ties[i] = eventDataJson;
                }
            }
            res.render('team_stats_ties.pug', { title: 'Ties', 'game_ties': ties });
        });
    });
});

router.get('/goalfor', function (req, res, next) {
    var goals_for = {};
    var connection = ges({ host: '127.0.0.1' });
    connection.on('connect', function () {
        console.log('connecting to geteventstore...');
        connection.readStreamEventsBackward('goal_for_stats', { start: -1, count: 1000 }, function (err, readResult) {
            if (err) return console.log('Ooops!', err);
            for (var i = 0; i < readResult.Events.length; i++) {
                var eventDataStr = util.bin2String(readResult.Events[i].Event.Data.toJSON().data);
                var eventDataJson = JSON.parse(eventDataStr);
                goals_for[i] = eventDataJson;
            }
            res.render('team_stats_goals_for.pug', { title: 'Goals For', 'goals_for': goals_for });
        });
    });
});

router.get('/goalagainst', function (req, res, next) {
    var goals_against = {};
    var connection = ges({ host: '127.0.0.1' });
    connection.on('connect', function () {
        console.log('connecting to geteventstore...');
        connection.readStreamEventsBackward('goal_against_stats', { start: -1, count: 1000 }, function (err, readResult) {
            if (err) return console.log('Ooops!', err);
            for (var i = 0; i < readResult.Events.length; i++) {
                var eventDataStr = util.bin2String(readResult.Events[i].Event.Data.toJSON().data);
                var eventDataJson = JSON.parse(eventDataStr);
                goals_against[i] = eventDataJson;
            }
            res.render('team_stats_goals_against.pug', { title: 'Goals Against', 'goals_against': goals_against });
        });
    });
});

router.get('/penalty', function (req, res, next) {
    var penalties = {};
    var connection = ges({ host: '127.0.0.1' });
    connection.on('connect', function () {
        console.log('connecting to geteventstore...');
        connection.readStreamEventsBackward('penalty_stats', { start: -1, count: 1000 }, function (err, readResult) {
            if (err) return console.log('Ooops!', err);
            for (var i = 0; i < readResult.Events.length; i++) {
                var eventDataStr = util.bin2String(readResult.Events[i].Event.Data.toJSON().data);
                var eventDataJson = JSON.parse(eventDataStr);
                penalties[i] = eventDataJson;
            }
            res.render('team_stats_penalties.pug', { title: 'Penalties', 'penalties': penalties });
        });
    });
});

module.exports = router;
