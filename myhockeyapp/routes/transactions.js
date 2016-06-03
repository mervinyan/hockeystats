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
    var options1 = {
        host: 'localhost',
        port: 2113,
        path: '/projection/projection_balances/result',
        method: 'GET'
    }

    http.request(options1, function (res1) {
        res1.setEncoding('utf8');
        var body = "";
        res1.on('data', function (chunk) {
            body += chunk;
        });
        res1.on('end', function () {
            var data = JSON.parse(body);
            var account_balances = [];
            for (var account in data.balances) {
                var s = numeral(data.balances[account]).format('$0,0.00');
                account_balances.push([account, s]);
            }
            res.render('accounts.pug', { title: 'Transaction', 'account_balances': account_balances });
        });
    }).end();
});

router.get('/load', function (req, res, next) {
    var stream = fs.createReadStream("\data\\transactions.csv");
    var events = [];
    csv.fromStream(stream, { headers: true })
        .on("data", function (data) {
            events.unshift({
                EventId: uuid.v4(),
                Type: 'TransactionOccurred',
                Data: new Buffer(JSON.stringify(data)),
                IsJson: true
            });
        })
        .on("end", function () {
            console.log("done");
            var connection = ges({ host: '127.0.0.1' });
            connection.on('connect', function () {
                console.log('connecting to geteventstore...');
                var streamId = 'transactionstream-' + uuid.v4();
                connection.readStreamEventsBackward(streamId, { start: -1, count: 1, resolveLinkTos: true }, function (err, readResult) {
                    if (err) return console.log('Ooops!', err);
                    var expectedVersion = readResult.LastEventNumber;
                    var appendData = {
                        expectedVersion: expectedVersion,
                        events: events
                    };
                    connection.appendToStream(streamId, appendData, function (err, appendResult) {
                        if (err) return console.log('Oops!', err);
                        res.json(appendResult);
                    });

                });
            });
        });
});

router.get('/incomeforecasts', function (req, res, next) {
    res.render('income_forecasts.pug', { title: 'Income Forecasts' });
});

router.get('/fetchforecasts', function (req, res, next) {
    fetch_events_backwards('forecasted_transactions', -1, 1000, true, function (readResult) {
        var forecasted_transactions = [];
        for (var i = 0; i < readResult.Events.length; i++) {
            var event = readResult.Events[i].Event;
            var eventDataStr = bin2String(readResult.Events[i].Event.Data.toJSON().data)
            var eventData = JSON.parse(eventDataStr);

            forecasted_transactions[i] = { date: eventData.date, account: eventData.account, from: eventData.from, amount: numeral(eventData.amount).format('$0,0.00'), type: eventData.type };
        }
        res.json({ "data": forecasted_transactions });
    });
});

router.post('/addincomeforecast', function (req, res, next) {
    process(req, res,
        function (req) {
            req.checkBody('account', 'Account is required').notEmpty();
            req.checkBody('from', 'From is required').notEmpty();
            req.checkBody('amount', 'Amount is required').notEmpty().isDecimal();
            req.checkBody('type', 'Type is required').notEmpty();
            req.checkBody('date', 'Date is required').notEmpty().isDate();
            if (req.body.recurring == 'yes') {
                req.checkBody('frequency', 'Frequency is required').notEmpty();
                // req.checkBody('starts', 'Starts is required').notEmpty().isDate();
                req.checkBody('endOptions', 'endOptions is required').notEmpty();
                if (req.body.endOptions == 'after') {
                    req.checkBody('occurrences', 'Occurrences is required').notEmpty().isInt();
                } else if (req.body.endOptions == 'on') {
                    req.checkBody('ends', 'Ends is required').notEmpty().isDate();
                }
            }
            var errors = req.validationErrors();
            return errors;

        },
        function (req) {
            return "account-" + req.body.account.toLowerCase().replace(/ /g, "_");
        },
        function (req) {
            var dates = [];
            var start = moment(req.body.date);
            if (req.body.recurring == 'yes') {
                var step = 0;
                var unit = '';
                if (req.body.frequency == 'Bi-Weekly') {
                    step = 14;
                    unit = 'days';
                }
                if (req.body.frequency == 'Semi-Monthly') {
                    step = 15;
                    unit = 'days';
                }
                if (req.body.frequency == 'Monthly') {
                    step = 1;
                    unit = 'months';
                }
                if (req.body.frequency == 'Yearly') {
                    step = 1;
                    unit = 'years';
                }

                if (req.body.endOptions == 'after') {
                    var count = parseInt(req.body.occurrences);
                    dates = calculate_dates(start, count, step, unit);
                } else if (req.body.endOptions == 'on') {
                    dates = calculate_dates_until(start, moment(req.body.ends), step, unit);
                }
            } else {
                dates.push(start);
            }

            console.log(dates);
            var events = [];
            for (var i = 0; i < dates.length; i++) {
                events.push(
                    {
                        'EventId': uuid.v4(),
                        'Type': 'IncomeForecastAdded',
                        'Data': new Buffer(JSON.stringify({
                            'account': req.body.account,
                            'from': req.body.from,
                            'amount': req.body.amount,
                            'type': req.body.type,
                            'date': dates[i].format('YYYY-MM-DD')
                        })),
                        'IsJson': true
                    }
                );
            }

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

function sort_by_date(a, b) {
    return b.date.localeCompare(a.date);
}

function calculate_dates(start, count, step, unit) {
    var dates = [];
    dates.push(moment(start));
    for (var i = 0; i < count; i++) {
        dates.push(moment(start).add(step * (i + 1), unit));
    }
    return dates;
}

function calculate_dates_until(start, end, step, unit) {
    var dates = [];
    dates.push(moment(start));
    var i = 0;
    while (moment(start).add(step * (i + 1), unit) <= moment(end)) {
        dates.push(moment(start).add(step * (i + 1), unit));
        i++;
    }
    return dates;
}


module.exports = router;
