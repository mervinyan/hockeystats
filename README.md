# hockeystats
A simple hockey statistics analysis web app based on Node.js, Express.js, Jade, C3 Chart, and GetEventStore. 

This is just a fun project during the journey of learning EventSourcing with GetEventStore, and modern web app development with Mean (MongoDB, Express, Angularjs, Node.js)

How to run the project:

1. Download the EventStore from https://geteventstore.com/. 
2. Start the GetEventStore with the following command
    EventStore.ClusterNode.exe --db ./db --log ./logs –start-standard-projections=true –run-projections=all
3. Post events to EventStore (for each file in the data folder), e.g. for the game of 2015-10-23
    curl –i –d @game_2015_10_23.json http://127.0.0.1:2113/streams/game-2015_10_23 -H “Content-Type:application/vnd.eventstore.events+json”
4. Add new projection in GetEventStore (for each file in the projections folder)
    Login to GetEventStore web console, click the Projections tab and click the "New Projection" button. Copy the content from file projection_game_stats.js and paste to the "Source" textbox, in the Name box enter a name you prefer, and choose "Continuous" in the Mode dropdown list, and check the "Emit Enabled" checkbox
5. Run the web app either from Visual Studio Code from command line
6. The url to check team stats: http://host:port/teamstats (e.g. http://localhost:3000/teamstats)
7. The url to check player stats: http://host:port/playerstats/12 (e.g. http://localhost:3000/playerstats/12)

