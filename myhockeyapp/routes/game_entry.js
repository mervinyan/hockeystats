var express = require('express');
var router = express.Router();

var ges = require('ges-client');

var uuid = require('node-uuid');
    
router.get('/', function(req, res, next) {
    // res.send({ title: 'Express' });
    // res.json('game entry');
    res.render('game_entry.jade', {title: 'Game Entry'});
});

router.get('/gamestart', function(req, res, next) {
    // res.send({ title: 'Express' });
    // res.json('game entry');
    res.render('game_entry_game_start.jade', {title: 'Game Start'});
});

router.post('/gamestart', function(req, res, next) {
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
            // res.json(appendResult.Events);
            res.render('game_entry.jade', {title: 'Game Entry', message: 'Event GameStarted Created Successfully'});
        });
    });
});

router.get('/homescore', function(req, res, next) {
    // res.send({ title: 'Express' });
    res.render('game_entry_home_score.jade', {title: 'Home Score'});
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
                // res.json(appendResult.Events);
                res.render('game_entry.jade', {title: 'Game Entry', message: 'Event GoalScored Created Successfully'});
            });

         });
                    
    });
});

router.get('/homepenalty', function(req, res, next) {
    // res.send({ title: 'Express' });
    res.render('game_entry_home_penalty.jade', {title: 'Home Penalty'});
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
                // res.json(appendResult.Events);
                res.render('game_entry.jade', {title: 'Game Entry', message: 'Event PenaltyTaken Created Successfully'});
            });
            
        });
    });
});

router.get('/guestscore', function(req, res, next) {
    // res.send({ title: 'Express' });
    res.render('game_entry_visitor_score.jade', {title: 'Visitor Score'});
});

router.post('/guestscore', function (req, res, next) {
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
                // res.json(appendResult.Events);
                res.render('game_entry.jade', {title: 'Game Entry', message: 'Event OpponentScored Created Successfully'});
            });

         });
                    
    });
});

router.get('/guestpenalty', function(req, res, next) {
    // res.send({ title: 'Express' });
    res.render('game_entry_visitor_penalty.jade', {title: 'Visitor Penalty'});
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
                // res.json(appendResult.Events);
                res.render('game_entry.jade', {title: 'Game Entry', message: 'Event OpponentPenaltyTaken Created Successfully'});
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
                // res.json(appendResult.Events);
                res.render('game_entry.jade', , {title: 'Game Entry', message: 'Event GameEnded Created Successfully'})
            });
        });
    });
});

module.exports = router;
