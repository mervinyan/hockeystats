var express = require('express');
var router = express.Router();

var ges = require('ges-client');
    
router.get('/', function(req, res, next) {
    var players = {};
    var connection = ges({host:'127.0.0.1'});
    connection.on('connect', function() {
        console.log('connecting to geteventstore...');
        connection.readStreamEventsForward('player_gamestats', {start: 0, count: 4000, resolveLinkTos: true}, function(err, readResult) {
            if (err) return console.log('Ooops!', err)
            // console.log(readResult.Events);
            for (var i = 0; i < readResult.Events.length; i++) {
                var event = readResult.Events[i].Event;
                // var eventData = JSON.parse(bin2String(event.Data.toJSON().data));
                var eventDataStr = bin2String(readResult.Events[i].Event.Data.toJSON().data)
                // console.log(eventDataStr);
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
            for (var player in players)
            {
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
            res.render('players_stats.pug', { title: 'Players Stats', 'players_stats': players_stats});        
        });
    });
});

router.get('/:player_number', function(req, res, next) {
    var player_number = req.params.player_number;
    
    // res.send({ title: 'Express' });
    var stats = [];
    var homescore = [];
    var goalbyperiod = {};
    var assistbyperiod = {};
    var pointbyperiod = {};
    var assistfrombyplayer = {};
    var assisttobyplayer = {};
    var goalbykind = {};
    var penaltybyperiod = {};
    var pimbyperiod = {};
    var penaltybykind = {};
    var pimbykind = {};
    var gamestats = [];
    var connection = ges({host:'127.0.0.1'});
    connection.on('connect', function() {
        console.log('connecting to geteventstore...');
        var stream = player_number;
        // console.log(stream);
        connection.readStreamEventsForward(stream, {start: 0, count: 1000, resolveLinkTos: true}, function(err, readResult) {
            if (err) return console.log('Ooops!', err)
            var j = 0;
            for (var i = 0; i < readResult.Events.length; i++) 
            {
                // console.log(readResult.Events[i]);
                var eventDataStr = bin2String(readResult.Events[i].Event.Data.toJSON().data)
                // console.log(eventDataStr);
                var eventDataJson = JSON.parse(eventDataStr)
                var pos = eventDataJson.time.indexOf(':');
                var min = eventDataJson.time.substring(0, pos);
                var sec = eventDataJson.time.substring(pos, eventDataJson.time.length);
                var at = ((eventDataJson.period -1) * 20 + parseInt(min)) + sec;
                if (readResult.Events[i].Event.EventType == 'GoalScored')
                {
                    if (!pointbyperiod['period' + eventDataJson.period]) {
                        pointbyperiod['period' + eventDataJson.period] = 0;
                    }
                    pointbyperiod['period' + eventDataJson.period]++;
                        
                        if (eventDataJson.score == player_number) {
                            if (!goalbykind[eventDataJson.kind]) 
                            {
                                goalbykind[eventDataJson.kind] = 0;
                            }
                            goalbykind[eventDataJson.kind]++;
                            if (!goalbyperiod['period' + eventDataJson.period]) {
                                goalbyperiod['period' + eventDataJson.period] = 0;
                            }
                            goalbyperiod['period' + eventDataJson.period]++;
                            if (eventDataJson.assist1) {
                                if (!assistfrombyplayer[eventDataJson.assist1]) {
                                    assistfrombyplayer[eventDataJson.assist1] = 0;
                                }
                                assistfrombyplayer[eventDataJson.assist1]++;
                            }
                            if (eventDataJson.assist2) 
                            {
                                if (!assistfrombyplayer[eventDataJson.assist2]) {
                                    assistfrombyplayer[eventDataJson.assist2] = 0;
                                }
                                assistfrombyplayer[eventDataJson.assist2]++;                    
                            }
                        } else {
                        if (!assistbyperiod['period' + eventDataJson.period]) {
                                assistbyperiod['period' + eventDataJson.period] = 0;
                            }
                            assistbyperiod['period' + eventDataJson.period]++;
                        if (!assisttobyplayer[eventDataJson.score]) {
                                assisttobyplayer[eventDataJson.score] = 0;
                            }
                            assisttobyplayer[eventDataJson.score]++;
                        }
                        var assistfrom = "";
                        var assistto = "";
                        if (eventDataJson.score == player_number) 
                        {
                            if (eventDataJson.assist1)
                            {
                                assistfrom = eventDataJson.assist1;
                            } else
                            {
                                assistfrom = eventDataJson.score;    
                            }
                            homescore[j] = {'time': at, 'g': assistfrom};
                        } else 
                        {
                            assistto = eventDataJson.score;
                            homescore[j] = {'time': at, 'a': assistto};
                        }
                        stats[j] = eventDataJson;   
                }
                if (readResult.Events[i].Event.EventType == 'PenaltyTaken')
                {
                    if (!penaltybyperiod['period' + eventDataJson.period]) {
                        penaltybyperiod['period' + eventDataJson.period] = 0;
                    }
                    penaltybyperiod['period' + eventDataJson.period]++;

                    if (!pimbyperiod['period' + eventDataJson.period]) {
                        pimbyperiod['period' + eventDataJson.period] = 0;
                    }
                    pimbyperiod['period' + eventDataJson.period] += parseInt(eventDataJson.min);
                    
                    if (!penaltybykind[eventDataJson.offense]) {
                        penaltybykind[eventDataJson.offense] = 0;
                    }
                    penaltybykind[eventDataJson.offense]++;

                    if (!pimbykind[eventDataJson.offense]) {
                        pimbykind[eventDataJson.offense] = 0;
                    }
                    pimbykind[eventDataJson.offense] += parseInt(eventDataJson.min);
                    homescore[j] = {'time': at, 'penalty': eventDataJson.player};
                }
                j++;             

            }
            
            var opponents = {};
            var rinks = {};
            
            connection.readStreamEventsForward('player_'+player_number+'_gamestats', {start: 0, count: 1000, resolveLinkTos: true}, function(err, readResult) {
                if (err) return console.log('Ooops!', err)
                for (var i = 0; i < readResult.Events.length; i++) 
                {
                    // console.log(readResult.Events[i]);
                    var eventDataStr = bin2String(readResult.Events[i].Event.Data.toJSON().data)
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
                res.render('player_stats.pug', { title: 'Stats for Player #' + player_number, player_id: player_number, data: stats, 'goalbykind': goalbykind, 'homescore': homescore, 'goalbyperiod': goalbyperiod, 'assistbyperiod': assistbyperiod, 'pointbyperiod': pointbyperiod, 'assistfrombyplayer': assistfrombyplayer, 'assisttobyplayer': assisttobyplayer, 'penaltybyperiod': penaltybyperiod, 'pimbyperiod': pimbyperiod, 'penaltybykind': penaltybykind, 'pimbykind': pimbykind, 'gamestats': gamestats, 'opponent_stats': opponent_stats, 'rink_stats': rink_stats, });        
            });
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
