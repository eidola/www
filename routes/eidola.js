exports.index = function(req, res){
  res.render('index', { title: 'Eidola Records' })
};

/*
// Mongodb database
var lps = null;
var db = require('mongoskin').db('localhost:27017/eidola');
db.collection('releases').find().toArray(function(err, results) {
    if (err) throw err;
    console.log(results);
    lps = results;
});

// handler for displaying the items
exports.releases = function(req, res) {
    res.render('releases', { title: 'Eidola Records | Releases',  items:lps });
};

// handler for displaying individual items

exports.release = function(req, res) {
    db.collection('releases').findOne({ _id: db.ObjectID.createFromHexString(req.params.id)}, function(err, result) {
	if(err) throw err;
	res.render('release', { title: 'Eidola Records | ' + result.title, item:result });
    });
};
*/
