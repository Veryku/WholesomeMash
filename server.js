// modules =================================================
var express        = require('express');
var app            = express();
var mongoose       = require('mongoose');
var bodyParser     = require('body-parser');
var methodOverride = require('method-override');
var fs = require("fs");

// configuration ===========================================
	
// config files

var scores = JSON.parse(fs.readFileSync("scores.json"))

var content = Object.keys(scores).map(function(key) {
	return {"_id": key, "url": scores[key]["url"]}
});

var port = process.env.PORT || 8080; // set our port

app.use(express.static(__dirname + '/public')); // set the static files location /public/img will be /img for users
app.get('/memes', (req, res) => {
	var r1 = Math.floor(Math.random()*content.length);
	var r2 = -1;
        do {
		r2 = Math.floor(Math.random()*content.length);
	}
	while (r2 === r1);
	res.send(JSON.stringify([content[r1], content[r2]]));
});

app.get('/scores', (req, res) => {
	content =  Object.keys(scores).map(function(key) {
		return {"_id": key, "url": scores[key]["url"], "elo": scores[key]["elo"]}
	});
	res.send(content);
});

app.post('/choice', (req, res) => {
	var winner = req.query.winner;
	var loser = req.query.loser;
	var wElo = scores[winner]["elo"];
	var lElo = scores[loser]["elo"];
	
	var rR = Math.pow(10, wElo/400);
	var lR = Math.pow(10, lElo/400);
	var rE = rR / (rR + lR);
	var lE = lR / (rR + lR);
	
	var wRes = wElo + 32 * (1 - rE);
	var lRes = lElo - 32 * lE;

	console.log("Winner: " + winner + ", Loser: " + loser);
	console.log("Winner ELO before: " + wElo + ", Loser ELO before: " + lElo);
	console.log("Winner ELO after: " + wRes + ", Loser ELO after: " + lRes);

	scores[winner]["elo"] = wRes;
	scores[loser]["elo"] = lRes;
	fs.writeFile("scores.json", JSON.stringify(scores), "utf8", function(){});
	res.end()
});
	
	


// start app ===============================================
app.listen(port);	
console.log('Magic happens on port ' + port); 			// shoutout to the user
exports = module.exports = app; 						// expose app
