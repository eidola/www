exports.index = function(req, res){
  res.render('index', { title: 'Eidola Records' })
};

// our 'database'
var items = {
    SKN:{name:'Shuriken', price:100},
    ASK:{name:'Ashiko', price:690},
    CGI:{name:'Chigiriki', price:250},
    NGT:{name:'Naginata', price:900},
    KTN:{name:'Katana', price:1000}
};
// mongodb test
var lps = null;
var db = require('mongoskin').db('localhost:27017/eidola');
db.collection('releases').find().toArray(function(err, results) {
    if (err) throw err;
    console.log(results);
    lps = results
});

// handler for displaying the items
exports.releases = function(req, res) {
    res.render('releases', { title: 'Ninja Store - Items',  items:lps });
};

// handler for displaying individual items
exports.release = function(req, res) {
    var name = items[req.params.id].title;
    var price = items[req.params.id].Artist;
    res.render('release', { title: 'Ninja Store - ' + name,  name:name, price:price });
    
};
