fromCategory('game')
    .when({
        $init: function() {
            return {opponent: "", rink: "" };
        },
        "GameScheduled": function(state, ev) {
            state.opponent = ev.body.opponent;
            state.rink = ev.body.arena;
        },
        "GoalScored": function(state, ev) {
            if (!state[ev.body.score]) 
            {
                state[ev.body.score] = {g: 0, a: 0, pts: 0, ppg: 0, shg: 0, eng: 0, pim: 0, assist_from: {}, opponents: { }, rinks: {}, penalties: {}};
            }
            if (!state[ev.body.score].opponents[state.opponent])
            {
                state[ev.body.score].opponents[state.opponent] = {g: 0, a: 0, pts:0, ppg: 0, shg: 0, eng: 0, pim: 0};
            }
            if (!state[ev.body.score].rinks[state.rink])
            {
                state[ev.body.score].rinks[state.rink] = {g: 0, a: 0, pts:0, ppg: 0, shg: 0, eng: 0, pim: 0};
            }
            state[ev.body.score].g ++;
            state[ev.body.score].pts ++;
            state[ev.body.score].opponents[state.opponent].g ++;
            state[ev.body.score].rinks[state.rink].g ++;
            state[ev.body.score].opponents[state.opponent].pts ++;
            state[ev.body.score].rinks[state.rink].pts ++;
            if (ev.body.kind == 'pp')
            {
                state[ev.body.score].ppg ++;
                state[ev.body.score].opponents[state.opponent].ppg ++;
                state[ev.body.score].rinks[state.rink].ppg ++;
            }
            if (ev.body.kind == 'sh')
            {
                state[ev.body.score].shg ++;
                state[ev.body.score].opponents[state.opponent].shg ++;
                state[ev.body.score].rinks[state.rink].shg ++;
            }
            if (ev.body.kind == 'en')
            {
                state[ev.body.score].eng ++;
                state[ev.body.score].opponents[state.opponent].eng ++;
                state[ev.body.score].rinks[state.rink].eng ++;
            }
            if (ev.body.assist1) 
            {
                if (!state[ev.body.assist1]) 
                {
                    state[ev.body.assist1] = {g: 0, a: 0, pts: 0, ppg: 0, shg: 0, eng: 0, pim: 0, assist_from: {}, opponents: {}, rinks: {}, penalties: {}};
                }
                if (!state[ev.body.assist1].opponents[state.opponent])
                {
                    state[ev.body.assist1].opponents[state.opponent] = {g: 0, a: 0, pts:0, ppg: 0, shg: 0, eng: 0, pim: 0};
                }
                if (!state[ev.body.assist1].rinks[state.rink])
                {
                    state[ev.body.assist1].rinks[state.rink] = {g: 0, a: 0, pts:0, ppg: 0, shg: 0, eng: 0, pim: 0};
                }
                state[ev.body.assist1].a ++;
                state[ev.body.assist1].pts ++;
                state[ev.body.assist1].opponents[state.opponent].a++;
                state[ev.body.assist1].rinks[state.rink].a++;
                state[ev.body.assist1].opponents[state.opponent].pts++;
                state[ev.body.assist1].rinks[state.rink].pts++;
                if (!state[ev.body.score].assist_from[ev.body.assist1])
                {
                    state[ev.body.score].assist_from[ev.body.assist1] = 0;
                }
                state[ev.body.score].assist_from[ev.body.assist1] ++;
            }
            if (ev.body.assist2) 
            {
                if (!state[ev.body.assist2]) 
                {
                    state[ev.body.assist2] = {g: 0, a: 0, pts: 0, ppg: 0, shg: 0, eng: 0, pim: 0, assist_from: {}, opponents: {}, rinks: {}, penalties: {}};
                }
                 if (!state[ev.body.assist2].opponents[state.opponent])
                {
                    state[ev.body.assist2].opponents[state.opponent] = {g: 0, a: 0, pts:0, ppg: 0, shg: 0, eng: 0, pim: 0};
                }
                if (!state[ev.body.assist2].rinks[state.rink])
                {
                    state[ev.body.assist2].rinks[state.rink] = {g: 0, a: 0, pts:0, ppg: 0, shg: 0, eng: 0, pim: 0};
                }
                state[ev.body.assist2].a ++;
                state[ev.body.assist2].pts ++;
                state[ev.body.assist2].opponents[state.opponent].a++;
                state[ev.body.assist2].rinks[state.rink].a++;
                state[ev.body.assist2].opponents[state.opponent].pts++;
                state[ev.body.assist2].rinks[state.rink].pts++;
                if (!state[ev.body.score].assist_from[ev.body.assist2])
                {
                    state[ev.body.score].assist_from[ev.body.assist2] = 0;
                }
                state[ev.body.score].assist_from[ev.body.assist2] ++;
            }
        },
        "PenaltyTaken": function(state, ev) {
            if (!state[ev.body.player]) 
            {
                state[ev.body.player] = {g: 0, a: 0, pts: 0, ppg: 0, shg: 0, eng: 0, pim: 0, assist_from: {}, opponents: {}, rinks: {}, penalties: {}};
            }
            if (!state[ev.body.player].opponents[state.opponent])
            {
                state[ev.body.player].opponents[state.opponent] = {g: 0, a: 0, pts:0, ppg: 0, shg: 0, eng: 0, pim: 0};
            }
            if (!state[ev.body.player].rinks[state.rink])
            {
                state[ev.body.player].rinks[state.rink] = {g: 0, a: 0, pts:0, ppg: 0, shg: 0, eng: 0, pim: 0};
            }
            state[ev.body.player].pim += parseInt(ev.body.min);
            state[ev.body.player].opponents[state.opponent].pim += parseInt(ev.body.min);
            state[ev.body.player].rinks[state.rink].pim += parseInt(ev.body.min);
            if (!state[ev.body.player].penalties[ev.body.offense]) 
            {
                state[ev.body.player].penalties[ev.body.offense] = 0;
            }
            state[ev.body.player].penalties[ev.body.offense] += parseInt(ev.body.min);
        },
        "GameEnded": function(state, ev) {
            state.opponent = "";
            state.rink = "";
        }
    }
)