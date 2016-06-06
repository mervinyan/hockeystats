fromCategory('account')
    .when({
        $init: function () {
            return {
                cashflow: {}
            };
        },
        "IncomeForecastAdded": function (state, ev) {
            var event_year = parseInt(ev.body.date.substring(0, 4));
            var event_month = parseInt(ev.body.date.substring(5, 7));
            var event_day = parseInt(ev.body.date.substring(8, 10));

            var event_date = new Date(event_year, event_month, event_day);

            var current_date = new Date();

            var event_year_month = ev.body.date.substring(0, 7);
            var s_prev_month = (event_month -1).toString();
            var previous_year_month = event_month == 1 ? (event_year - 1) + "-" + 12 : event_year + "-" + ("00".substring(0, 2 - s_prev_month.length) + s_prev_month);

            if (!state.cashflow[event_year_month]) {
                state.cashflow[event_year_month] = { "Total": { begin: 0.00, in: 0.00, out: 0.00, end: 0.00 } };
            }
            if (!state.cashflow[event_year_month][ev.body.account]) {
                state.cashflow[event_year_month][ev.body.account] = { begin: 0.00, in: 0.00, out: 0.00, end: 0.00 };
            }
            if (event_date >= current_date) {
                state.cashflow[event_year_month][ev.body.account].in += parseFloat(ev.body.amount);
                state.cashflow[event_year_month]["Total"].in += parseFloat(ev.body.amount);

                if (!state.cashflow[previous_year_month]) {
                    state.cashflow[event_year_month][ev.body.account].begin = 0.00;
                    state.cashflow[event_year_month]["Total"].begin = 0.00;
                } else {
                    if (!state.cashflow[previous_year_month][ev.body.account]) {
                        state.cashflow[event_year_month][ev.body.account].begin = 0.00;
                    } else {
                        state.cashflow[event_year_month][ev.body.account].begin = state.cashflow[previous_year_month][ev.body.account].end;
                    }
                    if (!state.cashflow[previous_year_month]["Total"]) {
                        state.cashflow[event_year_month]["Total"].begin = 0.00;
                    } else {
                        state.cashflow[event_year_month]["Total"].begin = state.cashflow[previous_year_month]["Total"].end;
                    }
                }

                state.cashflow[event_year_month][ev.body.account].end = state.cashflow[event_year_month][ev.body.account].begin + state.cashflow[event_year_month][ev.body.account].in - state.cashflow[event_year_month][ev.body.account].out;
                state.cashflow[event_year_month]["Total"].end = state.cashflow[event_year_month]["Total"].begin + state.cashflow[event_year_month]["Total"].in - state.cashflow[event_year_month]["Total"].out;
            }
        },
        "IncomeActualAdded": function (state, ev) {
            var event_year = parseInt(ev.body.date.substring(0, 4));
            var event_month = parseInt(ev.body.date.substring(5, 7));
            var event_day = parseInt(ev.body.date.substring(8, 10));

            var event_date = new Date(event_year, event_month, event_day);

            var current_date = new Date();

            var event_year_month = ev.body.date.substring(0, 7);

            var s_prev_month = (event_month -1).toString();
            var previous_year_month = event_month == 1 ? (event_year - 1) + "-" + 12 : event_year + "-" + ("00".substring(0, 2 - s_prev_month.length) + s_prev_month);

            if (!state.cashflow[event_year_month]) {
                state.cashflow[event_year_month] = { "Total": { begin: 0.00, in: 0.00, out: 0.00, end: 0.00 } };
            }
            if (!state.cashflow[event_year_month][ev.body.account]) {
                state.cashflow[event_year_month][ev.body.account] = { begin: 0.00, in: 0.00, out: 0.00, end: 0.00 };
            }
            if (event_date < current_date) {
                state.cashflow[event_year_month][ev.body.account].in += parseFloat(ev.body.amount);
                state.cashflow[event_year_month]["Total"].in += parseFloat(ev.body.amount);

                if (!state.cashflow[previous_year_month]) {
                    state.cashflow[event_year_month][ev.body.account].begin = 0.00;
                    state.cashflow[event_year_month]["Total"].begin = 0.00;
                } else {
                    if (!state.cashflow[previous_year_month][ev.body.account]) {
                        state.cashflow[event_year_month][ev.body.account].begin = 0.00;
                    } else {
                        state.cashflow[event_year_month][ev.body.account].begin = state.cashflow[previous_year_month][ev.body.account].end;
                    }
                    if (!state.cashflow[previous_year_month]["Total"]) {
                        state.cashflow[event_year_month]["Total"].begin = 0.00;
                    } else {
                        state.cashflow[event_year_month]["Total"].begin = state.cashflow[previous_year_month]["Total"].end;
                    }
                }

                state.cashflow[event_year_month][ev.body.account].end = state.cashflow[event_year_month][ev.body.account].begin + state.cashflow[event_year_month][ev.body.account].in - state.cashflow[event_year_month][ev.body.account].out;
                state.cashflow[event_year_month]["Total"].end = state.cashflow[event_year_month]["Total"].begin + state.cashflow[event_year_month]["Total"].in - state.cashflow[event_year_month]["Total"].out;
            }
        },
        "ExpenseForecastAdded": function (state, ev) {
            var event_year = parseInt(ev.body.date.substring(0, 4));
            var event_month = parseInt(ev.body.date.substring(5, 7));
            var event_day = parseInt(ev.body.date.substring(8, 10));

            var event_date = new Date(event_year, event_month, event_day);

            var current_date = new Date();

            var event_year_month = ev.body.date.substring(0, 7);

            var s_prev_month = (event_month -1).toString();
            var previous_year_month = event_month == 1 ? (event_year - 1) + "-" + 12 : event_year + "-" + ("00".substring(0, 2 - s_prev_month.length) + s_prev_month);

            if (!state.cashflow[event_year_month]) {
                state.cashflow[event_year_month] = { "Total": { begin: 0.00, in: 0.00, out: 0.00, end: 0.00 } };
            }
            if (!state.cashflow[event_year_month][ev.body.account]) {
                state.cashflow[event_year_month][ev.body.account] = { begin: 0.00, in: 0.00, out: 0.00, end: 0.00 };
            }
            if (event_date >= current_date) {
                state.cashflow[event_year_month][ev.body.account].out += parseFloat(ev.body.amount);
                state.cashflow[event_year_month]["Total"].out += parseFloat(ev.body.amount);

                if (!state.cashflow[previous_year_month]) {
                    state.cashflow[event_year_month][ev.body.account].begin = 0.00;
                    state.cashflow[event_year_month]["Total"].begin = 0.00;
                } else {
                    if (!state.cashflow[previous_year_month][ev.body.account]) {
                        state.cashflow[event_year_month][ev.body.account].begin = 0.00;
                    } else {
                        state.cashflow[event_year_month][ev.body.account].begin = state.cashflow[previous_year_month][ev.body.account].end;
                    }
                    if (!state.cashflow[previous_year_month]["Total"]) {
                        state.cashflow[event_year_month]["Total"].begin = 0.00;
                    } else {
                        state.cashflow[event_year_month]["Total"].begin = state.cashflow[previous_year_month]["Total"].end;
                    }
                }

                state.cashflow[event_year_month][ev.body.account].end = state.cashflow[event_year_month][ev.body.account].begin + state.cashflow[event_year_month][ev.body.account].in - state.cashflow[event_year_month][ev.body.account].out;
                state.cashflow[event_year_month]["Total"].end = state.cashflow[event_year_month]["Total"].begin + state.cashflow[event_year_month]["Total"].in - state.cashflow[event_year_month]["Total"].out;
            }
        },
        "ExpenseActualAdded": function (state, ev) {
            var event_year = parseInt(ev.body.date.substring(0, 4));
            var event_month = parseInt(ev.body.date.substring(5, 7));
            var event_day = parseInt(ev.body.date.substring(8, 10));

            var event_date = new Date(event_year, event_month, event_day);

            var current_date = new Date();

            var event_year_month = ev.body.date.substring(0, 7);

            var s_prev_month = (event_month -1).toString();
            var previous_year_month = event_month == 1 ? (event_year - 1) + "-" + 12 : event_year + "-" + ("00".substring(0, 2 - s_prev_month.length) + s_prev_month);

            if (!state.cashflow[event_year_month]) {
                state.cashflow[event_year_month] = { "Total": { begin: 0.00, in: 0.00, out: 0.00, end: 0.00 } };
            }
            if (!state.cashflow[event_year_month][ev.body.account]) {
                state.cashflow[event_year_month][ev.body.account] = { begin: 0.00, in: 0.00, out: 0.00, end: 0.00 };
            }
            if (event_date < current_date) {
                state.cashflow[event_year_month][ev.body.account].out += parseFloat(ev.body.amount);
                state.cashflow[event_year_month]["Total"].out += parseFloat(ev.body.amount);

                if (!state.cashflow[previous_year_month]) {
                    state.cashflow[event_year_month][ev.body.account].begin = 0.00;
                    state.cashflow[event_year_month]["Total"].begin = 0.00;
                } else {
                    if (!state.cashflow[previous_year_month][ev.body.account]) {
                        state.cashflow[event_year_month][ev.body.account].begin = 0.00;
                    } else {
                        state.cashflow[event_year_month][ev.body.account].begin = state.cashflow[previous_year_month][ev.body.account].end;
                    }
                    if (!state.cashflow[previous_year_month]["Total"]) {
                        state.cashflow[event_year_month]["Total"].begin = 0.00;
                    } else {
                        state.cashflow[event_year_month]["Total"].begin = state.cashflow[previous_year_month]["Total"].end;
                    }
                }

                state.cashflow[event_year_month][ev.body.account].end = state.cashflow[event_year_month][ev.body.account].begin + state.cashflow[event_year_month][ev.body.account].in - state.cashflow[event_year_month][ev.body.account].out;
                state.cashflow[event_year_month]["Total"].end = state.cashflow[event_year_month]["Total"].begin + state.cashflow[event_year_month]["Total"].in - state.cashflow[event_year_month]["Total"].out;
            }
        }
    })