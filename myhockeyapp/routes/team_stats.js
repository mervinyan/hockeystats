var express = require('express');
var router = express.Router();

var ges = require('ges-client');
var util = require('./util.js');

router.get('/', function (req, res, next) {
    var connection = ges({ host: '127.0.0.1' });

    connection.on('connect', function () {
        console.log('connecting to geteventstore...');
        connection.readStreamEventsForward('gamestats', { start: 0, count: 1000 }, function (err, readResult) {
            if (err) return console.log('Ooops!', err);
            
            var team_stats_0 = gatherTeamStats0(readResult);
            
            connection.readStreamEventsForward('team_time_stats', { start: 0, count: 1000 }, function (err, readResult) {
                if (err) return console.log('Ooops!', err);
                
                var team_stats_1 = gatherTeamStats1(readResult);

                res.render('team_stats.pug', { title: 'Team Stats', 'team_stats_0': team_stats_0, 'team_stats_1': team_stats_1});

            });
        });

    });

});

gatherTeamStats0 = function (readResult) {
    var game_stats = [];
    var opponents = {};
    var rinks = {};
    for (var i = 0; i < readResult.Events.length; i++) {
        var eventDataStr = util.bin2String(readResult.Events[i].Event.Data.toJSON().data);
        var eventDataJson = JSON.parse(eventDataStr);
        game_stats[i] = eventDataJson;
        if (!opponents[eventDataJson.opponent]) {
            opponents[eventDataJson.opponent] = { gf: 0, ga: 0, pim: 0 };
        }
        opponents[eventDataJson.opponent].gf = opponents[eventDataJson.opponent].gf + eventDataJson.gf;
        opponents[eventDataJson.opponent].ga = opponents[eventDataJson.opponent].ga + eventDataJson.ga;
        opponents[eventDataJson.opponent].pim = opponents[eventDataJson.opponent].pim + eventDataJson.pim;

        if (!rinks[eventDataJson.rink]) {
            rinks[eventDataJson.rink] = { gf: 0, ga: 0, pim: 0 };
        }
        rinks[eventDataJson.rink].gf = rinks[eventDataJson.rink].gf + eventDataJson.gf;
        rinks[eventDataJson.rink].ga = rinks[eventDataJson.rink].ga + eventDataJson.ga;
        rinks[eventDataJson.rink].pim = rinks[eventDataJson.rink].pim + eventDataJson.pim;
    }

    var opponent_stats = [];
    for (var opponent in opponents) {
        var item = {};
        item.opponent = opponent;
        item.gf = opponents[opponent].gf;
        item.ga = opponents[opponent].ga;
        item.pim = opponents[opponent].pim;
        opponent_stats.push(item);
    }

    var rink_stats = [];
    for (var rink in rinks) {
        var item = {};
        item.rink = rink;
        item.gf = rinks[rink].gf;
        item.ga = rinks[rink].ga;
        item.pim = rinks[rink].pim;
        rink_stats.push(item);
    }

    return { 'game_stats': game_stats, 'opponent_stats': opponent_stats, 'rink_stats': rink_stats };
}

gatherTeamStats1 = function (readResult) {
    var team_time_stats = [];
    var goal_by_period = {};
    var penalty_by_period = {};
    var pim_by_period = {};
    var goal_by_kind = {};
    var penalty_by_kind = {};
    var pim_by_kind = {};

    for (var i = 0; i < readResult.Events.length; i++) {
        var eventDataStr = util.bin2String(readResult.Events[i].Event.Data.toJSON().data);
        var eventDataJson = JSON.parse(eventDataStr);
        
        team_time_stats[i] = eventDataJson;
        var period = 'Period 1';
        if (eventDataJson.time > '40:00') {
            period = 'Period 3';
        } else if (eventDataJson.time > '20:00') {
            period = 'Period 2';
        }
        if (readResult.Events[i].Event.EventType == 'GoalScored') {
            if (!goal_by_period[period]) {
                goal_by_period[period] = 0;
            }
            goal_by_period[period]++;
            if (!goal_by_kind[eventDataJson.goalkind]) {
                goal_by_kind[eventDataJson.goalkind] = 0;
            }
            goal_by_kind[eventDataJson.goalkind]++;

        }
        if (readResult.Events[i].Event.EventType == 'PenaltyTaken') {
            if (!penalty_by_period[period]) {
                penalty_by_period[period] = 0;
            }
            penalty_by_period[period]++;
            if (!pim_by_period[period]) {
                pim_by_period[period] = 0;
            }
            pim_by_period[period] += parseInt(eventDataJson.min);
            if (!penalty_by_kind[eventDataJson.offense]) {
                penalty_by_kind[eventDataJson.offense] = 0;
            }
            penalty_by_kind[eventDataJson.offense]++;
            if (!pim_by_kind[eventDataJson.offense]) {
                pim_by_kind[eventDataJson.offense] = 0;
            }
            pim_by_kind[eventDataJson.offense] += parseInt(eventDataJson.min);
        }
    }
    
    return {'team_time_stats': team_time_stats, 'goal_by_period': goal_by_period, 'goal_by_kind': goal_by_kind, 'penalty_by_period': penalty_by_period, 'pim_by_period': pim_by_period, 'penalty_by_kind': penalty_by_kind, 'pim_by_kind': pim_by_kind};
}

router.get('/wins', function (req, res, next) {
    var wins = {};
    var connection = ges({ host: '127.0.0.1' });
    connection.on('connect', function () {
        console.log('connecting to geteventstore...');
        connection.readStreamEventsForward('gamestats', { start: 0, count: 1000 }, function (err, readResult) {
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
        connection.readStreamEventsForward('gamestats', { start: 0, count: 1000 }, function (err, readResult) {
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
        connection.readStreamEventsForward('gamestats', { start: 0, count: 1000 }, function (err, readResult) {
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
        connection.readStreamEventsForward('gamestats', { start: 0, count: 1000 }, function (err, readResult) {
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

module.exports = router;
