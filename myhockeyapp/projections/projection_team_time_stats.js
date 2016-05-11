fromCategory('game')
    .when({
        $init: function() {
            return {gameday: "", gamestartat: "", opponent: "", homeaway: "", kind: "", rink: ""};
        },
        "GameScheduled": function(state, ev) {
            state.gameday = ev.body.date;
            state.gamestartat = ev.body.time;
            state.opponent = ev.body.opponent;
            state.homeaway = ev.body.homeaway;
            state.kind = ev.body.type;
            state.rink = ev.body.arena;
        },
        "GoalScored": function(state, ev) {
            var pos = ev.body.time.indexOf(':');
            var min = ev.body.time.substring(0, pos);
            var sec = ev.body.time.substring(pos, ev.body.time.length);
            var at = ((ev.body.period -1) * 20 + parseInt(min)) + sec;
            
            emit('team_time_stats',  
                ev.eventType,
                {
                    "gameday": state.gameday,
                    "gamestartat": state.gamestartat,
                    "opponent": state.opponent,
                    "homeaway": state.homeaway,
                    "kind": state.kind,
                    "rink": state.rink,
                    "time": at,
                    "gf": ev.body.score,
                    "goalkind": ev.body.kind
                })
        },
        "OpponentGoalScored": function(state, ev) {
            var pos = ev.body.time.indexOf(':');
            var min = ev.body.time.substring(0, pos);
            var sec = ev.body.time.substring(pos, ev.body.time.length);
            var at = ((ev.body.period -1) * 20 + parseInt(min)) + sec;
            
            emit('team_time_stats',  
                ev.eventType,
                {
                    "gameday": state.gameday,
                    "gamestartat": state.gamestartat,
                    "opponent": state.opponent,
                    "homeaway": state.homeaway,
                    "kind": state.kind,
                    "rink": state.rink,
                    "time": at,
                    "ga": ev.body.score,
                    "goalkind": ev.body.kind
                });
        },
        "PenaltyTaken": function(state, ev) {
            var pos = ev.body.time.indexOf(':');
            var min = ev.body.time.substring(0, pos);
            var sec = ev.body.time.substring(pos, ev.body.time.length);
            var at = ((ev.body.period -1) * 20 + parseInt(min)) + sec;
            
            emit('team_time_stats',  
                ev.eventType,
                {
                    "gameday": state.gameday,
                    "gamestartat": state.gamestartat,
                    "opponent": state.opponent,
                    "homeaway": state.homeaway,
                    "kind": state.kind,
                    "rink": state.rink,
                    "time": at,
                    "penalty": ev.body.player,
                    "offense": ev.body.offense,
                    "min": ev.body.min
                });
        },
        "GameEnded": function(state, ev) {
            state.gameday = "";
            state.gamestartat = "";
            state.opponent = "";
            state.homeaway = "";
            state.kind = "";
            state.rink = "";
        }
    }
)