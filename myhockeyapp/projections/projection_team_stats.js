fromCategory('game')
    .when({
        $init: function() {
            return {gp: 0, gf: 0, ga: 0, pim: 0, w: 0, l: 0, t: 0, gf1: 0, ga1: 0, opponents: {}, rinks: {}, opponent: "", rink: "", penalties: {}}
        },
        "GameStarted": function(state, ev) {
            state.gp++
            state.gf1 = 0
            state.ga1 = 0
            state.opponent = ev.body.opponent;
            state.rink = ev.body.arena
            if (!state.opponents[ev.body.opponent])
            {
                state.opponents[ev.body.opponent] = {gp:0, gf: 0, ga: 0, w: 0, l:0, t:0, pim: 0}
            }
             state.opponents[ev.body.opponent].gp++
            if (!state.rinks[ev.body.arena])
            {
                state.rinks[ev.body.arena] = {gp: 0, gf: 0, ga: 0, w: 0, l:0, t:0, pim: 0}
            } 
            state.rinks[ev.body.arena].gp++
        },
        "GoalScored": function(state, ev) {
            state.gf++
            state.gf1++
            state.opponents[state.opponent].gf++
            state.rinks[state.rink].gf++
        },
        "OpponentGoalScored": function(state, ev) {
            state.ga++
            state.ga1++
            state.opponents[state.opponent].ga++
            state.rinks[state.rink].ga++
        },
        "PenaltyTaken": function(state, ev) {
            state.pim += parseInt(ev.body.min)
            state.opponents[state.opponent].pim += parseInt(ev.body.min)
            state.rinks[state.rink].pim += parseInt(ev.body.min)
            if (!state.penalties[ev.body.offense])
            {
                state.penalties[ev.body.offense] = 0
            } 
            state.penalties[ev.body.offense] += parseInt(ev.body.min)
        },
        "GameEnded": function(state, ev) {
            if (state.gf1 > state.ga1)
            {
                state.w++
                state.opponents[state.opponent].w++
                state.rinks[state.rink].w++
            } 
            if (state.gf1 == state.ga1) {
                state.t++
                state.opponents[state.opponent].t++
                state.rinks[state.rink].t++
            }
            if (state.gf1 < state.ga1) {
                state.l++
                state.opponents[state.opponent].l++
                state.rinks[state.rink].l++
            }
            state.gf1 = 0
            state.ga1 = 0
            state.opponent = ""
            state.rink = ""
        }
    }
)