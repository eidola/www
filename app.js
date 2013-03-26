
/**
 * Module dependencies.
 */
//var eidola = require('./routes/eidola');
var express = require('express')
  , http = require('http')
  , path = require('path')
  , eidola = require('./routes/eidola')
  , releases = require('./routes/releases');

var app = express();

app.configure(function(){
  app.set('port', process.env.OPENSHIFT_NODEJS_PORT || 8080 || process.env.PORT || 3000);
  app.set('ipaddr',process.env.OPENSHIFT_INTERNAL_IP || '127.0.0.1');
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser('your secret here'));
  app.use(express.session());
  app.use(app.router);
  app.use(require('stylus').middleware(__dirname + '/public'));
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});
/* Get */
app.get('/', eidola.index);
app.get('/releases', releases.list);
app.get('/releases/new', releases.create);
app.get('/releases/admin', releases.admin);
app.get('/releases/update/:id',releases.update);
app.get('/releases/:id', releases.view);

/* Post */
app.post('/releases/_newrelease', releases._create);
app.post('/releases/delete', releases._delete);

http.createServer(app).listen(app.get('port'), app.get('ipaddr'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
