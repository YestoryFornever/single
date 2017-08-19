let http = require('http'),
	express = require('express'),
	morgan = require('morgan'),
	bodyParser = require('body-parser'),
	app = express(),
	server = http.createServer( app );

app.use( morgan('combined') );
app.use( bodyParser.json() );
app.get('/',function( req, res ){
	res.send('Hello express');
});
server.listen(9999);
console.log(9999);
