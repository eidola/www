/*
  Make sure mongodb is active service mongod start

*/

var mongoose = require('mongoose')
, Schema = mongoose.Schema
, fs = require('fs')
, ensureDir = require('ensureDir')
, util = require('util')
, mv = require('mv')
, formidable = require('formidable');
mongoose.connect('mongodb://localhost:27017/eidola');

var releaseSchema = Schema({
    title: String,
    artist: [{type: Schema.Types.ObjectId, ref: 'artists'}],
    tracks: [{
	number: Number,
	title: String,
	url: String
    }],
    description: String,
    cover: String,
    download: String
});

var artistSchema = Schema({
    name: String,
    members: [{type: Schema.Types.ObjectId, ref: 'artists'}]
});
var Release = mongoose.model('releases', releaseSchema);
var Artist = mongoose.model('artists', artistSchema);


var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
// Functions
function setArtistNameInTempArray(_release,_artists, i, j, callback ) {
    console.log(_release );
    console.log(_artists[j] );
    if(_artists[j] != undefined ) {
	var _objectId = _artists[j].toString();
	Artist.findOne({_id: mongoose.Types.ObjectId(_objectId)},function(err, _artist){
	    if(err) throw err;
	    console.log(_artist.name);
	    callback(null,_artist.name,i,j);
	});
    }
    else
	callback("err", null);
}
function getArtistName(Releases, callback){
    var _releases = Releases;
    var c = 0;
    if(_releases.length != undefined) {
	for(var id in _releases) {
	    var _release = _releases[id];
	    var _artists = _release.artist;
	    for(var i=0;i<_artists.length;i++) {
		setArtistNameInTempArray(_release,_artists,id,i,function(err,_artist,i,j) {
	    	    if(err) throw err;1
		    _releases[i].artist[j] = _artist;
		    c++;
		    checkForCallback(callback,_releases,c,Releases.length);
		});
	    }
	}
    }
    else {
	var _release = _releases;
	var _artists = _release.artist;
	for(var i=0;i<_artists.length;i++) {
	    setArtistNameInTempArray(_release,_artists,id,i,function(err,_artist,i,j) {
	    	if(err) throw err;1
		_releases.artist[j] = _artist;
		c++;
		checkForCallback(callback,_releases,c,1);
	    });
	}
    }
}
function checkForCallback(callback,returnvalue,counter,condition) {
    if(condition == counter) {
	callback(null,returnvalue);
    }
}
function addTracks(id, track, n, path, callback) {
    var rPath = '/releases/' + id + '/' + track.name;
    var tmp_path = track.path;
    var track_path  = path + track.name;
    var is = fs.createReadStream(tmp_path);
    var trackdata = {"number":n,"title":track.name,"url":rPath};
    ensureDir(path, 0755, function(err) {
	if(err) throw err;
	mv(tmp_path, track_path, function(err){
	    if(err) throw err;
	    callback(null,trackdata);
	});
    });
    
}
function zip(id, pathToFolder, cPath) {
    var execFile = require('child_process').execFile;
    var zipPath = pathToFolder + id;
    execFile('zip', ['-r', '-j', zipPath, pathToFolder], function(err, stdout) {
        if(err) throw err;
        Release.update({ _id: mongoose.Types.ObjectId(id)}
		       , { $set: {'download' : cPath}}
		       , function(err,result){
			   if(err) throw err;
			   console.log(result);
		       });
    });
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
	if(err) res.redirect('/releases');
	res.render('release', { title: 'Eidola Records | ' + result.title, item:result });
    });
};
exports.admin = function(req, res) {
    Release.find(function(err, Releases) {
	if(err) throw err;
	getArtistName(Releases, function(err, _releases) {
	    if(err) throw err;
	    res.render('releases_admin', { title: 'Eidola Records | Releases - Admin', items: Releases });
	});
    });
};
exports.create = function(req, res) {
    Artist.find(function(err, _artists) {
	if(err) throw err;
	console.log(_artists);
	res.render('newrelease', {title: 'Eidola Records | Create New Release', artists: _artists });
    });
};
exports.update = function(req, res) {
    Release.findOne({_id:  mongoose.Types.ObjectId(req.params.id)}, function(err, result) {
	if(err) throw err;
	getArtistName(result, function(err, _release) {
	    if(err) throw err;
	    Artist.find(function(err, _artists) {
		res.render('releases_update', { title: 'Eidola Records | Releases - Admin', release: _release, artists: _artists });
	    });
	});
    }); 
}

// Validate and create the new release

exports._create = function(req, res) {
    var files = req.files;
    console.log(files);
    var _release = new Release();
    _release.title = req.body.title;
    _release.artist = req.body.artist;
    _release.description = req.body.description;
    var id = _release._id;
    var path = './public/releases/' + id + '/';
    var rPath = '/releases/' + id + '/' + req.files.cover.name;
    var cPath = '/releases/'+id+'/'+id+'.zip';
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
    var tracks = req.files.tracks;
    var tc = 0;
    for(var i =0; i< tracks.length;i++) {
	console.log(tracks[i]);
	addTracks(id, tracks[i], i, path, function(err, trackdata){
	    if(err) throw err;
	    _release.tracks.push(trackdata);
	    tc++;
	    console.log(tc);
	    if(tc == tracks.length) {
		_release.save();
		zip(id.toString(), path, cPath);
		res.redirect('/releases');
		}
		
	});
    }  
};
exports._update = function(req, res) {
    var id = req.body.id;
    Release.findOne({ _id: mongoose.Types.ObjectId(id)},function(err, _release) {
	if(err) throw err;
	if(req.body.name != _release.title)
	    _release.title = req.body.name;
	for(var i = 0; i < _release.tracks.length; i++) {
	    
	    }
    });
}
exports._delete = function(req, res) {
    var id = req.body.id;
    Release.findOne({ _id:  mongoose.Types.ObjectId(id)}, function(err, result) {
	if(err) throw err;
	result.remove();
	var dPath = './public/releases/'+ id;
	var execFile = require('child_process').execFile;
	execFile('rm', ['-r', '-f', dPath], function(err, stdout) {
	    if(err) throw err;
	    console.log(stdout);
	});
    });
    res.redirect('/releases/admin');
};

