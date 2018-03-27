module.exports = function() {
	var express = require('express');
	var router = express.Router();


function getInstruments(res, mysql, context, complete)
{
	mysql.pool.query("SELECT instruments_id, name FROM instruments", function(error, results, fields) {
	if(error)
	{
		res.write(JSON.stringify(error));
		res.end();
	}

	context.instruments = results;
	complete();
	});
} 


	router.get('/', function(req, res)
	{
		var callbackCount = 0;
		var context = {};
		var mysql = req.app.get('mysql');
		getInstruments(res, mysql, context, complete);
		function complete()
		{
			callbackCount++;
			if(callbackCount >= 2);
			{
				res.render('instruments', context);
			}
		}
	});

	router.post('/', function(req, res) {
	var mysql = req.app.get('mysql');
	var sql = "INSERT INTO instruments (name) VALUES (?)";
	var inserts = [req.body.name];
	sql = mysql.pool.query(sql, inserts, function(error, results, fields){
		if(error)
		{
			res.write(JSON.stringify(error));
			res.end();
		}
		else
		{
			res.redirect('/instruments');
		}
		});
	});

	return router;
}();
				
