var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var sf = require('node-salesforce');

function ascensionRoute() {
  var ascension = new express.Router();
  ascension.use(cors());
  ascension.use(bodyParser());

  // GET REST endpoint - query params may or may not be populated
  ascension.get('/', function(req, res) {
    console.log('----------------------------------------------------------------------------------------------------');
    var strWork = req.query.query.toString().trim();
    timeLog('Received query is ' + strWork);

    if ((strWork.search('sbstr=') > 0) || (strWork.search('access.redhat.com') > 0 )) {
      // sf link with case number at the end.
      timeLog('Ascension link - ' + process.env.ROOT + strWork.slice(strWork.length - 8));
      res.json({url: process.env.ROOT + strWork.slice(strWork.length - 8)});
    }
    else if (strWork.search('id=') > 0 )
    {
      // sf link with an id in the url.  Have to get equivalent case number from sf database
      timeLog('url contains an id parameter.  Need to get case number from sf');
      var id = strWork.substr(strWork.search('id=') + 3, 15);

      var q = process.env.QUERY.replace('{casenumber}', id);

      var conn = new sf.Connection({});

      conn.login(process.env.USERNAME, process.env.PASSWORD, function(err, userInfo) {
        if (err) { return console.error(err); }

        timeLog('Query is - ' + q);
        conn.query(q, function(err, result) {
          if (err) { return console.error(err); }
          timeLog('query complete');

          if (result.records.length > 0) {
            // Record was found.
            timeLog('Ascension link - ' + process.env.ROOT + result.records[0].CaseNumber);
            res.json({url: process.env.ROOT + result.records[0].CaseNumber});
          }
        })  //  end of conn.query
        conn.logout();
        timeLog('logged out');
      })  // end of conn.login
    };

  })

  return ascension;
}

function timeLog(lg){
  console.log(new Date().toISOString() + ' -> ' + lg);
};

module.exports = ascensionRoute;
