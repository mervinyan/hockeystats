fromCategory('account')
    .foreachStream()
    .when({
        "IncomeForecastAdded": function(state, ev) {
            linkTo('forecasted_transactions', ev);
        }
    }
)