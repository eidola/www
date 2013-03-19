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
function setArtistNameInTempArray(_release, _artists,i,j,callback) {
    var _objectId = _artists[i].toString();
    Artist.findOne({_id: mongoose.Types.ObjectId(_objectId)},function(err, _artist){
	if(err) throw err;
	console.log(_artist.name);
	callback(null,_artist.name,i,j);
    });
}
function getArtistName(Releases, callback){
    var _releases = Releases;
    var c = 0;
    for(var id in _releases) {
	var _release = _releases[id];
	var _artists = _release.artist;
	for(var i=0;i<_artists.length;i++) {
	    setArtistNameInTempArray(_release,_artists,id,i,function(err,_artist,i,j) {
	    	if(err) throw err;
		_releases[i].artist[j] = _artist;
		c++;
		checkForCallback(callback,_releases,c,Releases.length);
	    });
	}
    }
    
}
function checkForCallback(callback,returnvalue,counter,condition) {
    if(condition == counter) {
	callback(null,returnvalue);
    }
}
// handler for displaying the items
exports.list = function(req, res) {
    Release.find(function(err, Releases) {
	if(err) throw err;
	getArtistName(Releases, function(err, _releases) {
	    if(err) throw err;
	    res.render('releases', { title: 'Eidola Records | Releases',  items: _releases });
	});
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
    console.log(req.body.id);
    Release.findOne({ _id:  mongoose.Types.ObjectId(req.body.id)}, function(err, result) {
	if(err) throw err;
	result.remove();
    });
    res.redirect('/releases/admin');
};

