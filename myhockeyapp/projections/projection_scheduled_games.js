fromCategory('game')
    .foreachStream()
    .when({
        "GameScheduled": function(state, ev) {
            linkTo('scheduled_games', ev);
        }
    }
)