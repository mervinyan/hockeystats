fromCategory('account')
    .when({
        $init: function () {
            return {
                accounts: {}
            };
        },
        "AccountCreated": function (state, ev) {
            if (!state.accounts[ev.body.name]) {
                
                state.accounts[ev.body.name] = {
                                                    "name": ev.body.name,
                                                    "status": ev.body.status,
                                                    "type": ev.body.type,
                                                    "yield": ev.body.yield,
                                                    "monthly_fee": ev.body.monthly_fee,
                                                    "min_balance": ev.body.min_balance,
                                                    "free_bill_pay": ev.body.free_bill_pay,
                                                    "free_atm_use": ev.body.free_atm_use,
                                                    "std_apr": ev.body.std_apr,
                                                    "annual_fee": ev.body.annual_fee,
                                                    "brand": ev.body.brand,
                                                    "reward": ev.body.reward,
                                                    "reward_rate": ev.body.reward_rate,
                                                    "interest_rate": ev.body.interest_rate,
                                                    "term": ev.body.term,
                                                    "loan_amount": ev.body.loan_amount,
                                                    "origination_date": ev.body.origination_date,
                                                    "mortgage_type": ev.body.mortgage_type,                                                    
                                                };
            }
        },
        "AccountClosed": function (state, ev) {
            state.accounts[ev.body.name].status = ev.body.status;
        },
        "AccountUpdated": function (state, ev) {
            state.accounts[ev.body.name].yield = ev.body.yield;
            state.accounts[ev.body.name].monthly_fee = ev.body.monthly_fee;
            state.accounts[ev.body.name].min_balance = ev.body.min_balance;
            state.accounts[ev.body.name].free_bill_pay = ev.body.free_bill_pay;
            state.accounts[ev.body.name].free_atm_use = ev.body.free_atm_use;
            state.accounts[ev.body.name].std_apr = ev.body.std_apr;
            state.accounts[ev.body.name].annual_fee = ev.body.annual_fee;
            state.accounts[ev.body.name].brand = ev.body.brand;
            state.accounts[ev.body.name].reward = ev.body.reward;
            state.accounts[ev.body.name].reward_rate = ev.body.reward_rate;
            state.accounts[ev.body.name].interest_rate = ev.body.interest_rate;
            state.accounts[ev.body.name].term = ev.body.term;
            state.accounts[ev.body.name].loan_amount = ev.body.loan_amount;
            state.accounts[ev.body.name].origination_date = ev.body.origination_date;
            state.accounts[ev.body.name].mortgage_type = ev.body.mortgage_type;
        },

    })