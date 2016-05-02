$fileName = '@C:\temp\stats\myhockeyapp\data\test.json'
$streamId = 'http://127.0.0.1:2113/streams/game-' + [guid]::NewGuid()
$args = @('-i', '-d', $fileName, $streamId, '-H', 'Content-Type:application/vnd.eventstore.events+json')
& 'C:\temp\curl.exe' $args