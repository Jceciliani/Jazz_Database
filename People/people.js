module.exports = function(){
    var express = require('express');
    var router = express.Router();

	function getHometown(res, mysql, context, complete){
        mysql.pool.query("SELECT hometown_id, city_name, state_name FROM hometown", function(error, results, fields){
		if(error)
		{
                res.write(JSON.stringify(error));
                res.end();
		}
		context.hometown  = results;
		complete();
	});
     }

    function getPeople(res, mysql, context, complete){
        mysql.pool.query("SELECT people.people_id, people.first_name, people.last_name, people.dob, hometown.city_name AS hometown FROM people INNER JOIN hometown ON people.hid = hometown.hometown_id", function(error, results, fields){
		if(error)
		{
                res.write(JSON.stringify(error));
                res.end();
		}
		context.people = results;
            	complete();
        });
    }

    function getPerson(res, mysql, context, id, complete){
        var sql = "SELECT people_id, first_name, last_name, dob, hid FROM people WHERE people_id = ?";
        var inserts = [id];
        mysql.pool.query(sql, inserts, function(error, results, fields){
            	if(error)
		{
                res.write(JSON.stringify(error));
                res.end();
           	}
   	        context.person = results[0];
            	complete();
        });
    }

    /*Display all people. Requires web based javascript to delete users with AJAX*/

    router.get('/', function(req, res){
        var callbackCount = 0;
        var context = {};
        context.jsscripts = ["deletePeople.js"];
        var mysql = req.app.get('mysql');
        getPeople(res, mysql, context, complete);
        getHometown(res, mysql, context, complete);
        function complete(){
        	callbackCount++;
            	if(callbackCount >= 2)
		{
                res.render('people', context);
            	}

        }
    });

    /* Display one person for the specific purpose of updating people */

    router.get('/:id', function(req, res){
        callbackCount = 0;
        var context = {};
        context.jsscripts = ["selectedHometown.js", "updatePeople.js"];
        var mysql = req.app.get('mysql');
        getPerson(res, mysql, context, req.params.id, complete);
        getHometown(res, mysql, context, complete);
        function complete(){
            	callbackCount++;
            	if(callbackCount >= 2)
		{
                res.render('updatePeople', context);
            	}

        }
    });

    /* Adds a person, redirects to the people page after adding */

    router.post('/', function(req, res){
        var mysql = req.app.get('mysql');
        var sql = "INSERT INTO people (first_name, last_name, dob, hid) VALUES (?,?,?,?)";
        var inserts = [req.body.first_name, req.body.last_name, req.body.dob, req.body.hid];
        sql = mysql.pool.query(sql,inserts,function(error, results, fields){
            	if(error)
		{
                res.write(JSON.stringify(error));
                res.end();
            	}
		else
		{
                res.redirect('/people');
            	}
        });
    });

    /* The URI that update data is sent to in order to update a person */

    router.put('/:id', function(req, res){
        var mysql = req.app.get('mysql');
        var sql = "UPDATE people SET first_name=?, last_name=?, dob=?, hid=? WHERE people_id=?";
        var inserts = [req.body.first_name, req.body.last_name, req.body.dob, req.body.hid, req.params.id];
        sql = mysql.pool.query(sql,inserts,function(error, results, fields){
            	if(error)
		{
                res.write(JSON.stringify(error));
                res.end();
            	}
		else
		{
                res.status(200);
                res.end();
            	}
        });
    });

    /* Route to delete a person, simply returns a 202 upon success. Ajax will handle this. */

    router.delete('/:id', function(req, res){
        var mysql = req.app.get('mysql');
        var sql = "DELETE FROM people WHERE people_id = ?";
        var inserts = [req.params.id];
        sql = mysql.pool.query(sql, inserts, function(error, results, fields){
            	if(error)
		{
                res.write(JSON.stringify(error));
                res.status(400);
                res.end();
            	}
		else
		{
                res.status(200)
		res.end();
            	}	
        })
    })

    return router;
}();
