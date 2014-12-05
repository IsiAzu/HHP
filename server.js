// HTTP Portion
var http = require('http');
var fs = require('fs'); // Using the filesystem module
var httpServer = http.createServer(requestHandler);
var url = require('url');
var nedb = require('nedb');

httpServer.listen(8080);

function requestHandler(req, res) {

	var parsedUrl = url.parse(req.url);
	console.log("The Request is: " + parsedUrl.pathname);
	
	// Read index.html	
	fs.readFile(__dirname + parsedUrl.pathname, 
		// Callback function for reading
		function (err, data) {
			// if there is an error
			if (err) {
				res.writeHead(500);
				return res.end('Error loading ' + parsedUrl.pathname);
			}
			// Otherwise, send the data, the contents of the file
			res.writeHead(200);
			res.end(data);
  		}
  	);
  	
}

// WebSocket Portion
// WebSockets work with the HTTP server
var io = require('socket.io').listen(httpServer);

// Empty array to hold clients
var clients = [];

//this file should hold all the order groups created
var groupordersdb = new nedb({
	filename: 'groups.db',
	autoload: true
});

//this file should store all info on the users order params in each groupdb
var userparamsdb = new nedb({
	filename: 'userparams.db',
	autoload: true
});



// Register a callback function to run when we have an individual connection
// This is run for each individual user that connects
io.sockets.on('connection', 
	// We are given a websocket object in our function
	function (socket) {

		console.log("connected");

		
		// when a request for a new order group is created, add a new group to groups database. als add a new user to users database

		socket.on('neworderreq', function(data){
			var id = data.id;
			var gOrds = {
				// the name of the group
				groupname: data.group.groupname,
				_id: id,
				// an array of food choices available for other users to pick
				//groupcuisine: data.group.cuisine,

				//group was created by
				groupcreated: data.username
			};

			groupordersdb.insert(gOrds, function (err, group) {});

			var uParms = {
				//the user's name
				username: data.username,

				//the user's food choices
				usercuisine: data.cuisine,

				//the group this user is attached to
				grouporderID: db.find({})
				//groupordersdb.id
			};

			//save newgroup to db, save new user to db

			userparamsdb.insert(uParms, function(err, user) {});


			io.sockets.emit('newgroupcreated', gOrds, uParms);
		});

		// if a new user joins an existing group, push their data to the db, emit the info to everyone else
		socket.on('joinanexorder', function(data){
			var uParms = {
				//the user's name
				username: data.username,

				//the user's food choices
				usercuisine: data.cuisine,

				//the group this user is attached to
				grouporderID: groupordersdb.id
			};

			// save userinfo to db
			userparamsdb.insert(uParms, function(err, user){});

			console.log('a new user has joined the order group');
			io.sockets.emit('newuserjoined', uParms);
		});

		// Disconnect clients and remove them from array
		socket.on('disconnect', function() {
			console.log("Client has disconnected " + socket.id);
			clients.splice(clients.indexOf(socket.id), 1);
			console.log(clients);
		});
	}
);

