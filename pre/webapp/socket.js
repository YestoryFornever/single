let countUp,
	http = require('http'),
	express = require('express'),
	socketIo = require('socket.io'),

	app = express(),
	server = http.createServer(app),
	io = socketIo.listen(server),
	countIdx = 0;

countUp = function(){
	countIdx++;
	console.log(countIdx);
	io.sockets.send(countIdx);
}

app.use( express.static(__dirname+'/public') );
app.use( 
	express.Router().get('/', (req, res, next)=>{
		res.redirect('./socket.html');
	})
);
server.listen(9999);
console.log(9999);

setInterval(countUp,1000);