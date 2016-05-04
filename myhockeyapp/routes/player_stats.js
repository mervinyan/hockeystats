var express = require('express');
var router = express.Router();

var ges = require('ges-client');
var util = require('./util.js');

router.get('/', function (req, res, next) {
    var connection = ges({ host: '127.0.0.1' });
    connection.on('connect', function () {
        console.log('connecting to geteventstore...');
        connection.readStreamEventsForward('player_gamestats', { start: 0, count: 4000, resolveLinkTos: true }, function (err, readResult) {
            if (err) return console.log('Ooops!', err)
            var players_stats = gatherPlayersStats(readResult);
            res.render('players_stats.pug', { title: 'Skater Stats', 'players_stats': players_stats });
        });
    });
});

gatherPlayersStats = function (readResult) {
    var players = {};
    for (var i = 0; i < readResult.Events.length; i++) {
        var event = readResult.Events[i].Event;
        var eventDataStr = util.bin2String(readResult.Events[i].Event.Data.toJSON().data)
        var eventData = JSON.parse(eventDataStr);
        var player_number = eventData.playernumber;
        if (event.EventType == 'PlayerGameStats') {
            if (!players[player_number]) {
                players[player_number] = { g: 0, a: 0, pts: 0, ppg: 0, shg: 0, eng: 0, pim: 0 };
            }
            players[player_number].g = players[player_number].g + eventData.g;
            players[player_number].ppg = players[player_number].ppg + eventData.ppg;
            players[player_number].shg = players[player_number].shg + eventData.shg;
            players[player_number].eng = players[player_number].eng + eventData.eng;
            players[player_number].a = players[player_number].a + eventData.a;
            players[player_number].pts = players[player_number].pts + eventData.pts;
            players[player_number].pim = players[player_number].pim + eventData.pim;
        }
    }
    var players_stats = [];
    for (var player in players) {
        var item = {};
        item.no = player;
        item.g = players[player].g;
        item.ppg = players[player].ppg;
        item.shg = players[player].shg;
        item.eng = players[player].eng;
        item.a = players[player].a;
        item.pts = players[player].pts;
        item.pim = players[player].pim;
        players_stats.push(item);
    }
    console.log(players_stats);
    return players_stats;
}

router.get('/:player_number', function (req, res, next) {
    var player_number = req.params.player_number;

    // res.send({ title: 'Express' });

    var connection = ges({ host: '127.0.0.1' });
    connection.on('connect', function () {
        console.log('connecting to geteventstore...');
        var stream = player_number;
        // console.log(stream);
        connection.readStreamEventsForward(stream, { start: 0, count: 1000, resolveLinkTos: true }, function (err, readResult) {
            if (err) return console.log('Ooops!', err)

            var player_stats_0 = gatherPlayerStats0(readResult, player_number);

            connection.readStreamEventsForward('player_' + player_number + '_gamestats', { start: 0, count: 1000, resolveLinkTos: true }, function (err, readResult) {
                if (err) return console.log('Ooops!', err)
                
                var player_stats_1 = gatherPlayerStats1(readResult);
                
                res.render('player_stats.pug', { 'title': 'Stats for Player #' + player_number, 'player_id': player_number, 'player_stats_0': player_stats_0, 'player_stats_1': player_stats_1 });
            });
        });

    });
});

gatherPlayerStats0 = function (readResult, player_number) {
    var player_stats = {
        occurred_at: [],
        goal_by_period: {},
        assist_by_period: {},
        point_by_period: {},
        pim_by_period: {},
        penalty_by_period: {},
        assist_from_by_player: {},
        assist_to_by_player: {},
        goal_by_kind: {},
        penalty_by_kind: {},
        pim_by_kind: {}
    };
    var j = 0;
    for (var i = 0; i < readResult.Events.length; i++) {
        var eventDataStr = util.bin2String(readResult.Events[i].Event.Data.toJSON().data)
        var eventDataJson = JSON.parse(eventDataStr)

        var pos = eventDataJson.time.indexOf(':');
        var min = eventDataJson.time.substring(0, pos);
        var sec = eventDataJson.time.substring(pos, eventDataJson.time.length);
        var at = ((eventDataJson.period - 1) * 20 + parseInt(min)) + sec;

        if (readResult.Events[i].Event.EventType == 'GoalScored') {
            if (!player_stats.point_by_period['period' + eventDataJson.period]) {
                player_stats.point_by_period['period' + eventDataJson.period] = 0;
            }
            player_stats.point_by_period['period' + eventDataJson.period]++;

            if (eventDataJson.score == player_number) {
                if (!player_stats.goal_by_kind[eventDataJson.kind]) {
                    player_stats.goal_by_kind[eventDataJson.kind] = 0;
                }
                player_stats.goal_by_kind[eventDataJson.kind]++;
                if (!player_stats.goal_by_period['period' + eventDataJson.period]) {
                    player_stats.goal_by_period['period' + eventDataJson.period] = 0;
                }
                player_stats.goal_by_period['period' + eventDataJson.period]++;
                if (eventDataJson.assist1) {
                    if (!player_stats.assist_from_by_player[eventDataJson.assist1]) {
                        player_stats.assist_from_by_player[eventDataJson.assist1] = 0;
                    }
                    player_stats.assist_from_by_player[eventDataJson.assist1]++;
                }
                if (eventDataJson.assist2) {
                    if (!player_stats.assist_from_by_player[eventDataJson.assist2]) {
                        player_stats.assist_from_by_player[eventDataJson.assist2] = 0;
                    }
                    player_stats.assist_from_by_player[eventDataJson.assist2]++;
                }
            } else {
                if (!player_stats.assist_by_period['period' + eventDataJson.period]) {
                    player_stats.assist_by_period['period' + eventDataJson.period] = 0;
                }
                player_stats.assist_by_period['period' + eventDataJson.period]++;
                if (!player_stats.assist_to_by_player[eventDataJson.score]) {
                    player_stats.assist_to_by_player[eventDataJson.score] = 0;
                }
                player_stats.assist_to_by_player[eventDataJson.score]++;
            }
            var assistfrom = "";
            var assistto = "";
            if (eventDataJson.score == player_number) {
                if (eventDataJson.assist1) {
                    assistfrom = eventDataJson.assist1;
                } else {
                    assistfrom = eventDataJson.score;
                }
                player_stats.occurred_at[j] = { 'time': at, 'g': assistfrom };
            } else {
                assistto = eventDataJson.score;
                player_stats.occurred_at[j] = { 'time': at, 'a': assistto };
            }
        }
        if (readResult.Events[i].Event.EventType == 'PenaltyTaken') {
            if (!player_stats.penalty_by_period['period' + eventDataJson.period]) {
                player_stats.penalty_by_period['period' + eventDataJson.period] = 0;
            }
            player_stats.penalty_by_period['period' + eventDataJson.period]++;

            if (!player_stats.pim_by_period['period' + eventDataJson.period]) {
                player_stats.pim_by_period['period' + eventDataJson.period] = 0;
            }
            player_stats.pim_by_period['period' + eventDataJson.period] += parseInt(eventDataJson.min);

            if (!player_stats.penalty_by_kind[eventDataJson.offense]) {
                player_stats.penalty_by_kind[eventDataJson.offense] = 0;
            }
            player_stats.penalty_by_kind[eventDataJson.offense]++;

            if (!player_stats.pim_by_kind[eventDataJson.offense]) {
                player_stats.pim_by_kind[eventDataJson.offense] = 0;
            }
            player_stats.pim_by_kind[eventDataJson.offense] += parseInt(eventDataJson.min);
            player_stats.occurred_at[j] = { 'time': at, 'penalty': eventDataJson.player };
        }
        j++;
    }
    return player_stats;
}

gatherPlayerStats1 = function (readResult) {
    var gamestats = [];
    var opponents = {};
    var rinks = {};
    for (var i = 0; i < readResult.Events.length; i++) {
        // console.log(readResult.Events[i]);
        var eventDataStr = util.bin2String(readResult.Events[i].Event.Data.toJSON().data)
        // console.log(eventDataStr);
        var eventDataJson = JSON.parse(eventDataStr)
        gamestats[i] = eventDataJson;

        if (!opponents[eventDataJson.opponent]) {
            opponents[eventDataJson.opponent] = { g: 0, ppg: 0, shg: 0, eng: 0, a: 0, pts: 0, pim: 0 };
        }
        opponents[eventDataJson.opponent].g = opponents[eventDataJson.opponent].g + eventDataJson.g;
        opponents[eventDataJson.opponent].ppg = opponents[eventDataJson.opponent].ppg + eventDataJson.ppg;
        opponents[eventDataJson.opponent].shg = opponents[eventDataJson.opponent].shg + eventDataJson.shg;
        opponents[eventDataJson.opponent].eng = opponents[eventDataJson.opponent].eng + eventDataJson.eng;
        opponents[eventDataJson.opponent].a = opponents[eventDataJson.opponent].a + eventDataJson.a;
        opponents[eventDataJson.opponent].pts = opponents[eventDataJson.opponent].pts + eventDataJson.pts;
        opponents[eventDataJson.opponent].pim = opponents[eventDataJson.opponent].pim + eventDataJson.pim;

        if (!rinks[eventDataJson.rink]) {
            rinks[eventDataJson.rink] = { g: 0, ppg: 0, shg: 0, eng: 0, a: 0, pts: 0, pim: 0 };
        }
        rinks[eventDataJson.rink].g = rinks[eventDataJson.rink].g + eventDataJson.g;
        rinks[eventDataJson.rink].ppg = rinks[eventDataJson.rink].ppg + eventDataJson.ppg;
        rinks[eventDataJson.rink].shg = rinks[eventDataJson.rink].shg + eventDataJson.shg;
        rinks[eventDataJson.rink].eng = rinks[eventDataJson.rink].eng + eventDataJson.eng;
        rinks[eventDataJson.rink].a = rinks[eventDataJson.rink].a + eventDataJson.a;
        rinks[eventDataJson.rink].pts = rinks[eventDataJson.rink].pts + eventDataJson.pts;
        rinks[eventDataJson.rink].pim = rinks[eventDataJson.rink].pim + eventDataJson.pim;

        var opponent_stats = [];
        for (var opponent in opponents) {
            var item = {};
            item.opponent = opponent;
            item.g = opponents[opponent].g;
            item.ppg = opponents[opponent].ppg;
            item.shg = opponents[opponent].shg;
            item.eng = opponents[opponent].eng;
            item.a = opponents[opponent].a;
            item.pts = opponents[opponent].pts;
            item.pim = opponents[opponent].pim;
            opponent_stats.push(item);
        }

        var rink_stats = [];
        for (var rink in rinks) {
            var item = {};
            item.rink = rink;
            item.g = rinks[rink].g;
            item.ppg = rinks[rink].ppg;
            item.shg = rinks[rink].shg;
            item.eng = rinks[rink].eng;
            item.a = rinks[rink].a;
            item.pts = rinks[rink].pts;
            item.pim = rinks[rink].pim;
            rink_stats.push(item);
        }

    }
    return {'gamestats': gamestats, 'opponent_stats': opponent_stats, 'rink_stats': rink_stats};
}

module.exports = router;
