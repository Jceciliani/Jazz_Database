module.exports = function() {
	var express = require('express');
	var router = express.Router();


function getGenres(res, mysql, context, complete)
{
	mysql.pool.query("SELECT genres_id, name, era FROM genres", function(error, results, fields) {
	if(error)
	{
		res.write(JSON.stringify(error));
		res.end();
	}

	context.genres = results;
	complete();
	});
} 


	router.get('/', function(req, res)
	{
		var callbackCount = 0;
		var context = {};
		var mysql = req.app.get('mysql');
		getGenres(res, mysql, context, complete);
		function complete()
		{
			callbackCount++;
			if(callbackCount >= 2);
			{
				res.render('genres', context);
			}
		}
	});

	router.post('/', function(req, res) {
	var mysql = req.app.get('mysql');
	var sql = "INSERT INTO genres (name, era) VALUES (?,?)";
	var inserts = [req.body.name, req.body.era];
	sql = mysql.pool.query(sql, inserts, function(error, results, fields){
		if(error)
		{
			res.write(JSON.stringify(error));
			res.end();
		}
		else
		{
			res.redirect('/genres');
		}
		});
	});

	
	
    function filterGenres(res, mysql, context, id, complete){
        var sql = "SELECT genres_id, name, era WHERE name = ?";
        var inserts = [id];
        mysql.pool.query(sql, inserts, function(error, results, fields){
            	if(error)
		{
                res.write(JSON.stringify(error));
                res.end();
           	}
   	        context.genres = results[0];
            	complete();
        });
    }

	return router;
}();	

