var express = require('express');
var router = express.Router();

var http = require('http');

router.get('/', function (req, res, next) {
  var dashboard = { w: 0, l: 0, t: 0, o: 0, gf: 0, ppg: 0, shg: 0, eng: 0, ga: 0, so: 0, p: 0, pim: 0, goal_leaders: [], ppg_leaders: [], shg_leaders: [], eng_leaders: [], assist_leaders: [], point_leaders: [], pim_leaders: []};

  var options1 = {
    host: 'localhost',
    port: 2113,
    path: '/projection/projection_dashboard/result',
    method: 'GET'
  }

  http.request(options1, function (res1) {
    res1.setEncoding('utf8');
    var body = "";
    res1.on('data', function (chunk) {
      body += chunk;
    });
    res1.on('end', function () {
      var data = JSON.parse(body);
      
      dashboard.gp = data.gp;
      dashboard.gf = data.gf;
      dashboard.ga = data.ga;
      dashboard.pim = data.pim;
      dashboard.w = data.w;
      dashboard.l = data.l;
      dashboard.t = data.t;
      dashboard.so = data.so;
      dashboard.p = data.p;

      var players_stats = [];
      for (var player in data.players) {
        players_stats.push([player, data.players[player].g, data.players[player].ppg, data.players[player].shg, data.players[player].eng, data.players[player].a, data.players[player].pts, data.players[player].pim]);
      }

      sort_and_push_first_five_elements(players_stats, 1, dashboard.goal_leaders);
      sort_and_push_first_five_elements(players_stats, 2, dashboard.ppg_leaders);
      sort_and_push_first_five_elements(players_stats, 3, dashboard.shg_leaders);
      sort_and_push_first_five_elements(players_stats, 4, dashboard.eng_leaders);
      sort_and_push_first_five_elements(players_stats, 5, dashboard.assist_leaders);
      sort_and_push_first_five_elements(players_stats, 6, dashboard.point_leaders);
      sort_and_push_first_five_elements(players_stats, 7, dashboard.pim_leaders);
      
      res.render('index.pug', { title: 'Dashboard', 'dashboard': dashboard });
    });
  }).end();
});

function sort_and_push_first_five_elements(source, index, target) {
  source.sort(function (a, b) {
    return b[index] - a[index];
  });
  for (var i = 0; i < source.length; i++) {
    if (i < 5) {
      if (source[i][index] > 0) {
        target.push(source[i]);
      }
    }
  }
}

module.exports = router;
