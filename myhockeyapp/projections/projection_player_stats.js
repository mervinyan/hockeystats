fromCategory('game')
    .when({
        $init: function () {
            return { game: "", data: "", time: "", opponent: "", rink: "" };
        },
        "GameScheduled": function (state, ev) {
            state.opponent = ev.body.opponent;
            state.rink = ev.body.arena;
        },
        "GameStarted": function (state, ev) {
            state.date = ev.body.date;
            state.time = ev.body.time;
            state.game = state.date + " " + state.time;
        },
        "GoalScored": function (state, ev) {
            var pos = ev.body.time.indexOf(':');
            var min = ev.body.time.substring(0, pos);
            var sec = ev.body.time.substring(pos, ev.body.time.length);
            var at = ((ev.body.period - 1) * 20 + parseInt(min)) + sec;

            if (!state[ev.body.score]) {
                state[ev.body.score] = {
                    g: 0, a: 0, pts: 0, ppg: 0, shg: 0, eng: 0, p: 0, pim: 0,
                    games: {}, assist_from: {}, assist_to: {}, events: [],
                    point_by_period: {}, goal_by_period: {}, assist_by_period: {}, penalty_by_period: {}, pim_by_period: {},
                    goal_by_kind: {}, penalty_by_kind: {}, pim_by_kind: {}, opponents: {}, rinks: {}
                };
            }
            state[ev.body.score].g++;
            state[ev.body.score].pts++;

            if (!state[ev.body.score].games[state.game]) {
                state[ev.body.score].games[state.game] = { date: state.date, time: state.time, g: 0, a: 0, pts: 0, ppg: 0, shg: 0, eng: 0, pim: 0 };
            }
            state[ev.body.score].games[state.game].g++;
            state[ev.body.score].games[state.game].pts++;
            
            if (!state[ev.body.score].opponents[state.opponent]) {
                state[ev.body.score].opponents[state.opponent] = { g: 0, a: 0, pts: 0, ppg: 0, shg: 0, eng: 0, pim: 0 };
            }
            state[ev.body.score].opponents[state.opponent].g++;
            state[ev.body.score].opponents[state.opponent].pts++;
            
            if (!state[ev.body.score].rinks[state.rink]) {
                state[ev.body.score].rinks[state.rink] = { g: 0, a: 0, pts: 0, ppg: 0, shg: 0, eng: 0, pim: 0 };
            }
            state[ev.body.score].rinks[state.rink].g++;
            state[ev.body.score].rinks[state.rink].pts++;
            

            if (!state[ev.body.score].point_by_period[ev.body.period]) {
                state[ev.body.score].point_by_period[ev.body.period] = 0;
            }
            state[ev.body.score].point_by_period[ev.body.period]++;

            if (!state[ev.body.score].goal_by_period[ev.body.period]) {
                state[ev.body.score].goal_by_period[ev.body.period] = 0;
            }
            state[ev.body.score].goal_by_period[ev.body.period]++;

            if (!state[ev.body.score].goal_by_kind[ev.body.kind]) {
                state[ev.body.score].goal_by_kind[ev.body.kind] = 0;
            }
            state[ev.body.score].goal_by_kind[ev.body.kind]++;

            if (ev.body.kind == 'pp') {
                state[ev.body.score].ppg++;
                state[ev.body.score].games[state.game].ppg++;
                state[ev.body.score].opponents[state.opponent].ppg++;
                state[ev.body.score].rinks[state.rink].ppg++;
            }
            if (ev.body.kind == 'sh') {
                state[ev.body.score].shg++;
                state[ev.body.score].games[state.game].shg++;
                state[ev.body.score].opponents[state.opponent].shg++;
                state[ev.body.score].rinks[state.rink].shg++;
            }
            if (ev.body.kind == 'en') {
                state[ev.body.score].eng++;
                state[ev.body.score].games[state.game].eng++;
                state[ev.body.score].opponents[state.opponent].eng++;
                state[ev.body.score].rinks[state.rink].eng++;
            }

            if (ev.body.assist1) {
                if (ev.body.assist2) {
                    state[ev.body.score].events.push({ 'time': at, 'g': ev.body.assist1 + ", " + ev.body.assist2 });
                } else {
                    state[ev.body.score].events.push({ 'time': at, 'g': ev.body.assist1 });
                }
            } else {
                state[ev.body.score].events.push({ 'time': at, 'g': "" });
            }

            if (ev.body.assist1) {
                if (!state[ev.body.assist1]) {
                    state[ev.body.assist1] = {
                        g: 0, a: 0, pts: 0, ppg: 0, shg: 0, eng: 0, p: 0, pim: 0,
                        games: {}, assist_from: {}, assist_to: {}, events: [],
                        point_by_period: {}, goal_by_period: {}, assist_by_period: {}, penalty_by_period: {}, pim_by_period: {},
                        goal_by_kind: {}, penalty_by_kind: {}, pim_by_kind: {}, opponents: {}, rinks: {}
                    };
                }
                state[ev.body.assist1].a++;
                state[ev.body.assist1].pts++;

                if (!state[ev.body.assist1].games[state.game]) {
                    state[ev.body.assist1].games[state.game] = { date: state.date, time: state.time, g: 0, a: 0, pts: 0, ppg: 0, shg: 0, eng: 0, pim: 0 };
                }
                state[ev.body.assist1].games[state.game].a++;
                state[ev.body.assist1].games[state.game].pts++;

                if (!state[ev.body.assist1].opponents[state.opponent]) {
                    state[ev.body.assist1].opponents[state.opponent] = { g: 0, a: 0, pts: 0, ppg: 0, shg: 0, eng: 0, pim: 0 };
                }
                state[ev.body.assist1].opponents[state.opponent].a++;
                state[ev.body.assist1].opponents[state.opponent].pts++;

                if (!state[ev.body.assist1].rinks[state.rink]) {
                    state[ev.body.assist1].rinks[state.rink] = { g: 0, a: 0, pts: 0, ppg: 0, shg: 0, eng: 0, pim: 0 };
                }
                state[ev.body.assist1].rinks[state.rink].a++;
                state[ev.body.assist1].rinks[state.rink].pts++;

                if (!state[ev.body.score].assist_from[ev.body.assist1]) {
                    state[ev.body.score].assist_from[ev.body.assist1] = 0;
                }
                state[ev.body.score].assist_from[ev.body.assist1]++;

                if (!state[ev.body.assist1].assist_to[ev.body.score]) {
                    state[ev.body.assist1].assist_to[ev.body.score] = 0;
                }
                state[ev.body.assist1].assist_to[ev.body.score]++;

                if (!state[ev.body.assist1].assist_by_period[ev.body.period]) {
                    state[ev.body.assist1].assist_by_period[ev.body.period] = 0;
                }
                state[ev.body.assist1].assist_by_period[ev.body.period]++;

                if (!state[ev.body.assist1].point_by_period[ev.body.period]) {
                    state[ev.body.assist1].point_by_period[ev.body.period] = 0;
                }
                state[ev.body.assist1].point_by_period[ev.body.period]++;

                state[ev.body.assist1].events.push({ 'time': at, 'a': ev.body.score });
            }
            if (ev.body.assist2) {
                if (!state[ev.body.assist2]) {
                    state[ev.body.assist2] = {
                        g: 0, a: 0, pts: 0, ppg: 0, shg: 0, eng: 0, p: 0, pim: 0,
                        games: {}, assist_from: {}, assist_to: {}, events: [],
                        point_by_period: {}, goal_by_period: {}, assist_by_period: {}, penalty_by_period: {}, pim_by_period: {},
                        goal_by_kind: {}, penalty_by_kind: {}, pim_by_kind: {}, opponents: {}, rinks: {}
                    };
                }
                state[ev.body.assist2].a++;
                state[ev.body.assist2].pts++;

                if (!state[ev.body.assist2].games[state.game]) {
                    state[ev.body.assist2].games[state.game] = { date: state.date, time: state.time, g: 0, a: 0, pts: 0, ppg: 0, shg: 0, eng: 0, pim: 0 };
                }
                state[ev.body.assist2].games[state.game].a++;
                state[ev.body.assist2].games[state.game].pts++;

                if (!state[ev.body.assist2].opponents[state.opponent]) {
                    state[ev.body.assist2].opponents[state.opponent] = { g: 0, a: 0, pts: 0, ppg: 0, shg: 0, eng: 0, pim: 0 };
                }
                state[ev.body.assist2].opponents[state.opponent].a++;
                state[ev.body.assist2].opponents[state.opponent].pts++;

                if (!state[ev.body.assist2].rinks[state.rink]) {
                    state[ev.body.assist2].rinks[state.rink] = { g: 0, a: 0, pts: 0, ppg: 0, shg: 0, eng: 0, pim: 0 };
                }
                state[ev.body.assist2].rinks[state.rink].a++;
                state[ev.body.assist2].rinks[state.rink].pts++;

                if (!state[ev.body.score].assist_from[ev.body.assist2]) {
                    state[ev.body.score].assist_from[ev.body.assist2] = 0;
                }
                state[ev.body.score].assist_from[ev.body.assist2]++;

                if (!state[ev.body.assist2].assist_to[ev.body.score]) {
                    state[ev.body.assist2].assist_to[ev.body.score] = 0;
                }
                state[ev.body.assist2].assist_to[ev.body.score]++;

                if (!state[ev.body.assist2].assist_by_period[ev.body.period]) {
                    state[ev.body.assist2].assist_by_period[ev.body.period] = 0;
                }
                state[ev.body.assist2].assist_by_period[ev.body.period]++;

                if (!state[ev.body.assist2].point_by_period[ev.body.period]) {
                    state[ev.body.assist2].point_by_period[ev.body.period] = 0;
                }
                state[ev.body.assist2].point_by_period[ev.body.period]++;

                state[ev.body.assist2].events.push({ 'time': at, 'a': ev.body.score });
            }
        },
        "PenaltyTaken": function (state, ev) {
            var pos = ev.body.time.indexOf(':');
            var min = ev.body.time.substring(0, pos);
            var sec = ev.body.time.substring(pos, ev.body.time.length);
            var at = ((ev.body.period - 1) * 20 + parseInt(min)) + sec;
            
            if (!state[ev.body.player]) {
                state[ev.body.player] = {
                    g: 0, a: 0, pts: 0, ppg: 0, shg: 0, eng: 0, p: 0, pim: 0,
                    games: {}, assist_from: {}, assist_to: {}, events: [],
                    point_by_period: {}, goal_by_period: {}, assist_by_period: {}, penalty_by_period: {}, pim_by_period: {},
                    goal_by_kind: {}, penalty_by_kind: {}, pim_by_kind: {}, opponents: {}, rinks: {}
                };
            }
            state[ev.body.player].p++;
            state[ev.body.player].pim += parseInt(ev.body.min);

            if (!state[ev.body.player].games[state.game]) {
                state[ev.body.player].games[state.game] = { date: state.date, time: state.time, g: 0, a: 0, pts: 0, ppg: 0, shg: 0, eng: 0, pim: 0 };
            }
            state[ev.body.player].games[state.game].pim += parseInt(ev.body.min);

            if (!state[ev.body.player].opponents[state.opponent]) {
                state[ev.body.player].opponents[state.opponent] = { g: 0, a: 0, pts: 0, ppg: 0, shg: 0, eng: 0, pim: 0 };
            }
            state[ev.body.player].opponents[state.opponent].pim += parseInt(ev.body.min);

            if (!state[ev.body.player].rinks[state.rink]) {
                state[ev.body.player].rinks[state.rink] = { g: 0, a: 0, pts: 0, ppg: 0, shg: 0, eng: 0, pim: 0 };
            }
            state[ev.body.player].rinks[state.rink].pim += parseInt(ev.body.min);

            if (!state[ev.body.player].penalty_by_kind[ev.body.offense]) {
                state[ev.body.player].penalty_by_kind[ev.body.offense] = 0;
            }
            state[ev.body.player].penalty_by_kind[ev.body.offense]++;

            if (!state[ev.body.player].pim_by_kind[ev.body.offense]) {
                state[ev.body.player].pim_by_kind[ev.body.offense] = 0;
            }
            state[ev.body.player].pim_by_kind[ev.body.offense] += parseInt(ev.body.min);

            if (!state[ev.body.player].penalty_by_period[ev.body.period]) {
                state[ev.body.player].penalty_by_period[ev.body.period] = 0;
            }
            state[ev.body.player].penalty_by_period[ev.body.period]++;

            if (!state[ev.body.player].pim_by_period[ev.body.period]) {
                state[ev.body.player].pim_by_period[ev.body.period] = 0;
            }
            state[ev.body.player].pim_by_period[ev.body.period]++;

            state[ev.body.player].events.push({ 'time': at, 'penalty': ev.body.player });

        },
        "GameEnded": function (state, ev) {
            state.game = "";
            state.date = "";
            state.time = "";
            state.opponent = "";
            state.rink = "";
        }
    }
    )