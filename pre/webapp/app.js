let http = require('http'),
	express = require('express'),
	morgan = require('morgan'),
	bodyParser = require('body-parser'),
	methodOverride = require('method-override'),
	errorHandler = require('errorhandler'),
	app = express(),
	server = http.createServer( app );

let router = express.Router();
router.get('/', (req, res, next)=>{
	res.redirect('./spa.html');
});
router.get('/user/list',(req,res,next)=>{
	res.contentType('json');
	res.send({title:'user list'});
});
router.post('/user/create',(req,res,next)=>{
	res.contentType('json');
	res.send({title:'user create'});
});
router.get('/user/read/:id([0-9]+)',(req,res,next)=>{
	res.contentType('json');
	res.send({title:'user with id' + req.params.id + ' found'});
});
router.post('/user/update/:id([0-9]+)',(req,res,next)=>{
	res.contentType('json');
	res.send({title:'user with id' + req.params.id + ' updated'});
});
router.get('/user/delete/:id([0-9]+)',(req,res,next)=>{
	res.contentType('json');
	res.send({title:'user with id' + req.params.id + ' deleted'});
});

app.use( bodyParser.json() );
app.use( methodOverride('X-HTTP-Method-Override') );
app.use( express.static(__dirname+'/public') );

app.use('/',router);// '/'可省略，挂载功能默认就是使用slash

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
