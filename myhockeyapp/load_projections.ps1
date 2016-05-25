$projections = 'projection_dashboard',  'projection_team_stats', 'projection_game_stats', 'projection_player_stats'
$projections = $projections + 'projection_scheduled_games' 

Foreach ($projection in $projections)
{
	$fileName = '@C:\temp\stats\myhockeyapp\projections\' + $projection + '.js'
	$streamId = 'http://127.0.0.1:2113/projections/continuous?emit=yes&checkpoints=yes&enabled=yes&name=' + $projection
	$args = @('-i', '-X', 'POST', '-d', $fileName, $streamId, '-H', 'Content-Type:application/json', '-u', 'admin:changeit')
	& 'C:\temp\curl.exe' $args
}