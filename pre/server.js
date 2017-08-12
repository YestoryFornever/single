let http = require('http');
let parse = require('url').parse;
let join = require('path').join;
let fs = require('fs');

let root = __dirname;
let server = http.createServer(function(req,res){
	let url = parse(req.url);
	let path = join(root,url.pathname);
	let stream = fs.createReadStream(path);
	stream.on('data',function(chunk){
		res.write(chunk);
	});
	stream.on('end',function(){
		res.end();
	});
	stream.on('error',function(err){
		res.writeHead(200, {'Content-Type': 'text/plain; charset=utf8'});
		res.statusCode = 500;
		res.end('服务器错误');
	});
});
server.listen(9999);
console.log(9999);
