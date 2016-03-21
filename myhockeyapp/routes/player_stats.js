var express = require('express');
var router = express.Router();

var ges = require('ges-client');
    
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
                            homescore[j] = {'time': at, 'goal': assistfrom};
                        } else 
                        {
                            assistto = eventDataJson.score;
                            homescore[j] = {'time': at, 'assist': assistto};
                        }
                        stats[j] = eventDataJson;   
                        j++;             
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
                    
                }
            }
            console.log(penaltybyperiod);
            console.log(pimbyperiod);
            console.log(penaltybykind);
            console.log(pimbykind);            
            res.render('player_stats', { title: 'Player Stats', player_id: player_number, data: stats, 'goalbykind': goalbykind, 'homescore': homescore, 'goalbyperiod': goalbyperiod, 'assistbyperiod': assistbyperiod, 'pointbyperiod': pointbyperiod, 'assistfrombyplayer': assistfrombyplayer, 'assisttobyplayer': assisttobyplayer, 'penaltybyperiod': penaltybyperiod, 'pimbyperiod': pimbyperiod, 'penaltybykind': penaltybykind, 'pimbykind': pimbykind});        
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
