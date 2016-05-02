var express = require('express');
var router = express.Router();

var ges = require('ges-client');

router.get('/', function (req, res, next) {
    // res.send({ title: 'Express' });
    var game_stats = []
    var team_time_stats = [];
    var connection = ges({ host: '127.0.0.1' });
    var goalbyperiod = {};
    var goalbykind = {};
    var penaltybyperiod = {};
    var pimbyperiod = {};
    var penaltybykind = {};
    var pimbykind = {};
    var opponents = {};
    var rinks = {};
    connection.on('connect', function () {
        console.log('connecting to geteventstore...');
        connection.readStreamEventsForward('gamestats', { start: 0, count: 1000 }, function (err, readResult) {
            if (err) return console.log('Ooops!', err);
            for (var i = 0; i < readResult.Events.length; i++) {
                var eventDataStr = bin2String(readResult.Events[i].Event.Data.toJSON().data);
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

            connection.readStreamEventsForward('team_time_stats', { start: 0, count: 1000 }, function (err, readResult) {
                if (err) return console.log('Ooops!', err);
                for (var i = 0; i < readResult.Events.length; i++) {
                    var eventDataStr = bin2String(readResult.Events[i].Event.Data.toJSON().data);
                    var eventDataJson = JSON.parse(eventDataStr);
                    team_time_stats[i] = eventDataJson;
                    var period = 'Period 1';
                    if (eventDataJson.time > '40:00') {
                        period = 'Period 3';
                    } else if (eventDataJson.time > '20:00') {
                        period = 'Period 2';
                    }
                    if (readResult.Events[i].Event.EventType == 'GoalScored') {
                        if (!goalbyperiod[period]) {
                            goalbyperiod[period] = 0;
                        }
                        goalbyperiod[period]++;
                        if (!goalbykind[eventDataJson.goalkind]) {
                            goalbykind[eventDataJson.goalkind] = 0;
                        }
                        goalbykind[eventDataJson.goalkind]++;

                    }
                    if (readResult.Events[i].Event.EventType == 'PenaltyTaken') {
                        if (!penaltybyperiod[period]) {
                            penaltybyperiod[period] = 0;
                        }
                        penaltybyperiod[period]++;
                        if (!pimbyperiod[period]) {
                            pimbyperiod[period] = 0;
                        }
                        pimbyperiod[period] += parseInt(eventDataJson.min);
                        if (!penaltybykind[eventDataJson.offense]) {
                            penaltybykind[eventDataJson.offense] = 0;
                        }
                        penaltybykind[eventDataJson.offense]++;
                        if (!pimbykind[eventDataJson.offense]) {
                            pimbykind[eventDataJson.offense] = 0;
                        }
                        pimbykind[eventDataJson.offense] += parseInt(eventDataJson.min);
                    }
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

                res.render('team_stats.pug', { title: 'Team Stats', 'game_stats': game_stats, 'opponent_stats': opponent_stats, 'rink_stats': rink_stats, 'team_time_stats': team_time_stats, 'goalbyperiod': goalbyperiod, 'goalbykind': goalbykind, 'penaltybyperiod': penaltybyperiod, 'pimbyperiod': pimbyperiod, 'penaltybykind': penaltybykind, 'pimbykind': pimbykind });

            });
        });

    });

});

router.get('/wins', function (req, res, next) {
    // res.send({ title: 'Express' });
    var wins = {};
    var connection = ges({ host: '127.0.0.1' });
    connection.on('connect', function () {
        console.log('connecting to geteventstore...');
        connection.readStreamEventsForward('gamestats', { start: 0, count: 1000 }, function (err, readResult) {
            if (err) return console.log('Ooops!', err);
            for (var i = 0; i < readResult.Events.length; i++) {
                console.log(readResult.Events[i].Event.EventType);
                if (readResult.Events[i].Event.EventType == 'Win') {
                    var eventDataStr = bin2String(readResult.Events[i].Event.Data.toJSON().data);
                    var eventDataJson = JSON.parse(eventDataStr);
                    wins[i] = eventDataJson;
                }
            }
            res.render('team_stats_wins.pug', { title: 'Wins', 'game_wins': wins });
        });
    });
});

router.get('/losses', function (req, res, next) {
    // res.send({ title: 'Express' });
    var losses = {};
    var connection = ges({ host: '127.0.0.1' });
    connection.on('connect', function () {
        console.log('connecting to geteventstore...');
        connection.readStreamEventsForward('gamestats', { start: 0, count: 1000 }, function (err, readResult) {
            if (err) return console.log('Ooops!', err);
            for (var i = 0; i < readResult.Events.length; i++) {
                console.log(readResult.Events[i].Event.EventType);
                if (readResult.Events[i].Event.EventType == 'Loss') {
                    var eventDataStr = bin2String(readResult.Events[i].Event.Data.toJSON().data);
                    var eventDataJson = JSON.parse(eventDataStr);
                    losses[i] = eventDataJson;
                }
            }
            res.render('team_stats_losses.pug', { title: 'Losses', 'game_losses': losses });
        });
    });
});

router.get('/shutouts', function (req, res, next) {
    // res.send({ title: 'Express' });
    var shutouts = {};
    var connection = ges({ host: '127.0.0.1' });
    connection.on('connect', function () {
        console.log('connecting to geteventstore...');
        connection.readStreamEventsForward('gamestats', { start: 0, count: 1000 }, function (err, readResult) {
            if (err) return console.log('Ooops!', err);
            for (var i = 0; i < readResult.Events.length; i++) {
                console.log(readResult.Events[i].Event.EventType);
                if (readResult.Events[i].Event.EventType == 'Win') {
                    var eventDataStr = bin2String(readResult.Events[i].Event.Data.toJSON().data);
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
    // res.send({ title: 'Express' });
    var ties = {};
    var connection = ges({ host: '127.0.0.1' });
    connection.on('connect', function () {
        console.log('connecting to geteventstore...');
        connection.readStreamEventsForward('gamestats', { start: 0, count: 1000 }, function (err, readResult) {
            if (err) return console.log('Ooops!', err);
            for (var i = 0; i < readResult.Events.length; i++) {
                console.log(readResult.Events[i].Event.EventType);
                if (readResult.Events[i].Event.EventType == 'Tie') {
                    var eventDataStr = bin2String(readResult.Events[i].Event.Data.toJSON().data);
                    var eventDataJson = JSON.parse(eventDataStr);
                    ties[i] = eventDataJson;
                }
            }
            res.render('team_stats_ties.pug', { title: 'Ties', 'game_ties': ties });
        });
    });
});

function bin2String(array) {
    var result = "";
    for (var i = 0; i < array.length; i++) {
        result += String.fromCharCode(array[i]);
    }
    return result;
}

module.exports = router;
