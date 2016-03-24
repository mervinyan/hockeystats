var express = require('express');
var router = express.Router();

var ges = require('ges-client');
    
router.get('/', function(req, res, next) {
    // res.send({ title: 'Express' });
    res.json('game entry');
    
});

router.post('/gamestart', function(req, res, next) {
    var stream = "game-"+req.body.date.replace('-', '_').replace('-', '_'); //2016_03_24
    var event = {
        'eventId': uuid.v1(),
        'eventType': 'GameStart',
        'data': {
            'number': req.body.number,
            'date': req.body.date,
            'time': req.body.time,
            'type': req.body.type,
            'homeaway': req.body.homeaway,
            'opponent': req.body.opponent,
            'arena': req.body.arena
        }
    };
    console.log(event);
    var connection = ges({host:'127.0.0.1'});
    connection.on('connect', function() {
        console.log('connecting to geteventstore...');
        var appendData = {
          expectedVersion: ges.expectedVersion.emptyStream,
          events: [event]  
        };
        connection.appendToStream(stream, appendData, function(err, appendResult) {
            if (err) return console.log('Oops!', err);
            console.log(appendResult);
            connection.readStreamEventsForward(stream, {start: 0, count: 1000}, function(err, readResult) {
                if (err) return console.log('Oops!', err);
                console.log(readResult.Events);
                res.json(readResult.Events);
            });
        });
    });
});

router.post('/homescore', function (req, res, next) {
    res.json('homescore');
});

router.post('/homepenalty', function (req, res, next) {
    res.json('homepenalty');
});

router.post('/guestcore', function (req, res, next) {
    res.json('guestscore');
});

router.post('/guestpenalty', function (req, res, next) {
    res.json('guestpenalty');
});

router.post('/gameend', function (req, res, next) {
    res.json('gameend');
});

function bin2String(array) {
    var result = "";
    for (var i = 0; i < array.length; i++) {
        result += String.fromCharCode(array[i]);
    }
    return result;
}

module.exports = router;
