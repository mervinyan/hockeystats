var express = require('express');
var router = express.Router();

var ges = require('ges-client');
var uuid = require('node-uuid');
var util = require('./util.js');

router.get('/', function (req, res, next) {
    res.render('shot_stats.pug', { title: 'Games', 'games': [] });
});

router.post('/add', function (req, res, next) {
    var stream = 'powershot_log';
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

router.post('/add', function (req, res, next) {
    var stream = 'powershot_training_event_stream';
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
                        Type: 'ShotPracticed',
                        Data: new Buffer(JSON.stringify({
                            numberofshots: req.body.numberofshots,
                            averagescore: req.body.averagescore,
                            maximumscore: req.body.maximumscore,
                            averagepuckspeed: req.body.averagepuckspeed
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
