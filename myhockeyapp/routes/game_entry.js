var express = require('express');
var router = express.Router();

var ges = require('ges-client');

var uuid = require('node-uuid');
    
router.get('/', function(req, res, next) {
    // res.send({ title: 'Express' });
    // res.json('game entry');
    res.render('game_entry.jade')
});

router.post('/gamestart', function(req, res, next) {
    var stream = "game-"+req.body.date.replace('-', '_').replace('-', '_'); //2016_03_24
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
                        type: req.body.type,
                        homeaway: req.body.homeaway,
                        opponent: req.body.opponent,
                        arena: req.body.arena
                    }))
                }
          ]  
        };
        connection.appendToStream(stream, appendData, function(err, appendResult) {
            if (err) return console.log('Oops!', err);
            console.log(appendResult);
            res.json(appendResult.Events);
        });
    });
});

router.post('/homescore', function (req, res, next) {
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
                                period: req.body.period,
                                time: req.body.time,
                                kind: req.body.kind,
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
                res.json(appendResult.Events);
            });

         });
                    
    });
});

router.post('/homepenalty', function (req, res, next) {
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
                            Type: 'PenaltyTaken',
                            Data: new Buffer(JSON.stringify({
                                period: req.body.period,
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
                res.json(appendResult.Events);
            });
            
        });
    });
});

router.post('/guestcore', function (req, res, next) {
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
                            Type: 'OpponentGoalScored',
                            Data: new Buffer(JSON.stringify({
                                period: req.body.period,
                                time: req.body.time,
                                kind: req.body.kind,
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
                res.json(appendResult.Events);
            });

         });
                    
    });
});

router.post('/guestpenalty', function (req, res, next) {
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
                            Type: 'OpponentPenaltyTaken',
                            Data: new Buffer(JSON.stringify({
                                period: req.body.period,
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
                res.json(appendResult.Events);
            });
            
        });
    });
});

router.post('/gameend', function (req, res, next) {
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
                res.json(appendResult.Events);
            });
        });
    });
});

module.exports = router;
