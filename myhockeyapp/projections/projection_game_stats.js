fromCategory('game')
    .foreachStream()
    .when({
        $init: function() {
            return {date: "", time: "", opponent: "", homeaway: "", kind: "", rink: "",  gf: 0, ga: 0, p: 0, pim: 0};
        },
        "GameScheduled": function(state, ev) {
            state.date = ev.body.date;
            state.time = ev.body.time;
            state.opponent = ev.body.opponent;
            state.homeaway = ev.body.homeaway;
            state.kind = ev.body.type;
            state.rink = ev.body.arena;
        },
        "GameStarted": function(state, ev) {
            state.date = ev.body.date;
            state.time = ev.body.time;
        },           
        "GoalScored": function(state, ev) {
            state.gf++;
            linkTo(ev.body.score, ev);
            if (ev.body.assist1) {
                linkTo(ev.body.assist1, ev);
            }
            if (ev.body.assist2) {
                linkTo(ev.body.assist2, ev);
            }
            emit('goal_for_stats',  
                "GoalFor",
                {
                    "date": state.date,
                    "start": state.time,
                    "opponent": state.opponent,
                    "homeaway": state.homeaway,
                    "kind": state.kind,
                    "rink": state.rink,
                    "period": ev.body.period,
                    "time": ev.body.time,
                    "goal": ev.body.kind,
                    "score": ev.body.score,
                    "assist1": ev.body.assist1,
                    "assist2": ev.body.assist2,
                });
        },
        "OpponentGoalScored": function(state, ev) {
            state.ga++;
            emit('goal_against_stats',  
                "GoalAgainst",
                {
                    "date": state.date,
                    "start": state.time,
                    "opponent": state.opponent,
                    "homeaway": state.homeaway,
                    "kind": state.kind,
                    "rink": state.rink,
                    "period": ev.body.period,
                    "time": ev.body.time,
                    "goal": ev.body.kind,
                    "score": ev.body.score,
                    "assist1": ev.body.assist1,
                    "assist2": ev.body.assist2,
                });
        },
        "PenaltyTaken": function(state, ev) {
            state.p++; 
            state.pim += parseInt(ev.body.min);
            linkTo(ev.body.player, ev);
            emit('penalty_stats',  
                "Penalty",
                {
                    "date": state.date,
                    "start": state.time,
                    "opponent": state.opponent,
                    "homeaway": state.homeaway,
                    "kind": state.kind,
                    "rink": state.rink,
                    "period": ev.body.period,
                    "time": ev.body.time,
                    "offense": ev.body.offense,
                    "player": ev.body.player,
                    "min": ev.body.min,
                    "off": ev.body.off,
                    "on": ev.body.on,
                });
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
                    "date": state.date,
                    "time": state.time,
                    "opponent": state.opponent,
                    "homeaway": state.homeaway,
                    "kind": state.kind,
                    "rink": state.rink,
                    "gf": state.gf,
                    "ga": state.ga,
                    "p": state.p,
                    "pim": state.pim
                });
            state.date = "";
            state.time = "";
            state.opponent = "";
            state.homeaway = "";
            state.kind = "";
            state.rink = "";
        }
    }
)