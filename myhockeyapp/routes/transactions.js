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

router.get('/fetchincomeforecasts', function (req, res, next) {
    fetch_events_backwards('forecasted_transactions', -1, 1000, true, function (readResult) {
        var forecasted_transactions = [];
        var j = 0;
        for (var i = 0; i < readResult.Events.length; i++) {
            var event = readResult.Events[i].Event;
            if (event.EventType == 'IncomeForecastAdded') {
                var eventDataStr = bin2String(readResult.Events[i].Event.Data.toJSON().data)
                var eventData = JSON.parse(eventDataStr);

                forecasted_transactions[j++] = { date: eventData.date, account: eventData.account, from: eventData.from, amount: numeral(eventData.amount).format('$0,0.00'), type: eventData.type };
            }
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
                if (req.body.frequency == 'Semi-Monthly') {
                    if (moment(req.body.date).date() > 28) {

                    }
                }
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

router.get('/expenseforecasts', function (req, res, next) {
    res.render('expense_forecasts.pug', { title: 'Expense Forecasts' });
});

router.get('/fetchexpenseforecasts', function (req, res, next) {
    fetch_events_backwards('forecasted_transactions', -1, 1000, true, function (readResult) {
        var forecasted_transactions = [];
        var j = 0;
        for (var i = 0; i < readResult.Events.length; i++) {
            var event = readResult.Events[i].Event;
            if (event.EventType == 'ExpenseForecastAdded') {
                var eventDataStr = bin2String(readResult.Events[i].Event.Data.toJSON().data)
                var eventData = JSON.parse(eventDataStr);

                forecasted_transactions[j++] = { date: eventData.date, account: eventData.account, to: eventData.to, for: eventData.for, amount: numeral(eventData.amount).format('$0,0.00'), category: eventData.category };

            }
        }
        res.json({ "data": forecasted_transactions });
    });
});

router.post('/addexpenseforecast', function (req, res, next) {
    process(req, res,
        function (req) {
            req.checkBody('account', 'Account is required').notEmpty();
            req.checkBody('to', 'To is required').notEmpty();
            req.checkBody('for', 'For is required').notEmpty();
            req.checkBody('amount', 'Amount is required').notEmpty().isDecimal();
            req.checkBody('category', 'Category is required').notEmpty();
            req.checkBody('date', 'Date is required').notEmpty().isDate();
            if (req.body.recurring == 'yes') {
                req.checkBody('frequency', 'Frequency is required').notEmpty();
                if (req.body.frequency == 'Semi-Monthly') {
                    if (moment(req.body.date).date() > 28) {

                    }
                }
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
                        'Type': 'ExpenseForecastAdded',
                        'Data': new Buffer(JSON.stringify({
                            'account': req.body.account,
                            'to': req.body.to,
                            'for': req.body.for,
                            'amount': req.body.amount,
                            'category': req.body.category,
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
    if (step < 15) {
        for (var i = 1; i < count; i++) {
            dates.push(moment(start).add(step * (i + 1), unit));
        }
    } else {
        if (moment(start).date() <= 13) {
            for (var i = 1; i < count; i++) {
                if (i % 2 == 0) {
                    dates.push(moment(start).add(Math.floor(i / 2), 'months'));
                } else {
                    dates.push(moment(start).add(Math.floor(i / 2), 'months').add(15, 'days'));
                }
            }
        } else {
            for (var i = 1; i < count; i++) {
                if (i % 2 == 1) {
                    if (moment(start).date() <= 15) {
                        dates.push(moment(start).add(Math.floor((i + 1) / 2), 'months').subtract((moment(start).date() - 1), 'days'));
                    } else {
                        dates.push(moment(start).add(Math.floor((i + 1) / 2), 'months').subtract(15, 'days'));
                    }
                } else {
                    dates.push(moment(start).add(Math.floor((i + 1) / 2), 'months'));
                }
            }
        }
    }

    return dates;
}

function calculate_dates_until(start, end, step, unit) {
    var dates = [];
    dates.push(moment(start));
    if (step < 15) {
        var i = 1;
        while (moment(start).add(step * (i + 1), unit) <= moment(end)) {
            dates.push(moment(start).add(step * (i + 1), unit));
            i++;
        }
    } else {
        if (moment(start).date() <= 13) {
            var i = 1;
            var next_date = (i % 2 == 0) ? moment(start).add(Math.floor(i / 2), 'months') : moment(start).add(Math.floor(i / 2), 'months').add(15, 'days');
            while (next_date < moment(end)) {
                dates.push(moment(next_date));
                i++;
                next_date = (i % 2 == 0) ? moment(start).add(Math.floor(i / 2), 'months') : moment(start).add(Math.floor(i / 2), 'months').add(15, 'days');
            }
        } else {
            var i = 1;
            var next_date = (i % 2 == 0) ? moment(start).add(Math.floor((i + 1) / 2), 'months') : (moment(start).date() <= 15 ? moment(start).add(Math.floor((i + 1) / 2), 'months').subtract((moment(start).date() - 1), 'days') : moment(start).add(Math.floor((i + 1) / 2), 'months').subtract(15, 'days'));
            while (next_date < moment(end)) {
                dates.push(moment(next_date));
                i++;
                next_date = (i % 2 == 0) ? moment(start).add(Math.floor((i + 1) / 2), 'months') : (moment(start).date() <= 15 ? moment(start).add(Math.floor((i + 1) / 2), 'months').subtract((moment(start).date() - 1), 'days') : moment(start).add(Math.floor((i + 1) / 2), 'months').subtract(15, 'days'));
            }
        }
    }

    return dates;
}


module.exports = router;
