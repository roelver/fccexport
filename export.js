var env = require('./.env');
var MongoClient = require('mongodb').MongoClient;
var fs = require('fs');


var rundate = new Date();
var rundateFmt = rundate.getFullYear()+'-'+rundate.getMonth()+'-'+rundate.getDate()+
					'T'+rundate.getHours()+':'+rundate.getMinutes()+':'+rundate.getSeconds()
var threshold30days = rundate.getTime() - (30 * 24 * 60 * 60 *1000);
var header = '"username","img","lastUpdate","points","pointsRecent","bonfires","bonfiresRecent"'+
				 ',"ziplines","ziplinesRecent","basejumps","basejumpsRecent","waypoints","waypointsRecent"';

var fileName = 'fccoutput'+rundateFmt+'.csv';
var counter = 0;

fs.open(env.path+fileName, 'a', function(err, fd) {
	
		if (err) {throw err;}

		fs.writeSync(fd,header+'\n');

		MongoClient.connect(env.url, function(err, db) {

		   if (err) { throw err; }

			processUsers(db, fd, function() {
		      db.close();
		      fs.closeSync(fd);
		      console.log('File:'+fileName+' Records exported:', counter);
		  	});
		});

});

var processUsers = function(db, fd, callback ) {

	var cursor = db.collection('user').find();
   cursor.each(function(err, doc) {
   	if (err) { throw err;}
      if (doc != null) {
      	counter++;
      	fs.write(fd, processUser(doc)+'\n');
      } 
      else {
         callback();
      }
   });

}

var processUser = function (doc) {
  var rec = [];

  var recentTimestamps = doc.progressTimestamps.filter(function(elm) {
  								return elm.timestamp >= threshold30days;
  							});

  // Start with the easy data
  rec.push( '"'+doc.username+'"' ); // 1: username
  rec.push( '"'+doc.picture+'"' ); // 2: img
  rec.push( '"'+rundateFmt+'"' ); // 3: lastUpdate
  rec.push(doc.progressTimestamps.length); // 4: points
  rec.push(recentTimestamps.length);  // 5: pointsRecent  

  var countChallenge       = [0,0,0,0,0,0,0,0];
  var countChallengeRecent = [0,0,0,0,0,0,0,0];

  doc.completedChallenges
  		.forEach(function(challenge) {
  			// Bonfires and Waypoints are both challengeType 5: Split up on challenge name starting with Bonfire 
  			var idx = (challenge.name.indexOf('Bonfire') === 0 ? 2 : challenge.challengeType);
  			countChallenge[idx]++;		
 	 		if (challenge.completedDate >= threshold30days) {
 	 				countChallengeRecent[idx]++;
 	 		}
  		});

  	// 6: bonfires
  	// 7: bonfiresRecent
  	// 8: ziplines
  	// 9: ziplinesRecent
  	// 10: basejumps
  	// 11: basejumpsRecent
  	// 12: waypoints
  	// 13: waypointsRecent

  	for (var i=2; i<=5;i++) {
  		rec.push(countChallenge[i] );
  		rec.push(countChallengeRecent[i] );
  	}

  return rec.join(',');

}
