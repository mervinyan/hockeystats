# hockeystats
A simple hockey statistics analysis web app based on Node.js, Express.js, Jade, C3 Chart, and GetEventStore. 

This is just a fun project during the journey of learning EventSourcing with GetEventStore, and modern web app development with Mean (MongoDB, Express, Angularjs, Node.js)

How to run the project:

1. Download the EventStore from https://geteventstore.com/. 
2. Start the GetEventStore with the following command
    EventStore.ClusterNode.exe --db ./db --log ./logs –-start-standard-projections=true –-run-projections=all
3. Post events to EventStore (for each file in the data folder), e.g. for the game of 2015-10-23
    curl –i –d @game_2015_10_23.json http://127.0.0.1:2113/streams/game-2015_10_23 -H “Content-Type:application/vnd.eventstore.events+json”
4. Add new projection in GetEventStore (for each file in the projections folder)
    Login to GetEventStore web console, click the Projections tab and click the "New Projection" button. Copy the content from file projection_game_stats.js and paste to the "Source" textbox, in the Name box enter a name you prefer, and choose "Continuous" in the Mode dropdown list, and check the "Emit Enabled" checkbox
5. Install Express: npm install express --save
6. Install Express Generator: npm install express-generator -g
7. Generate Application: express myhockeyapp
8. Install dependencies: npm install
9. Install C3 Chart: npm install c3-chart
10. Install Mongoose: npm install mongoose --save
11. Install Consolidate: npm install consolidate
12. Install Pug: npm install pug --save
13. Install Morgan: npm install morgan 
14. Run the web app either from Visual Studio Code from Node.ss command line 
     $ cd myhockeyapp 
     $ node app.js
15. The url to check team stats: http://host:port/teamstats (e.g. http://localhost:3000/teamstats)
16. The url to check player stats: http://host:port/playerstats/12 (e.g. http://localhost:3000/playerstats/12)


