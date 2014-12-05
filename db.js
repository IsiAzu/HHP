/**
 * Created by Isi on 12/3/14.
 */



var usersdb = new nedb({filename: 'users.db', autoload: true});

var username = "shawn";
var password = "shawn";
var userid = -1;

usersdb.find({username: username, password: password}, function(err, result) {
    if (err) { console.log(err); }
    if (result.count > 0) {
        userid = result[0]._id;
//              socket.emit(
    }
});

var myorder = {
    type: "chinese",
    cost: "medium",
    pointperson: true
};

myorder.userid = userid;



ordersdb.insert(myorder);

//////////////










var db = new nedb({filename: 'test.db', autoload: true});

var dataToInsert = {username: "blah", password: "hi"};

db.insert(dataToInsert, function (err) {
    if (err) { console.log(err); }});

db.find({username: "blah"}, function(err, results) {
    if (err) { console.log(err); }

    console.log(results);

    for (var i = 0; i < results.length; i++) {
        console.log(results[i].password);
    }

});