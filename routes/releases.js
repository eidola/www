// Mongodb database
//var Releases = null;
/*
var db = require('mongoskin').db('localhost:27017/eidola');
db.collection('releases').find().toArray(function(err, results) {
    if (err) throw err;
    console.log(results);
    lps = results;
});
*/
// Mongoose 
var mongoose = require('mongoose')
, Schema = mongoose.Schema
, fs = require('fs')
, ensureDir = require('ensureDir')
, util = require('util')
, mv = require('mv');

mongoose.connect('mongodb://localhost:27017/eidola');

var releaseSchema = Schema({
    title: String,
    artist: [{type: Schema.Types.ObjectId, ref: 'Artist'}],
    tracks: [{
	number: Number,
	title: String,
	url: String
    }],
    description: String,
    cover: String
});

var artistSchema = Schema({
    name: String
});
var Release = mongoose.model('releases', releaseSchema);
var Artist = mongoose.model('artists', artistSchema);


var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));


// handler for displaying the items
exports.list = function(req, res) {
    Release.find(function(err, Releases) {
	if(err) throw err;
	res.render('releases', { title: 'Eidola Records | Releases',  items: Releases });
    });
};

// handler for displaying individual items

exports.view = function(req, res) {
    Release.findOne({ _id:  mongoose.Types.ObjectId(req.params.id)}, function(err, result) {
	if(err) throw err;
	res.render('release', { title: 'Eidola Records | ' + result.title, item:result });
    });
};
exports.admin = function(req, res) {
    Release.find(function(err, Releases) {
	if(err) throw err;
	res.render('releases_admin', { title: 'Eidola Records | Releases - Admin', items: Releases });
    });
};
exports.create = function(req, res) {
    Artist.find(function(err, _artists) {
	if(err) throw err;
	console.log(_artists);
	res.render('newrelease', {title: 'Eidola Records | Create New Release', artists: _artists });
    });
};
// Validate and create the new release
exports._create = function(req, res) {
    var files = req.files;
    var _release = new Release();
    _release.title = req.body.title;
    _release.artist = req.body.artist;
    _release.description = req.body.description;
    console.log(req.files.cover);
    var id = _release._id;
    var path = './public/releases/' + id + '/';
    var rPath = '/releases/' + id + '/' + req.files.cover.name;
    var tmp_path = req.files.cover.path;
    var cover_path  = path + req.files.cover.name;
    var is = fs.createReadStream(tmp_path);
    _release.cover = rPath;
    ensureDir(path, 0755, function(err) {
	if(err) throw err;
	mv(tmp_path, cover_path, function(err){
	    if(err) throw err;
	});
    });
    _release.save();
    console.log(_release);
    res.redirect('/releases');
};
exports._delete = function(req, res) {
    
};

