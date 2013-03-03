
/*
 * GET home page.
 */

exports.index = function(req, res){
    res.render('index', { title: 'Express' });
};
exports.releases = function(req, res){
    res.render('index', { title: 'Releases' });
};
