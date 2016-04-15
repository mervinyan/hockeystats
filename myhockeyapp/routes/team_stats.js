var express = require('express');
var router = express.Router();

var ges = require('ges-client');
    
router.get('/', function(req, res, next) {
    // res.send({ title: 'Express' });
    var game_stats = []
    var team_time_stats = [];
    var connection = ges({host:'127.0.0.1'});
    var goalbyperiod = {};
    var goalbykind = {};
    var penaltybyperiod = {};
    var pimbyperiod = {};
    var penaltybykind = {};
    var pimbyplayer = {};
    var pimbykind = {};
    
    connection.on('connect', function() {
        console.log('connecting to geteventstore...');
        connection.readStreamEventsForward('gamestats', {start: 0, count: 1000}, function(err, readResult) {
            if (err) return console.log('Ooops!', err);
            for (var i = 0; i < readResult.Events.length; i++) {
                var eventDataStr = bin2String(readResult.Events[i].Event.Data.toJSON().data);
                var eventDataJson = JSON.parse(eventDataStr);
                game_stats[i] = eventDataJson;
            }
            
            connection.readStreamEventsForward('team_time_stats', {start: 0, count: 1000}, function(err, readResult) {
                if (err) return console.log('Ooops!', err);
                for (var i = 0; i < readResult.Events.length; i++) {
                    var eventDataStr = bin2String(readResult.Events[i].Event.Data.toJSON().data);
                    var eventDataJson = JSON.parse(eventDataStr);
                    team_time_stats[i] = eventDataJson;
                    var period = 'Period 1';
                    if (eventDataJson.time > '40:00')
                    {
                        period = 'Period 3';
                    } else if (eventDataJson.time > '20:00') 
                    {
                        period = 'Period 2';
                    }
                    if (readResult.Events[i].Event.EventType == 'GoalScored') 
                    {
                        if (!goalbyperiod[period]) 
                        {
                            goalbyperiod[period] = 0;
                        }
                        goalbyperiod[period]++;
                        if (!goalbykind[eventDataJson.goalkind]) 
                        {
                            goalbykind[eventDataJson.goalkind] = 0;
                        }
                        goalbykind[eventDataJson.goalkind]++;
                        
                    }
                    if (readResult.Events[i].Event.EventType == 'PenaltyTaken') 
                    {
                        if (!penaltybyperiod[period]) 
                        {
                            penaltybyperiod[period] = 0;
                        }
                        penaltybyperiod[period]++;
                        if (!pimbyperiod[period]) 
                        {
                            pimbyperiod[period] = 0;
                        }
                        pimbyperiod[period] += parseInt(eventDataJson.min);
                        if (!penaltybykind[eventDataJson.offense]) 
                        {
                            penaltybykind[eventDataJson.offense] = 0;
                        }
                        penaltybykind[eventDataJson.offense]++;
                        if (!pimbyplayer[eventDataJson.penalty]) 
                        {
                            pimbyplayer[eventDataJson.penalty] = 0;
                        }
                        pimbyplayer[eventDataJson.penalty] += parseInt(eventDataJson.min);
                        if (!pimbykind[eventDataJson.offense]) 
                        {
                            pimbykind[eventDataJson.offense] = 0;
                        }
                        pimbykind[eventDataJson.offense] += parseInt(eventDataJson.min);
                    }
                }
                res.render('team_stats.jade', { title: 'Team Stats', 'game_stats': game_stats, 'team_time_stats': team_time_stats, 'goalbyperiod': goalbyperiod, 'goalbykind': goalbykind, 'penaltybyperiod': penaltybyperiod, 'pimbyperiod': pimbyperiod, 'penaltybykind': penaltybykind, 'pimbyplayer': pimbyplayer, 'pimbykind': pimbykind });        

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
