fromStream('transactionstream-6ee1da56-7648-40d6-95bb-fd16eeb40503')
    .when({
        $init: function () {
            return {
                balances: {}
            }
        },
        "TransactionOccurred": function (state, ev) {
            if (!state.balances[ev.body["Account Name"]]) {
                state.balances[ev.body["Account Name"]] = 0.00;
            }
            if (ev.body["Transaction Type"] == "credit") {
                state.balances[ev.body["Account Name"]] += parseFloat(ev.body.Amount);
            }
            if (ev.body["Transaction Type"] == "debit") {
                state.balances[ev.body["Account Name"]] -= parseFloat(ev.body.Amount);
            }
        }
    });
