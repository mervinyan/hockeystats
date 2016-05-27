var express = require('express');
var router = express.Router();

var ges = require('ges-client');
var uuid = require('node-uuid');

var moment = require('moment');

router.get('/', function (req, res, next) {
    res.render('game_list.pug', { title: 'Games', 'games': [] });
});

router.get('/fetch', function (req, res, next) {
    fetch_events_backwards('scheduled_games', -1, 1000, true, function (readResult) {
        var games = [];
        for (var i = 0; i < readResult.Events.length; i++) {
            var event = readResult.Events[i].Event;
            var eventDataStr = bin2String(readResult.Events[i].Event.Data.toJSON().data)
            var eventData = JSON.parse(eventDataStr);
            var game_event = { streamid: event.EventStreamId, date: eventData.date, time: eventData.time, opponent: eventData.opponent, homeaway: eventData.homeaway, arena: eventData.arena, type: eventData.type }
            games[i] = game_event;
        }
        games.sort(sort_by_date_time);
        res.json({ "data": games });
    });
});

router.post('/add', function (req, res, next) {
    process(req, res,
        function (req) {
            req.checkBody('date', 'Date is required').notEmpty().isDate();
            req.checkBody('time', 'Time is required').notEmpty();
            req.checkBody('type', 'Type is required').notEmpty();
            req.checkBody('homeaway', 'HomeAway is required').notEmpty();
            req.checkBody('opponent', 'Opponent is required').notEmpty();
            req.checkBody('arena', 'Arena is required').notEmpty();

            var errors = req.validationErrors();
            return errors;

        },
        function (req) {
            return {
                date: req.body.date,
                time: req.body.time,
                type: req.body.type,
                homeaway: req.body.homeaway,
                opponent: req.body.opponent,
                arena: req.body.arena
            };
        },
        'GameScheduled');
});

router.get('/:streamid', function (req, res, next) {
    var streamid = req.params.streamid;
    fetch_events_backwards(streamid, -1, 1000, true, function (readResult) {
        var game_events = [];
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
            game_events[i] = { number: event.EventNumber, type: event.EventType, createdDate: event.Created, json: JSON.parse(bin2String(event.Data.toJSON().data)) };
        }
        res.render('game_entry.pug', { title: 'Game Events', 'stream_id': streamid, 'game_events': game_events, 'gamestart': gamestart, 'gameover': gameover });
    });
});

router.get('/:streamid/timeline', function (req, res, next) {
    var streamid = req.params.streamid;
    fetch_events_backwards(streamid, -1, 1000, true, function (readResult) {
        var game_events = [];
        for (var i = 0; i < readResult.Events.length; i++) {
            var event = readResult.Events[i].Event;
            game_events[i] = { number: event.EventNumber, type: event.EventType, createdDate: event.Created, json: JSON.parse(bin2String(event.Data.toJSON().data)) };
        }
        res.render('game_timeline.pug', { title: 'Game Timeline', 'stream_id': streamid, 'game_events': game_events });
    });
});

router.get('/fetchevents/:streamid', function (req, res, next) {
    var streamid = req.params.streamid;
    fetch_events_backwards(streamid, -1, 1000, true, function (readResult) {
        var game_events = [];
        var gameover = false;
        var gamestart = false;
        for (var i = 0; i < readResult.Events.length; i++) {
            var event = readResult.Events[i].Event;
            console.log(event);
            if (gamestart == false && event.EventType == 'GameStarted') {
                gamestart = true;
            }
            if (gameover == false && event.EventType == 'GameEnded') {
                gameover = true;
            }
            game_events[i] = { number: event.EventNumber, type: event.EventType, createdDate: convert_to_date(event.Created), json: JSON.parse(bin2String(event.Data.toJSON().data)) };
        }
        res.json({ 'data': game_events, 'stream_id': streamid, 'gamestart': gamestart, 'gameover': gameover });
    });
});

router.post('/gamestart', function (req, res, next) {
    process(req, res,
        function (req) {
            req.checkBody('date', 'Date is required').notEmpty().isDate();
            req.checkBody('time', 'Time is required').notEmpty();

            var errors = req.validationErrors();
            return errors;

        },
        function (req) {
            return {
                date: req.body.date,
                time: req.body.time
            };
        },
        'GameStarted');

});

router.post('/homescore', function (req, res, next) {
    process(req, res, validateScoreRequest, extractScoreEventData, 'GoalScored');

});


router.post('/homepenalty', function (req, res, next) {
    process(req, res, validatePenaltyRequest, extractPenaltyEventData, 'PenaltyTaken');
});


router.post('/guestscore', function (req, res, next) {
    process(req, res, validateScoreRequest, extractScoreEventData, 'OpponentGoalScored');
});


router.post('/guestpenalty', function (req, res, next) {
    process(req, res, validatePenaltyRequest, extractPenaltyEventData, 'OpponentPenaltyTaken');
});

router.post('/gameend', function (req, res, next) {
    process(req, res,
        function (req) {
            req.checkBody('date', 'Date is required').notEmpty().isDate();
            req.checkBody('time', 'Time is required').notEmpty();

            var errors = req.validationErrors();
            return errors;
        },
        function (req) {
            return {
                date: req.body.date,
                time: req.body.time
            };
        },
        'GameEnded');
});

function process(req, res, requestValidator, eventDataExtractor, eventType) {
    var errors = requestValidator(req);
    if (errors) {
        res.json({ flash: { type: 'alert-danger', messages: errors } });
    } else {
        var stream = req.body.streamId;
        if (!stream) {
            stream = 'game-' + uuid.v4();
        }
        var eventData = eventDataExtractor(req);
        append_event_to_stream(stream, eventType, eventData, function (appendResult) {
            res.json(appendResult);
        })
    }
}

function append_event_to_stream(stream, eventType, eventData, callback) {
    var connection = ges({ host: '127.0.0.1' });
    connection.on('connect', function () {
        console.log('connecting to geteventstore...');
        connection.readStreamEventsBackward(stream, { start: -1, count: 1, resolveLinkTos: true }, function (err, readResult) {
            if (err) return console.log('Ooops!', err);
            var expectedVersion = readResult.LastEventNumber;
            var appendData = {
                expectedVersion: expectedVersion,
                events: [
                    {
                        EventId: uuid.v4(),
                        Type: eventType,
                        Data: new Buffer(JSON.stringify(eventData)),
                        IsJson: true
                    }
                ]
            };
            connection.appendToStream(stream, appendData, function (err, appendResult) {
                if (err) return console.log('Oops!', err);
                callback(appendResult);
            });

        });
    });
}

function fetch_events_backwards(stream, start, count, resolveLinkTos, resultProcessor) {
    console.log(resolveLinkTos);
    var connection = ges({ host: '127.0.0.1' });
    connection.on('connect', function () {
        console.log('connecting to geteventstore...');
        connection.readStreamEventsBackward(stream, { start: start, count: count, resolveLinkTos: resolveLinkTos }, function (err, readResult) {
            if (err) return console.log('Ooops!', err);
            console.log(readResult);
            resultProcessor(readResult);
        });
    });
}

function validateScoreRequest(req) {
    req.checkBody('period', 'Period is required').notEmpty();
    req.checkBody('time', 'Time is required').notEmpty();
    req.checkBody('kind', 'Kind is required').notEmpty();
    req.checkBody('score', 'Score is required').notEmpty();

    var errors = req.validationErrors();
    return errors;
}

function validatePenaltyRequest(req) {
    req.checkBody('period', 'Period is required').notEmpty();
    req.checkBody('time', 'Time is required').notEmpty();
    req.checkBody('player', 'Player is required').notEmpty();
    req.checkBody('offense', 'offense is required').notEmpty();
    req.checkBody('min', 'min is required').notEmpty();
    req.checkBody('off', 'off is required').notEmpty();

    var errors = req.validationErrors();
    return errors;
}

function extractScoreEventData(req) {
    return {
        period: req.body.period,
        time: req.body.time,
        kind: req.body.kind,
        score: req.body.score,
        assist1: req.body.assist1,
        assist2: req.body.assist2
    };
}

function extractPenaltyEventData(req) {
    return {
        period: req.body.period,
        time: req.body.time,
        player: req.body.player,
        offense: req.body.offense,
        min: req.body.min,
        off: req.body.off,
        on: req.body.on
    };
}


function bin2String(array) {
    var result = "";
    for (var i = 0; i < array.length; i++) {
        result += String.fromCharCode(array[i]);
    }
    return result;
}

function sort_by_date_time(a, b) {
    if (b.date == a.date) {
        return left_pad_zero(b.time).localeCompare(left_pad_zero(a.time));
    } else {
        return b.date.localeCompare(a.date);
    }
}

function left_pad_zero(time) {
    return "00000".substring(0, 5 - time.length) + time
}

function convert_to_date(timestamp) {
    var t = new moment(timestamp);
    var formatted = t.format("dd.mm.yyyy hh:MM:ss");
    console.log(formatted);
    return formatted;
}

module.exports = router;
