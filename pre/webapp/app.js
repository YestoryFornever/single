let http = require('http'),
	express = require('express'),
	morgan = require('morgan'),
	bodyParser = require('body-parser'),
	methodOverride = require('method-override'),
	errorHandler = require('errorhandler'),
	routes = require('./lib/routes'),
	app = express(),
	server = http.createServer( app ),
	chat = require('./lib/chat');

app.use( bodyParser.json() );
app.use( methodOverride('X-HTTP-Method-Override') );
app.use( express.static(__dirname+'/public') );
app.use('/',routes);// '/'可省略，挂载功能默认就是使用slash

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
chat.connect(server);
server.listen(9999);
console.log(9999);
