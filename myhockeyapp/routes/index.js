var express = require('express');
var router = express.Router();

var ges = require('ges-client');
var util = require('./util.js');    

router.get('/', function(req, res, next) {
    var dashboard = {w: 0, l: 0, t: 0, o: 0, gf: 0, ppg:0, shg: 0, eng:0, ga: 0, so: 0, p: 0, pim: 0, goal_leaders: [], ppg_leaders: [], shg_leaders: [], eng_leaders: [], assist_leaders: [], point_leaders: [], pim_leaders: []};
    var players = {};
    var connection = ges({host:'127.0.0.1'});
    connection.on('connect', function() {
        console.log('connecting to geteventstore...');
        connection.readStreamEventsForward('gamestats', {start: 0, count: 1000}, function(err, readResult) {
            if (err) return console.log('Ooops!', err);
            for (var i = 0; i < readResult.Events.length; i++) {
                var eventDataStr = util.bin2String(readResult.Events[i].Event.Data.toJSON().data);
                var eventDataJson = JSON.parse(eventDataStr);
                dashboard.gf += eventDataJson.gf;
                dashboard.ga += eventDataJson.ga;
                dashboard.p += eventDataJson.p;
                dashboard.pim += eventDataJson.pim;
                if (eventDataJson.gf > eventDataJson.ga) {
                  dashboard.w++;
                  if (eventDataJson.ga == 0) {
                    dashboard.so++;
                  }
                } else if (eventDataJson.gf < eventDataJson.ga) {
                  dashboard.l++;
                } else {
                  dashboard.t++;
                }               
            }
            
            connection.readStreamEventsForward('player_gamestats', { start: 0, count: 4000, resolveLinkTos: true }, function (err, readResult) {
              if (err) return console.log('Ooops!', err)
              // console.log(readResult.Events);
              for (var i = 0; i < readResult.Events.length; i++) {
                var event = readResult.Events[i].Event;
                // var eventData = JSON.parse(bin2String(event.Data.toJSON().data));
                var eventDataStr = util.bin2String(readResult.Events[i].Event.Data.toJSON().data)
                // console.log(eventDataStr);
                var eventData = JSON.parse(eventDataStr);
                var player_number = eventData.playernumber;
                if (event.EventType == 'PlayerGameStats') {
                  if (!players[player_number]) {
                    players[player_number] = { g: 0, a: 0, pts: 0, ppg: 0, shg: 0, eng: 0, pim: 0 };
                  }
                  players[player_number].g = players[player_number].g + eventData.g;
                  players[player_number].ppg = players[player_number].ppg + eventData.ppg;
                  players[player_number].shg = players[player_number].shg + eventData.shg;
                  players[player_number].eng = players[player_number].eng + eventData.eng;
                  players[player_number].a = players[player_number].a + eventData.a;
                  players[player_number].pts = players[player_number].pts + eventData.pts;
                  players[player_number].pim = players[player_number].pim + eventData.pim;
                }
              }
              var players_stats = [];
              for (var player in players) {
                players_stats.push([player, players[player].g, players[player].ppg, players[player].shg, players[player].eng, players[player].a, players[player].pts, players[player].pim]);
              }

              players_stats.sort(function (a, b) {
                return b[1] - a[1];
              });
              for (var i=0; i < players_stats.length; i++) {
                if (i < 5) {
                  if (players_stats[i][1] > 0) {
                    dashboard.goal_leaders.push(players_stats[i]);
                  }                  
                }
              }
              
              players_stats.sort(function (a, b) {
                return b[2] - a[2];
              });
              for (var i=0; i < players_stats.length; i++) {
                if (i < 5) {
                  if (players_stats[i][2] > 0) {
                    dashboard.ppg_leaders.push(players_stats[i]);                  
                  }
                }
              }
              
              players_stats.sort(function (a, b) {
                return b[3] - a[3];
              });
              for (var i=0; i < players_stats.length; i++) {
                if (i < 5) {
                  if (players_stats[i][3] > 0) {
                    dashboard.shg_leaders.push(players_stats[i]);                  
                  }
                }
              }
              
              players_stats.sort(function (a, b) {
                return b[4] - a[4];
              });
              for (var i=0; i < players_stats.length; i++) {
                if (i < 5) {
                  if (players_stats[i][4] > 0) {
                    dashboard.eng_leaders.push(players_stats[i]);             
                  }
                }
              }
                                                        
              players_stats.sort(function (a, b) {
                return b[5] - a[5];
              });
              for (var i=0; i < players_stats.length; i++) {
                if (i < 5) {
                  if (players_stats[i][5] > 0) {
                    dashboard.assist_leaders.push(players_stats[i]);
                  }                  
                }
              }
              players_stats.sort(function (a, b) {
                return b[6] - a[6];
              });
              for (var i=0; i < players_stats.length; i++) {
                if (i < 5) {
                  if (players_stats[i][6] > 0) {
                    dashboard.point_leaders.push(players_stats[i]);
                  }
                }
              }
              players_stats.sort(function (a, b) {
                return b[7] -a[7];
              });
              for (var i=0; i < players_stats.length; i++) {
                if (i < 5) {
                  if (players_stats[i][7] > 0) {
                    dashboard.pim_leaders.push(players_stats[i]);
                  }                  
                }
              }  
              res.render('index.pug', { title: 'Dashboard', 'dashboard': dashboard}); 
            });
        
                         
        });              
    });
    
});

module.exports = router;
