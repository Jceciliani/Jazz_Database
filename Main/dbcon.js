var mysql = require('mysql');
var pool = mysql.createPool({
  connectionLimit : 10,
  host            : 'classmysql.engr.oregonstate.edu',
  user            : 'cs340_ceciliaj',
  password        : '1953',
  database        : 'cs340_ceciliaj'
});

module.exports.pool = pool;
