fromCategory('game')
    .foreachStream()
    .when({
        $init: function() {
            return {date: "", time: "", opponent: "", homeaway: "", kind: "", rink: "", players: {}};
        },
        "GameScheduled": function(state, ev) {
            state.date = ev.body.date;
            state.time = ev.body.time;
            state.opponent = ev.body.opponent;
            state.homeaway = ev.body.homeaway;
            state.kind = ev.body.kind;
            state.rink = ev.body.arena;
        },
        "GoalScored": function(state, ev) {
            if (!state.players[ev.body.score]) 
            {
                state.players[ev.body.score] = {g: 0, a: 0, pts: 0, ppg: 0, shg: 0, eng: 0, pim: 0};
            }
            state.players[ev.body.score].g ++;
            state.players[ev.body.score].pts ++;
            
            if (ev.body.kind == 'pp')
            {
                state.players[ev.body.score].ppg ++;
            }
            if (ev.body.kind == 'sh')
            {
                state.players[ev.body.score].shg ++;
            }
            if (ev.body.kind == 'en')
            {
                state.players[ev.body.score].eng ++;
            }
            if (ev.body.assist1) 
            {
                if (!state.players[ev.body.assist1]) 
                {
                     state.players[ev.body.assist1] = {g: 0, a: 0, pts: 0, ppg: 0, shg: 0, eng: 0, pim: 0};
                }
                state.players[ev.body.assist1].a ++;
                state.players[ev.body.assist1].pts ++;
            }
            if (ev.body.assist2) 
            {
                if (!state.players[ev.body.assist2]) 
                {
                     state.players[ev.body.assist2] = {g: 0, a: 0, pts: 0, ppg: 0, shg: 0, eng: 0, pim: 0};
                }
                state.players[ev.body.assist2].a ++;
                state.players[ev.body.assist2].pts ++;
            }
        },
        "PenaltyTaken": function(state, ev) {
            if (!state.players[ev.body.player]) 
            {
                state.players[ev.body.player] = {g: 0, a: 0, pts: 0, ppg: 0, shg: 0, eng: 0, pim: 0};
            }
            state.players[ev.body.player].pim += parseInt(ev.body.min);
        },
        "GameEnded": function(state, ev) {
            for (var property in state.players) 
            {
                if (state.players.hasOwnProperty(property)) 
                {
                    var item = state.players[property];
                    emit('player_' + property + '_gamestats',  
                    "PlayerGameStats",
                    {
                        "date": state.date,
                        "time": state.time,
                        "opponent": state.opponent,
                        "homeaway": state.homeaway,
                        "kind": state.kind,
                        "rink": state.rink,
                        "g": item.g,
                        "ppg": item.ppg,
                        "shg": item.shg,
                        "eng": item.eng,                    
                        "a": item.a,
                        "pts": item.pts,                    
                        "pim": item.pim
                    });
                    emit('player_gamestats',  
                    "PlayerGameStats",
                    {
                        "date": state.date,
                        "time": state.time,
                        "opponent": state.opponent,
                        "homeaway": state.homeaway,
                        "kind": state.kind,
                        "rink": state.rink,
                        'playernumber': property,
                        "g": item.g,
                        "ppg": item.ppg,
                        "shg": item.shg,
                        "eng": item.eng,                    
                        "a": item.a,
                        "pts": item.pts,                    
                        "pim": item.pim
                    });
                }
            }
            state.date = "";
            state.time = "";
            state.opponent = "";
            state.homeaway = "";
            state.kind = "";
            state.rink = "";
        }
    }
)