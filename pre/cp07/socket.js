let setWatch,
	http = require('http'),
	express = require('express'),
	socketIo = require('socket.io'),
	fs = require('fs'),

	app = express(),
	server = http.createServer(app),
	io = socketIo.listen(server),
	watchMap = {};

setWatch = function( url_path, file_type ){
	url_path = url_path.split('?')[0];//默认带有？后缀
	console.log( url_path );
	if(! watchMap[url_path]){
		console.log('setting watch on ' + "sockets/"+url_path.slice(1));
		fs.watchFile(
			"sockets/"+url_path.slice(1),
			function(current,previous){
				if( current.mtime !== previous.mtime ){
					console.log('file changed',url_path);
					io.sockets.emit(file_type,url_path);
				}
			}
		);
		watchMap[url_path] = true;
	}
}
app.use( (req,res,next)=>{
	if( req.url.indexOf('/js/')>=0){
		setWatch(req.url,'script');
	}else if(req.url.indexOf('/css/')>=0){
		setWatch(req.url,'stylesheet');
	}
	next();
});
app.use( express.static(__dirname+'/sockets') );
app.use( 
	express.Router().get('/', (req, res, next)=>{
		res.redirect('./socket.html');
	})
);
server.listen(9999);
console.log(9999);