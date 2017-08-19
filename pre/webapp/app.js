let http = require('http'),
	express = require('express'),
	morgan = require('morgan'),
	bodyParser = require('body-parser'),
	methodOverride = require('method-override'),
	errorHandler = require('errorhandler'),
	app = express(),
	server = http.createServer( app );

let router = express.Router();
router.get('/', function(req, res, next) {
	res.redirect('./spa.html');
});

app.use( bodyParser.json() );
app.use( methodOverride('X-HTTP-Method-Override') );
app.use( express.static(__dirname+'/public') );

app.use('/',router);

if (app.get('env') === 'development') {
	app.use( morgan('combined') );
	app.use( errorHandler({
		dumpException:true,
		showStack:true
	}) );
}
if (app.get('env') === 'production') {
	app.use( errorHandler() );
}
/*app.get('/',function( req, res ){
	res.send('Hello express');
});*/
server.listen(9999);
console.log(9999);
