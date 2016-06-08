var express = require('express');
var router = express.Router();

var http = require('http');

var ges = require('ges-client');
var uuid = require('node-uuid');

var moment = require('moment');
var fs = require("fs");
var csv = require('fast-csv');

var numeral = require('numeral');

router.get('/', function (req, res, next) {
    res.render('accounts.pug', { title: 'Accounts' });
});

router.get('/fetch', function (req, res, next) {
    var options1 = {
        host: 'localhost',
        port: 2113,
        path: '/projection/projection_account_info/result',
        method: 'GET'
    }

    http.request(options1, function (res1) {
        if (res1.statusCode == 200) {
            res1.setEncoding('utf8');
            var body = "";
            res1.on('data', function (chunk) {
                body += chunk;
            });
            res1.on('end', function () {
                var data = JSON.parse(body);
                var accounts = [];
                for (var account in data.accounts) {
                    accounts.push(data.accounts[account]);
                }
                res.json({ 'data': accounts });
            });
        } else {
            res.json({ 'data': [] });
        }
    }).end();
});

router.post('/add', function (req, res, next) {
    process(req, res,
        function (req) {
            req.checkBody('name', 'Name is required').notEmpty();
            req.checkBody('status', 'Status is required').notEmpty();
            req.checkBody('type', 'Type is required').notEmpty();

            var errors = req.validationErrors();
            return errors;

        },
        function (req) {
            return "account-" + req.body.name.toLowerCase().replace(/ /g, "_");
        },
        function (req) {

            var events = [];
            events.push(
                {
                    'EventId': uuid.v4(),
                    'Type': 'AccountCreated',
                    'Data': new Buffer(JSON.stringify({
                        'name': req.body.name,
                        'status': req.body.status,
                        'type': req.body.type,
                        'yield': req.body.yield,
                        'monthly_fee': req.body.monthly_fee,
                        'min_balance': req.body.min_balance,
                        'free_bill_pay': req.body.free_bill_pay,
                        'free_atm_use': req.body.free_atm_use,
                        'std_apr': req.body.std_apr,
                        'annual_fee': req.body.annual_fee,
                        'brand': req.body.brand,
                        'reward': req.body.reward,
                        'reward_rate': req.body.reward_rate,
                        'interest_rate': req.body.interest_rate,
                        'term': req.body.term,
                        'loan_amount': req.body.loan_amount,
                        'origination_date': req.body.origination_date,
                        'mortgage_type': req.body.mortgage_type,
                    })),
                    'IsJson': true
                }
            );

            return events;
        }
    );
});

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

function process(req, res, requestValidator, streamIdGenerator, eventDataExtractor) {
    var errors = requestValidator(req);
    if (errors) {
        res.json({ flash: { type: 'alert-danger', messages: errors } });
    } else {
        var stream = streamIdGenerator(req);
        var events = eventDataExtractor(req);
        console.log(events);
        append_events_to_stream(stream, events, function (appendResult) {
            res.json(appendResult);
        })
    }
}

function append_events_to_stream(stream, events, callback) {
    var connection = ges({ host: '127.0.0.1' });
    connection.on('connect', function () {
        console.log('connecting to geteventstore...');
        connection.readStreamEventsBackward(stream, { start: -1, count: 1, resolveLinkTos: true }, function (err, readResult) {
            if (err) return console.log('Ooops!', err);
            var expectedVersion = readResult.LastEventNumber;
            var appendData = {
                expectedVersion: expectedVersion,
                events: events
            };
            console.log(appendData);
            connection.appendToStream(stream, appendData, function (err, appendResult) {
                if (err) return console.log('Oops!', err);
                callback(appendResult);
            });

        });
    });
}

function bin2String(array) {
    var result = "";
    for (var i = 0; i < array.length; i++) {
        result += String.fromCharCode(array[i]);
    }
    return result;
}

module.exports = router;
