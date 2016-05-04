var express = require('express');
var router = express.Router();

var ges = require('ges-client');
var uuid = require('node-uuid');
var util = require('./util.js');

router.get('/', function (req, res, next) {
    res.render('game_list.pug', { title: 'Games', 'games': [] });
});

router.get('/fetch', function (req, res, next) {
    var games = [];
    var connection = ges({ host: '127.0.0.1' });
    connection.on('connect', function () {
        console.log('connecting to geteventstore...');
        connection.readStreamEventsBackward('scheduled_games', { start: -1, count: 1000, resolveLinkTos: true }, function (err, readResult) {
            if (err) return console.log('Ooops!', err);
            for (var i = 0; i < readResult.Events.length; i++) {
                var event = readResult.Events[i].Event;
                var eventDataStr = util.bin2String(readResult.Events[i].Event.Data.toJSON().data)
                var eventData = JSON.parse(eventDataStr);
                var game_event = { streamid: event.EventStreamId, number: eventData.number, date: eventData.date, time: eventData.time, opponent: eventData.opponent, homeaway: eventData.homeaway, arena: eventData.arena, type: eventData.type }
                games[i] = game_event;
            }
            console.log(games);
            res.json({ "data": games });
        });
    });
});

router.post('/add', function (req, res, next) {
    var stream = 'game-' + uuid.v4();
    var connection = ges({ host: '127.0.0.1' });
    connection.on('connect', function () {
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
                    })),
                    IsJson: true
                }
            ]
        };
        console.log(appendData);
        connection.appendToStream(stream, appendData, function (err, appendResult) {
            if (err) return console.log('Oops!', err);
            console.log(appendResult);
            res.json(appendResult);
        });
    });

});


router.get('/:streamid', function (req, res, next) {
    var streamid = req.params.streamid;
    var connection = ges({ host: '127.0.0.1' });
    connection.on('connect', function () {
        console.log('connecting to geteventstore...');
        connection.readStreamEventsBackward(streamid, { start: -1, count: 1000 }, function (err, readResult) {
            if (err) return console.log('Ooops!', err);
            var gameover = false;
            var gamestart = false;
            for (var i = 0; i < readResult.Events.length; i++) {
                var event = readResult.Events[i].Event;
                if (gamestart == false && event.EventType == 'GameStarted') {
                    gamestart = true;
                }
                if (gameover == false && event.EventType == 'GameEnded') {
                    gameover = true;
                }
            }
            res.render('game_entry.pug', { title: 'Game Events', 'stream_id': streamid, 'gamestart': gamestart, 'gameover': gameover });
        });
    });

});

router.get('/fetchevents/:streamid', function (req, res, next) {
    var game_events = [];
    var streamid = req.params.streamid;
    console.log(streamid);
    var connection = ges({ host: '127.0.0.1' });
    connection.on('connect', function () {
        console.log('connecting to geteventstore...');
        connection.readStreamEventsBackward(streamid, { start: -1, count: 1000 }, function (err, readResult) {
            if (err) return console.log('Ooops!', err);
            var gameover = false;
            var gamestart = false;
            for (var i = 0; i < readResult.Events.length; i++) {
                var event = readResult.Events[i].Event;
                if (gamestart == false && event.EventType == 'GameStarted') {
                    gamestart = true;
                }
                if (gameover == false && event.EventType == 'GameEnded') {
                    gameover = true;
                }
                game_events[i] = { number: event.EventNumber, type: event.EventType, json: JSON.parse(util.bin2String(event.Data.toJSON().data)) };
            }
            console.log(game_events);
            console.log(gamestart);
            console.log(gameover);
            res.json({ 'data': game_events, 'stream_id': streamid, 'gamestart': gamestart, 'gameover': gameover });
        });
    });
});

router.post('/gamestart', function (req, res, next) {
    var stream = req.body.streamId;
    var connection = ges({ host: '127.0.0.1' });
    var game_events = [];
    connection.on('connect', function () {
        console.log('connecting to geteventstore...');
        connection.readStreamEventsForward(stream, { start: 0, count: 1000 }, function (err, readResult) {
            if (err) return console.log('Ooops!', err);
            var appendData = {
                expectedVersion: readResult.Events.length - 1,
                events: [
                    {
                        EventId: uuid.v4(),
                        Type: 'GameStarted',
                        Data: new Buffer(JSON.stringify({
                            date: req.body.date,
                            time: req.body.time
                        })),
                        IsJson: true
                    }
                ]
            };
            connection.appendToStream(stream, appendData, function (err, appendResult) {
                if (err) return console.log('Oops!', err);
                console.log(appendResult);
                res.json(appendData);
            });

        });
    });
});

router.post('/homescore', function (req, res, next) {
    var stream = req.body.streamId;
    var connection = ges({ host: '127.0.0.1' });
    var game_events = [];
    connection.on('connect', function () {
        console.log('connecting to geteventstore...');
        connection.readStreamEventsForward(stream, { start: 0, count: 1000 }, function (err, readResult) {
            if (err) return console.log('Ooops!', err);
            var appendData = {
                expectedVersion: readResult.Events.length - 1,
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
                        })),
                        IsJson: true
                    }
                ]
            };
            connection.appendToStream(stream, appendData, function (err, appendResult) {
                if (err) return console.log('Oops!', err);
                console.log(appendResult);
                res.json(appendData);
            });

        });

    });
});

router.post('/homepenalty', function (req, res, next) {
    var stream = req.body.streamId;
    var connection = ges({ host: '127.0.0.1' });
    var game_events = [];
    connection.on('connect', function () {
        console.log('connecting to geteventstore...');
        connection.readStreamEventsForward(stream, { start: 0, count: 1000 }, function (err, readResult) {
            if (err) return console.log('Ooops!', err);
            var appendData = {
                expectedVersion: readResult.Events.length - 1,
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
                        })),
                        IsJson: true
                    }
                ]
            };
            connection.appendToStream(stream, appendData, function (err, appendResult) {
                if (err) return console.log('Oops!', err);
                console.log(appendResult);
                res.json(appendData);
            });

        });
    });
});

router.post('/guestscore', function (req, res, next) {
    var stream = req.body.streamId;
    var connection = ges({ host: '127.0.0.1' });
    var game_events = [];
    connection.on('connect', function () {
        console.log('connecting to geteventstore...');
        connection.readStreamEventsForward(stream, { start: 0, count: 1000 }, function (err, readResult) {
            if (err) return console.log('Ooops!', err);
            var appendData = {
                expectedVersion: readResult.Events.length - 1,
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
                        })),
                        IsJson: true
                    }
                ]
            };
            connection.appendToStream(stream, appendData, function (err, appendResult) {
                if (err) return console.log('Oops!', err);
                console.log(appendResult);
                res.json(appendData);
            });

        });

    });
});

router.post('/guestpenalty', function (req, res, next) {
    var stream = req.body.streamId;
    var connection = ges({ host: '127.0.0.1' });
    var game_events = [];
    connection.on('connect', function () {
        console.log('connecting to geteventstore...');
        connection.readStreamEventsForward(stream, { start: 0, count: 1000 }, function (err, readResult) {
            if (err) return console.log('Ooops!', err);
            var appendData = {
                expectedVersion: readResult.Events.length - 1,
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
                        })),
                        IsJson: true
                    }
                ]
            };
            connection.appendToStream(stream, appendData, function (err, appendResult) {
                if (err) return console.log('Oops!', err);
                console.log(appendResult);
                res.json(appendData);
            });

        });
    });
});

router.post('/gameend', function (req, res, next) {
    var stream = req.body.streamId;
    var connection = ges({ host: '127.0.0.1' });
    var game_events = [];
    connection.on('connect', function () {
        console.log('connecting to geteventstore...');
        connection.readStreamEventsForward(stream, { start: 0, count: 1000 }, function (err, readResult) {
            if (err) return console.log('Ooops!', err);
            var appendData = {
                expectedVersion: readResult.Events.length - 1,
                events: [
                    {
                        EventId: uuid.v4(),
                        Type: 'GameEnded',
                        Data: new Buffer(JSON.stringify({
                            date: req.body.date,
                            time: req.body.time
                        })),
                        IsJson: true
                    }
                ]
            };
            connection.appendToStream(stream, appendData, function (err, appendResult) {
                if (err) return console.log('Oops!', err);
                console.log(appendResult);
                res.json(appendData);
            });
        });
    });
});

module.exports = router;
