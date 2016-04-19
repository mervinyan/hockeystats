fromCategory('game')
    .foreachStream()
    .when({
        $init: function() {
            return {number: "", date: "", time: "", opponent: "", homeaway: "", kind: "", rink: "",  gf: 0, ga: 0, pim: 0};
        },
        "GameStarted": function(state, ev) {
            state.number = ev.body.number;
            state.date = ev.body.date;
            state.time = ev.body.time;
            state.opponent = ev.body.opponent;
            state.homeaway = ev.body.homeaway;
            state.kind = ev.body.type;
            state.rink = ev.body.arena;
        },
        "GoalScored": function(state, ev) {
            state.gf++;
            linkTo(ev.body.score, ev);
            if (ev.body.assist1) 
            {
                linkTo(ev.body.assist1, ev);
            }
            if (ev.body.assist2) 
            {
                linkTo(ev.body.assist2, ev);
            }
        },
        "OpponentGoalScored": function(state, ev) {
            state.ga++;
        },
        "PenaltyTaken": function(state, ev) {
            state.pim += parseInt(ev.body.min);
            linkTo(ev.body.player, ev);
        },
        "GameEnded": function(state, ev) {
            var eventType = "";
            if (state.gf > state.ga) 
            {
                eventType = 'Win';
            } else if (state.gf < state.ga)
            {
                eventType = 'Loss';
            } else
            {
                eventType = 'Tie';
            }
            emit('gamestats',  
                eventType,
                {
                    'number': state.number,
                    "date": state.date,
                    "time": state.time,
                    "opponent": state.opponent,
                    "homeaway": state.homeaway,
                    "kind": state.kind,
                    "rink": state.rink,
                    "gf": state.gf,
                    "ga": state.ga,
                    "pim": state.pim
                });
            state.number = "";
            state.date = "";
            state.time = "";
            state.opponent = "";
            state.homeaway = "";
            state.kind = "";
            state.rink = "";
        }
    }
)