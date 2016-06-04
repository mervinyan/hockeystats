$dates = '2015_10_23', '2015_10_24', '2015_10_31'
$dates = $dates + '2015_11_01', '2015_11_13', '2015_11_14', '2015_11_18', '2015_11_22', '2015_11_25', '2015_11_29', '2015_11_30'
$dates = $dates + '2015_12_07', '2015_12_12', '2015_12_18', '2015_12_19'
$dates = $dates + '2016_01_08', '2016_01_09', '2016_01_14', '2016_01_15', '2016_01_18'
$dates = $dates + '2016_02_13', '2016_02_14', '2016_02_16', '2016_02_20', '2016_02_27', '2016_02_29'

Foreach ($date in $dates)
{
	$fileName = '@C:\my_workspaces\hockeystats\myhockeyapp\data\game_' + $date + '.json'
	$streamId = 'http://127.0.0.1:2113/streams/game-' + [guid]::NewGuid()
	$args = @('-i', '-d', $fileName, $streamId, '-H', 'Content-Type:application/vnd.eventstore.events+json')
	& 'C:\my_workspaces\curl.exe' $args
}