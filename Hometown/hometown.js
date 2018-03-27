module.exports = function() {
	var express = require('express');
	var router = express.Router();


function getHometown(res, mysql, context, complete)
{
	mysql.pool.query("SELECT hometown_id, city_name, state_name, population FROM hometown", function(error, results, fields) {
	if(error)
	{
		res.write(JSON.stringify(error));
		res.end();
	}

	context.hometown = results;
	complete();
	});
} 


	router.get('/', function(req, res)
	{
		var callbackCount = 0;
		var context = {};
		var mysql = req.app.get('mysql');
		getHometown(res, mysql, context, complete);
		function complete()
		{
			callbackCount++;
			if(callbackCount >= 2);
			{
				res.render('hometown', context);
			}
		}
	});

	router.post('/', function(req, res) {
	var mysql = req.app.get('mysql');
	var sql = "INSERT INTO hometown (city_name, state_name, population) VALUES (?,?,?)";
	var inserts = [req.body.city_name, req.body.state_name, req.body.population];
	sql = mysql.pool.query(sql, inserts, function(error, results, fields){
		if(error)
		{
			res.write(JSON.stringify(error));
			res.end();
		}
		else
		{
			res.redirect('/hometown');
		}
		});
	});


	return router;

}();

