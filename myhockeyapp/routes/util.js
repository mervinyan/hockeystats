
module.exports = {
    bin2String: function (array) {
        var result = "";
        for (var i = 0; i < array.length; i++) {
            result += String.fromCharCode(array[i]);
        }
        return result;
    },
    
    readStreamEventsForward: function (ges, stream, callback) {
        var connection = ges({ host: '127.0.0.1' });
        connection.on('connect', function () {
            console.log('connecting to geteventstore...');
            connection.readStreamEventsForward('gamestats', { start: 0, count: 1000, resolveLinkTos: true }, function (err, readResult) {
                if (err) return console.log('Ooops!', err);
                callback(readResult);
            });
        });
    }
};

