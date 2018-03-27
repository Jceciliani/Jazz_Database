module.exports = function(){
    var express = require('express');
    var router = express.Router();

    function getGenres(res, mysql, context, complete){
        mysql.pool.query("SELECT genres_id, name, era FROM genres", function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.genres  = results;
            complete();
        });
    }

    function getPlayIn(res, mysql, context, complete){
        mysql.pool.query("SELECT gid, pid, genres.era AS Genres, CONCAT(people.first_name,' ', people.last_name) AS Musicians FROM people INNER JOIN play_in ON people.people_id = play_in.pid INNER JOIN genres ON genres.genres_id = play_in.gid ", function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.play_in = results;
            complete();
        });
    }

    function getPeople(res, mysql, context, complete) {
	mysql.pool.query("SELECT people_id, first_name FROM people", function(error, results, fields) {
	if(error)
	{
		res.write(JSON.stringify(error));
		res.end();
	} 
	context.people = results;
	complete();
	});
	}

	//Display all play_in relationships
    router.get('/', function(req, res){
        var callbackCount = 0;
        var context = {};
        var mysql = req.app.get('mysql');
        getPlayIn(res, mysql, context, complete);
        getGenres(res, mysql, context, complete);
	getPeople(res, mysql, context, complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 3){
                res.render('play_in', context);
            }

        }
    });

	//Add to play in 
    router.post('/', function(req, res){
        var mysql = req.app.get('mysql');
        var sql = "INSERT INTO play_in (gid, pid) VALUES (?,?)";
        var inserts = [req.body.gid, req.body.pid];
        sql = mysql.pool.query(sql,inserts,function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }else{
                res.redirect('/play_in');
            }
        });
    });

    return router;
}();
