var express = require('express');
var router = express.Router();

var ges = require('ges-client');

var uuid = require('node-uuid');

router.get('/', function(req, res, next) {
    var games = [];
    var connection = ges({host:'127.0.0.1'});
        connection.on('connect', function() {
            console.log('connecting to geteventstore...');
            connection.readStreamEventsBackward('scheduled_games', {start: -1, count: 1000,  resolveLinkTos: true}, function(err, readResult) {
                if (err) return console.log('Ooops!', err);
                for (var i = 0; i < readResult.Events.length; i++) {
                    var event = readResult.Events[i].Event;
                    var eventDataStr = bin2String(readResult.Events[i].Event.Data.toJSON().data)
                    var eventData = JSON.parse(eventDataStr);
                    var game_event = {streamid: event.EventStreamId, number: eventData.number, date: eventData.date, time: eventData.time, opponent: eventData.opponent, homeaway: eventData.homeaway, arena: eventData.arena, type: eventData.type}
                    games[i] = game_event;
                }
                res.render('game_list.jade', {title: 'Games', 'games': games});
            });        
        });
});

router.post('/add', function (req, res, next) {
    var stream = 'game-'+uuid.v4();
    var connection = ges({host:'127.0.0.1'});
    connection.on('connect', function() {
        console.log('connecting to geteventstore...');
        var appendData = {
          expectedVersion: ges.expectedVersion.emptyStream,
          events: [
               {
                    EventId: uuid.v4(),
                    Type: 'GameScheduled',
                    Data: new Buffer(JSON.stringify({
                        number: req.body.number,
                        date: req.body.date,
                        time: req.body.time,
                        type: req.body.typeOptions,
                        homeaway: req.body.homeawayOptions,
                        opponent: req.body.opponent,
                        arena: req.body.arena
                    }))
                }
          ]  
        };
        console.log(appendData);
        connection.appendToStream(stream, appendData, function(err, appendResult) {
            if (err) return console.log('Oops!', err);
            console.log(appendResult);
            var games = [];
                        connection.readStreamEventsBackward('scheduled_games', {start: -1, count: 1000,  resolveLinkTos: true}, function(err, readResult) {
                if (err) return console.log('Ooops!', err);
                for (var i = 0; i < readResult.Events.length; i++) {
                    var event = readResult.Events[i].Event;
                    var eventDataStr = bin2String(readResult.Events[i].Event.Data.toJSON().data)
                    var eventData = JSON.parse(eventDataStr);
                    var game_event = {streamid: event.EventStreamId, number: eventData.number, date: eventData.date, time: eventData.time, opponent: eventData.opponent, homeaway: eventData.homeaway, arena: eventData.arena, type: eventData.type}
                    games[i] = game_event;
                }
                res.render('game_list.jade', {title: 'Games', 'games': games});
            });        

        });
    });

});

    
router.get('/:streamid', fetchAndDisplayEvents);

function fetchAndDisplayEvents(req, res, next) {
    var game_events = [];    
    var streamid = req.params.streamid;
    if (streamid) {
        console.log(streamid);
        var connection = ges({host:'127.0.0.1'});
        connection.on('connect', function() {
            console.log('connecting to geteventstore...');
            connection.readStreamEventsBackward(streamid, {start: -1, count: 1000}, function(err, readResult) {
                if (err) return console.log('Ooops!', err);
                console.log(readResult.Events);
                for (var i = 0; i < readResult.Events.length; i++) {
                    var event = readResult.Events[i].Event;
                    var game_event = {streamId: event.EventStreamId, number: event.EventNumber, type: event.EventType, json: JSON.parse(bin2String(event.Data.toJSON().data))}
                    game_events[i] = game_event;
                }
                console.log(readResult.Events);
                res.render('game_entry.jade', {title: 'Game Entry', 'game_events': game_events});
            });        
        });
    } else {
        res.render('game_entry.jade', {title: 'Game Entry', 'game_events': game_events});
    }
}

function startGame(req, res, next) {
    var stream = req.body.streamId;
    var connection = ges({host:'127.0.0.1'});
    connection.on('connect', function() {
        console.log('connecting to geteventstore...');
        var appendData = {
          expectedVersion: ges.expectedVersion.emptyStream,
          events: [
               {
                    EventId: uuid.v4(),
                    Type: 'GameStarted',
                    Data: new Buffer(JSON.stringify({
                        number: req.body.number,
                        date: req.body.date,
                        time: req.body.time,
                        type: req.body.typeOptions,
                        homeaway: req.body.homeawayOptions,
                        opponent: req.body.opponent,
                        arena: req.body.arena
                    }))
                }
          ]  
        };
        connection.appendToStream(stream, appendData, function(err, appendResult) {
            if (err) return console.log('Oops!', err);
            console.log(appendResult);
        });
    });
    return next();
}

function homeScore(req, res, next) {
    var stream = req.body.streamId;
    var connection = ges({host:'127.0.0.1'});
    connection.on('connect', function() {
        console.log('connecting to geteventstore...');
         connection.readStreamEventsForward(stream, {start: 0, count: 1000}, function(err, readResult) {
            if (err) return console.log('Ooops!', err);
            var appendData = {
                expectedVersion: readResult.Events.length -1,
                events: [
                    {
                            EventId: uuid.v4(),
                            Type: 'GoalScored',
                            Data: new Buffer(JSON.stringify({
                                period: req.body.periodOptions,
                                time: req.body.time,
                                kind: req.body.kindOptions,
                                score: req.body.score,
                                assist1: req.body.assist1,
                                assist2: req.body.assist2
                            }))
                        }
                ]  
            };
            connection.appendToStream(stream, appendData, function(err, appendResult) {
                if (err) return console.log('Oops!', err);
                console.log(appendResult);
            });
         });
    });
    return next();
}


function bin2String(array) {
    var result = "";
    for (var i = 0; i < array.length; i++) {
        result += String.fromCharCode(array[i]);
    }
    return result;
}

router.get('/gamestart', function(req, res, next) {
    // res.send({ title: 'Express' });
    // res.json('game entry');
    res.render('game_entry_game_start.jade', {title: 'Game Start'});
});

router.post('/gamestart', startGame, fetchAndDisplayEvents);

router.get('/homescore', function(req, res, next) {
    // res.send({ title: 'Express' });
    res.render('game_entry_home_score.jade', {title: 'Home Score'});
});

router.post('/homescore', homeScore, fetchAndDisplayEvents);

router.get('/homepenalty', function(req, res, next) {
    // res.send({ title: 'Express' });
    res.render('game_entry_home_penalty.jade', {title: 'Home Penalty'});
});

router.post('/homepenalty', function (req, res, next) {
    var stream = req.body.streamId;
    var connection = ges({host:'127.0.0.1'});
    var game_events = [];    
    connection.on('connect', function() {
        console.log('connecting to geteventstore...');
        connection.readStreamEventsForward(stream, {start: 0, count: 1000}, function(err, readResult) {
            if (err) return console.log('Ooops!', err);
            var appendData = {
                expectedVersion: readResult.Events.length -1,
                events: [
                    {
                            EventId: uuid.v4(),
                            Type: 'PenaltyTaken',
                            Data: new Buffer(JSON.stringify({
                                period: req.body.periodOptions,
                                time: req.body.time,
                                player: req.body.player,
                                offense: req.body.offense,
                                min: req.body.min,
                                off: req.body.off,
                                on: req.body.on
                            }))
                        }
                ]  
            };
            connection.appendToStream(stream, appendData, function(err, appendResult) {
                if (err) return console.log('Oops!', err);
                console.log(appendResult);
                connection.readStreamEventsBackward('game-2016_03_19', {start: -1, count: 1000}, function(err, readResult) {
                    if (err) return console.log('Ooops!', err);
                    for (var i = 0; i < readResult.Events.length; i++) {
                        var event = readResult.Events[i].Event;
                        var game_event = {streamId: event.EventStreamId, number: event.EventNumber, type: event.EventType, json: JSON.parse(bin2String(event.Data.toJSON().data))}
                        game_events[i] = game_event;
                    }
                    res.render('game_entry.jade', {title: 'Game Entry', 'game_events': game_events});
                });
            });
            
        });
    });
});

router.get('/guestscore', function(req, res, next) {
    // res.send({ title: 'Express' });
    res.render('game_entry_visitor_score.jade', {title: 'Guest Score'});
});

router.post('/guestscore', function (req, res, next) {
    var stream = req.body.streamId;
    var connection = ges({host:'127.0.0.1'});
    var game_events = [];    
    connection.on('connect', function() {
        console.log('connecting to geteventstore...');
         connection.readStreamEventsForward(stream, {start: 0, count: 1000}, function(err, readResult) {
            if (err) return console.log('Ooops!', err);
            var appendData = {
                expectedVersion: readResult.Events.length -1,
                events: [
                    {
                            EventId: uuid.v4(),
                            Type: 'OpponentGoalScored',
                            Data: new Buffer(JSON.stringify({
                                period: req.body.periodOptions,
                                time: req.body.time,
                                kind: req.body.kindOptions,
                                score: req.body.score,
                                assist1: req.body.assist1,
                                assist2: req.body.assist2
                            }))
                        }
                ]  
            };
            connection.appendToStream(stream, appendData, function(err, appendResult) {
                if (err) return console.log('Oops!', err);
                console.log(appendResult);
                connection.readStreamEventsBackward('game-2016_03_19', {start: -1, count: 1000}, function(err, readResult) {
                    if (err) return console.log('Ooops!', err);
                    for (var i = 0; i < readResult.Events.length; i++) {
                        var event = readResult.Events[i].Event;
                        var game_event = {streamId: event.EventStreamId, number: event.EventNumber, type: event.EventType, json: JSON.parse(bin2String(event.Data.toJSON().data))}
                        game_events[i] = game_event;
                    }
                    res.render('game_entry.jade', {title: 'Game Entry', 'game_events': game_events});
                });
            });

         });
                    
    });
});

router.get('/guestpenalty', function(req, res, next) {
    // res.send({ title: 'Express' });
    res.render('game_entry_visitor_penalty.jade', {title: 'Guest Penalty'});
});

router.post('/guestpenalty', function (req, res, next) {
    var stream = req.body.streamId;
    var connection = ges({host:'127.0.0.1'});
    var game_events = [];    
    connection.on('connect', function() {
        console.log('connecting to geteventstore...');
        connection.readStreamEventsForward(stream, {start: 0, count: 1000}, function(err, readResult) {
            if (err) return console.log('Ooops!', err);
            var appendData = {
                expectedVersion: readResult.Events.length -1,
                events: [
                    {
                            EventId: uuid.v4(),
                            Type: 'OpponentPenaltyTaken',
                            Data: new Buffer(JSON.stringify({
                                period: req.body.periodOptions,
                                time: req.body.time,
                                player: req.body.player,
                                offense: req.body.offense,
                                min: req.body.min,
                                off: req.body.off,
                                on: req.body.on
                            }))
                        }
                ]  
            };
            connection.appendToStream(stream, appendData, function(err, appendResult) {
                if (err) return console.log('Oops!', err);
                console.log(appendResult);
                connection.readStreamEventsBackward('game-2016_03_19', {start: -1, count: 1000}, function(err, readResult) {
                    if (err) return console.log('Ooops!', err);
                    for (var i = 0; i < readResult.Events.length; i++) {
                        var event = readResult.Events[i].Event;
                        var game_event = {streamId: event.EventStreamId, number: event.EventNumber, type: event.EventType, json: JSON.parse(bin2String(event.Data.toJSON().data))}
                        game_events[i] = game_event;
                    }
                    res.render('game_entry.jade', {title: 'Game Entry', 'game_events': game_events});
                });
            });
            
        });
    });
});

router.get('/gameend', function(req, res, next) {
    // res.send({ title: 'Express' });
    res.render('game_entry_game_end.jade', {title: 'Game End'});
});

router.post('/gameend', function (req, res, next) {
    var stream = req.body.streamId;
    var connection = ges({host:'127.0.0.1'});
    var game_events = [];    
    connection.on('connect', function() {
        console.log('connecting to geteventstore...');
        connection.readStreamEventsForward(stream, {start: 0, count: 1000}, function(err, readResult) {
            if (err) return console.log('Ooops!', err);
            var appendData = {
                expectedVersion: readResult.Events.length -1,
                events: [
                    {
                            EventId: uuid.v4(),
                            Type: 'GameEnded',
                            Data: new Buffer(JSON.stringify({
                                date: req.body.date,
                                time: req.body.time
                            }))
                        }
                ]  
            };
            connection.appendToStream(stream, appendData, function(err, appendResult) {
                if (err) return console.log('Oops!', err);
                console.log(appendResult);
                connection.readStreamEventsBackward('game-2016_03_19', {start: -1, count: 1000}, function(err, readResult) {
                    if (err) return console.log('Ooops!', err);
                    for (var i = 0; i < readResult.Events.length; i++) {
                        var event = readResult.Events[i].Event;
                        var game_event = {streamId: event.EventStreamId, number: event.EventNumber, type: event.EventType, json: JSON.parse(bin2String(event.Data.toJSON().data))}
                        game_events[i] = game_event;
                    }
                    res.render('game_entry.jade', {title: 'Game Entry', 'game_events': game_events});
                });
            });
        });
    });
});

module.exports = router;
