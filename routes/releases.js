// Mongodb database
var Releases = null;
/*
var db = require('mongoskin').db('localhost:27017/eidola');
db.collection('releases').find().toArray(function(err, results) {
    if (err) throw err;
    console.log(results);
    lps = results;
});
*/
// Mongoose Test
var mongoose = require('mongoose')
, Schema = mongoose.Schema;
mongoose.connect('mongodb://localhost:27017/eidola');

var releaseSchema = Schema({
    title: String,
    artist: [{type: Schema.Types.ObjectId, ref: 'Artist'}],
    tracks: [{
	number: Number,
	title: String,
	url: String
    }],
    description: String
});
var Release = mongoose.model('Releases', releaseSchema);



var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
//db.once('open', function callback () {
/*
    Release.find(function(err, results) {
	if(err) throw err;
	console.log("Releases from mongoose.");
	console.log(results);
	Releases = results;
	});*/
//});

// handler for displaying the items
exports.list = function(req, res) {
    Release.find(function(err, Releases) {
	if(err) throw err;
	res.render('releases', { title: 'Eidola Records | Releases',  items: Releases });
    });
};

// handler for displaying individual items

exports.view = function(req, res) {
    //db.on('error', console.error.bind(console, 'connection error:'));
    //db.once('open', function callback () { 
	Release.findOne({ _id:  mongoose.Types.ObjectId(req.params.id)}, function(err, result) {
	    if(err) throw err;
	    res.render('release', { title: 'Eidola Records | ' + result.title, item:result });
	});
    //});
/*    db.collection('releases').findOne({ _id: db.ObjectID.createFromHexString(req.params.id)}, function(err, result) {
	if(err) throw err;
	res.render('release', { title: 'Eidola Records | ' + result.title, item:result });
    });
*/
};

exports.create = function(req, res) {
    res.render('newrelease', {title: 'Eidola Records | Create New Release' });
};

