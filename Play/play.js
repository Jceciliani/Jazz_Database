module.exports = function(){
    var express = require('express');
    var router = express.Router();

    function getInstruments(res, mysql, context, id, complete){
        var sql = "SELECT instruments_id, name FROM instruments WHERE instruments_id = ?";
	var inserts = [id];
	mysql.pool.query(sql, inserts, function(error, results, fields){	
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.play  = results[0];
            complete();
        });
    }

/*
	//Other way
    function getInstruments(res, mysql, context, complete){
	mysql.pool.query("SELECT instruments_id AS iid, name FROM instruments", function(error, results, fields) {
	if(error){
		res.write(JSON.stringify(error));
		res.end();
	}
	context.instruments = results;
	complete();
	});
}
*/
	
	
    function getPlayInfo(res, mysql, context, iid, pid, complete) {
	var sql = "SELECT play.iid, play.pid FROM play INNER JOIN instruments ON instruments.instruments_id = play.iid INNER JOIN people ON people.people_id = play.pid WHERE iid = ? AND pid = ?";
	var inserts = [iid, pid];
	mysql.pool.query(sql, inserts, function(error, results, fields) {
	if(error){
		res.write(JSON.stringify(error));
		res.end();
	}
	context.play = results[0];
	complete();
	});
}		

    function useInstruments(res, mysql, context, complete){
	mysql.pool.query("SELECT instruments_id, name FROM instruments", function(error, results, fields){
	if(error)
	{
		res.write(JSON.stringify(error));
		res.end();
	}	
	context.instruments = results;
	complete();
	});
	}

    function usePeople(res, mysql, context, complete) {
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

    function getPlay(res, mysql, context, complete){
        mysql.pool.query("SELECT iid, pid, instruments.name AS Instruments, CONCAT(people.first_name,' ',people.last_name) AS Musicians FROM people INNER JOIN play ON people.people_id = play.pid INNER JOIN instruments ON instruments.instruments_id = play.iid ", function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.play = results;
            complete();
        });
    }

    function getPerson(res, mysql, context, id, complete){
        var sql = "SELECT people_id, first_name FROM people WHERE people_id = ?";
        var inserts = [id];
        mysql.pool.query(sql, inserts, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.play = results[0];
            complete();
        });
    }

/*
	//Other ways
    function getPerson(res, mysql, context, complete){
	sql = "SELECT people_id AS pid, first_name FROM people";
	mysql.pool.query(sql, function(error, results, fields){
	if(error){
		res.write(JSON.stringify(error));
		res.end()
	}
	context.people = results;
	complete();
	});
}

    function getPeopleInstruments(res, mysql, context, complete){
	sql = "SELECT iid, pid, instruments.name AS Instrument, CONCAT(people.first_name,' ',people.last_name) AS Musician FROM instruments INNER JOIN play ON instruments.instruments_id = play.iid INNER JOIN people ON people.people_id = play.pid"
	mysql.pool.query(sql, function(error, results, fields) {
	if(error){
		res.write(JSON.stringify(error));
		res.end()
	}
	context.peopleInstruments = results;
	complete();
	});
}  
*/   	 
    /*Display all people. Requires web based javascript to delete users with AJAX*/

    router.get('/', function(req, res){
        var callbackCount = 0;
        var context = {};
        context.jsscripts = ["deletePlay.js"];
        var mysql = req.app.get('mysql');
        getPlay(res, mysql, context, complete);
	usePeople(res, mysql, context, complete);
	useInstruments(res, mysql, context, complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 3){
                res.render('play', context);
            }

        }
    });

/*
	//other way
    router.get('/',function(req, res){
	var callbackCount = 0;
	var context = {};
	context.jsscripts = ["deletePlay.js"];
	var mysql = req.app.get('mysql');

	getPerson(res, mysql, context, complete);
	getInstruments(res, mysql, context, complete);  
	getPeopleInstruments(res, mysql, context, complete);
	function complete(){
		callbackCount++;
		if(callbackCount >= 3){
			res.render('play', context);
		}
	}
}); 
*/  
   //Display single play for update 

    router.get('/play/:iid-:pid', function(req, res){
        callbackCount = 0;
        var context = {};
        context.jsscripts = ["selectedInstruments.js", "selectedPerson.js", "updatePlay.js"];
        var mysql = req.app.get('mysql');
        getInstrument(res, mysql, context,req.params.iid, complete);
        getPerson(res, mysql, context, req.params.pid, complete);
       // getPlayInfo(res, mysql, context, req.params.iid, req.params.pid, complete);
	useInstruments(res, mysql, context, complete);
	usePeople(res, mysql, context, complete);	 
        function complete(){
            callbackCount++;
            if(callbackCount >= 3){
                res.render('updatePlay', context);
            }

        }
    });

    /* Adds a person, redirects to the people page after adding */

    router.post('/', function(req, res){
        var mysql = req.app.get('mysql');
        var sql = "INSERT INTO play (iid, pid) VALUES (?,?)";
        var inserts = [req.body.iid, req.body.pid];
        sql = mysql.pool.query(sql,inserts,function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }else{
                res.redirect('/play');
            }
        });
    });

/*
	//other way
    router.post('/', function(req, res){
	var mysql = req.app.get('mysql');
	var instruments = req.body.iid;
	var person = req.body.pid;
	for(let iid of instruments) {
	var sql = "INSERT INTO play (iid, pid) VALUES (?, ?)";
	var inserts = [instruments, person];
	sql = mysql.pool.query(sql, inserts, function(error, results, fields){
	if(error)
	{
		res.write(JSON.stringify(error));
		res.end();
	}
	else
	{
		res.redirect('/play');
	}
	});
});
*/	    
   //URL to update play 

    router.put('/play/:iid-:pid', function(req, res){
        var mysql = req.app.get('mysql');
        var sql = "UPDATE play SET iid=?, pid=? WHERE iid=? AND pid=?";
        var inserts = [req.body.iid, req.body.pid, req.params.iid, req.params.pid];
        sql = mysql.pool.query(sql,inserts,function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }else{
                res.status(200);
                res.end();
            }
        });
    });

    //Route to delete	

    router.delete('/:iid-:pid', function(req, res){
        var mysql = req.app.get('mysql');
        var sql = "DELETE FROM play WHERE iid = ? AND pid = ?";
        var inserts = [req.params.iid, req.params.pid];
        sql = mysql.pool.query(sql, inserts, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.status(400);
                res.end();
            }else{
                res.status(202).end();
            }
        })
    })

/*
	//other way
    router.delete('/iid/:iid/pid/:pid', function(req, res){
	var mysql = req.app.get('mysql');
	var sql = "DELETE FROM play WHERE iid = ? AND pid = ?";
	var inserts = [req.params.iid, req.params.pid];
	sql = mysql.pool.query(sql, inserts, function(error, results, fields){
	if(error)
	{
		res.write(JSON.stringify(error));
		res.status(400);
		res.end();
	}
	else
	{
		res.status(202).end();
	}
	})
})
*/
	 
    return router;
}();
