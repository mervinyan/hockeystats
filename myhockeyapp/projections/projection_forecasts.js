fromCategory('account')
    .foreachStream()
    .when({
        "IncomeForecastAdded": function(state, ev) {
            linkTo('forecasted_income_transactions', ev);
        },
        "ExpenseForecastAdded": function(state, ev) {
            linkTo('forecasted_expense_transactions', ev);
        }
    }
)