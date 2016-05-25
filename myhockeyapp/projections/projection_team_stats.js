fromCategory('game')
    .when({
        $init: function() {
            return {
                gp: 0, gf: 0, ga: 0, p: 0, pim: 0, w: 0, so: 0, l: 0, t: 0, 
                games: [], events:[], opponents: {}, rinks: {},  penalties: {}, 
                goal_by_period: {}, goal_by_kind: {}, penalty_by_period: {}, penalty_by_kind: {}, 
                pim_by_period: {}, pim_by_kind: {}, 
                gf1: 0, ga1: 0, p1: 0, pim1: 0, date1: "", time1: "", opponent1: "", homeaway1: "", kind1: "", rink1: "", wlt1: ""
            }
        },
        "GameScheduled": function(state, ev) {
            state.opponent1 = ev.body.opponent;
            state.homeaway1 = ev.body.homeaway;
            state.kind1 = ev.body.type;
            state.rink1 = ev.body.arena;

            state.gp++;

            state.gf1 = 0;
            state.ga1 = 0;
            state.p1 = 0;
            state.pim1 = 0;

            if (!state.opponents[ev.body.opponent])
            {
                state.opponents[ev.body.opponent] = {gp:0, gf: 0, ga: 0, w: 0, l:0, t:0, pim: 0};
            }
             state.opponents[ev.body.opponent].gp++;
            if (!state.rinks[ev.body.arena])
            {
                state.rinks[ev.body.arena] = {gp: 0, gf: 0, ga: 0, w: 0, l:0, t:0, pim: 0};
            } 
            state.rinks[ev.body.arena].gp++;
        },
        "GameStarted": function(state, ev) {
            state.date1 = ev.body.date;
            state.time1 = ev.body.time;
        },        
        "GoalScored": function(state, ev) {
            var pos = ev.body.time.indexOf(':');
            var min = ev.body.time.substring(0, pos);
            var sec = ev.body.time.substring(pos, ev.body.time.length);
            var at = ((ev.body.period -1) * 20 + parseInt(min)) + sec;
            state.events.push({
                    "date": state.date1,
                    "start": state.time1,
                    "opponent": state.opponent1,
                    "homeaway": state.homeaway1,
                    "kind": state.kind1,
                    "rink": state.rink1,
                    "period": ev.body.period,
                    "time": ev.body.time,
                    "at": at,
                    "type": "gf",
                    "gf": ev.body.score,
                    "a1": ev.body.assist1,
                    "a2": ev.body.assist2,
                    "goalkind": ev.body.kind
                });
                
            state.gf++;
            state.gf1++;
            state.opponents[state.opponent1].gf++;
            state.rinks[state.rink1].gf++;
            
            if (!state.goal_by_period[ev.body.period]) {
                state.goal_by_period[ev.body.period] = 0;
            }
            state.goal_by_period[ev.body.period] ++;
            
            if (!state.goal_by_kind[ev.body.kind]) {
                state.goal_by_kind[ev.body.kind] = 0;
            }
            state.goal_by_kind[ev.body.kind] ++;
        },
        "OpponentGoalScored": function(state, ev) {
            var pos = ev.body.time.indexOf(':');
            var min = ev.body.time.substring(0, pos);
            var sec = ev.body.time.substring(pos, ev.body.time.length);
            var at = ((ev.body.period -1) * 20 + parseInt(min)) + sec;
            state.events.push({
                    "date": state.date1,
                    "start": state.time1,
                    "opponent": state.opponent1,
                    "homeaway": state.homeaway1,
                    "kind": state.kind1,
                    "rink": state.rink1,
                    "period": ev.body.period,
                    "time": ev.body.time,
                    "at": at,
                    "type": "ga",
                    "ga": ev.body.score,
                    "a1": ev.body.assist1,
                    "a2": ev.body.assist2,
                    "goalkind": ev.body.kind
                });
            
            state.ga++;
            state.ga1++;
            state.opponents[state.opponent1].ga++;
            state.rinks[state.rink1].ga++;
        },
        "PenaltyTaken": function(state, ev) {
            var pos = ev.body.time.indexOf(':');
            var min = ev.body.time.substring(0, pos);
            var sec = ev.body.time.substring(pos, ev.body.time.length);
            var at = ((ev.body.period -1) * 20 + parseInt(min)) + sec;
            state.events.push({
                    "date": state.date1,
                    "start": state.time1,
                    "opponent": state.opponent1,
                    "homeaway": state.homeaway1,
                    "kind": state.kind1,
                    "rink": state.rink1,
                    "period": ev.body.period,
                    "time": ev.body.time,                    
                    "at": at,
                    "type": "p",
                    "penalty": ev.body.player,
                    "offense": ev.body.offense,
                    "min": ev.body.min,
                    "off": ev.body.off,
                    "on": ev.body.on
                });
            
            state.p++;
            state.pim += parseInt(ev.body.min);
            
            state.p1++;
            state.pim1 += parseInt(ev.body.min);
            
            state.opponents[state.opponent1].pim += parseInt(ev.body.min);
            state.rinks[state.rink1].pim += parseInt(ev.body.min);
            if (!state.penalties[ev.body.offense])
            {
                state.penalties[ev.body.offense] = 0;
            } 
            state.penalties[ev.body.offense] += parseInt(ev.body.min);
            
            if (!state.penalty_by_period[ev.body.period]) {
                state.penalty_by_period[ev.body.period] = 0;
            }
            state.penalty_by_period[ev.body.period] ++;
            
            if (!state.penalty_by_kind[ev.body.offense]) {
                state.penalty_by_kind[ev.body.offense] = 0;
            }
            state.penalty_by_kind[ev.body.offense] ++;
            
            if (!state.pim_by_period[ev.body.period]) {
                state.pim_by_period[ev.body.period] = 0;
            }
            state.pim_by_period[ev.body.period] += parseInt(ev.body.min);
            
            if (!state.pim_by_kind[ev.body.offense]) {
                state.pim_by_kind[ev.body.offense] = 0;
            }
            state.pim_by_kind[ev.body.offense] += parseInt(ev.body.min);
        },
        "GameEnded": function(state, ev) {
            if (state.gf1 > state.ga1)
            {
                if (state.ga1 === 0) {
                    state.so++;
                    state.wlt1 = 'so';
                } else {
                    state.wlt1 = 'w';
                }
                state.w++;
                state.opponents[state.opponent1].w++;
                state.rinks[state.rink1].w++;
            } 
            if (state.gf1 == state.ga1) {
                state.t++;
                state.wlt1 = 't';
                state.opponents[state.opponent1].t++;
                state.rinks[state.rink1].t++;
            }
            if (state.gf1 < state.ga1) {
                state.l++;
                state.wlt1 = 'l';
                state.opponents[state.opponent1].l++;
                state.rinks[state.rink1].l++;
            }
            
            state.games.push({
                    "date": state.date1, 
                    "time": state.time1, 
                    "opponent": state.opponent1, 
                    "homeaway": state.homeaway1, 
                    "kind": state.kind1, 
                    "rink": state.rink1, 
                    "gf": state.gf1, 
                    "ga": state.ga1, 
                    "p": state.p1, 
                    "pim": state.pim1, 
                    "wlt": state.wlt1
                });
            
            state.gf1 = 0;
            state.ga1 = 0;
            state.date1 = "";
            state.time1 = "";
            state.opponent1 = "";
            state.homeaway1 = "";
            state.kind1 = "";
            state.rink1 = "";
            state.p1 = 0;
            state.pim1 = 0;
            state.wlt1 = "";
        }
    }
)