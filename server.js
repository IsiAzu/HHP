// expres server
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 3000;
var nedb = require('nedb');

server.listen(port, function(){
	console.log('Server listening at port', port);
});

app.use(express.static(__dirname +'/public'));


var usernames = {};
var numUsers = 0;



// Empty array to hold clients
var clients = [];


var db = {};
//this file should hold all the order groups created
db.groupordersdb = new nedb({
	filename: 'groups.db',
	autoload: true
});

//this file should store all info on the users order params in each groupdb
db.userparamsdb = new nedb({
	filename: 'userparams.db',
	autoload: true
});
 db.userparamsdb.loadDatabase();

// Register a callback function to run when we have an individual connection
// This is run for each individual user that connects
io.sockets.on('connection', 
	// We are given a websocket object in our function
	function (socket) {
	var addedUser=false;

		console.log("connected");

		
		// when a request for a new order group is created, add a new group to groups database. als add a new user to users database
socket.on('new message', function(data){
	socket.broadcast.emit('new message', { username: socket.username, message:data});

});

		socket.on('add user', function (data) {
			// we store the username in the socket session for this client
			socket.username = data.UserName;
			// add the client's username to the global list
			usernames[data.UserName] = data.UserName;
			++numUsers;
			addedUser = true;
			socket.emit('login', {
				numUsers: numUsers
			});
			// echo globally (all clients) that a person has connected
			socket.broadcast.emit('user joined', {
				username: socket.username,
				numUsers: numUsers
			});
		});

		// when the client emits 'typing', we broadcast it to others
		socket.on('typing', function () {
			socket.broadcast.emit('typing', {
				username: socket.username
			});
		});

		// when the client emits 'stop typing', we broadcast it to others
		socket.on('stop typing', function () {
			socket.broadcast.emit('stop typing', {
				username: socket.username
			});
		});

		//socket.on('ad '{});

		socket.on('neworderreq', function(data){
			//var id = data.id;
			//var gOrds = {
			//	//the name of the group
			//	groupname: data.groupname,
			//	//_id: id,
			//	//an array of food choices available for other users to pick
			//	groupcuisine: data.group.cuisine,
            //
			//	//group was created by
			//	groupcreated: data.username
			//};

			//db.groupordersdb.insert(gOrds, function (err, group) {});
			var userId = -1;

			var uParms = {
				//the user's name
				username: data.username,
				usernumber: data.usernumber,
				//the user's food choices
				cuisine: data.cuisine,
				//the group this user is attached to
				group: data.groupname
			};

			//save newgroup to db, save new user to db
			console.log(data);
			db.userparamsdb.insert(uParms, function(err, user) {});

			db.userparamsdb.find({usernumber: data.usernumber}, function(err){
				if(err){
					console.log(err);
				}
			});
			//socket.broadcast.emit('neworderreq', data);
		});

		socket.on('findDb', function(){
			db.userparamsdb.find({}, function (err, result){
				if (err) { console.log(err); }
				if (result.count > 0) {
					console.log(result[0]._id);
				}
			});
		});

		socket.on('ready', function(data){
			var r;
			db.userparamsdb.find({username: data}, function (err, result){
				if (err) { console.log(err); }
				if (result.count > 0) {
					r = result[0]._id;
					console.log(result[0]._id);
				}
			});

			//remove user from database
			db.remove({ _id: r }, {}, function (err, numRemoved) {
				// Now the fruits array is ['orange', 'pear']
				socket.broadcast.emit('useroptout', data);
			});
		});

		socket.on('optOut', function(data){
			db.userparamsdb.find({username: data}, function (err, result){
				if (err) { console.log(err); }
				if (result.count > 0) {
					//console.log(result[0]._id);
				}
			});
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
			userparamsdb.insert(uParms, function(err){
				if (err) { console.log(err); }});

			console.log('a new user has joined the order group');
			io.sockets.emit('newuserjoined', uParms);
		});

		// Disconnect clients and remove them from array
		socket.on('disconnect', function() {
			console.log("Client has disconnected " + socket.id);
			clients.splice(clients.indexOf(socket.id), 1);
			console.log(clients);
			if (addedUser) {
				delete usernames[socket.username];
				--numUsers;

				// echo globally that this client has left
				socket.broadcast.emit('user left', {
					username: socket.username,
					numUsers: numUsers
				});
			}
		});
	});

